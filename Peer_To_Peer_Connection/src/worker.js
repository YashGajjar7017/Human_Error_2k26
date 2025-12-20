#!/usr/bin/env node
const { createNode } = require('./peer');
const { loadConfig } = require('./config');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const PROTOCOL = '/p2p-compiler/1.0.0';
const log = pino({ level: process.env.LOG_LEVEL || 'info' });

async function streamToString(source) {
  let s = '';
  for await (const chunk of source) {
    s += chunk.toString();
  }
  return s;
}

async function main() {
  const cfg = await loadConfig();
  const listenAddrs = [].concat(cfg.peer.listenAddrs?.addr || ['/ip4/0.0.0.0/tcp/0']);
  const node = await createNode({ listenAddrs, bootstrap: [].concat(cfg.peer.bootstrapPeers?.peer || []) });

  const cacheDir = path.join(__dirname, '..', 'cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  node.handle(PROTOCOL, async ({ stream, connection }) => {
    try {
      const reqStr = await streamToString(stream.source);
      const req = JSON.parse(reqStr || '{}');
      log.info({ job: req }, 'Received job');

      const cmd = req.command || cfg.worker.defaultCommand || 'echo "compiled"';
      const jobId = req.jobId || `job-${Date.now()}`;

      // Simple execution (unsafe for untrusted input)
      exec(cmd, { timeout: 60_000 }, (err, stdout, stderr) => {
        const res = {
          jobId,
          status: err ? 'error' : 'done',
          stdout: stdout?.toString(),
          stderr: stderr?.toString(),
          error: err?.message
        };

        // Cache result by jobId
        fs.writeFileSync(path.join(cacheDir, `${jobId}.json`), JSON.stringify(res, null, 2));

        // Send response
        const sink = stream.sink;
        (async () => {
          const payload = JSON.stringify(res);
          await sink([Buffer.from(payload)]);
        })();
      });

    } catch (e) {
      log.error(e, 'Failed handling job');
      try { await stream.sink([Buffer.from(JSON.stringify({ status: 'error', error: e.message }))]); } catch (e) {}
    }
  });

  log.info({ id: node.peerId.toString() }, 'Worker running.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
