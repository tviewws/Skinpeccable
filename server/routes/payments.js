const express = require('express');
const router = express.Router();
const axios = require('axios');
const { z } = require('zod');

const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_ENV,
  PESAPAL_IPN_URL,
  PESAPAL_CALLBACK_URL,
} = process.env;

// Validation schema
const orderSchema = z.object({
  amount: z.number().positive(),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(9),
    address: z.string().min(1),
    city: z.string().min(1),
  }),
  items: z.array(z.any()).min(1),
});

// Use sandbox or live URL based on environment
const PESAPAL_BASE =
  PESAPAL_ENV === 'live'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

// ── STEP 1: Get Pesapal auth token
async function getPesapalToken() {
  const res = await axios.post(
    `${PESAPAL_BASE}/api/Auth/RequestToken`,
    {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    },
    { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
  );

  if (!res.data.token) {
    throw new Error('Pesapal auth failed — check your consumer key and secret');
  }

  return res.data.token;
}

// ── STEP 2: Register IPN (only needs to happen once, but safe to call each time)
async function registerIPN(token) {
  const res = await axios.post(
    `${PESAPAL_BASE}/api/URLSetup/RegisterIPN`,
    {
      url: PESAPAL_IPN_URL,
      ipn_notification_type: 'GET',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.data.ipn_id) {
    throw new Error('IPN registration failed');
  }

  return res.data.ipn_id;
}

// ── STEP 3: Submit order to Pesapal and get redirect URL
async function submitOrder(token, ipnId, orderData) {
  const { customer, items, amount, notes } = orderData;

  const payload = {
    id: `SKP-${Date.now()}`,               // unique order ID
    currency: 'KES',
    amount,
    description: `Skinpeccable order — ${items.length} item(s)`,
    callback_url: PESAPAL_CALLBACK_URL,
    notification_id: ipnId,
    billing_address: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email_address: customer.email,
      phone_number: customer.phone,
      line_1: customer.address,
      city: customer.city,
      country_code: 'KE',
    },
  };

  const res = await axios.post(
    `${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.data.redirect_url) {
    throw new Error('No redirect URL returned from Pesapal');
  }

  return {
    redirect_url: res.data.redirect_url,
    order_tracking_id: res.data.order_tracking_id,
  };
}

// ── POST /api/payments/pesapal/initiate
// Called by checkout page — registers order and returns Pesapal redirect URL
router.post('/pesapal/initiate', async (req, res) => {
  try {
    const validation = orderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order data',
        details: validation.error.flatten(),
      });
    }

    const { customer, items, amount, notes } = req.body;

    // 1. Get auth token
    const token = await getPesapalToken();

    // 2. Register IPN
    const ipnId = await registerIPN(token);

    // 3. Submit order and get redirect URL
    const { redirect_url, order_tracking_id } = await submitOrder(token, ipnId, {
      customer,
      items,
      amount,
      notes,
    });

    console.log(`Pesapal order created: ${order_tracking_id}`);

    res.json({ success: true, redirect_url, order_tracking_id });

  } catch (err) {
    console.error('Pesapal initiate error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/payments/pesapal/ipn
// Called by Pesapal when payment status changes
router.get('/pesapal/ipn', async (req, res) => {
  try {
    const { orderTrackingId, orderMerchantReference, orderNotificationType } = req.query;

    console.log('Pesapal IPN received:', {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationType,
    });

    // Get token to check transaction status
    const token = await getPesapalToken();

    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = statusRes.data.payment_status_description;
    console.log(`Payment status for ${orderTrackingId}: ${status}`);

    // Respond to Pesapal to confirm IPN was received
    res.json({ orderNotificationType, orderTrackingId, orderMerchantReference, status: '200' });

  } catch (err) {
    console.error('Pesapal IPN error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/payments/pesapal/status
// Check payment status manually (called from frontend if needed)
router.get('/pesapal/status', async (req, res) => {
  try {
    const { orderTrackingId } = req.query;

    if (!orderTrackingId) {
      return res.status(400).json({ success: false, error: 'orderTrackingId is required' });
    }

    const token = await getPesapalToken();

    const statusRes = await axios.get(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({
      success: true,
      status: statusRes.data.payment_status_description,
      data: statusRes.data,
    });

  } catch (err) {
    console.error('Pesapal status error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;