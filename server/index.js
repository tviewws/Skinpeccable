require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.disable('x-powered-by');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 requests per IP per window
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Tighter limit for the endpoints that create records or start payments
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/odoo/order', writeLimiter);
app.use('/api/payments/pesapal/initiate', writeLimiter);

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://skinpeccable.vercel.app',
  'https://skinpeccable.co.ke',
  'https://www.skinpeccable.co.ke',
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api/odoo', require('./routes/odoo'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Server running' }));

// Fallback error handler — log details, return a generic message
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
