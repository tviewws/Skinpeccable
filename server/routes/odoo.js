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

  const newProduct = await odooCall('product.product', 'create', [{
    name,
    list_price: price,
    type: 'consu'
  }]);
  return newProduct;
}

// Find or create a dedicated delivery service product in Odoo.
// We reuse the same product record every time and set the price per order line.
async function findOrCreateDeliveryProduct() {
  const existing = await odooCall('product.product', 'search_read',
    [[['name', '=', 'Delivery Fee']]],
    { fields: ['id', 'name'], limit: 1 }
  );
  if (existing.length > 0) return existing[0].id;

  const newProduct = await odooCall('product.product', 'create', [{
    name: 'Delivery Fee',
    list_price: 0,
    type: 'service',
    sale_ok: true,
    purchase_ok: false,
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

// GET /api/odoo/categories
router.get('/categories', async (req, res) => {
  try {
    const products = await odooCall(
      'product.template',
      'search_read',
      [[['is_published', '=', true]]],
      { fields: ['categ_id'] }
    );

    const categoryMap = new Map();
    for (const p of products) {
      if (p.categ_id && p.categ_id[0]) {
        categoryMap.set(p.categ_id[0], p.categ_id[1]);
      }
    }

    const categories = [
      { id: 'all', label: 'All Products' },
      ...[...categoryMap.entries()]
        .map(([, name]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];

    res.json({ success: true, categories });
  } catch (err) {
    console.error('Odoo categories fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/odoo/products
// Fetches all published products from Odoo and shapes them to match the frontend Product interface.
// qty_available is used to mark products as SOLD OUT when stock is zero or below.
router.get('/products', async (req, res) => {
  try {
    const products = await odooCall(
      'product.template',
      'search_read',
      [[['is_published', '=', true]]],
      {
        fields: [
          'id',
          'name',
          'description',
          'description_sale',
          'list_price',
          'image_1920',
          'categ_id',
          'qty_available',
        ],
      }
    );

    const shaped = products.map((p) => {
      let description = '';
      if (p.description && typeof p.description === 'string') {
        description = p.description.replace(/<[^>]*>/g, '').trim();
      } else if (p.description_sale && typeof p.description_sale === 'string') {
        description = p.description_sale.replace(/<[^>]*>/g, '').trim();
      }

      const inStock = p.qty_available > 0;

      return {
        id: `odoo_${p.id}`,
        name: p.name,
        brand: 'Skinpeccable',
        category: p.categ_id?.[1]?.toLowerCase().replace(/\s+/g, '-') || 'all',
        price: p.list_price > 0 && inStock ? p.list_price : 'SOLD OUT',
        description,
        image: p.image_1920
          ? `data:image/png;base64,${p.image_1920}`
          : '/placeholder.png',
      };
    });

    res.json({ success: true, products: shaped });
  } catch (err) {
    console.error('Odoo products fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/odoo/order
// Creates a confirmed sale order in Odoo, including a delivery fee line item.
// Expected body:
// {
//   customer: { name, email, phone, address, city },
//   items: [{ name, price, qty }],
//   total: number,          // full amount including delivery
//   deliveryFee: number,    // e.g. 300
//   deliveryZone: string,   // e.g. "Zone 2 — Central Nairobi"
//   notes: string
// }
router.post('/order', async (req, res) => {
  try {
    const { customer, items, total, deliveryFee, deliveryZone, notes } = req.body;

    // 1. Find or create the customer in Odoo
    const partnerId = await findOrCreateCustomer(
      customer.name || `${customer.firstName} ${customer.lastName}`,
      customer.email,
      customer.phone || ''
    );

    // 2. Build order lines for each product
    const orderLines = await Promise.all(items.map(async (item) => {
      const productId = await findOrCreateProduct(item.name, item.price);
      return [0, 0, {
        product_id: productId,
        name: item.name,
        product_uom_qty: item.qty,
        price_unit: item.price,
      }];
    }));

    // 3. Add delivery fee as a separate line item (if applicable)
    if (deliveryFee && deliveryFee > 0) {
      const deliveryProductId = await findOrCreateDeliveryProduct();
      orderLines.push([0, 0, {
        product_id: deliveryProductId,
        name: `Delivery — ${deliveryZone || 'Standard'}`,
        product_uom_qty: 1,
        price_unit: deliveryFee,
      }]);
    }

    // 4. Create the sale order
    const saleOrderId = await odooCall('sale.order', 'create', [{
      partner_id: partnerId,
      order_line: orderLines,
      note: [
        notes ? `Customer note: ${notes}` : '',
        `Customer phone: ${customer.phone || 'N/A'}`,
        `Delivery zone: ${deliveryZone || 'N/A'}`,
        `Delivery address: ${customer.address || ''}${customer.city ? ', ' + customer.city : ''}`,
        `Order total (incl. delivery): KES ${total}`,
      ].filter(Boolean).join('\n'),
    }]);

    // 5. Confirm the order (moves it from draft to confirmed in Odoo)
    await odooCall('sale.order', 'action_confirm', [[saleOrderId]]);

    res.json({
      success: true,
      sale_order_id: saleOrderId,
      message: `Order #${saleOrderId} created in Odoo`,
    });

  } catch (err) {
    console.error('Odoo order error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;