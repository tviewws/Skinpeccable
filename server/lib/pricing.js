const { odooCall } = require('./odoo');

// Delivery fees the storefront is allowed to charge (see DELIVERY_ZONES in
// client/src/pages/Checkout.tsx). Anything else is treated as invalid.
const ALLOWED_DELIVERY_FEES = new Set([0, 200, 250, 300, 350, 500, 600]);

class PricingError extends Error {}

function normalizeDeliveryFee(fee) {
  const value = Number(fee) || 0;
  if (!ALLOWED_DELIVERY_FEES.has(value)) {
    throw new PricingError('Invalid delivery fee');
  }
  return value;
}

// Resolve each requested item against Odoo and use the price stored there.
// Client-supplied prices are never trusted; unknown products are rejected so a
// crafted request cannot inject new products into the catalogue.
async function resolveItems(items) {
  return Promise.all(
    items.map(async (item) => {
      let matches = await odooCall(
        'product.product',
        'search_read',
        [[['name', '=', item.name]]],
        { fields: ['id', 'name', 'list_price'], limit: 1 }
      );

      if (!matches.length) {
        matches = await odooCall(
          'product.product',
          'search_read',
          [[['name', 'ilike', item.name]]],
          { fields: ['id', 'name', 'list_price'], limit: 1 }
        );
      }

      if (!matches.length) {
        throw new PricingError(`Unknown product: ${item.name}`);
      }

      return {
        productId: matches[0].id,
        name: matches[0].name,
        qty: item.qty,
        unitPrice: matches[0].list_price,
      };
    })
  );
}

// Look up a promo code in Odoo's loyalty programs and return the discount it
// grants for the given subtotal, or null when the code is not applicable.
async function resolveDiscount(code, subtotal) {
  if (!code) return null;

  const normalized = String(code).toUpperCase();

  const matchingRules = await odooCall('loyalty.rule', 'search_read',
    [[['code', '=', normalized]]],
    { fields: ['id', 'program_id', 'minimum_amount', 'minimum_qty', 'code'], limit: 1 }
  );

  let programId = null;
  let minimumAmount = 0;

  if (matchingRules && matchingRules.length > 0) {
    programId = matchingRules[0].program_id[0];
    minimumAmount = matchingRules[0].minimum_amount || 0;
  } else {
    // Fallback: match against the program name (e.g. MULDIBO5%)
    const programs = await odooCall('loyalty.program', 'search_read',
      [[['program_type', '=', 'promo_code']]],
      { fields: ['id', 'name'], limit: 50 }
    );

    const match = programs.find(p =>
      p.name.toUpperCase().replace('%', '').includes(normalized) ||
      normalized.includes(p.name.toUpperCase().replace('%', ''))
    );

    if (!match) return { error: 'Invalid discount code.' };

    programId = match.id;

    const rules = await odooCall('loyalty.rule', 'search_read',
      [[['program_id', '=', programId]]],
      { fields: ['minimum_amount', 'minimum_qty'], limit: 1 }
    );
    minimumAmount = rules[0]?.minimum_amount || 0;
  }

  if (Number(subtotal) < minimumAmount) {
    return {
      error: `Minimum spend of KSh ${minimumAmount.toLocaleString()} required for this code.`,
    };
  }

  const rewards = await odooCall('loyalty.reward', 'search_read',
    [[['program_id', '=', programId]]],
    { fields: ['discount', 'discount_mode', 'reward_type'], limit: 1 }
  );

  if (!rewards.length) return { error: 'No reward found for this code.' };

  const reward = rewards[0];
  const type = reward.discount_mode === 'fixed_amount' ? 'fixed' : 'percentage';

  return {
    discount: {
      type,
      value: reward.discount,
      label: type === 'fixed'
        ? `KSh ${reward.discount.toLocaleString()} off`
        : `${reward.discount}% off`,
    },
  };
}

function discountAmountFor(discount, subtotal) {
  if (!discount) return 0;
  if (discount.type === 'percentage') {
    return Math.round((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal);
}

// Authoritative totals for an order: line prices come from Odoo, the delivery
// fee must be a known zone fee and the discount is re-validated server side.
async function priceOrder({ items, deliveryFee, discountCode }) {
  const fee = normalizeDeliveryFee(deliveryFee);
  const resolvedItems = await resolveItems(items);

  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );

  const result = await resolveDiscount(discountCode, subtotal);
  const discount = result && result.discount ? result.discount : null;
  const discountAmount = discountAmountFor(discount, subtotal);

  return {
    items: resolvedItems,
    subtotal,
    deliveryFee: fee,
    discountAmount,
    total: subtotal + fee - discountAmount,
  };
}

module.exports = {
  PricingError,
  priceOrder,
  resolveDiscount,
  normalizeDeliveryFee,
};
