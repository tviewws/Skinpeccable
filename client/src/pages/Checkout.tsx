/*
 * SKINPECCABLE GLOWTIQUE — Checkout Page
 * Design: "Structured Warmth" — clean checkout, order summary, payment options
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ShoppingBag, ArrowLeft, CreditCard, Smartphone, CheckCircle, Lock, Truck, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
      fontSize: '16px',
      color: '#3B2A1A',
      '::placeholder': { color: '#B5A99A' },
    },
    invalid: { color: '#e53e3e' },
  },
};

type CardErrorType = 'declined' | 'funds' | 'cvc' | 'expired' | 'network' | 'order' | 'generic';

interface CardErrorState {
  type: CardErrorType;
  message: string;
  referenceId?: string;
  suggestMpesa?: boolean;
}

function getFriendlyCardError(code?: string): CardErrorState {
  switch (code) {
    case 'card_declined':
    case 'do_not_honor':
    case 'transaction_not_allowed':
      return { type: 'declined', message: 'Your card was declined. Please try a different card or pay with M-Pesa.', suggestMpesa: true };
    case 'insufficient_funds':
      return { type: 'funds', message: 'Your card has insufficient funds. Please try another card or pay with M-Pesa.', suggestMpesa: true };
    case 'incorrect_cvc':
    case 'invalid_cvc':
      return { type: 'cvc', message: 'Incorrect CVV. Please double-check the 3-digit code on the back of your card.' };
    case 'expired_card':
    case 'invalid_expiry_year':
    case 'invalid_expiry_month':
      return { type: 'expired', message: 'Your card has expired. Please use a different card.' };
    default:
      return { type: 'generic', message: 'Payment failed. Please try again or choose M-Pesa.', suggestMpesa: true };
  }
}

function ErrorBanner({ error, onSwitchToMpesa, onRetry }: { error: CardErrorState; onSwitchToMpesa?: () => void; onRetry?: () => void }) {
  const isNetwork = error.type === 'network';
  const isOrderFailure = error.type === 'order';
  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: isOrderFailure ? '#FFF8E1' : '#FFF1F1', border: `1px solid ${isOrderFailure ? '#F59E0B' : '#FECACA'}` }}>
      <div className="flex items-start gap-3">
        <span style={{ color: isOrderFailure ? '#D97706' : '#DC2626', flexShrink: 0, marginTop: '2px' }}>
          {isNetwork ? <WifiOff size={16} /> : <AlertCircle size={16} />}
        </span>
        <div className="flex-1">
          <p className="font-body font-semibold text-sm mb-1" style={{ color: isOrderFailure ? '#92400E' : '#991B1B' }}>
            {isNetwork ? 'Connection Problem' : isOrderFailure ? 'Payment Received — Order Issue' : 'Payment Unsuccessful'}
          </p>
          <p className="font-body text-sm" style={{ color: isOrderFailure ? '#92400E' : '#7F1D1D' }}>{error.message}</p>
          {isOrderFailure && error.referenceId && (
            <p className="font-body text-xs mt-2 font-mono p-2 rounded" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              Payment ref: {error.referenceId}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {isNetwork && onRetry && (
              <button type="button" onClick={onRetry} className="flex items-center gap-1 font-body font-semibold text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
                <RefreshCw size={11} /> Retry
              </button>
            )}
            {error.suggestMpesa && onSwitchToMpesa && (
              <button type="button" onClick={onSwitchToMpesa} className="flex items-center gap-1 font-body font-semibold text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--deep-orange)', color: '#FFFFFF' }}>
                <Smartphone size={11} /> Pay with M-Pesa instead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── M-PESA STK PUSH FORM
function MpesaForm({
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
  // mpesaPhone pre-fills from the delivery details phone number
  const [mpesaPhone, setMpesaPhone] = useState(form.phone || '');
  const [mpesaState, setMpesaState] = useState<'idle' | 'sending' | 'waiting' | 'failed'>('idle');
  const [mpesaError, setMpesaError] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(120); // 2 minute timeout
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling and timer on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSendSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setMpesaState('sending');
    setMpesaError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/mpesa/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: total,
          customerName: `${form.firstName} ${form.lastName}`,
          customerEmail: form.email,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.invoice_id) {
        setMpesaError(data.error || 'Failed to send M-Pesa prompt. Please try again.');
        setMpesaState('failed');
        return;
      }

      // STK push sent — start waiting and polling
      setInvoiceId(data.invoice_id);
      setMpesaState('waiting');
      setSecondsLeft(120);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            stopPolling();
            setMpesaState('failed');
            setMpesaError('Payment timed out. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll every 4 seconds for payment status
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${BACKEND_URL}/api/payments/mpesa/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice_id: data.invoice_id }),
          });

          const statusData = await statusRes.json();
          const state = statusData.status;

          if (state === 'COMPLETE') {
            stopPolling();
            // Payment confirmed — create order in Odoo
            try {
              await fetch(`${BACKEND_URL}/api/odoo/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customer: {
                    name: `${form.firstName} ${form.lastName}`,
                    email: form.email,
                    phone: mpesaPhone,
                  },
                  items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
                  total,
                }),
              });
            } catch (odooErr) {
              console.error('Odoo order failed after M-Pesa payment:', odooErr);
            }
            onSuccess();

          } else if (state === 'FAILED' || state === 'CANCELLED') {
            stopPolling();
            setMpesaState('failed');
            setMpesaError('Payment was cancelled or failed. Please try again.');
          }
          // PENDING / PROCESSING — keep polling
        } catch (pollErr) {
          console.error('Status poll error:', pollErr);
          // Don't stop polling on a single network blip — keep trying
        }
      }, 4000);

    } catch (err) {
      setMpesaError('Could not connect to payment server. Please check your internet and try again.');
      setMpesaState('failed');
    }
  };

  // ── WAITING STATE — customer needs to check their phone
  if (mpesaState === 'waiting') {
    return (
      <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
        <div className="text-center">
          {/* Animated phone icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--soft-cream)', border: '3px solid var(--deep-orange)', animation: 'pulse 2s infinite' }}
          >
            <Smartphone size={36} style={{ color: 'var(--deep-orange)' }} />
          </div>

          <h2 className="font-display font-semibold mb-3" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>
            Check Your Phone
          </h2>
          <p className="font-body mb-2" style={{ fontSize: '0.9375rem', color: 'var(--charcoal)' }}>
            We've sent an M-Pesa payment request to
          </p>
          <p className="font-body font-bold mb-5" style={{ fontSize: '1rem', color: 'var(--deep-orange)' }}>
            {mpesaPhone}
          </p>
          <p className="font-body text-sm mb-6" style={{ color: 'var(--warm-taupe)', lineHeight: 1.7 }}>
            Enter your M-Pesa PIN on your phone to complete the payment of <strong style={{ color: 'var(--dark-chocolate)' }}>KSh {total.toLocaleString()}</strong>
          </p>

          {/* Countdown */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: secondsLeft < 30 ? '#FFF1F1' : 'var(--soft-cream)', border: `1px solid ${secondsLeft < 30 ? '#FECACA' : 'var(--soft-border-beige)'}` }}
          >
            <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: secondsLeft < 30 ? '#DC2626' : 'var(--deep-orange)' }} />
            <span className="font-body font-semibold text-sm" style={{ color: secondsLeft < 30 ? '#DC2626' : 'var(--dark-chocolate)' }}>
              Waiting for payment… {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          </div>

          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>
            Do not close this page. This will update automatically once payment is confirmed.
          </p>

          {/* Cancel option */}
          <button
            type="button"
            onClick={() => { stopPolling(); setMpesaState('idle'); }}
            className="mt-6 font-body text-sm underline"
            style={{ color: 'var(--warm-taupe)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cancel and try again
          </button>
        </div>
      </div>
    );
  }

  // ── IDLE / FAILED STATE — phone number input
  return (
    <form onSubmit={handleSendSTK}>
      <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>

        <h2 className="font-display font-semibold mb-2" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>
          M-Pesa Payment
        </h2>
        <p className="font-body text-sm mb-6" style={{ color: 'var(--warm-taupe)' }}>
          Enter your Safaricom number and we'll send a payment prompt directly to your phone.
        </p>

        <div className="mb-6">
          <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
            M-Pesa Phone Number *
          </label>
          <input
            type="tel"
            value={mpesaPhone}
            onChange={e => setMpesaPhone(e.target.value)}
            required
            placeholder="e.g. 0712 345 678"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
            onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
          />
          <p className="font-body text-xs mt-2" style={{ color: 'var(--warm-taupe)' }}>
            Must be a Safaricom number registered for M-Pesa
          </p>
        </div>

        {/* Amount confirmation */}
        <div
          className="flex items-center justify-between p-4 rounded-xl mb-6"
          style={{ backgroundColor: 'var(--soft-cream)', border: '1px solid var(--soft-border-beige)' }}
        >
          <span className="font-body font-medium text-sm" style={{ color: 'var(--charcoal)' }}>Amount to pay</span>
          <span className="font-body font-bold" style={{ fontSize: '1.125rem', color: 'var(--dark-chocolate)' }}>
            KSh {total.toLocaleString()}
          </span>
        </div>

        {/* Error message */}
        {mpesaState === 'failed' && mpesaError && (
          <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ backgroundColor: '#FFF1F1', border: '1px solid #FECACA' }}>
            <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
            <p className="font-body text-sm" style={{ color: '#991B1B' }}>{mpesaError}</p>
          </div>
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
            disabled={mpesaState === 'sending'}
            className="btn-primary flex-1 justify-center flex items-center gap-2"
            style={{ opacity: mpesaState === 'sending' ? 0.7 : 1 }}
          >
            {mpesaState === 'sending' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Request…
              </>
            ) : (
              <>
                <Smartphone size={15} />
                Send Payment Request
              </>
            )}
          </button>
        </div>

        <p className="font-body text-xs text-center mt-4" style={{ color: 'var(--warm-taupe)' }}>
          🔒 Payments are secured by Intasend
        </p>
      </div>
    </form>
  );
}

// ── STRIPE CARD FORM
function StripeCardForm({ total, onSuccess, onBack, onSwitchToMpesa, form, items }: {
  total: number; onSuccess: () => void; onBack: () => void; onSwitchToMpesa: () => void; form: any; items: any[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<CardErrorState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      let intentRes: Response;
      try {
        intentRes = await fetch(`${BACKEND_URL}/api/payments/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ amount: total, currency: 'kes', customerEmail: form.email, customerName: `${form.firstName} ${form.lastName}` }),
        });
      } catch (fetchErr: any) {
        setCardError({ type: 'network', message: fetchErr?.name === 'AbortError' ? 'The request timed out. Please check your connection and try again.' : 'Could not connect to our payment server. Please check your internet and try again.' });
        setLoading(false);
        return;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!intentRes.ok) {
        setCardError({ type: 'generic', message: 'Our payment server encountered an issue. Please try again in a moment.', suggestMpesa: true });
        setLoading(false);
        return;
      }

      const { clientSecret } = await intentRes.json();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone },
        },
      });

      if (error) { setCardError(getFriendlyCardError(error.code)); setLoading(false); return; }

      if (paymentIntent?.status === 'succeeded') {
        try {
          const orderRes = await fetch(`${BACKEND_URL}/api/odoo/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: { name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone },
              items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
              total,
              paymentIntentId: paymentIntent.id,
            }),
          });
          if (!orderRes.ok) throw new Error(`Odoo responded with ${orderRes.status}`);
          onSuccess();
        } catch (orderErr) {
          console.error('Odoo order creation failed:', orderErr);
          setCardError({ type: 'order', message: 'Your payment was successful, but we had trouble recording your order. Please contact us at glow@skinpeccable.co.ke and quote your payment reference below.', referenceId: paymentIntent.id });
          setLoading(false);
          return;
        }
      }
    } catch (unexpectedErr) {
      console.error('Unexpected checkout error:', unexpectedErr);
      setCardError({ type: 'generic', message: 'Something unexpected went wrong. Please try again.', suggestMpesa: true });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
        <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>Card Payment</h2>
        <div className="mb-6">
          <label className="block font-body font-medium text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>Card Details</label>
          <div className="p-4 rounded-xl" style={{ border: '2px solid var(--deep-orange)', backgroundColor: '#FFFFFF', minHeight: '50px' }}>
            <CardElement options={cardElementOptions} />
          </div>
        </div>
        {cardError && <ErrorBanner error={cardError} onSwitchToMpesa={cardError.suggestMpesa ? onSwitchToMpesa : undefined} onRetry={cardError.type === 'network' ? () => setCardError(null) : undefined} />}
        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-secondary flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <button type="submit" disabled={loading || !stripe} className="btn-primary flex-1 justify-center flex items-center gap-2" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>) : (<><Lock size={15} />Pay KSh {total.toLocaleString()}</>)}
          </button>
        </div>
        <p className="font-body text-xs text-center mt-4" style={{ color: 'var(--warm-taupe)' }}>🔒 Payments are secured and encrypted by Stripe</p>
      </div>
    </form>
  );
}

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', notes: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('payment'); };

  const handleSwitchToMpesa = () => { setPaymentMethod('mpesa'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSuccess = () => { setStep('success'); clearCart(); };

  const shipping = totalPrice >= 5000 ? 0 : 350;
  const total = totalPrice + shipping;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: 'var(--light-warm-grey)' }}>
        <div className="max-w-md w-full text-center rounded-2xl p-12" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
          <CheckCircle size={64} style={{ color: 'var(--deep-orange)' }} className="mx-auto mb-6" />
          <h1 className="font-display font-semibold mb-3" style={{ fontSize: '2rem', color: 'var(--dark-chocolate)' }}>Order Confirmed!</h1>
          <p className="font-body mb-2" style={{ fontSize: '1rem', color: 'var(--charcoal)' }}>Thank you for choosing Skinpeccable.</p>
          <p className="font-body mb-8" style={{ fontSize: '0.9rem', color: 'var(--warm-taupe)' }}>We hope your purchase brings confidence, care and a little more glow to your routine.</p>
          <p className="font-display italic text-lg mb-8" style={{ color: 'var(--deep-orange)' }}>Glow. Different.</p>
          <Link href="/shop"><button className="btn-primary w-full justify-center">Continue Shopping</button></Link>
          <Link href="/"><button className="btn-secondary w-full justify-center mt-3">Back to Home</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--light-warm-grey)', minHeight: '100vh' }}>
      <div className="container py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop">
            <button className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: 'var(--warm-taupe)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--dark-chocolate)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--warm-taupe)')}>
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
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-sm"
                    style={{ backgroundColor: step === s || (step === 'payment' && s === 'details') ? 'var(--deep-orange)' : 'var(--soft-border-beige)', color: step === s || (step === 'payment' && s === 'details') ? '#FFFFFF' : 'var(--warm-taupe)' }}>
                    {step === 'payment' && s === 'details' ? '✓' : i + 1}
                  </div>
                  <span className="font-body font-medium text-sm capitalize" style={{ color: step === s ? 'var(--dark-chocolate)' : 'var(--warm-taupe)' }}>
                    {s === 'details' ? 'Delivery Details' : 'Payment'}
                  </span>
                  {i === 0 && <div className="w-8 h-px" style={{ backgroundColor: 'var(--soft-border-beige)' }} />}
                </div>
              ))}
            </div>

            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit}>
                <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
                  <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>Delivery Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {[{ name: 'firstName', label: 'First Name', placeholder: 'Jane' }, { name: 'lastName', label: 'Last Name', placeholder: 'Doe' }].map(field => (
                      <div key={field.name}>
                        <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>{field.label} *</label>
                        <input type="text" name={field.name} value={(form as any)[field.name]} onChange={handleChange} required placeholder={field.placeholder} style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@email.com" style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                    </div>
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>Phone *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+254 700 000 000" style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>Delivery Address *</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="Street address, apartment, area" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                  </div>
                  <div className="mb-5">
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>City *</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} required placeholder="Nairobi" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                  </div>
                  <div className="mb-7">
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>Order Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any special instructions for your order?" style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')} onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')} />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center">Continue to Payment</button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <>
                {/* Payment Method Selector */}
                <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
                  <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}>Payment Method</h2>
                  <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map(method => (
                      <label key={method.id} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                        style={{ border: `2px solid ${paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-border-beige)'}`, backgroundColor: paymentMethod === method.id ? '#FFF8F4' : '#FFFFFF' }}>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="sr-only" />
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-cream)', color: paymentMethod === method.id ? '#FFFFFF' : 'var(--warm-taupe)' }}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>{method.label}</p>
                          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>{method.desc}</p>
                        </div>
                        <div className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: paymentMethod === method.id ? 'var(--deep-orange)' : 'var(--soft-border-beige)' }}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--deep-orange)' }} />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* M-Pesa STK Push Form */}
                {paymentMethod === 'mpesa' && (
                  <MpesaForm
                    total={total}
                    form={form}
                    items={items}
                    onSuccess={handleSuccess}
                    onBack={() => setStep('details')}
                  />
                )}

                {/* Stripe Card Payment */}
                {paymentMethod === 'card' && (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      total={total}
                      form={form}
                      items={items}
                      onSuccess={handleSuccess}
                      onBack={() => setStep('details')}
                      onSwitchToMpesa={handleSwitchToMpesa}
                    />
                  </Elements>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-5">
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--soft-border-beige)' }}>
              <h3 className="font-display font-semibold mb-5" style={{ fontSize: '1.25rem', color: 'var(--dark-chocolate)' }}>
                Order Summary
                <span className="font-body font-normal text-sm ml-2" style={{ color: 'var(--warm-taupe)' }}>({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              </h3>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={36} style={{ color: 'var(--soft-border-beige)' }} className="mx-auto mb-3" />
                  <p className="font-body text-sm" style={{ color: 'var(--warm-taupe)' }}>Your bag is empty</p>
                  <Link href="/shop"><button className="btn-primary mt-4 text-sm" style={{ fontSize: '0.8rem', padding: '0.6rem 1.5rem' }}>Shop Now</button></Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-5">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--soft-border-beige)' }}>
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-medium text-sm leading-snug" style={{ color: 'var(--dark-chocolate)' }}>{item.name}</p>
                          <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>Qty: {item.quantity}</p>
                        </div>
                        <span className="font-body font-semibold text-sm flex-shrink-0" style={{ color: 'var(--dark-chocolate)' }}>KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--soft-border-beige)' }}>
                    <div className="flex justify-between font-body text-sm" style={{ color: 'var(--charcoal)' }}><span>Subtotal</span><span>KSh {totalPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between font-body text-sm" style={{ color: 'var(--charcoal)' }}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `KSh ${shipping.toLocaleString()}`}</span></div>
                    {shipping === 0 && <p className="font-body text-xs" style={{ color: 'var(--deep-orange)' }}>✓ Free delivery on orders over KSh 5,000</p>}
                    <div className="flex justify-between font-body font-bold pt-3" style={{ borderTop: '1px solid var(--soft-border-beige)', color: 'var(--dark-chocolate)', fontSize: '1rem' }}>
                      <span>Total</span><span>KSh {total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: 'var(--soft-cream)', border: '1px solid var(--soft-border-beige)' }}>
              {[{ icon: <Lock size={14} />, text: 'Secure checkout' }, { icon: <Truck size={14} />, text: 'Delivery across Nairobi' }, { icon: <CheckCircle size={14} />, text: '100% authentic products' }].map(item => (
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