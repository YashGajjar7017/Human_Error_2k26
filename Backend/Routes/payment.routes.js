const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/create-intent', auth, paymentController.createIntent);
router.post('/create-checkout', auth, paymentController.createCheckout);
router.post('/webhook', paymentController.webhook);

module.exports = router;
