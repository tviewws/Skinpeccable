/*
 * SKINPECCABLE GLOWTIQUE — Product Data
 * Categories: Skincare, Sunscreen & SPF, Fragrance & Body Mists,
 *             Body Wash, Body Lotion & Butter, Deodorant
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  badge?: 'new' | 'glow' | 'offer';
  bestFor?: string;
  howToUse?: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'sunscreen', label: 'Sunscreen & SPF' },
  { id: 'fragrance', label: 'Fragrance & Body Mists' },
  { id: 'body-wash', label: 'Body Wash' },
  { id: 'body-lotion', label: 'Body Lotion & Butter' },
  { id: 'deodorant', label: 'Deodorant' },
];

// Curated Unsplash product images — warm, editorial, clean
const IMG = {
  serum: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  moisturizer: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  toner: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80',
  cleanser: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
  mask: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
  spf: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
  perfume: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80',
  bodymist: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
  bodywash: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
  lotion: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
  butter: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
  deodorant: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&q=80',
  eyecream: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
  retinol: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80',
};

export const PRODUCTS: Product[] = [
  // ── SKINCARE ──
  {
    id: 'sk-001',
    name: 'Radiance Renewal Serum',
    brand: 'Glow Essentials',
    category: 'skincare',
    price: 2850,
    image: IMG.serum,
    description: 'A lightweight vitamin C serum that brightens and evens skin tone for a luminous, healthy glow.',
    badge: 'glow',
    bestFor: 'Dull skin, uneven tone, hyperpigmentation',
    howToUse: 'Apply 3–4 drops to cleansed skin morning and evening before moisturiser.',
  },
  {
    id: 'sk-002',
    name: 'Deep Hydration Moisturiser',
    brand: 'Skin Ritual',
    category: 'skincare',
    price: 1950,
    image: IMG.moisturizer,
    description: 'Rich yet non-greasy daily moisturiser with hyaluronic acid and ceramides for lasting hydration.',
    badge: 'new',
    bestFor: 'Dry to normal skin, dehydration',
    howToUse: 'Apply morning and evening to face and neck after serum.',
  },
  {
    id: 'sk-003',
    name: 'Balancing Toner Mist',
    brand: 'Pure Ritual',
    category: 'skincare',
    price: 1200,
    image: IMG.toner,
    description: 'Alcohol-free toner that balances skin pH and preps skin for better product absorption.',
    bestFor: 'All skin types, oily and combination skin',
    howToUse: 'Mist onto face after cleansing or throughout the day for a refresh.',
  },
  {
    id: 'sk-004',
    name: 'Gentle Foam Cleanser',
    brand: 'Skin Ritual',
    category: 'skincare',
    price: 980,
    image: IMG.cleanser,
    description: 'Soft, foaming cleanser that removes impurities without stripping the skin\'s natural moisture barrier.',
    bestFor: 'Sensitive and normal skin',
    howToUse: 'Massage onto damp skin, rinse thoroughly. Use morning and evening.',
  },
  {
    id: 'sk-005',
    name: 'Overnight Glow Mask',
    brand: 'Glow Essentials',
    category: 'skincare',
    price: 2200,
    image: IMG.mask,
    description: 'Intensive overnight treatment that works while you sleep to reveal softer, more radiant skin by morning.',
    badge: 'glow',
    bestFor: 'Tired, dull skin needing intensive care',
    howToUse: 'Apply as the final step of your evening routine. Rinse off in the morning.',
  },
  {
    id: 'sk-006',
    name: 'Retinol Renewal Cream',
    brand: 'Derma Select',
    category: 'skincare',
    price: 3400,
    image: IMG.retinol,
    description: 'Gentle retinol formula that smooths fine lines and improves skin texture with regular use.',
    badge: 'new',
    bestFor: 'Mature skin, fine lines, uneven texture',
    howToUse: 'Apply a pea-sized amount to face every other evening. Always follow with SPF in the morning.',
  },
  {
    id: 'sk-007',
    name: 'Brightening Eye Cream',
    brand: 'Pure Ritual',
    category: 'skincare',
    price: 1750,
    image: IMG.eyecream,
    description: 'Lightweight eye cream that targets dark circles, puffiness and fine lines around the delicate eye area.',
    bestFor: 'Dark circles, puffiness, fine lines',
    howToUse: 'Gently pat a small amount around the eye area morning and evening.',
  },

  // ── SUNSCREEN & SPF ──
  {
    id: 'spf-001',
    name: 'Daily Defence SPF 50+',
    brand: 'Shield & Glow',
    category: 'sunscreen',
    price: 1650,
    image: IMG.spf,
    description: 'Lightweight, non-greasy SPF 50+ sunscreen with a soft-matte finish. No white cast.',
    badge: 'glow',
    bestFor: 'Daily protection, all skin types',
    howToUse: 'Apply generously as the final step of your morning routine. Reapply every 2 hours in direct sun.',
  },
  {
    id: 'spf-002',
    name: 'Tinted Glow SPF 40',
    brand: 'Shield & Glow',
    category: 'sunscreen',
    price: 1900,
    image: IMG.moisturizer,
    description: 'Tinted sunscreen with a natural glow finish. Provides SPF 40 protection with a hint of colour.',
    badge: 'new',
    bestFor: 'Light coverage, natural glow look',
    howToUse: 'Apply to face and neck as the last step of your morning skincare routine.',
  },
  {
    id: 'spf-003',
    name: 'Mineral Sunscreen SPF 30',
    brand: 'Pure Ritual',
    category: 'sunscreen',
    price: 1350,
    image: IMG.serum,
    description: 'Gentle mineral sunscreen with zinc oxide. Ideal for sensitive skin and everyday wear.',
    bestFor: 'Sensitive skin, children, outdoor activities',
    howToUse: 'Apply liberally 15 minutes before sun exposure. Reapply as needed.',
  },

  // ── FRAGRANCE & BODY MISTS ──
  {
    id: 'fr-001',
    name: 'Velvet Oud Eau de Parfum',
    brand: 'Maison Glow',
    category: 'fragrance',
    price: 4500,
    image: IMG.perfume,
    description: 'A warm, sophisticated fragrance with notes of oud, amber, and sandalwood. Long-lasting and distinctive.',
    badge: 'glow',
    bestFor: 'Evening wear, special occasions',
    howToUse: 'Spray onto pulse points — wrists, neck, and behind the ears.',
  },
  {
    id: 'fr-002',
    name: 'Fresh Bloom Body Mist',
    brand: 'Bloom & Glow',
    category: 'fragrance',
    price: 850,
    image: IMG.bodymist,
    description: 'Light, refreshing body mist with notes of jasmine, rose, and white musk. Perfect for everyday freshness.',
    badge: 'new',
    bestFor: 'Daily wear, warm weather, layering with perfume',
    howToUse: 'Spray generously over body after shower or throughout the day.',
  },
  {
    id: 'fr-003',
    name: 'Citrus & Cedar EDP',
    brand: 'Maison Glow',
    category: 'fragrance',
    price: 3800,
    image: IMG.perfume,
    description: 'A fresh, modern fragrance for men and women. Bright citrus top notes with a warm cedar base.',
    bestFor: 'Everyday wear, office, casual occasions',
    howToUse: 'Apply to pulse points. Layer with matching body mist for longer wear.',
  },
  {
    id: 'fr-004',
    name: 'Rose & Vanilla Mist',
    brand: 'Bloom & Glow',
    category: 'fragrance',
    price: 780,
    image: IMG.bodymist,
    description: 'Romantic and warm body mist with rose petals and creamy vanilla. Soft, feminine, and long-lasting.',
    bestFor: 'Romantic occasions, layering fragrance',
    howToUse: 'Mist over body after moisturising for best results.',
  },

  // ── BODY WASH ──
  {
    id: 'bw-001',
    name: 'Coconut Milk Body Wash',
    brand: 'Nourish & Glow',
    category: 'body-wash',
    price: 750,
    image: IMG.bodywash,
    description: 'Creamy, moisturising body wash with coconut milk and shea butter. Leaves skin soft and hydrated.',
    badge: 'glow',
    bestFor: 'Dry skin, daily cleansing',
    howToUse: 'Apply to wet skin, lather, rinse thoroughly.',
  },
  {
    id: 'bw-002',
    name: 'Charcoal Detox Shower Gel',
    brand: 'Pure Ritual',
    category: 'body-wash',
    price: 920,
    image: IMG.bodywash,
    description: 'Deep-cleansing shower gel with activated charcoal that draws out impurities and refreshes skin.',
    badge: 'new',
    bestFor: 'Oily skin, post-workout cleansing',
    howToUse: 'Apply to wet skin, massage in circular motions, rinse well.',
  },
  {
    id: 'bw-003',
    name: 'Lavender & Honey Wash',
    brand: 'Nourish & Glow',
    category: 'body-wash',
    price: 680,
    image: IMG.bodywash,
    description: 'Calming body wash with lavender essential oil and honey. Perfect for evening wind-down routines.',
    bestFor: 'Sensitive skin, evening routine, relaxation',
    howToUse: 'Use in the shower or bath. Rinse thoroughly.',
  },

  // ── BODY LOTION & BUTTER ──
  {
    id: 'bl-001',
    name: 'Shea & Mango Body Butter',
    brand: 'Nourish & Glow',
    category: 'body-lotion',
    price: 1100,
    image: IMG.butter,
    description: 'Rich, whipped body butter with shea and mango butter. Intensely nourishes and softens dry skin.',
    badge: 'glow',
    bestFor: 'Very dry skin, elbows, knees, heels',
    howToUse: 'Apply to clean skin after bathing. Focus on dry areas.',
  },
  {
    id: 'bl-002',
    name: 'Daily Glow Body Lotion',
    brand: 'Skin Ritual',
    category: 'body-lotion',
    price: 850,
    image: IMG.lotion,
    description: 'Lightweight daily lotion with vitamin E and aloe vera. Absorbs quickly for all-day hydration.',
    badge: 'new',
    bestFor: 'Normal to oily skin, daily use',
    howToUse: 'Apply to body after shower while skin is slightly damp for best absorption.',
  },
  {
    id: 'bl-003',
    name: 'Rose Hip Body Oil',
    brand: 'Pure Ritual',
    category: 'body-lotion',
    price: 1450,
    image: IMG.lotion,
    description: 'Luxurious dry body oil with rosehip and argan oil. Nourishes skin and leaves a subtle golden sheen.',
    bestFor: 'Dry skin, stretch marks, evening care',
    howToUse: 'Apply a few drops to skin and massage in circular motions until absorbed.',
  },
  {
    id: 'bl-004',
    name: 'Cocoa Butter Cream',
    brand: 'Nourish & Glow',
    category: 'body-lotion',
    price: 720,
    image: IMG.butter,
    description: 'Classic cocoa butter cream that deeply moisturises and helps improve skin elasticity.',
    bestFor: 'Dry skin, stretch marks, daily moisture',
    howToUse: 'Massage into skin morning and evening, focusing on dry areas.',
  },

  // ── DEODORANT ──
  {
    id: 'deo-001',
    name: 'Natural Mineral Deodorant',
    brand: 'Pure Ritual',
    category: 'deodorant',
    price: 650,
    image: IMG.toner,
    description: 'Aluminium-free mineral deodorant with baking soda and coconut oil. Effective 24-hour protection.',
    badge: 'glow',
    bestFor: 'Sensitive underarms, natural lifestyle',
    howToUse: 'Apply to clean, dry underarms. Allow to dry before dressing.',
  },
  {
    id: 'deo-002',
    name: 'Fresh Citrus Roll-On',
    brand: 'Shield & Glow',
    category: 'deodorant',
    price: 480,
    image: IMG.toner,
    description: 'Light, fresh roll-on deodorant with citrus and green tea extract. 48-hour odour protection.',
    badge: 'new',
    bestFor: 'Everyday use, active lifestyle',
    howToUse: 'Roll onto clean, dry underarms. Allow to dry before dressing.',
  },
  {
    id: 'deo-003',
    name: 'Charcoal Detox Deodorant',
    brand: 'Pure Ritual',
    category: 'deodorant',
    price: 720,
    image: IMG.cleanser,
    description: 'Activated charcoal deodorant stick that absorbs excess moisture and neutralises odour naturally.',
    bestFor: 'Active lifestyle, heavy sweating',
    howToUse: 'Apply to clean underarms. Can be used morning and evening.',
  },
];

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === categoryId);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}
