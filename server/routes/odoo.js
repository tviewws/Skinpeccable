const express = require('express');
const { z } = require('zod');
const router = express.Router();

const { odooCall } = require('../lib/odoo');
const { priceOrder, resolveDiscount, PricingError } = require('../lib/pricing');

const { WARMUP_TOKEN } = process.env;

// ── Products / categories cache — serve from memory, refresh every 5 minutes
let productsCache = { data: null, expiresAt: 0 };
let categoriesCache = { data: null, expiresAt: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Content blocks cache — homepage banners, hero, new-arrivals promos
let contentBlocksCache = { data: null, expiresAt: 0 };

// ── Product tags cache — Shop by Concern (Acne, Oily Skin, etc.)
let tagsCache = { data: null, expiresAt: 0 };

// Request schemas — every public endpoint validates its input before any Odoo
// call, so untrusted payloads cannot reach the ERP.
const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    firstName: z.string().trim().max(60).optional(),
    lastName: z.string().trim().max(60).optional(),
    email: z.string().email().max(160),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(80).optional(),
  }),
  items: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    qty: z.number().int().positive().max(100),
    price: z.number().nonnegative().optional(),
  })).min(1).max(50),
  deliveryFee: z.number().nonnegative().optional(),
  deliveryZone: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000).optional(),
  discountCode: z.string().trim().max(60).nullish(),
}).passthrough();

const discountQuerySchema = z.object({
  code: z.string().trim().min(1).max(60),
  subtotal: z.coerce.number().nonnegative().default(0),
});

const contentBlocksQuerySchema = z.object({
  section: z.string().trim().max(80).optional(),
});

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

// Fetch content blocks (hero/banners/new-arrivals promos) from the
// custom Studio model, optionally filtered by section.
async function getContentBlocks(section = null) {
  const domain = [['x_active', '=', true]];
  if (section) domain.push(['x_studio_section_1', '=', section]);

  const blocks = await odooCall(
    'x_website_content_block',
    'search_read',
    [domain],
    {
      fields: [
        'id',
        'x_name',
        'x_studio_subtitle',
        'x_studio_link_url',
        'x_studio_section_1',
        'x_studio_image',
      ],
      order: 'id asc',
    }
  );

  return blocks.map((b) => ({
    id: b.id,
    title: b.x_name || '',
    subtitle: b.x_studio_subtitle || '',
    linkUrl: b.x_studio_link_url || '',
    section: b.x_studio_section_1,
    image: b.x_studio_image
      ? `data:image/png;base64,${b.x_studio_image}`
      : null,
  }));
}

// GET /api/odoo/warmup
// Pre-fills products and categories caches. Designed to be pinged by an
// external cron job every ~25 minutes (just under the 30-minute TTL) so
// real visitors never hit a cold cache.
router.get('/warmup', async (req, res) => {
  try {
    if (WARMUP_TOKEN && req.get('x-warmup-token') !== WARMUP_TOKEN) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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
          'product_tag_ids',
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
        tagIds: p.product_tag_ids || [],
      };
    });

    productsCache.data = shaped;
    productsCache.expiresAt = Date.now() + CACHE_TTL;

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

    categoriesCache.data = categories;
    categoriesCache.expiresAt = Date.now() + CACHE_TTL;

    res.json({
      success: true,
      message: `Warmed up cache with ${shaped.length} products and ${categories.length} categories`,
    });
  } catch (err) {
    console.error('Odoo warmup error:', err.message);
    res.status(500).json({ success: false, error: 'Could not warm up cache' });
  }
});

// GET /api/odoo/categories
router.get('/categories', async (req, res) => {
  try {
    if (categoriesCache.data && Date.now() < categoriesCache.expiresAt) {
      return res.json({ success: true, categories: categoriesCache.data });
    }

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

    categoriesCache.data = categories;
    categoriesCache.expiresAt = Date.now() + CACHE_TTL;

    res.json({ success: true, categories });
  } catch (err) {
    console.error('Odoo categories fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Could not load categories' });
  }
});

// GET /api/odoo/products
// Fetches all published products from Odoo and shapes them to match the frontend Product interface.
// qty_available is used to mark products as SOLD OUT when stock is zero or below.
router.get('/products', async (req, res) => {
  try {
    if (productsCache.data && Date.now() < productsCache.expiresAt) {
      return res.json({ success: true, products: productsCache.data });
    }

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
          'product_tag_ids',
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
        tagIds: p.product_tag_ids || [],
      };
    });

    productsCache.data = shaped;
    productsCache.expiresAt = Date.now() + CACHE_TTL;

    res.json({ success: true, products: shaped });
  } catch (err) {
    console.error('Odoo products fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Could not load products' });
  }
});

// GET /api/odoo/content-blocks?section=Home Hero
// Fetches homepage/banner/new-arrivals content blocks from the custom
// Website Content Block model, optionally filtered by section.
router.get('/content-blocks', async (req, res) => {
  try {
    const query = contentBlocksQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ success: false, error: 'Invalid section' });
    }

    const { section } = query.data;
    const cacheKey = section || 'all';

    if (
      contentBlocksCache.data &&
      contentBlocksCache.data[cacheKey] &&
      Date.now() < contentBlocksCache.expiresAt
    ) {
      return res.json({ success: true, blocks: contentBlocksCache.data[cacheKey] });
    }

    const blocks = await getContentBlocks(section || null);

    if (!contentBlocksCache.data) contentBlocksCache.data = {};
    contentBlocksCache.data[cacheKey] = blocks;
    contentBlocksCache.expiresAt = Date.now() + CACHE_TTL;

    res.json({ success: true, blocks });
  } catch (err) {
    console.error('Odoo content blocks fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Could not load content blocks' });
  }
});

// GET /api/odoo/tags
// Returns all product tags (used for Shop by Concern: Acne, Oily Skin, etc.)
// as { id, name } pairs so the frontend can map tag IDs to readable labels.
router.get('/tags', async (req, res) => {
  try {
    if (tagsCache.data && Date.now() < tagsCache.expiresAt) {
      return res.json({ success: true, tags: tagsCache.data });
    }

    const tags = await odooCall(
      'product.tag',
      'search_read',
      [[]],
      { fields: ['id', 'name'] }
    );

    const shaped = tags.map((t) => ({ id: t.id, name: t.name }));

    tagsCache.data = shaped;
    tagsCache.expiresAt = Date.now() + CACHE_TTL;

    res.json({ success: true, tags: shaped });
  } catch (err) {
    console.error('Odoo tags fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Could not load tags' });
  }
});

// POST /api/odoo/order
// Creates a confirmed sale order in Odoo, including a delivery fee line item.
// Line prices, the delivery fee and any discount are resolved server side from
// Odoo — the amounts sent by the browser are only used for reconciliation logs.
// Expected body:
// {
//   customer: { name, email, phone, address, city },
//   items: [{ name, qty }],
//   deliveryFee: number,    // e.g. 300
//   deliveryZone: string,   // e.g. "Zone 2 — Central Nairobi"
//   discountCode: string,
//   notes: string
// }
router.post('/order', async (req, res) => {
  try {
    const validation = orderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order data',
        details: validation.error.flatten(),
      });
    }

    const { customer, items, deliveryFee, deliveryZone, notes, discountCode } = validation.data;

    // 1. Price the order from Odoo data
    const priced = await priceOrder({ items, deliveryFee, discountCode });

    // 2. Find or create the customer in Odoo
    const partnerId = await findOrCreateCustomer(
      customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
      customer.email,
      customer.phone || ''
    );

    // 3. Build order lines for each product
    const orderLines = priced.items.map((item) => [0, 0, {
      product_id: item.productId,
      name: item.name,
      product_uom_qty: item.qty,
      price_unit: item.unitPrice,
    }]);

    // 4. Add delivery fee as a separate line item (if applicable)
    if (priced.deliveryFee > 0) {
      const deliveryProductId = await findOrCreateDeliveryProduct();
      orderLines.push([0, 0, {
        product_id: deliveryProductId,
        name: `Delivery — ${deliveryZone || 'Standard'}`,
        product_uom_qty: 1,
        price_unit: priced.deliveryFee,
      }]);
    }

    // 5. Create the sale order
    const saleOrderId = await odooCall('sale.order', 'create', [{
      partner_id: partnerId,
      order_line: orderLines,
      note: [
        notes ? `Customer note: ${notes}` : '',
        `Customer phone: ${customer.phone || 'N/A'}`,
        `Delivery zone: ${deliveryZone || 'N/A'}`,
        `Delivery address: ${customer.address || ''}${customer.city ? ', ' + customer.city : ''}`,
        discountCode ? `Discount code: ${discountCode} (KES ${priced.discountAmount})` : '',
        `Order total (incl. delivery): KES ${priced.total}`,
      ].filter(Boolean).join('\n'),
    }]);

    // 6. Confirm the order (moves it from draft to confirmed in Odoo)
    await odooCall('sale.order', 'action_confirm', [[saleOrderId]]);

    res.json({
      success: true,
      sale_order_id: saleOrderId,
      total: priced.total,
      message: `Order #${saleOrderId} created in Odoo`,
    });

  } catch (err) {
    if (err instanceof PricingError) {
      return res.status(400).json({ success: false, error: err.message });
    }
    console.error('Odoo order error:', err.message);
    res.status(500).json({ success: false, error: 'Could not create order' });
  }
});

// GET /api/odoo/discount/validate
// Validates a discount code against Odoo loyalty programs (promo_code type)
// Query: ?code=MULDIBO5&subtotal=3500
router.get('/discount/validate', async (req, res) => {
  const query = discountQuerySchema.safeParse(req.query);

  if (!query.success) {
    return res.json({ success: false, error: 'No code provided.' });
  }

  try {
    const result = await resolveDiscount(query.data.code, query.data.subtotal);

    if (!result || result.error) {
      return res.json({ success: false, error: result?.error || 'Invalid discount code.' });
    }

    return res.json({ success: true, discount: result.discount });
  } catch (err) {
    console.error('Discount validation error:', err.message);
    return res.json({ success: false, error: 'Could not validate code. Please try again.' });
  }
});

module.exports = router;
