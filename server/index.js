require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 requests per IP per window
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

app.use(cors({
  origin: ['http://localhost:3000', 'https://skinpeccable.vercel.app']
}));
app.use(express.json());

// Routes
app.use('/api/odoo', require('./routes/odoo'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Server running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;