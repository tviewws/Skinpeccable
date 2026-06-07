require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/odoo', require('./routes/odoo'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Server running' }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Required for Vercel
module.exports = app;