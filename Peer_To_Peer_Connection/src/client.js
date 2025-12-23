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
  const node = await createNode({ listenAddrs: [].concat(cfg.peer.listenAddrs?.addr || ['/ip4/0.0.0.0/tcp/0']) , bootstrap: [].concat(cfg.peer.bootstrapPeers?.peer || [])});

  const command = process.argv.slice(2).join(' ') || cfg.worker.defaultCommand || 'echo "compiled"';
  const job = { jobId: `job-${Date.now()}`, command };

  // Strategy: dial bootstrap peers sequentially until one replies
  const bootstrap = [].concat(cfg.peer.bootstrapPeers?.peer || []);
  if (!bootstrap.length) {
    log.warn('No bootstrap peers configured. Peer-to-peer discovery may be limited.');
  }

  for (const peerAddr of bootstrap) {
    try {
      log.info({ peer: peerAddr }, 'Dialing peer');
      const { stream } = await node.dialProtocol(peerAddr, PROTOCOL);
      await stream.sink([Buffer.from(JSON.stringify(job))]);
      const resStr = await streamToString(stream.source);
      const res = JSON.parse(resStr || '{}');
      console.log('Job result:', res);
      return;
    } catch (err) {
      log.error({ err: err.message }, 'Dial failed');
    }
  }

  console.log('No bootstrap peers responded. For local demo, start a worker and then use direct dialing with its multiaddr.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
