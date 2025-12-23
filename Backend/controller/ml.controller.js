const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const TrainingJob = require('../models/TrainingJob.model');

const uploadDir = path.join(__dirname, '..', 'ML_Data');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Accepts a data file (csv/json) and starts a training job by invoking the Python trainer
exports.startTraining = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'No data file uploaded' });

    const destDir = path.join(uploadDir, String(userId));
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const destPath = path.join(destDir, `${Date.now()}_${file.originalname}`);
    fs.renameSync(file.path, destPath);

    const job = new TrainingJob({ user: userId, filename: destPath, status: 'pending' });
    await job.save();

    // Spawn python training process (non-blocking)
    const pythonPath = process.env.PYTHON_BIN || 'python';
    const trainerScript = path.join(__dirname, '..', '..', 'CodePredictor', 'train_enhanced.py');

    const proc = spawn(pythonPath, [trainerScript, '--input', destPath], { stdio: ['ignore', 'pipe', 'pipe'] });

    job.status = 'running';
    await job.save();

    let logs = '';
    proc.stdout.on('data', (chunk) => { logs += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { logs += chunk.toString(); });

    proc.on('close', async (code) => {
      job.status = code === 0 ? 'completed' : 'failed';
      job.logs = logs;
      await job.save();
    });

    res.json({ success: true, message: 'Training started', jobId: job._id });
  } catch (err) {
    console.error('Error starting training job:', err);
    res.status(500).json({ success: false, error: 'Failed to start training job' });
  }
};
