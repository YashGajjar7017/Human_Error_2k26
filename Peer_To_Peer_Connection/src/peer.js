const { createLibp2p } = require('@libp2p/core');
const tcp = require('@libp2p/tcp');
const websocket = require('@libp2p/websockets');
const { noise } = require('@chainsafe/libp2p-noise');
const mplex = require('@libp2p/mplex');
const { kadDHT } = require('@libp2p/kad-dht');

async function createNode({listenAddrs = ['/ip4/0.0.0.0/tcp/0'], bootstrap = []} = {}) {
  const node = await createLibp2p({
    transports: [tcp(), websocket()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    dht: kadDHT({}),
    addresses: {
      listen: listenAddrs
    }
  });

  // Start
  await node.start();

  // Bootstrap peers if provided
  if (Array.isArray(bootstrap) && bootstrap.length) {
    for (const addr of bootstrap) {
      try {
        await node.dial(addr);
      } catch (err) {
        // ignore
      }
    }
  }

  return node;
}

module.exports = { createNode };
