/*
 * SKINPECCABLE GLOWTIQUE — Contact Us Page
 * Design: "Structured Warmth" — contact form, info cards, animations
 */

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Send, CheckCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663656533692/jCCPNKSkazkgBn7bH3FjhA/hero-home-kqjyACi9knqn96y4NyeKv6.webp';

const CONTACT_INFO = [
  {
    icon: <MapPin size={20} />,
    label: 'Visit Us',
    value: 'Nairobi, Kenya',
    sub: 'Find us in-store',
  },
  {
    icon: <Phone size={20} />,
    label: 'Call or WhatsApp',
    value: '+254 700 000 000',
    sub: 'Mon–Sat, 9am–6pm',
    href: 'tel:+254700000000',
  },
  {
    icon: <Mail size={20} />,
    label: 'Email Us',
    value: 'hello@skinpeccable.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@skinpeccable.com',
  },
  {
    icon: <Clock size={20} />,
    label: 'Opening Hours',
    value: 'Mon–Sat: 9am–7pm',
    sub: 'Sunday: 10am–4pm',
  },
];

export default function Contact() {
  useScrollReveal();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const inputStyle = {
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

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ height: '340px' }}>
        <img src={HERO_IMG} alt="Contact Skinpeccable Glowtique" className="w-full h-full object-cover object-top" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'rgba(90,52,32,0.62)' }}
        >
          <p
            className="font-body font-medium tracking-widest uppercase mb-3 fade-up"
            style={{ fontSize: '0.7rem', color: 'rgba(234,223,207,0.8)', letterSpacing: '0.2em' }}
          >
            We'd Love to Hear From You
          </p>
          <h1
            className="font-display font-semibold fade-up fade-up-delay-1"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#FFFFFF', lineHeight: 1.1 }}
          >
            Contact Us
          </h1>
          <p
            className="font-body mt-3 fade-up fade-up-delay-2"
            style={{ fontSize: '1rem', color: 'rgba(234,223,207,0.85)', maxWidth: '420px' }}
          >
            Questions, product advice, or just want to say hello — we're here.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ── */}
      <section className="py-16" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_INFO.map((info, i) => (
              <div
                key={info.label}
                className={`reveal reveal-delay-${i + 1} bg-white rounded-xl p-6`}
                style={{ border: '1px solid var(--soft-border-beige)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--soft-cream)', color: 'var(--deep-orange)' }}
                >
                  {info.icon}
                </div>
                <p
                  className="font-body font-semibold tracking-wide uppercase mb-1"
                  style={{ fontSize: '0.65rem', color: 'var(--warm-taupe)', letterSpacing: '0.12em' }}
                >
                  {info.label}
                </p>
                {info.href ? (
                  <a
                    href={info.href}
                    className="font-body font-semibold block transition-colors"
                    style={{ fontSize: '0.9375rem', color: 'var(--dark-chocolate)' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--deep-orange)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--dark-chocolate)')}
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="font-body font-semibold" style={{ fontSize: '0.9375rem', color: 'var(--dark-chocolate)' }}>
                    {info.value}
                  </p>
                )}
                <p className="font-body text-xs mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  {info.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM + SIDEBAR ── */}
      <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14 items-start">
            {/* Sidebar */}
            <div className="reveal">
              <div className="accent-line mb-6" />
              <h2
                className="font-display font-semibold mb-5"
                style={{ fontSize: '2rem', color: 'var(--dark-chocolate)', lineHeight: 1.1 }}
              >
                Let's Start a Conversation
              </h2>
              <p
                className="font-body leading-relaxed mb-8"
                style={{ fontSize: '0.9375rem', color: 'var(--charcoal)' }}
              >
                Whether you have a question about a product, need skincare advice, want to know about delivery, or simply want to connect — we're always happy to help.
              </p>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl mb-6 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--soft-cream)',
                  border: '1px solid var(--soft-border-beige)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--deep-orange)';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FFF8F4';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--soft-border-beige)';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--soft-cream)';
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-body font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                    Chat on WhatsApp
                  </p>
                  <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>
                    Quick replies, product help
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: 'var(--soft-cream)',
                  border: '1px solid var(--soft-border-beige)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--sg-pink)';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FFF5F8';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--soft-border-beige)';
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--soft-cream)';
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--sg-pink)' }}
                >
                  <Instagram size={16} color="white" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                    Follow on Instagram
                  </p>
                  <p className="font-body text-xs" style={{ color: 'var(--warm-taupe)' }}>
                    @skinpeccable
                  </p>
                </div>
              </a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 reveal reveal-delay-2">
              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center text-center py-20 px-8 rounded-2xl"
                  style={{ backgroundColor: 'var(--soft-cream)', border: '1px solid var(--soft-border-beige)' }}
                >
                  <CheckCircle size={56} style={{ color: 'var(--deep-orange)' }} className="mb-5" />
                  <h3
                    className="font-display font-semibold mb-3"
                    style={{ fontSize: '1.75rem', color: 'var(--dark-chocolate)' }}
                  >
                    Message Sent!
                  </h3>
                  <p className="font-body" style={{ fontSize: '1rem', color: 'var(--charcoal)', maxWidth: '360px' }}>
                    Thank you for reaching out. We'll get back to you within 24 hours. In the meantime, feel free to explore our shop.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary mt-8"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl p-8 md:p-10"
                  style={{ backgroundColor: 'var(--light-warm-grey)', border: '1px solid var(--soft-border-beige)' }}
                >
                  <h3
                    className="font-display font-semibold mb-8"
                    style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
                  >
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                    </div>
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="+254 700 000 000"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      />
                    </div>
                    <div>
                      <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                      >
                        <option value="">Select a subject</option>
                        <option value="product-enquiry">Product Enquiry</option>
                        <option value="order-support">Order Support</option>
                        <option value="skincare-advice">Skincare Advice</option>
                        <option value="wholesale">Wholesale / Supplier</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-7">
                    <label className="block font-body font-medium text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--warm-taupe)' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you today?"
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section
        className="py-16 text-center"
        style={{ backgroundColor: 'var(--dark-chocolate)' }}
      >
        <div className="container reveal">
          <p
            className="font-display italic text-xl mb-2"
            style={{ color: 'var(--deep-orange)' }}
          >
            Glow. Different.
          </p>
          <p
            className="font-body"
            style={{ fontSize: '0.9rem', color: 'rgba(234,223,207,0.65)' }}
          >
            Thank you for choosing Skinpeccable. We hope your purchase brings confidence, care and a little more glow to your routine.
          </p>
        </div>
      </section>
    </div>
  );
}
