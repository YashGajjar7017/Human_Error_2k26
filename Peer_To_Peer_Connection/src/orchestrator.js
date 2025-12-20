#!/usr/bin/env node
const { createNode } = require('./peer');
const { loadConfig } = require('./config');
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
  const bootstrap = [].concat(cfg.peer.bootstrapPeers?.peer || []);
  const node = await createNode({ listenAddrs: [].concat(cfg.peer.listenAddrs?.addr || ['/ip4/0.0.0.0/tcp/0']), bootstrap });

  // Very small demo: read command from stdin and try to assign to peers
  const command = process.argv.slice(2).join(' ') || 'echo "orchestrated compile"';
  const job = { jobId: `job-${Date.now()}`, command };

  for (const peerAddr of bootstrap) {
    try {
      log.info({ peer: peerAddr }, 'Dialing peer');
      const { stream } = await node.dialProtocol(peerAddr, PROTOCOL);
      await stream.sink([Buffer.from(JSON.stringify(job))]);
      const resStr = await streamToString(stream.source);
      console.log('Result from', peerAddr, resStr);
      return;
    } catch (err) {
      log.error({ err: err.message }, 'Dial failed');
    }
  }

  console.log('No peers available from bootstrap list.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
