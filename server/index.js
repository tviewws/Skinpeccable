require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { logError } = require('./lib/errors');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 requests per IP per window
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

app.use(cors({
  origin: ['http://localhost:3000', 'https://skinpeccable.vercel.app', 'https://skinpeccable.co.ke', 'https://www.skinpeccable.co.ke']
}));
app.use(express.json());

// Routes
app.use('/api/odoo', require('./routes/odoo'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Server running' }));

// Unknown API routes must not fall through as an HTML 404 the frontend then
// fails to parse as JSON.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Unknown endpoint: ${req.method} ${req.originalUrl}` });
});

// Central error handler — every route failure lands here with the upstream
// detail intact in the logs and a JSON body the frontend can read.
app.use((err, req, res, next) => {
  const info = logError(`${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return next(err);
  res.status(info.status).json({ success: false, error: info.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  logError('server:listen', err);
  process.exit(1);
});

// A rejection or throw outside a request would otherwise die silently (or
// leave the process in an unknown state) with nothing in the logs.
process.on('unhandledRejection', (reason) => {
  logError('process:unhandledRejection', reason);
});

process.on('uncaughtException', (err) => {
  logError('process:uncaughtException', err);
  server.close(() => process.exit(1));
});

module.exports = app;