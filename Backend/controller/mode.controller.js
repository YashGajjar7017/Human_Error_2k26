const AppMode = require('../models/AppMode.model');
const { spawn } = require('child_process');
const path = require('path');
let electronProcess = null;

exports.getMode = async (req, res) => {
  try {
    let mode = await AppMode.findOne().sort({ updatedAt: -1 });
    if (!mode) {
      mode = await AppMode.create({ mode: 'web' });
    }
    res.json({ success: true, mode: mode.mode, updatedAt: mode.updatedAt });
  } catch (err) {
    console.error('Error getting mode:', err);
    res.status(500).json({ success: false, error: 'Failed to get mode' });
  }
};

exports.setMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['web', 'electron'].includes(mode)) return res.status(400).json({ success: false, error: 'Invalid mode' });

    // Ensure only one active mode record
    await AppMode.updateMany({}, { isActive: false });
    const newMode = await AppMode.create({ mode, launchedBy: req.user?._id || null, isActive: true });

    res.json({ success: true, message: `Mode set to ${mode}`, mode: newMode.mode });
  } catch (err) {
    console.error('Error setting mode:', err);
    res.status(500).json({ success: false, error: 'Failed to set mode' });
  }
};

exports.launchElectron = async (req, res) => {
  try {
    if (electronProcess && !electronProcess.killed) {
      return res.json({ success: true, message: 'Electron already running', pid: electronProcess.pid });
    }

    // Try to launch electron from repo root (expects electron installed or available via npx)
    const repoRoot = path.join(__dirname, '..', '..');
    electronProcess = spawn('npx', ['electron', '.'], { cwd: repoRoot, detached: true, stdio: 'ignore' });

    electronProcess.unref();

    console.log('Launched electron with pid', electronProcess.pid);
    res.json({ success: true, message: 'Electron launch attempted', pid: electronProcess.pid });
  } catch (err) {
    console.error('Failed to launch electron:', err);
    res.status(500).json({ success: false, error: 'Failed to launch electron', details: err.message });
  }
};