const fs = require('fs').promises;
const path = require('path');

// Basic path sanitization helper - prevents path traversal by resolving and ensuring under allowed base
function resolveSafe(baseDir, target) {
  const absBase = path.resolve(baseDir);
  const absTarget = path.resolve(target.startsWith(path.sep) ? target : path.join(absBase, target));
  if (!absTarget.startsWith(absBase)) {
    throw new Error('Path out of range');
  }
  return absTarget;
}

// Default base (can be overridden by query param `base` but will be resolved)
const DEFAULT_BASE = process.env.EDITOR_BASE_DIR || path.join(__dirname, '../../');

exports.listDir = async (req, res) => {
  try {
    const base = req.query.base ? path.resolve(req.query.base) : DEFAULT_BASE;
    const rel = req.query.path || '.';
    const dirPath = resolveSafe(base, rel);

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result = entries.map(e => ({
      name: e.name,
      isDirectory: e.isDirectory()
    }));
    res.json({ success: true, path: rel, entries: result });
  } catch (err) {
    console.error('[EDITOR] listDir error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.readFile = async (req, res) => {
  try {
    const base = req.query.base ? path.resolve(req.query.base) : DEFAULT_BASE;
    const filePath = req.body.path;
    if (!filePath) return res.status(400).json({ success: false, error: 'Missing path' });
    const abs = resolveSafe(base, filePath);
    const stat = await fs.stat(abs);
    if (stat.isDirectory()) return res.status(400).json({ success: false, error: 'Path is a directory' });
    const content = await fs.readFile(abs, 'utf8');
    res.json({ success: true, path: filePath, content, mimetype: 'text/plain' });
  } catch (err) {
    console.error('[EDITOR] readFile error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.writeFile = async (req, res) => {
  try {
    const base = req.query.base ? path.resolve(req.query.base) : DEFAULT_BASE;
    const filePath = req.body.path;
    const content = req.body.content;
    if (!filePath) return res.status(400).json({ success: false, error: 'Missing path' });
    const abs = resolveSafe(base, filePath);
    // Ensure directory exists
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, 'utf8');
    res.json({ success: true, path: filePath });
  } catch (err) {
    console.error('[EDITOR] writeFile error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Receive sync updates from watcher tool (filePath relative to watcher base)
exports.syncReceive = async (req, res) => {
  try {
    const base = req.body.base ? path.resolve(req.body.base) : DEFAULT_BASE;
    const filePath = req.body.path; // relative
    const content = req.body.content;
    if (!filePath) return res.status(400).json({ success: false, error: 'Missing path' });
    const abs = resolveSafe(base, filePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content || '', 'utf8');
    console.log(`[EDITOR] syncReceive wrote ${abs}`);
    res.json({ success: true, path: filePath });
  } catch (err) {
    console.error('[EDITOR] syncReceive error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
