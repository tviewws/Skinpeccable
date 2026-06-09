/*
 * SKINPECCABLE GLOWTIQUE — Product Types
 * Static product library has been removed.
 * All products are now fetched live from Odoo via /api/odoo/products.
 * Categories are fetched live from Odoo via /api/odoo/categories.
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number | 'SOLD OUT';
  description: string;
  image: string;
  badge?: 'new' | 'glow' | 'offer';
  bestFor?: string;
  howToUse?: string;
}

// Type-safe sold-out check usable anywhere in the codebase
export function isSoldOut(product: Product): boolean {
  return product.price === 'SOLD OUT';
}