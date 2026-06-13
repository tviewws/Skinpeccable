/*
 * SKINPECCABLE GLOWTIQUE — Contact Us Page
 * Design: "Warm Luxury" — no form, elegant contact cards, rich atmosphere
 */

import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { usePageMeta } from '@/hooks/usePageMeta';
import contactUsPng from '../../assets/contactuspng.png';

export default function Contact() {
  usePageMeta(
    'Contact Us | Skinpeccable Glowtique Nairobi',
    'Get in touch with Skinpeccable Glowtique. WhatsApp, Instagram, email or visit us at Shop No. 2, Inka Centre, Lavington Green, Nairobi.'
  );
  useScrollReveal();

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ height: '340px' }}>
        <img src={contactUsPng} alt="Contact Skinpeccable Glowtique" className="w-full h-full object-cover object-top" />
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

      {/* ── INTRO ── */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="text-center reveal" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="accent-line mx-auto mb-6" />
            <h2
              className="font-display font-semibold mb-5"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--dark-chocolate)', lineHeight: 1.15 }}
            >
              Let's Start a Conversation
            </h2>
            <p
              className="font-body leading-relaxed"
              style={{ fontSize: '1rem', color: 'var(--charcoal)', lineHeight: 1.8 }}
            >
              Whether you have a question about a product, need skincare advice, want to know about delivery, or simply want to connect — reach us through any of the channels below and we'll get back to you warmly and promptly.
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTACT CHANNELS ── */}
      <section className="pb-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">

          {/* Top row — WhatsApp + Instagram + TikTok */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* WhatsApp — Primary CTA */}
            <a
              href="https://wa.me/254722303056"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal group relative overflow-hidden rounded-2xl flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--dark-chocolate)',
                padding: '2.5rem',
                minHeight: '260px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 20px 48px rgba(90,52,32,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
                style={{ backgroundColor: '#25D366' }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-5"
                style={{ backgroundColor: 'var(--deep-orange)' }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>

              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-2"
                  style={{ fontSize: '0.65rem', color: 'rgba(234,223,207,0.5)', letterSpacing: '0.18em' }}
                >
                  Fastest Response
                </p>
                <h3
                  className="font-display font-semibold mb-2"
                  style={{ fontSize: '1.5rem', color: '#FFFFFF' }}
                >
                  Chat on WhatsApp
                </h3>
                <p
                  className="font-body"
                  style={{ fontSize: '0.875rem', color: 'rgba(234,223,207,0.65)', lineHeight: 1.6 }}
                >
                  Quick replies, product help & order support. We typically respond within minutes.
                </p>
              </div>

              <div
                className="mt-6 inline-flex items-center gap-2 font-body font-semibold text-sm"
                style={{ color: '#25D366' }}
              >
                +254 722 303 056
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/skinpeccable.ke_"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal reveal-delay-1 group relative overflow-hidden rounded-2xl flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                padding: '2.5rem',
                minHeight: '260px',
                textDecoration: 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 20px 48px rgba(220,39,67,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ backgroundColor: '#FFFFFF' }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                <Instagram size={26} color="white" />
              </div>

              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-2"
                  style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.18em' }}
                >
                  Stay Connected
                </p>
                <h3
                  className="font-display font-semibold mb-2"
                  style={{ fontSize: '1.5rem', color: '#FFFFFF' }}
                >
                  Follow Us
                </h3>
                <p
                  className="font-body"
                  style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}
                >
                  New arrivals, skincare tips, and behind-the-scenes content. DM us anytime.
                </p>
              </div>

              <div
                className="mt-6 inline-flex items-center gap-2 font-body font-semibold text-sm"
                style={{ color: '#FFFFFF' }}
              >
                @skinpeccable.ke_
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@skinpeccable.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal reveal-delay-2 group relative overflow-hidden rounded-2xl flex flex-col justify-between"
              style={{
                backgroundColor: '#010101',
                padding: '2.5rem',
                minHeight: '260px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 20px 48px rgba(105,201,208,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                style={{ backgroundColor: '#69C9D0' }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
                style={{ backgroundColor: '#EE1D52' }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {/* TikTok icon */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </div>

              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-2"
                  style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em' }}
                >
                  Watch & Shop
                </p>
                <h3
                  className="font-display font-semibold mb-2"
                  style={{ fontSize: '1.5rem', color: '#FFFFFF' }}
                >
                  Find Us on TikTok
                </h3>
                <p
                  className="font-body"
                  style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}
                >
                  Product reviews, skincare routines, and glow-up content. Follow for daily inspo.
                </p>
              </div>

              <div
                className="mt-6 inline-flex items-center gap-2 font-body font-semibold text-sm"
                style={{ color: '#69C9D0' }}
              >
                @skinpeccable.ke
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </a>

          </div>

          {/* Bottom row — Email, Phone, Location, Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Email */}
            <a
              href="mailto:glow@skinpeccable.co.ke"
              className="reveal reveal-delay-1 group rounded-2xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--soft-cream)',
                border: '1px solid var(--soft-border-beige)',
                textDecoration: 'none',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-3px)';
                el.style.borderColor = 'var(--deep-orange)';
                el.style.boxShadow = '0 8px 24px rgba(90,52,32,0.1)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'var(--soft-border-beige)';
                el.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--deep-orange)' }}
              >
                <Mail size={18} color="white" />
              </div>
              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-1"
                  style={{ fontSize: '0.6rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
                >
                  Email Us
                </p>
                <p
                  className="font-body font-semibold"
                  style={{ fontSize: '0.875rem', color: 'var(--dark-chocolate)', lineHeight: 1.4 }}
                >
                  glow@skinpeccable.co.ke
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  Reply within 24 hours
                </p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+254722303056"
              className="reveal reveal-delay-2 group rounded-2xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--soft-cream)',
                border: '1px solid var(--soft-border-beige)',
                textDecoration: 'none',
                transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-3px)';
                el.style.borderColor = 'var(--deep-orange)';
                el.style.boxShadow = '0 8px 24px rgba(90,52,32,0.1)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'var(--soft-border-beige)';
                el.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--deep-orange)' }}
              >
                <Phone size={18} color="white" />
              </div>
              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-1"
                  style={{ fontSize: '0.6rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
                >
                  Call or WhatsApp
                </p>
                <p
                  className="font-body font-semibold"
                  style={{ fontSize: '0.875rem', color: 'var(--dark-chocolate)', lineHeight: 1.4 }}
                >
                  +254 722 303 056
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  Mon–Fri 9am–6pm, Sat 10am–5pm
                </p>
              </div>
            </a>

            {/* Location */}
            <div
              className="reveal reveal-delay-3 rounded-2xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--soft-cream)',
                border: '1px solid var(--soft-border-beige)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--deep-orange)' }}
              >
                <MapPin size={18} color="white" />
              </div>
              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-1"
                  style={{ fontSize: '0.6rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
                >
                  Visit Us
                </p>
                <p
                  className="font-body font-semibold"
                  style={{ fontSize: '0.875rem', color: 'var(--dark-chocolate)', lineHeight: 1.4 }}
                >
                  Shop No. 2, Inka Centre
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  Lavington Green, Nairobi
                </p>
              </div>
            </div>

            {/* Hours */}
            <div
              className="reveal reveal-delay-3 rounded-2xl p-6 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--soft-cream)',
                border: '1px solid var(--soft-border-beige)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--deep-orange)' }}
              >
                <Clock size={18} color="white" />
              </div>
              <div>
                <p
                  className="font-body font-medium uppercase tracking-widest mb-1"
                  style={{ fontSize: '0.6rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
                >
                  Opening Hours
                </p>
                <p
                  className="font-body font-semibold"
                  style={{ fontSize: '0.875rem', color: 'var(--dark-chocolate)', lineHeight: 1.4 }}
                >
                  Mon–Fri: 09:00–18:00
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--warm-taupe)' }}>
                  Saturday: 10:00–17:00
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TAGLINE FOOTER STRIP ── */}
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