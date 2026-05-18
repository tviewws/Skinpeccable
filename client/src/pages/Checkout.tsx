/*
 * SKINPECCABLE GLOWTIQUE — Checkout Page
 * Design: "Structured Warmth" — clean checkout, order summary, payment options
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { ShoppingBag, ArrowLeft, CreditCard, Smartphone, CheckCircle, Lock, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PAYMENT_METHODS = [
  { id: 'mpesa', label: 'M-Pesa', icon: <Smartphone size={18} />, desc: 'Pay via M-Pesa mobile money' },
  { id: 'card', label: 'Card', icon: <CreditCard size={18} />, desc: 'Visa, Mastercard, Amex' },
];

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

const cardElementOptions = {
  style: {
    base: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '14px',
      color: '#3B2A1A',
      '::placeholder': { color: '#B5A99A' },
    },
    invalid: { color: '#e53e3e' },
  },
};

// ── Inner Stripe form (needs to be inside <Elements>)
function StripeCardForm({
  total,
  onSuccess,
  onBack,
  form,
  items,
}: {
  total: number;
  onSuccess: () => void;
  onBack: () => void;
  form: any;
  items: any[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setCardError('');

    try {
      // 1. Create payment intent on backend
      const intentRes = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'kes',
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`,
        }),
      });
      const { clientSecret } = await intentRes.json();

      // 2. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            phone: form.phone,
          },
        },
      });

      if (error) {
        setCardError(error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 3. Create order in Odoo
        await fetch('/api/odoo/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              phone: form.phone,
            },
            items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
            total,
          }),
        });
        onSuccess();
      }
    } catch (err) {
      setCardError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
      >
        <h2
          className="font-display font-semibold mb-6"
          style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
        >
          Card Payment
        </h2>

        <div
          className="p-4 rounded-xl mb-6"
          style={{ border: '1px solid var(--soft-border-beige)', backgroundColor: '#FAFAFA' }}
        >
          <label className="block font-body font-medium text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
            Card Details
          </label>
          <CardElement options={cardElementOptions} />
        </div>

        {cardError && (
          <p className="font-body text-sm mb-4" style={{ color: '#e53e3e' }}>
            {cardError}
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
            style={{ fontSize: '0.875rem' }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <button
            type="submit"
            disabled={loading || !stripe}
            className="btn-primary flex-1 justify-center flex items-center gap-2"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Lock size={15} />
                Pay KSh {total.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      clearCart();
    }, 2000);
  };

  const shipping = totalPrice >= 5000 ? 0 : 350;
  const total = totalPrice + shipping;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: 'var(--light-warm-grey)' }}>
        <div
          className="max-w-md w-full text-center rounded-2xl p-12"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
        >
          <CheckCircle size={64} style={{ color: 'var(--deep-orange)' }} className="mx-auto mb-6" />
          <h1 className="font-display font-semibold mb-3" style={{ fontSize: '2rem', color: 'var(--dark-chocolate)' }}>
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop">
            <button
              className="flex items-center gap-2 font-body text-sm transition-colors"
              style={{ color: 'var(--warm-taupe)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--dark-chocolate)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--warm-taupe)')}
            >
              <ArrowLeft size={16} />
              Back to Shop
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              {['details', 'payment'].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-sm"
                    style={{
                      backgroundColor: step === s || (step === 'payment' && s === 'details') ? 'var(--deep-orange)' : 'var(--soft-border-beige)',
                      color: step === s || (step === 'payment' && s === 'details') ? '#FFFFFF' : 'var(--warm-taupe)',
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
                  {i === 0 && <div className="w-8 h-px" style={{ backgroundColor: 'var(--soft-border-beige)' }} />}
                </div>
              ))}
            </div>

            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit}>
                <div
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
                >
                  <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>
                    Delivery Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {[
                      { name: 'firstName', label: 'First Name', placeholder: 'Jane' },
                      { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
                    ].map(field => (
                      <div key={field.name}>
                        <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
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

            {step === 'payment' && (
              <>
                {/* Payment Method Selector */}
                <div
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
                >
                  <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>
                    Payment Method
                  </h2>
                  <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map(method => (
                      <label
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          border: `2px solid ${paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-border-beige)'}`,
                          backgroundColor: paymentMethod === method.id ? '#FFF8F4' : '#FFFFFF',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="sr-only"
                        />
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-cream)',
                            color: paymentMethod === method.id ? '#FFFFFF' : 'var(--warm-taupe)',
                          }}
                        >
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                            {method.label}
                          </p>
                          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>
                            {method.desc}
                          </p>
                        </div>
                        <div
                          className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-border-beige)' }}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--deep-orange)' }} />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* M-Pesa Instructions */}
                {paymentMethod === 'mpesa' && (
                  <form onSubmit={handleMpesaSubmit}>
                    <div
                      className="rounded-2xl p-8"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
                    >
                      <div
                        className="p-5 rounded-xl mb-7"
                        style={{ backgroundColor: 'var(--light-warm-grey)', border: '1px solid var(--soft-border-beige)' }}
                      >
                        <p className="font-body font-semibold text-sm mb-2" style={{ color: 'var(--dark-chocolate)' }}>
                          M-Pesa Payment Instructions
                        </p>
                        <ol className="font-body text-sm space-y-1" style={{ color: 'var(--charcoal)' }}>
                          <li>1. Go to M-Pesa on your phone</li>
                          <li>2. Select "Lipa na M-Pesa" → "Pay Bill"</li>
                          <li>3. Business Number: <strong>123456</strong></li>
                          <li>4. Account: Your phone number</li>
                          <li>5. Amount: <strong>KSh {total.toLocaleString()}</strong></li>
                        </ol>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setStep('details')}
                          className="btn-secondary flex items-center gap-2"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <ArrowLeft size={15} />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex-1 justify-center flex items-center gap-2"
                          style={{ opacity: loading ? 0.7 : 1 }}
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing…
                            </>
                          ) : (
                            <>
                              <Lock size={15} />
                              Place Order — KSh {total.toLocaleString()}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Stripe Card Payment */}
                {paymentMethod === 'card' && (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      total={total}
                      form={form}
                      items={items}
                      onSuccess={() => { setStep('success'); clearCart(); }}
                      onBack={() => setStep('details')}
                    />
                  </Elements>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="space-y-5">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}
            >
              <h3 className="font-display font-semibold mb-5" style={{ fontSize: '1.25rem', color: 'var(--dark-chocolate)' }}>
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
                          <p className="font-body font-medium text-sm leading-snug" style={{ color: 'var(--dark-chocolate)' }}>
                            {item.name}
                          </p>
                          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>Qty: {item.quantity}</p>
                        </div>
                        <span className="font-body font-semibold text-sm flex-shrink-0" style={{ color: 'var(--dark-chocolate)' }}>
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--soft-border-beige)' }}>
                    <div className="flex justify-between font-body text-sm" style={{ color: 'var(--charcoal)' }}>
                      <span>Subtotal</span>
                      <span>KSh {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm" style={{ color: 'var(--charcoal)' }}>
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `KSh ${shipping.toLocaleString()}`}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="font-body text-xs" style={{ color: 'var(--deep-orange)' }}>
                        ✓ Free delivery on orders over KSh 5,000
                      </p>
                    )}
                    <div
                      className="flex justify-between font-body font-bold pt-3"
                      style={{ borderTop: '1px solid var(--soft-border-beige)', color: 'var(--dark-chocolate)', fontSize: '1rem' }}
                    >
                      <span>Total</span>
                      <span>KSh {total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Trust Signals */}
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
                  <span className="font-body text-sm" style={{ color: 'var(--dark-chocolate)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}