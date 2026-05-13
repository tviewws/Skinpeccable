/*
 * SKINPECCABLE GLOWTIQUE — Cart Drawer
 * Slides in from right; shows cart items, quantity controls, total, checkout CTA
 */

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'wouter';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #D8C7B8' }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} style={{ color: 'var(--dark-chocolate)' }} />
            <span className="font-body font-semibold" style={{ fontSize: '1rem', color: 'var(--dark-chocolate)' }}>
              Your Bag
            </span>
            {totalItems > 0 && (
              <span
                className="font-body font-bold text-white rounded-full px-2 py-0.5"
                style={{ fontSize: '0.7rem', backgroundColor: 'var(--deep-orange)' }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-soft-cream"
            aria-label="Close cart"
          >
            <X size={18} style={{ color: 'var(--warm-taupe)' }} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <ShoppingBag size={48} style={{ color: 'var(--soft-border-beige)' }} />
              <div>
                <p className="font-display font-semibold text-xl" style={{ color: 'var(--dark-chocolate)' }}>
                  Your glow bag is empty
                </p>
                <p className="font-body text-sm mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  Explore our latest picks and start your routine.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-secondary mt-2"
                style={{ fontSize: '0.8rem', padding: '0.6rem 1.5rem' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4"
                  style={{ borderBottom: '1px solid #F6F1EB' }}
                >
                  {/* Product Image */}
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid #D8C7B8' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-body font-medium leading-snug"
                      style={{ fontSize: '0.875rem', color: 'var(--dark-chocolate)' }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="font-body mt-0.5"
                      style={{ fontSize: '0.75rem', color: 'var(--warm-taupe)' }}
                    >
                      {item.brand}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div
                        className="flex items-center gap-2 rounded-full px-2 py-1"
                        style={{ border: '1px solid #D8C7B8' }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full transition-colors hover:bg-soft-cream"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={10} style={{ color: 'var(--dark-chocolate)' }} />
                        </button>
                        <span
                          className="font-body font-semibold w-5 text-center"
                          style={{ fontSize: '0.8rem', color: 'var(--dark-chocolate)' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded-full transition-colors hover:bg-soft-cream"
                          aria-label="Increase quantity"
                        >
                          <Plus size={10} style={{ color: 'var(--dark-chocolate)' }} />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <span
                          className="font-body font-semibold"
                          style={{ fontSize: '0.9rem', color: 'var(--dark-chocolate)' }}
                        >
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 size={13} style={{ color: '#B42318' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — Total + Checkout */}
        {items.length > 0 && (
          <div
            className="px-6 py-5"
            style={{ borderTop: '1px solid #D8C7B8', backgroundColor: '#FAFAF9' }}
          >
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-sm" style={{ color: 'var(--warm-taupe)' }}>Subtotal</span>
              <span className="font-body font-semibold" style={{ color: 'var(--dark-chocolate)' }}>
                KSh {totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="font-body text-xs mb-4" style={{ color: 'var(--warm-taupe)' }}>
              Shipping and taxes calculated at checkout.
            </p>

            {/* Checkout CTA */}
            <Link href="/checkout" onClick={closeCart}>
              <button className="btn-primary w-full justify-center" style={{ fontSize: '0.875rem' }}>
                Proceed to Checkout
              </button>
            </Link>

            <button
              onClick={closeCart}
              className="w-full mt-3 font-body font-medium text-sm py-2 transition-colors"
              style={{ color: 'var(--warm-taupe)' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
