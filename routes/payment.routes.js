const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
    key_id: 'rzp_test_your_key_id', // Replace with your test key_id
    key_secret: 'your_key_secret' // Replace with your test key_secret
});

// Create order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt: 'order_' + Date.now(),
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Verify the payment signature
        const generated_signature = crypto
            .createHmac('sha256', razorpay.key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
