const express = require('express');
const axios = require('axios');
const router = express.Router();

const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY } = process.env;

// Authenticate and get session cookie
async function getOdooSession() {
  const response = await axios.post(`${ODOO_URL}/web/session/authenticate`, {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      db: ODOO_DB,
      login: ODOO_USERNAME,
      password: ODOO_API_KEY
    }
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.data.result || !response.data.result.uid) {
    throw new Error('Odoo authentication failed — check your email, API key and DB name');
  }

  const cookie = response.headers['set-cookie']?.[0];
  return cookie;
}

// Make an authenticated Odoo API call
async function odooCall(model, method, args = [], kwargs = {}) {
  const cookie = await getOdooSession();

  const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, {
    jsonrpc: '2.0',
    method: 'call',
    params: { model, method, args, kwargs }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  });

  if (response.data.error) throw new Error(response.data.error.data.message);
  return response.data.result;
}

// Find or create a customer
async function findOrCreateCustomer(name, email, phone = '') {
  const existing = await odooCall('res.partner', 'search_read',
    [[['email', '=', email]]],
    { fields: ['id', 'name', 'email'], limit: 1 }
  );
  if (existing.length > 0) return existing[0].id;

  const newCustomer = await odooCall('res.partner', 'create', [{
    name,
    email,
    phone,
    customer_rank: 1
  }]);
  return newCustomer;
}

// Find product in Odoo by name, or create it if it doesn't exist
async function findOrCreateProduct(name, price) {
  const existing = await odooCall('product.product', 'search_read',
    [[['name', 'ilike', name]]],
    { fields: ['id', 'name'], limit: 1 }
  );
  if (existing.length > 0) return existing[0].id;

  // Product not found — create it
  const newProduct = await odooCall('product.product', 'create', [{
    name,
    list_price: price,
    type: 'consu'
  }]);
  return newProduct;
}

// Test route
router.get('/test', async (req, res) => {
  try {
    const result = await odooCall('res.partner', 'search_read',
      [[['customer_rank', '>', 0]]],
      { fields: ['name', 'email'], limit: 5 }
    );
    res.json({ success: true, sample_customers: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/odoo/order
router.post('/order', async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    // 1. Find or create customer
    const partnerId = await findOrCreateCustomer(
      customer.name,
      customer.email,
      customer.phone || ''
    );

    // 2. Build order lines with real product IDs
    const orderLines = await Promise.all(items.map(async (item) => {
      const productId = await findOrCreateProduct(item.name, item.price);
      return [0, 0, {
        product_id: productId,
        name: item.name,
        product_uom_qty: item.qty,
        price_unit: item.price,
      }];
    }));

    // 3. Create Sales Order
    const saleOrderId = await odooCall('sale.order', 'create', [{
      partner_id: partnerId,
      order_line: orderLines,
      note: `Order placed via Skinpeccable website. Total: KES ${total}`
    }]);

    // 4. Confirm the Sales Order
    await odooCall('sale.order', 'action_confirm', [[saleOrderId]]);

    res.json({
      success: true,
      sale_order_id: saleOrderId,
      message: `Order #${saleOrderId} created in Odoo`
    });

  } catch (err) {
    console.error('Odoo order error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;