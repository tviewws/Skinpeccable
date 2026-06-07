/*
 * SKINPECCABLE GLOWTIQUE — Product Detail Page
 * Route: /shop/:id
 * Design: "Structured Warmth" — full product view with image, description, add to cart
 */

import { useParams, useLocation } from 'wouter';
import { ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const product = PRODUCTS.find(p => String(p.id) === String(id));

  // ── 404 fallback
  if (!product) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center py-24 px-4"
        style={{ backgroundColor: 'var(--light-warm-grey)' }}
      >
        <p className="font-display text-2xl mb-4" style={{ color: 'var(--dark-chocolate)' }}>
          Product not found
        </p>
        <button onClick={() => navigate('/shop')} className="btn-secondary">
          <ArrowLeft size={15} /> Back to Shop
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.name} added to your bag`, {
      description: `KSh ${product.price.toLocaleString()}`,
      duration: 2500,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ backgroundColor: 'var(--light-warm-grey)', minHeight: '100vh' }}>
      <div className="container py-10">

        {/* Back link */}
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 font-body text-sm mb-8 transition-colors"
          style={{ color: 'var(--warm-taupe)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--dark-chocolate)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--warm-taupe)')}
        >
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── PRODUCT IMAGE */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '4/5',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--soft-border-beige)',
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* ── PRODUCT INFO */}
          <div className="flex flex-col gap-6 pt-2">

            {/* Badge */}
            {product.badge && (
              <div>
                {product.badge === 'new' && <span className="badge-new">New</span>}
                {product.badge === 'glow' && <span className="badge-glow">Glow Pick</span>}
                {product.badge === 'offer' && (
                  <span className="badge-new" style={{ backgroundColor: 'var(--dark-chocolate)' }}>
                    Offer
                  </span>
                )}
              </div>
            )}

            {/* Brand */}
            <p
              className="font-body font-medium tracking-widest uppercase"
              style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.18em' }}
            >
              {product.brand}
            </p>

            {/* Name */}
            <h1
              className="font-display font-semibold leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--dark-chocolate)' }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <p
              className="font-body font-bold"
              style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
            >
              KSh {product.price.toLocaleString()}
            </p>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--soft-border-beige)' }} />

            {/* Description */}
            <div>
              <p
                className="font-body font-semibold text-xs uppercase tracking-widest mb-3"
                style={{ color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
              >
                About this product
              </p>
              <p
                className="font-body leading-relaxed"
                style={{ fontSize: '0.9375rem', color: 'var(--charcoal)', lineHeight: 1.8 }}
              >
                {product.description}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--soft-border-beige)' }} />

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-body font-semibold transition-all duration-200"
              style={{
                fontSize: '1rem',
                backgroundColor: added ? 'var(--dark-chocolate)' : 'var(--deep-orange)',
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {added ? (
                <>
                  <CheckCircle size={18} />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Bag
                </>
              )}
            </button>

            {/* Trust note */}
            <p
              className="font-body text-xs text-center"
              style={{ color: 'var(--warm-taupe)' }}
            >
              🔒 Secure checkout · Delivery across Nairobi · 100% authentic
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}