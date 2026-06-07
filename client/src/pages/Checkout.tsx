/*
 * SKINPECCABLE GLOWTIQUE — Checkout Page
 * Design: "Structured Warmth" — clean checkout, order summary, Pesapal payment
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Lock,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Poppins', sans-serif",
  fontSize: '0.875rem',
  padding: '0.75rem 1rem',
  borderRadius: '0.375rem',
  border: '1px solid var(--soft-border-beige)',
  backgroundColor: '#FFFFFF',
  color: 'var(--dark-chocolate)',
  outline: 'none',
  transition: 'border-color 200ms ease',
};

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const total = totalPrice;

  // ── INITIATE PESAPAL PAYMENT
  const handlePesapalPay = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/pesapal/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
          },
          items: items.map(i => ({
            name: i.name,
            price: i.price,
            qty: i.quantity,
          })),
          amount: total,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.redirect_url) {
        setError(data.error || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.redirect_url;

    } catch (err) {
      setError('Could not connect to the payment server. Please check your internet and try again.');
      setLoading(false);
    }
  };

  // ── SUCCESS PAGE
  if (step === 'success') {
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

  return (
    <div style={{ backgroundColor: 'var(--light-warm-grey)', minHeight: '100vh' }}>
      <div className="container py-10">

        {/* Back link */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop">
            <button
              className="flex items-center gap-2 font-body text-sm transition-colors"
              style={{ color: 'var(--warm-taupe)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--dark-chocolate)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--warm-taupe)')}
            >
              <ArrowLeft size={16} /> Back to Shop
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              {['details', 'payment'].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-sm"
                    style={{
                      backgroundColor:
                        step === s || (step === 'payment' && s === 'details')
                          ? 'var(--deep-orange)'
                          : 'var(--soft-border-beige)',
                      color:
                        step === s || (step === 'payment' && s === 'details')
                          ? '#FFFFFF'
                          : 'var(--warm-taupe)',
                    }}
                  >
                    {step === 'payment' && s === 'details' ? '✓' : i + 1}
                  </div>
                  <span
                    className="font-body font-medium text-sm capitalize"
                    style={{ color: step === s ? 'var(--dark-chocolate)' : 'var(--warm-taupe)' }}
                  >
                    {s === 'details' ? 'Delivery Details' : 'Payment'}
                  </span>
                  {i === 0 && (
                    <div className="w-8 h-px" style={{ backgroundColor: 'var(--soft-border-beige)' }} />
                  )}
                </div>
              ))}
            </div>

            {/* ── STEP 1: DELIVERY DETAILS */}
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit}>
                <div
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
                >
                  <h2
                    className="font-display font-semibold mb-6"
                    style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
                  >
                    Delivery Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {[
                      { name: 'firstName', label: 'First Name', placeholder: 'Jane' },
                      { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
                    ].map(field => (
                      <div key={field.name}>
                        <label
                          className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                          style={{ color: 'var(--warm-taupe)' }}
                        >
                          {field.label} *
                        </label>
                        <input
                          type="text"
                          name={field.name}
                          value={(form as any)[field.name]}
                          onChange={handleChange}
                          required
                          placeholder={field.placeholder}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label
                        className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                        style={{ color: 'var(--warm-taupe)' }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="jane@email.com"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                    </div>
                    <div>
                      <label
                        className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                        style={{ color: 'var(--warm-taupe)' }}
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="+254 700 000 000"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label
                      className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="Street address, apartment, area"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="Nairobi"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                    />
                  </div>

                  <div className="mb-7">
                    <label
                      className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      Order Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any special instructions for your order?"
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center">
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: PAYMENT — Pesapal */}
            {step === 'payment' && (
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
              >
                <h2
                  className="font-display font-semibold mb-2"
                  style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
                >
                  Payment
                </h2>
                <p className="font-body text-sm mb-8" style={{ color: 'var(--warm-taupe)' }}>
                  All transactions are secure and encrypted.
                </p>

                <div
                  className="rounded-xl p-5 mb-8"
                  style={{
                    border: '2px solid var(--deep-orange)',
                    backgroundColor: '#FFF8F4',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body font-semibold" style={{ color: 'var(--dark-chocolate)', fontSize: '1rem' }}>
                      Pesapal
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded" style={{ backgroundColor: '#1A1F71' }}>
                        <span className="font-body font-bold text-white" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>VISA</span>
                      </div>
                      <div className="flex">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#EB001B', marginRight: '-6px' }} />
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#F79E1B', opacity: 0.9 }} />
                      </div>
                      <div className="px-2 py-1 rounded" style={{ backgroundColor: '#4CAF50' }}>
                        <span className="font-body font-bold text-white" style={{ fontSize: '0.55rem', letterSpacing: '0.02em' }}>M-PESA</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-sm" style={{ color: 'var(--charcoal)', lineHeight: 1.6 }}>
                    You'll be redirected to Pesapal to complete your purchase. Pay with <strong>M-Pesa</strong> or any <strong>Visa / Mastercard</strong> — all handled securely on Pesapal's page.
                  </p>
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-xl mb-6"
                  style={{ backgroundColor: 'var(--soft-cream)', border: '1px solid var(--soft-border-beige)' }}
                >
                  <span className="font-body font-medium text-sm" style={{ color: 'var(--charcoal)' }}>
                    Amount to pay
                  </span>
                  <span
                    className="font-body font-bold"
                    style={{ fontSize: '1.125rem', color: 'var(--dark-chocolate)' }}
                  >
                    KSh {total.toLocaleString()}
                  </span>
                </div>

                {error && (
                  <div
                    className="p-4 rounded-xl mb-5"
                    style={{ backgroundColor: '#FFF1F1', border: '1px solid #FECACA' }}
                  >
                    <p className="font-body text-sm" style={{ color: '#991B1B' }}>{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="btn-secondary flex items-center gap-2"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handlePesapalPay}
                    disabled={loading}
                    className="btn-primary flex-1 justify-center flex items-center gap-2"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        Pay now — KSh {total.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>

                <p className="font-body text-xs text-center mt-4" style={{ color: 'var(--warm-taupe)' }}>
                  🔒 Payments are secured by Pesapal
                </p>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY */}
          <div className="space-y-5">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
            >
              <h3
                className="font-display font-semibold mb-5"
                style={{ fontSize: '1.25rem', color: 'var(--dark-chocolate)' }}
              >
                Order Summary
                <span className="font-body font-normal text-sm ml-2" style={{ color: 'var(--warm-taupe)' }}>
                  ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </span>
              </h3>

              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={36} style={{ color: 'var(--soft-border-beige)' }} className="mx-auto mb-3" />
                  <p className="font-body text-sm" style={{ color: 'var(--warm-taupe)' }}>Your bag is empty</p>
                  <Link href="/shop">
                    <button className="btn-primary mt-4 text-sm" style={{ fontSize: '0.8rem', padding: '0.6rem 1.5rem' }}>
                      Shop Now
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-5">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div
                          className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ border: '1px solid var(--soft-border-beige)' }}
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-body font-medium text-sm leading-snug"
                            style={{ color: 'var(--dark-chocolate)' }}
                          >
                            {item.name}
                          </p>
                          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span
                          className="font-body font-semibold text-sm flex-shrink-0"
                          style={{ color: 'var(--dark-chocolate)' }}
                        >
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--soft-border-beige)' }}>
                    <div
                      className="flex justify-between font-body font-bold pt-3"
                      style={{
                        color: 'var(--dark-chocolate)',
                        fontSize: '1rem',
                      }}
                    >
                      <span>Total</span>
                      <span>KSh {total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ backgroundColor: 'var(--soft-cream)', border: '1px solid var(--soft-border-beige)' }}
            >
              {[
                { icon: <Lock size={14} />, text: 'Secure checkout' },
                { icon: <Truck size={14} />, text: 'Delivery across Nairobi' },
                { icon: <CheckCircle size={14} />, text: '100% authentic products' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span style={{ color: 'var(--deep-orange)' }}>{item.icon}</span>
                  <span className="font-body text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}