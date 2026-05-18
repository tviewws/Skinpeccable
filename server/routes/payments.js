const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const IntaSend = require('intasend-node');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY,
  process.env.INTASEND_SECRET_KEY,
  false // true = test mode, change to false when going live
);

// ── STRIPE — Create Payment Intent (card payments)
router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'kes', customerEmail, customerName } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses lowest currency unit
      currency,
      receipt_email: customerEmail,
      metadata: { customerName, customerEmail }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── STRIPE — Webhook (called by Stripe when payment succeeds)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Stripe payment succeeded:', paymentIntent.id);
  }

  res.json({ received: true });
});

// ── INTASEND — Initiate M-Pesa STK Push
router.post('/mpesa/initiate', async (req, res) => {
  try {
    const { phone, amount, customerName, customerEmail } = req.body;

    // Format phone — must be 254XXXXXXXXX format
    let formattedPhone = phone.toString().trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    console.log('Initiating M-Pesa STK push:', {
      phone: formattedPhone,
      amount,
      firstName,
      lastName,
      customerEmail
    });

    const collection = intasend.collection();
    const response = await collection.mpesaStkPush({
      first_name: firstName,
      last_name: lastName,
      email: customerEmail,
      host: 'https://muigaikamau.odoo.com',
      amount: Math.round(amount),
      phone_number: formattedPhone,
      api_ref: `SKINPECCABLE-${Date.now()}`
    });

    console.log('Intasend full response:', JSON.stringify(response, null, 2));

    res.json({
      success: true,
      invoice_id: response.invoice?.invoice_id,
      state: response.invoice?.state,
      message: 'STK push sent — customer should see M-Pesa prompt on their phone'
    });

  } catch (err) {
    console.error('M-Pesa full error:', JSON.stringify(err, null, 2));
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
      details: JSON.stringify(err)
    });
  }
});

// ── INTASEND — Check M-Pesa Payment Status
router.post('/mpesa/status', async (req, res) => {
  try {
    const { invoice_id } = req.body;

    console.log('Checking M-Pesa status for invoice:', invoice_id);

    const collection = intasend.collection();
    const response = await collection.status({ invoice_id });

    console.log('M-Pesa status response:', JSON.stringify(response, null, 2));

    res.json({
      success: true,
      status: response.invoice?.state,
      invoice_id,
      // States: PENDING, PROCESSING, COMPLETE, FAILED
    });

  } catch (err) {
    console.error('M-Pesa status error:', JSON.stringify(err, null, 2));
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
      details: JSON.stringify(err)
    });
  }
});

module.exports = router;