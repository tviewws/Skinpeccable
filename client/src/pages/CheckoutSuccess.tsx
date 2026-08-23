import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, Loader, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { postJson } from '@/lib/api';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [orderSent, setOrderSent] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const sendOrderToOdoo = async () => {
      setSyncError(null);

      try {
        const raw = localStorage.getItem('pendingOrder');
        if (!raw) {
          setOrderSent(true);
          return;
        }

        const order = JSON.parse(raw);

        await postJson('/api/odoo/order', order);

        // Meta Pixel: Purchase event
        if (typeof window !== 'undefined') {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: 'purchase',
            ecommerce: {
              currency: 'KES',
              value: order.total,
              items: (order.items || []).map((i: any) => ({
                item_name: i.name,
                price: i.price,
                quantity: i.qty,
              })),
            },
          });
        }

        localStorage.removeItem('pendingOrder');
        setOrderSent(true);
      } catch (err: unknown) {
        // The payment went through, but the order was not recorded. Keep
        // pendingOrder so it can be retried and tell the shopper instead of
        // showing an unqualified confirmation.
        console.error('Failed to send order to Odoo:', err);
        setSyncError(
          err instanceof Error
            ? err.message
            : 'We could not record your order details.'
        );
      } finally {
        clearCart();
      }
    };

    sendOrderToOdoo();
  }, [retryKey]);

  return (
    <div
      className="min-h-screen flex items-center justify-center py-20 px-4"
      style={{ backgroundColor: 'var(--light-warm-grey)' }}
    >
      <div
        className="max-w-md w-full text-center rounded-2xl p-12"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
      >
        {syncError ? (
          <AlertTriangle size={64} style={{ color: 'var(--deep-orange)' }} className="mx-auto mb-6" />
        ) : !orderSent ? (
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
        {syncError && (
          <div
            className="font-body text-left rounded-lg p-4 mb-8"
            style={{
              fontSize: '0.85rem',
              color: 'var(--dark-chocolate)',
              backgroundColor: 'var(--light-warm-grey)',
              border: '1px solid var(--soft-border-beige)',
            }}
          >
            <p className="mb-3">
              Your payment went through, but we couldn't send your order details to
              our system ({syncError}). Please retry below or contact us so we can
              confirm your delivery.
            </p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              Retry Sending Order
            </button>
          </div>
        )}

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