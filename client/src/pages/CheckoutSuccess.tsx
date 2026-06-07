import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center py-20 px-4"
      style={{ backgroundColor: 'var(--light-warm-grey)' }}
    >
      <div
        className="max-w-md w-full text-center rounded-2xl p-12"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
      >
        <CheckCircle size={64} style={{ color: 'var(--deep-orange)' }} className="mx-auto mb-6" />
        <h1
          className="font-display font-semibold mb-3"
          style={{ fontSize: '2rem', color: 'var(--dark-chocolate)' }}
        >
          Order Confirmed!
        </h1>
        <p className="font-body mb-2" style={{ fontSize: '1rem', color: 'var(--charcoal)' }}>
          Thank you for choosing Skinpeccable.
        </p>
        <p className="font-body mb-8" style={{ fontSize: '0.9rem', color: 'var(--warm-taupe)' }}>
          We hope your purchase brings confidence, care and a little more glow to your routine.
        </p>
        <p className="font-display italic text-lg mb-8" style={{ color: 'var(--deep-orange)' }}>
          Glow. Different.
        </p>
        <Link href="/shop">
          <button className="btn-primary w-full justify-center">Continue Shopping</button>
        </Link>
        <Link href="/">
          <button className="btn-secondary w-full justify-center mt-3">Back to Home</button>
        </Link>
      </div>
    </div>
  );
}