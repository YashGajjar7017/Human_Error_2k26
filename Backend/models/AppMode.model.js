const mongoose = require('mongoose');

const appModeSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['web', 'electron'],
    default: 'web'
  },
  launchedBy: { // user who initiated last change (optional)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const AppMode = mongoose.model('AppMode', appModeSchema);
module.exports = AppMode;
