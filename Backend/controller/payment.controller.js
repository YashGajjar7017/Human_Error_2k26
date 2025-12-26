require('dotenv').config();
const Stripe = require('stripe');
const qrcode = require('qrcode');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

exports.createIntent = async (req, res) => {
    try {
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
