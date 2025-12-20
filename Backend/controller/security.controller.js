const SecurityKey = require('../models/SecurityKey.model');
const crypto = require('crypto');
const User = require('../models/User.model');

// Store JWT token hash for a user
exports.storeJwt = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'token is required' });

    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const entry = new SecurityKey({ user: userId, tokenHash, meta: { ip: req.ip } });
    await entry.save();

    // Optionally save reference on user
    await User.findByIdAndUpdate(userId, { $set: { refreshToken: token } });

    res.json({ success: true, message: 'Token stored securely.' });
  } catch (err) {
    console.error('Error storing JWT:', err);
    res.status(500).json({ success: false, error: 'Failed to store token.' });
  }
};
