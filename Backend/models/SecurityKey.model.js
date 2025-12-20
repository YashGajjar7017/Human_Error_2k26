const mongoose = require('mongoose');

const securityKeySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} }
});

const SecurityKey = mongoose.model('SecurityKey', securityKeySchema);
module.exports = SecurityKey;
