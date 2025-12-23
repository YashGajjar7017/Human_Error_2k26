const mongoose = require('mongoose');

const trainingJobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String },
  status: { type: String, enum: ['pending','running','completed','failed'], default: 'pending' },
  logs: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

trainingJobSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

const TrainingJob = mongoose.model('TrainingJob', trainingJobSchema);
module.exports = TrainingJob;
