const express = require('express');
const router = express.Router();

// Mock notification routes
router.get('/', (req, res) => {
    res.json({ notifications: [] });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Notification created' });
});

module.exports = router;
