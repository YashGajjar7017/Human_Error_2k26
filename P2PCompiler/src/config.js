const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function loadConfig(configPath = path.join(__dirname, '..', 'configs', 'server-config.xml')) {
  const xml = fs.readFileSync(configPath, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(xml);
  const cfg = parsed.serverConfig || {};
  return {
    peer: cfg.peer || {},
    worker: cfg.worker || {},
    security: cfg.security || {}
  };
}

module.exports = { loadConfig };
