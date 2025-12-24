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

async function handleJob({ stream, connection }, { exec: execFn, cacheDir, cfg } = {}) {
  try {
    const reqStr = await streamToString(stream.source);
    const req = JSON.parse(reqStr || '{}');
    log.info({ job: req }, 'Received job');

    const cmd = req.command || cfg?.worker?.defaultCommand || 'echo "compiled"';
    const jobId = req.jobId || `job-${Date.now()}`;
    const execLocal = execFn || exec;

    // Execute (non-sandboxed by design for now; we inject exec for tests)
    execLocal(cmd, { timeout: 60_000 }, (err, stdout, stderr) => {
      const res = {
        jobId,
        status: err ? 'error' : 'done',
        stdout: stdout?.toString(),
        stderr: stderr?.toString(),
        error: err?.message
      };

      // Cache result by jobId
      if (cacheDir) {
        try { fs.writeFileSync(path.join(cacheDir, `${jobId}.json`), JSON.stringify(res, null, 2)); } catch (e) { log.error(e, 'Failed to write cache'); }
      }

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
}

async function createWorker({ cfg, exec: execFn } = {}) {
  const config = cfg || await loadConfig();
  const listenAddrs = [].concat(config.peer.listenAddrs?.addr || ['/ip4/0.0.0.0/tcp/0']);
  const node = await createNode({ listenAddrs, bootstrap: [].concat(config.peer.bootstrapPeers?.peer || []) });

  const cacheDir = path.join(__dirname, '..', 'cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  node.handle(PROTOCOL, (args) => handleJob(args, { exec: execFn, cacheDir, cfg: config }));

  log.info({ id: node.peerId.toString() }, 'Worker running.');
  return {
    node,
    stop: async () => { try { await node.stop(); } catch (e) { log.error(e, 'Error stopping node'); } }
  };
}

if (require.main === module) {
  createWorker().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { createWorker, handleJob };
