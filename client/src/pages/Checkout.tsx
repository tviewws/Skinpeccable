/*
 * SKINPECCABLE GLOWTIQUE — Checkout Page
 * Design: "Structured Warmth" — clean checkout, order summary, Pesapal payment
 * Updated: Google Maps autocomplete + zone-based delivery fee (client zones v2)
 * Updated: Scroll-to-top on payment step + discount code input
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Lock,
  Truck,
  CreditCard,
  MapPin,
  Tag,
  X,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────
// DELIVERY ZONES — client-defined Nairobi zones
// Update prices / keywords here when rates change
// ─────────────────────────────────────────────
const DELIVERY_ZONES = [
  {
    id: 'zone0',
    label: 'Zone 0 — Store Pick-Up',
    fee: 0,
    keywords: [
      'lavington mall', 'pick up', 'pickup', 'collect in store', 'store pickup',
    ],
  },
  {
    id: 'zone1',
    label: 'Zone 1 — Lavington & Surrounds',
    fee: 200,
    keywords: [
      'lavington', 'denis pritt', 'kileleshwa', 'valley arcade',
      'riverside drive', 'spring valley', 'abc place', 'mpaka road',
      'parklands',
    ],
  },
  {
    id: 'zone2',
    label: 'Zone 2 — Central Nairobi',
    fee: 300,
    keywords: [
      'hurlingham', 'yaya', 'kilimani', 'upper hill', 'upperhill',
      'serena', 'cbd', 'city centre', 'city center', 'chiromo',
      'nairobi hospital', 'knh', 'prestige', 'strathmore', 'coptic',
      'madaraka', 'oshwal', 'highrise', 'nairobi west', 'nyayo',
    ],
  },
  {
    id: 'zone3',
    label: 'Zone 3 — Mid Nairobi',
    fee: 350,
    keywords: [
      'westgate', 'ngara', 'eastleigh', 'pangani', 'muthaiga', 'utalii',
      't-mall', 'capital centre', 'dci', 'balozi', 'aga khan', 'mp shah',
      'dagoretti', 'buruburu', 'donholm', 'jericho', 'kasarani', 'kangemi',
      'highridge', 'westlands',
    ],
  },
  {
    id: 'zone4',
    label: 'Zone 4 — Outer Nairobi',
    fee: 500,
    keywords: [
      'trm', 'thika road', 'thika rd', 'garden city', 'usiu', 'zimmerman',
      'githurai', 'kahawa wendani', 'kariobangi', 'lucky summer',
      'loresho', 'peponi', 'uthiru', 'kabete', 'delta', 'village market',
      'runda', 'gigiri', 'karura',
    ],
  },
  {
    id: 'zone5',
    label: 'Zone 5 — Nairobi Environs',
    fee: 600,
    keywords: [
      'ruaka', 'ndenderu', 'ruiru', 'syokimau', 'mlolongo', 'embakasi',
      'pipeline', 'tassia', 'ngong road', 'rongai', 'athi river',
      'kitengela', 'ngong', 'kahawa', 'juja',
    ],
  },
  {
    id: 'pickup_mtaani',
    label: 'Pick Up Mtaani — Next Day',
    fee: 250,
    keywords: [
      'pick up mtaani', 'pickup mtaani', 'mtaani',
    ],
  },
  {
    id: 'wells_fargo',
    label: 'Wells Fargo — Next Day',
    fee: 350,
    keywords: [
      'wells fargo', 'wellsfargo',
    ],
  },
];

// Zones shown in the sidebar fee guide (exclude zone0 — it's free / pick-up only)
const DISPLAY_ZONES = DELIVERY_ZONES.filter(z => z.id !== 'zone0');

// Match a typed/autocompleted address to a delivery zone
function getDeliveryZone(address: string): typeof DELIVERY_ZONES[0] | null {
  const lower = address.toLowerCase();
  for (const zone of DELIVERY_ZONES) {
    if (zone.keywords.some(kw => lower.includes(kw))) {
      return zone;
    }
  }
  return null;
}

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

// Discount type returned from backend
type DiscountResult = {
  type: 'percentage' | 'fixed';
  value: number;
  label: string;
};

// Extend window to include google maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<typeof DELIVERY_ZONES[0] | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // ── Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  // ── Scroll to top when entering payment step
  useEffect(() => {
    if (step === 'payment') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // ── Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY not set — autocomplete disabled');
      return;
    }
    if (window.google?.maps?.places) { setMapsLoaded(true); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // ── Attach Autocomplete to address field
  useEffect(() => {
    if (!mapsLoaded || !addressInputRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        componentRestrictions: { country: 'ke' },
        fields: ['formatted_address', 'name'],
      }
    );
    autocompleteRef.current = ac;

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const formatted = place.formatted_address || place.name || '';
      const searchText = `${place.name || ''} ${formatted}`;
      setForm(prev => ({ ...prev, address: formatted }));
      setDeliveryZone(getDeliveryZone(searchText));
    });
  }, [mapsLoaded]);

  // Re-run zone detection when user types manually (no autocomplete selected)
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, address: val }));
    const zone = getDeliveryZone(val);
    setDeliveryZone(zone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Discount calculation helpers
  const subtotal = totalPrice;
  const deliveryFee = deliveryZone?.fee ?? 0;

  const discountAmount = (() => {
    if (!discountResult) return 0;
    if (discountResult.type === 'percentage') {
      return Math.round((subtotal * discountResult.value) / 100);
    }
    return Math.min(discountResult.value, subtotal); // fixed — never discount below 0
  })();

  const total = subtotal + deliveryFee - discountAmount;

  // ── Apply discount code
  const handleApplyDiscount = async () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;

    setDiscountLoading(true);
    setDiscountError('');
    setDiscountResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!data.success) {
        setDiscountError(data.error || 'Invalid discount code. Please try again.');
      } else {
        setDiscountResult(data.discount);
        setDiscountCode(code);
      }
    } catch {
      setDiscountError('Could not validate the code. Please check your connection and try again.');
    } finally {
      setDiscountLoading(false);
    }
  };

  // ── Remove applied discount
  const handleRemoveDiscount = () => {
    setDiscountResult(null);
    setDiscountCode('');
    setDiscountInput('');
    setDiscountError('');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryZone) {
      setError('Please enter a valid Nairobi-area delivery address so we can calculate your delivery fee.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePesapalPay = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order in Odoo first
      const odooRes = await fetch(`${BACKEND_URL}/api/odoo/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: `${form.firstName} ${form.lastName}`,
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
          total,
          deliveryFee,
          deliveryZone: deliveryZone?.label,
          notes: form.notes,
          discountCode: discountCode || null,
          discountAmount: discountAmount || null,
        }),
      });

      const odooData = await odooRes.json();

      if (!odooData.success) {
        // Log the error but don't block payment — order can be manually created if needed
        console.error('Odoo order creation failed:', odooData.error);
      }

      // 2. Initiate Pesapal payment
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
          deliveryFee,
          deliveryZone: deliveryZone?.label,
          notes: form.notes,
          discountCode: discountCode || null,
          discountAmount: discountAmount || null,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.redirect_url) {
        setError(data.error || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('pendingOrder', JSON.stringify({
        customer: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
        },
        items: items.map(i => ({
          name: i.name,
          price: i.price,
          qty: i.quantity,
        })),
        deliveryFee,
        deliveryZone: deliveryZone?.label,
        discountCode: discountCode || null,
        discountAmount: discountAmount || null,
        total,
      }));

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
              <form onSubmit={handleDetailsSubmit} noValidate>
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

                  {/* Name row */}
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

                  {/* Email + Phone */}
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

                  {/* ── DELIVERY METHOD — Pick Up Mtaani / Wells Fargo / Address */}
                  <div className="mb-5">
                    <label
                      className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                      style={{ color: 'var(--warm-taupe)' }}
                    >
                      Delivery Method *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { id: 'address', label: '🏠 Home Delivery', sublabel: 'Enter your address below' },
                        { id: 'zone0', label: '🏪 In-Store Collection', sublabel: 'Lavington Mall — Free' },
                        { id: 'pickup_mtaani', label: '📦 Pick Up Mtaani', sublabel: 'Next day — KSh 250' },
                        { id: 'wells_fargo', label: '🚚 Wells Fargo', sublabel: 'Next day — KSh 350' },
                      ].map(method => {
                        const isActive =
                          method.id === 'address'
                            ? !['zone0', 'pickup_mtaani', 'wells_fargo'].includes(deliveryZone?.id || '')
                            : deliveryZone?.id === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                              if (method.id === 'zone0') {
                                setDeliveryZone(DELIVERY_ZONES.find(z => z.id === 'zone0') || null);
                                setForm(prev => ({ ...prev, address: 'In-Store Collection — Lavington Mall' }));
                              } else if (method.id === 'pickup_mtaani') {
                                setDeliveryZone(DELIVERY_ZONES.find(z => z.id === 'pickup_mtaani') || null);
                                setForm(prev => ({ ...prev, address: 'Pick Up Mtaani' }));
                              } else if (method.id === 'wells_fargo') {
                                setDeliveryZone(DELIVERY_ZONES.find(z => z.id === 'wells_fargo') || null);
                                setForm(prev => ({ ...prev, address: 'Wells Fargo Courier' }));
                              } else {
                                setDeliveryZone(null);
                                setForm(prev => ({ ...prev, address: '' }));
                              }
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              border: `2px solid ${isActive ? 'var(--deep-orange)' : 'var(--soft-border-beige)'}`,
                              backgroundColor: isActive ? '#FFF4EE' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 150ms ease',
                            }}
                          >
                            <p className="font-body font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                              {method.label}
                            </p>
                            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--warm-taupe)' }}>
                              {method.sublabel}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── DELIVERY ADDRESS — only shown for home delivery */}
                  {!['zone0', 'pickup_mtaani', 'wells_fargo'].includes(deliveryZone?.id || '') && (
                    <div className="mb-5">
                      <label
                        className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                        style={{ color: 'var(--warm-taupe)' }}
                      >
                        Delivery Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin
                          size={15}
                          style={{
                            position: 'absolute',
                            left: '0.85rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: deliveryZone ? 'var(--deep-orange)' : 'var(--warm-taupe)',
                            pointerEvents: 'none',
                            zIndex: 1,
                          }}
                        />
                        <input
                          ref={addressInputRef}
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleAddressChange}
                          required
                          placeholder="Start typing your estate or street…"
                          style={{
                            ...inputStyle,
                            paddingLeft: '2.25rem',
                          }}
                          onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                          onBlur={e => (e.target.style.borderColor = deliveryZone ? 'var(--deep-orange)' : 'var(--soft-border-beige)')}
                          autoComplete="off"
                        />
                      </div>

                      {/* Zone pill — appears once address is recognised */}
                      {form.address && (
                        <div className="mt-2">
                          {deliveryZone ? (
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-semibold"
                              style={{
                                backgroundColor: '#FFF4EE',
                                color: 'var(--deep-orange)',
                                border: '1px solid var(--deep-orange)',
                              }}
                            >
                              <Truck size={12} />
                              {deliveryZone.label} — Delivery: KSh {deliveryZone.fee.toLocaleString()}
                            </div>
                          ) : (
                            <p className="text-xs font-body" style={{ color: '#B45309' }}>
                              ⚠ Area not recognised — please select from the suggestions or type your estate name clearly.
                            </p>
                          )}
                        </div>
                      )}

                      {!mapsLoaded && import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                        <p className="text-xs mt-1 font-body" style={{ color: 'var(--warm-taupe)' }}>
                          Loading address suggestions…
                        </p>
                      )}
                    </div>
                  )}

                  {/* Zone confirmed pill for courier methods */}
                  {['zone0', 'pickup_mtaani', 'wells_fargo'].includes(deliveryZone?.id || '') && (
                    <div className="mb-5">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-semibold"
                        style={{
                          backgroundColor: '#FFF4EE',
                          color: 'var(--deep-orange)',
                          border: '1px solid var(--deep-orange)',
                        }}
                      >
                        <Truck size={12} />
                        {deliveryZone?.label} — KSh {deliveryZone?.fee.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* City */}
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

                  {/* Notes */}
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
                      placeholder={['pickup_mtaani', 'wells_fargo'].includes(deliveryZone?.id || '') ? 'Please enter your exact location / nearest stage for collection' : 'Any special instructions for your order?'}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                    />
                  </div>

                  {error && (
                    <div
                      className="p-4 rounded-xl mb-5"
                      style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
                    >
                      <p className="font-body text-sm" style={{ color: '#92400E' }}>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary w-full justify-center"
                    disabled={!deliveryZone}
                    style={{ opacity: deliveryZone ? 1 : 0.5, cursor: deliveryZone ? 'pointer' : 'not-allowed' }}
                  >
                    Continue to Payment
                  </button>

                  {!deliveryZone && form.address.length < 3 && (
                    <p className="text-xs text-center mt-3 font-body" style={{ color: 'var(--warm-taupe)' }}>
                      Select a delivery method above to continue
                    </p>
                  )}
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

                {/* Delivery summary strip */}
                {deliveryZone && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                    style={{ backgroundColor: '#FFF4EE', border: '1px solid #FDDCCA' }}
                  >
                    <Truck size={15} style={{ color: 'var(--deep-orange)', flexShrink: 0 }} />
                    <span className="font-body text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                      {deliveryZone.id === 'zone0' || deliveryZone.id === 'pickup_mtaani' || deliveryZone.id === 'wells_fargo'
                        ? <><strong>{deliveryZone.label}</strong> — next day delivery</>
                        : <>Delivering to <strong>{form.address}</strong> — {deliveryZone.label}</>
                      }
                    </span>
                  </div>
                )}

                {/* Pesapal payment box */}
                <div
                  className="rounded-xl p-5 mb-6"
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

                {/* ── DISCOUNT CODE */}
                <div className="mb-6">
                  <label
                    className="block font-body font-medium text-xs mb-2 uppercase tracking-wider"
                    style={{ color: 'var(--warm-taupe)' }}
                  >
                    Discount Code
                  </label>

                  {discountResult ? (
                    /* Applied state — show green pill with remove button */
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #86EFAC',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Tag size={14} style={{ color: '#16A34A' }} />
                        <span className="font-body font-semibold text-sm" style={{ color: '#15803D' }}>
                          {discountCode}
                        </span>
                        <span className="font-body text-sm" style={{ color: '#16A34A' }}>
                          — {discountResult.label} applied
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Remove discount"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    /* Input state */
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountInput}
                        onChange={e => {
                          setDiscountInput(e.target.value.toUpperCase());
                          setDiscountError('');
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                        placeholder="Enter code e.g. GLOW10"
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountInput.trim()}
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          padding: '0.75rem 1.25rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          backgroundColor: discountInput.trim() ? 'var(--dark-chocolate)' : 'var(--soft-border-beige)',
                          color: discountInput.trim() ? '#FFFFFF' : 'var(--warm-taupe)',
                          cursor: discountInput.trim() ? 'pointer' : 'not-allowed',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 150ms ease',
                          flexShrink: 0,
                        }}
                      >
                        {discountLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}

                  {discountError && (
                    <p className="font-body text-xs mt-2" style={{ color: '#DC2626' }}>
                      {discountError}
                    </p>
                  )}
                </div>

                {/* Amount breakdown */}
                <div
                  className="rounded-xl mb-6 overflow-hidden"
                  style={{ border: '1px solid var(--soft-border-beige)' }}
                >
                  <div
                    className="flex justify-between px-5 py-3"
                    style={{ backgroundColor: 'var(--soft-cream)' }}
                  >
                    <span className="font-body text-sm" style={{ color: 'var(--charcoal)' }}>Subtotal</span>
                    <span className="font-body text-sm font-medium" style={{ color: 'var(--dark-chocolate)' }}>
                      KSh {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="flex justify-between px-5 py-3"
                    style={{ backgroundColor: 'var(--soft-cream)', borderTop: '1px solid var(--soft-border-beige)' }}
                  >
                    <span className="font-body text-sm" style={{ color: 'var(--charcoal)' }}>
                      Delivery ({deliveryZone?.label})
                    </span>
                    <span className="font-body text-sm font-medium" style={{ color: 'var(--deep-orange)' }}>
                      {deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Discount line — only shown when a code is applied */}
                  {discountResult && (
                    <div
                      className="flex justify-between px-5 py-3"
                      style={{ backgroundColor: '#F0FDF4', borderTop: '1px solid var(--soft-border-beige)' }}
                    >
                      <span className="font-body text-sm flex items-center gap-1.5" style={{ color: '#15803D' }}>
                        <Tag size={12} />
                        Discount ({discountCode})
                      </span>
                      <span className="font-body text-sm font-medium" style={{ color: '#15803D' }}>
                        − KSh {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div
                    className="flex justify-between px-5 py-4"
                    style={{ borderTop: '1px solid var(--soft-border-beige)', backgroundColor: '#FFFFFF' }}
                  >
                    <span className="font-body font-bold" style={{ color: 'var(--dark-chocolate)' }}>Total</span>
                    <span className="font-body font-bold" style={{ fontSize: '1.125rem', color: 'var(--dark-chocolate)' }}>
                      KSh {total.toLocaleString()}
                    </span>
                  </div>
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

                  {/* Subtotal / Delivery / Discount / Total breakdown */}
                  <div
                    className="space-y-2 pt-4"
                    style={{ borderTop: '1px solid var(--soft-border-beige)' }}
                  >
                    <div className="flex justify-between font-body text-sm">
                      <span style={{ color: 'var(--warm-taupe)' }}>Subtotal</span>
                      <span style={{ color: 'var(--dark-chocolate)' }}>KSh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span style={{ color: 'var(--warm-taupe)' }}>Delivery</span>
                      <span style={{ color: deliveryZone ? 'var(--deep-orange)' : 'var(--warm-taupe)' }}>
                        {deliveryZone
                          ? deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`
                          : 'Select method'}
                      </span>
                    </div>
                    {/* Discount line in sidebar — only when applied */}
                    {discountResult && (
                      <div className="flex justify-between font-body text-sm">
                        <span style={{ color: '#15803D' }}>Discount</span>
                        <span style={{ color: '#15803D' }}>− KSh {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between font-body font-bold pt-3"
                      style={{
                        borderTop: '1px solid var(--soft-border-beige)',
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