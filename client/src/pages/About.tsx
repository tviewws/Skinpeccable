/*
 * SKINPECCABLE GLOWTIQUE — About Us Page
 * Design: "Structured Warmth" — brand story, values, team ethos, animated sections
 */

import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import aboutUsPng from '../../assets/aboutuspng.png';
import aboutUsPng2 from '../../assets/aboutuspng2.png';

const ABOUT_HERO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663656533692/jCCPNKSkazkgBn7bH3FjhA/about-hero-jV8SayHvBDchVyQrx3tDWN.webp';

const VALUES = [
  { title: 'Confidence', desc: 'Every customer should leave feeling more assured and cared for.' },
  { title: 'Care', desc: 'Product recommendations are thoughtful and customer-centred, never pushy.' },
  { title: 'Inclusivity', desc: 'We speak to women, men, and diverse skin needs — naturally and warmly.' },
  { title: 'Quality', desc: 'Products, packaging and service feel reliable and premium.' },
  { title: 'Warmth', desc: 'The shop feels welcoming, not intimidating — calm, friendly, and open.' },
  { title: 'Integrity', desc: 'Honest product language, no exaggerated claims, no unsafe advice.' },
];

const STATS = [
  { value: '200+', label: 'Curated Products' },
  { value: '6', label: 'Product Categories' },
  { value: '100%', label: 'Authentic Brands' },
  { value: '∞', label: 'Confidence Delivered' },
];

export default function About() {
  useScrollReveal();

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ height: '420px' }}>
        <img src={ABOUT_HERO} alt="Skinpeccable Glowtique boutique" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'rgba(90,52,32,0.6)' }}
        >
          <p
            className="font-body font-medium tracking-widest uppercase mb-3 fade-up"
            style={{ fontSize: '0.7rem', color: 'rgba(234,223,207,0.8)', letterSpacing: '0.2em' }}
          >
            Our Story
          </p>
          <h1
            className="font-display font-semibold fade-up fade-up-delay-1"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#FFFFFF', lineHeight: 1.1 }}
          >
            About Skinpeccable
          </h1>
          <p
            className="font-body mt-3 fade-up fade-up-delay-2"
            style={{ fontSize: '1rem', color: 'rgba(234,223,207,0.85)', maxWidth: '480px' }}
          >
            A warm, curated, modern and inclusive beauty and grooming destination.
          </p>
        </div>
      </section>

      {/* ── BRAND ESSENCE ── */}
      <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="accent-line mb-6" />
              <h2
                className="font-display font-semibold mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'var(--dark-chocolate)', lineHeight: 1.1 }}
              >
                Glow, Confidence &
                <br />
                Self-Care for Every Skin
              </h2>
              <p
                className="font-body leading-relaxed mb-5"
                style={{ fontSize: '1rem', color: 'var(--charcoal)' }}
              >
                Skinpeccable Glowtique is a modern beauty, skincare, cosmetics, fragrance and grooming retail brand. Our identity is warm, premium, inclusive, stylish and accessible — speaking to women and men alike without becoming overly feminine, overly clinical, or visually cluttered.
              </p>
              <p
                className="font-body leading-relaxed mb-8"
                style={{ fontSize: '1rem', color: 'var(--charcoal)' }}
              >
                We sit between mass-market beauty retailers and high-end luxury boutiques. Not cheap, not cluttered, not transactional — and not too exclusive, intimidating, or unaffordable. We are accessible premium, and proud of it.
              </p>
              <div
                className="p-5 rounded-xl"
                style={{ backgroundColor: 'var(--soft-cream)', borderLeft: '3px solid var(--deep-orange)' }}
              >
                <p className="font-display italic text-xl" style={{ color: 'var(--dark-chocolate)' }}>
                  "To make beauty, skincare, cosmetics and grooming feel accessible, curated, confidence-building and inclusive."
                </p>
                <p className="font-body text-sm mt-3" style={{ color: 'var(--warm-taupe)' }}>
                  — Our Purpose
                </p>
              </div>
            </div>

            <div className="reveal reveal-delay-2 relative">
              <div className="overflow-hidden rounded-xl" style={{ aspectRatio: '4/5' }}>
                <img
                  src={aboutUsPng}
                  alt="Skinpeccable — confidence and self-care"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div
                className="absolute -bottom-5 -left-5 w-24 h-24 rounded-xl -z-10"
                style={{ backgroundColor: 'var(--soft-cream)', border: '2px solid var(--warm-taupe)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ backgroundColor: 'var(--dark-chocolate)' }}>
        <div className="container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`reveal reveal-delay-${i + 1} text-center`}
              >
                <p
                  className="font-display font-semibold"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--deep-orange)' }}
                >
                  {stat.value}
                </p>
                <p
                  className="font-body font-medium mt-1"
                  style={{ fontSize: '0.875rem', color: 'rgba(234,223,207,0.75)', letterSpacing: '0.05em' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND VALUES ── */}
      <section className="py-24" style={{ backgroundColor: 'var(--light-warm-grey)' }}>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="accent-line mx-auto mb-6" />
            <h2
              className="font-display font-semibold"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--dark-chocolate)' }}
            >
              What We Stand For
            </h2>
            <p
              className="font-body mt-4 mx-auto"
              style={{ fontSize: '1rem', color: 'var(--warm-taupe)', maxWidth: '460px' }}
            >
              Our values guide every product we stock, every recommendation we make, and every customer we serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((val, i) => (
              <div
                key={val.title}
                className={`reveal reveal-delay-${(i % 3) + 1} bg-white rounded-xl p-7`}
                style={{ border: '1px solid var(--soft-border-beige)' }}
              >
                <div className="flex items-start gap-4">
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--deep-orange)' }} />
                  <div>
                    <h3
                      className="font-body font-semibold mb-2"
                      style={{ fontSize: '1rem', color: 'var(--dark-chocolate)' }}
                    >
                      {val.title}
                    </h3>
                    <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>
                      {val.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION SPLIT ── */}
      <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                label: 'Our Mission',
                text: 'To provide a warm, modern and carefully curated retail experience where customers discover trusted skincare, beauty, fragrance, body care and grooming products.',
                bg: 'var(--soft-cream)',
                accent: 'var(--deep-orange)',
              },
              {
                label: 'Our Vision',
                text: 'To become a recognised beauty and grooming destination known for inclusive customer care, curated products, premium accessibility and a distinctive retail experience.',
                bg: 'var(--dark-chocolate)',
                accent: 'var(--deep-orange)',
                dark: true,
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`reveal reveal-delay-${i + 1} rounded-2xl p-10`}
                style={{ backgroundColor: item.bg }}
              >
                <div
                  className="w-8 h-0.5 mb-5"
                  style={{ backgroundColor: item.accent }}
                />
                <h3
                  className="font-display font-semibold mb-4"
                  style={{
                    fontSize: '1.75rem',
                    color: item.dark ? 'var(--soft-cream)' : 'var(--dark-chocolate)',
                  }}
                >
                  {item.label}
                </h3>
                <p
                  className="font-body leading-relaxed"
                  style={{
                    fontSize: '1rem',
                    color: item.dark ? 'rgba(234,223,207,0.8)' : 'var(--charcoal)',
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIFESTYLE IMAGE BANNER ── */}
      <section className="relative overflow-hidden" style={{ height: '360px' }}>
        <img src={aboutUsPng2} alt="Skinpeccable curated products" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'rgba(90,52,32,0.65)' }}
        >
          <div className="reveal">
            <p
              className="font-display italic text-2xl md:text-3xl mb-6"
              style={{ color: '#FFFFFF' }}
            >
              "Your Skin, Your Standard."
            </p>
            <Link href="/shop">
              <button className="btn-primary flex items-center gap-2 mx-auto">
                Explore the Shop
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMISE ── */}
      <section className="py-24 text-center" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <div className="container reveal">
          <div className="accent-line mx-auto mb-6" />
          <h2
            className="font-display font-semibold mb-5"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--dark-chocolate)' }}
          >
            Our Promise to You
          </h2>
          <p
            className="font-body mx-auto mb-10"
            style={{ fontSize: '1.0625rem', color: 'var(--charcoal)', maxWidth: '560px', lineHeight: 1.75 }}
          >
            We help every customer discover beauty, skincare and grooming products that fit their skin, routine, lifestyle and confidence. Every visit to Skinpeccable should leave you feeling more assured, more cared for, and a little more glowing.
          </p>
          <Link href="/contact">
            <button className="btn-secondary flex items-center gap-2 mx-auto">
              Get In Touch
              <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}