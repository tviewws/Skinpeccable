import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Loader } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { BACKEND_URL, fetchJson } from '@/lib/api';
import { pushEcommerceEvent } from '@/lib/analytics';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    const sendOrderToOdoo = async () => {
      try {
        const raw = localStorage.getItem('pendingOrder');
        if (!raw) return;

        const order = JSON.parse(raw);

        await fetchJson(`${BACKEND_URL}/api/odoo/order`, {
          method: 'POST',
          body: JSON.stringify(order),
        });

        // Meta Pixel: Purchase event
        pushEcommerceEvent('purchase', order.total, (order.items || []).map((i: any) => ({
          item_name: i.name,
          price: i.price,
          quantity: i.qty,
        })));

        localStorage.removeItem('pendingOrder');
        console.log('Order sent to Odoo successfully');
      } catch (err) {
        console.error('Failed to send order to Odoo:', err);
      } finally {
        clearCart();
        setOrderSent(true);
      }
    };

    sendOrderToOdoo();
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
        {!orderSent ? (
          <Loader size={48} className="mx-auto mb-6 animate-spin" style={{ color: 'var(--deep-orange)' }} />
        ) : (
          <CheckCircle size={64} style={{ color: 'var(--deep-orange)' }} className="mx-auto mb-6" />
        )}
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