require('dotenv').config();
const Stripe = require('stripe');
const qrcode = require('qrcode');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn('STRIPE_SECRET_KEY not found. Payment features will be disabled.');
}

exports.createIntent = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({
                success: false,
                error: 'Payment service not configured. Please set STRIPE_SECRET_KEY.'
            });
        }

        const { amount = 500, currency = 'usd' } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
        res.json({ success: true, clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
    } catch (err) {
        console.error('Stripe create intent error:', err);
        res.status(500).json({ success: false, error: 'Failed to create payment intent' });
    }
};

// Create a Checkout Session and return both URL and a QR code data URL for quick payment
exports.createCheckout = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({
                success: false,
                error: 'Payment service not configured. Please set STRIPE_SECRET_KEY.'
            });
        }

        const { amount = 500, currency = 'usd', description = 'Payment' } = req.body;
        const successUrl = process.env.PAYMENT_SUCCESS_URL || (req.headers.origin ? `${req.headers.origin}/payment/success` : 'http://localhost:3000/payment/success');
        const cancelUrl = process.env.PAYMENT_CANCEL_URL || (req.headers.origin ? `${req.headers.origin}/payment/cancel` : 'http://localhost:3000/payment/cancel');

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency, product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl
        });

        // Generate QR code for the session URL
        const qrDataUrl = await qrcode.toDataURL(session.url, { errorCorrectionLevel: 'H', margin: 1 });

        res.json({ success: true, url: session.url, qr: qrDataUrl, id: session.id });
    } catch (err) {
        console.error('Stripe checkout creation error:', err);
        res.status(500).json({ success: false, error: 'Failed to create checkout session' });
    }
};

exports.webhook = async (req, res) => {
    // webhook stub
    console.log('Payment webhook received');
    res.json({ received: true });
};
