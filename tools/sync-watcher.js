const fs = require('fs');
const path = require('path');
const http = require('http');

if (process.argv.length < 4) {
  console.error('Usage: node sync-watcher.js <baseDir> <serverUrl>');
  console.error('Example: node sync-watcher.js "C:\\Projects\\mydir" http://localhost:8000');
  process.exit(1);
}

const baseDir = path.resolve(process.argv[2]);
const serverUrl = process.argv[3].replace(/\/$/, '');

console.log('Watcher starting');
console.log('Base dir:', baseDir);
console.log('Server URL:', serverUrl);

function sendSync(relPath) {
  const abs = path.join(baseDir, relPath);
  fs.readFile(abs, 'utf8', (err, data) => {
    const payload = JSON.stringify({ base: baseDir, path: relPath, content: data });
    const url = new URL(serverUrl + '/api/editor/sync');
    const req = http.request({ method: 'POST', hostname: url.hostname, port: url.port || 80, path: url.pathname, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }}, (res) => {
      // ignore response
      console.log(`Synced ${relPath} -> ${serverUrl}/api/editor/sync (status ${res.statusCode})`);
    });
    req.on('error', (e) => console.error('Sync error:', e));
    req.write(payload);
    req.end();
  });
}

function walkDir(dir, cb) {
  fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
    if (err) return;
    entries.forEach(e => {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walkDir(abs, cb);
      else {
        const rel = path.relative(baseDir, abs).replace(/\\/g, '/');
        cb(rel);
      }
    });
  });
}

// initial sync of all files
walkDir(baseDir, (rel) => sendSync(rel));

// watch for changes
fs.watch(baseDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  const rel = filename.replace(/\\/g, '/');
  // small debounce
  setTimeout(() => sendSync(rel), 100);
});

console.log('Watching', baseDir);
