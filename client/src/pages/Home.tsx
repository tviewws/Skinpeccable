/*
 * SKINPECCABLE GLOWTIQUE — Home Page
 * Design: "Structured Warmth" — animated welcome experience, no products
 * Sections: Hero (full-screen) | Brand Story | Three Pillars | Lifestyle Split | Tagline CTA
 */

import { useRef } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Sparkles, Leaf, Heart } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import heroVideo from '../../assets/herovideo.mp4';

import heroSkin from '../../assets/heroskin.jpg';

const HERO_IMG_2 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663656533692/jCCPNKSkazkgBn7bH3FjhA/hero-home-2-WUTV3RMNtmEEzPj6biBqEK.webp';

const PILLARS = [
  {
    icon: <Sparkles size={24} />,
    title: 'Curated Selection',
    desc: 'Every product on our shelves is carefully chosen for quality, efficacy, and skin compatibility.',
  },
  {
    icon: <Leaf size={24} />,
    title: 'Skin-First Philosophy',
    desc: 'We believe in honest, practical skincare that fits your routine, your skin, and your life.',
  },
  {
    icon: <Heart size={24} />,
    title: 'Inclusive Beauty',
    desc: 'Skinpeccable speaks to every skin tone, every gender, and every confidence level.',
  },
];

export default function Home() {
  useScrollReveal();
  const heroRef = useRef<HTMLDivElement>(null);

  // NOTE: Parallax scroll effect removed — it conflicts with video playback
  // and causes visual glitching on the <video> element.

  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: 'calc(100vh - 5rem)', minHeight: '600px', maxHeight: '900px' }}
      >
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="hero-img w-full h-full object-cover"
            style={{ transform: 'none', objectPosition: 'top' }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* Gradient overlay — dark left, transparent right */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, rgba(90,52,32,0.72) 0%, rgba(90,52,32,0.35) 50%, rgba(90,52,32,0.05) 100%)',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative h-full container flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5 fade-up">
              <div style={{ width: '2rem', height: '1.5px', backgroundColor: 'var(--deep-orange)' }} />
              <span
                className="font-body font-medium tracking-widest uppercase"
                style={{ fontSize: '0.7rem', color: 'rgba(234,223,207,0.9)', letterSpacing: '0.2em' }}
              >
                Beauty · Skincare · Grooming
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-semibold fade-up fade-up-delay-1"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '1.25rem',
              }}
            >
              Glow.
              <br />
              <span style={{ color: 'var(--deep-orange)' }}>Different.</span>
            </h1>

            {/* Subline */}
            <p
              className="font-body font-light leading-relaxed fade-up fade-up-delay-2"
              style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: 'rgba(234,223,207,0.85)',
                marginBottom: '2.5rem',
                maxWidth: '420px',
              }}
            >
              Curated beauty, skincare, fragrance and grooming essentials — selected for every skin, every routine, every confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 fade-up fade-up-delay-3">
              <Link href="/shop">
                <button className="btn-primary flex items-center gap-2">
                  Shop With Us
                  <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/about">
                <button
                  className="flex items-center gap-2 font-body font-semibold text-sm tracking-wide uppercase px-6 py-3 rounded transition-colors duration-200"
                  style={{
                    color: 'var(--soft-cream)',
                    border: '1.5px solid rgba(234,223,207,0.5)',
                    backgroundColor: 'transparent',
                    letterSpacing: '0.06em',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(234,223,207,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--soft-cream)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(234,223,207,0.5)';
                  }}
                >
                  Our Story
                </button>
              </Link>
            </div>
          </div>
        </div>


      </section>

      {/* ── BRAND INTRO STRIP ── */}
      <section style={{ backgroundColor: 'var(--soft-cream)' }}>
        <div className="container py-10">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {['Skincare', 'Cosmetics', 'Fragrance', 'Body Care', 'Grooming'].map((cat, i) => (
              <div key={cat} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className="hidden md:block w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--warm-taupe)' }}
                  />
                )}
                <span
                  className="font-body font-medium tracking-widest uppercase"
                  style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}
                >
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY SPLIT ── */}
      <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="reveal relative">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: '4/5', maxHeight: '600px' }}
              >
                <img
                  src={heroSkin}
                  alt="Skinpeccable model — confident, glowing skin"
                  className="w-full h-full object-cover"
                />
                {/* Decorative orange frame offset */}
                <div
                  className="absolute -bottom-4 -right-4 w-32 h-32 rounded-lg -z-10"
                  style={{ backgroundColor: 'var(--soft-cream)', border: '2px solid var(--deep-orange)' }}
                />
              </div>

              {/* Floating badge */}
              <div
                className="absolute top-6 -right-4 bg-white rounded-lg px-5 py-4 shadow-lg"
                style={{ border: '1px solid var(--soft-border-beige)' }}
              >
                <p className="font-display italic text-2xl" style={{ color: 'var(--dark-chocolate)' }}>
                  Glow.
                </p>
                <p className="font-display italic text-2xl" style={{ color: 'var(--deep-orange)' }}>
                  Different.
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="reveal reveal-delay-2">
              <div className="accent-line mb-6" />
              <h2
                className="font-display font-semibold mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--dark-chocolate)', lineHeight: 1.1 }}
              >
                Where Confidence
                <br />
                Meets Care
              </h2>
              <p
                className="font-body leading-relaxed mb-5"
                style={{ fontSize: '1rem', color: 'var(--charcoal)', maxWidth: '440px' }}
              >
                Skinpeccable Glowtique is a modern beauty and grooming boutique offering carefully curated products for customers who want to look good, feel confident, and maintain everyday self-care routines.
              </p>
              <p
                className="font-body leading-relaxed mb-8"
                style={{ fontSize: '1rem', color: 'var(--charcoal)', maxWidth: '440px' }}
              >
                We sit between mass-market beauty and high-end luxury — accessible premium, warm, and inclusive. Every product is selected with purpose, every category designed with care.
              </p>
              <Link href="/about">
                <button className="btn-secondary flex items-center gap-2">
                  Discover Our Story
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section className="py-24" style={{ backgroundColor: 'var(--light-warm-grey)' }}>
        <div className="container">
          <div className="text-center mb-16 reveal">
            <div className="accent-line mx-auto mb-6" />
            <h2
              className="font-display font-semibold"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--dark-chocolate)' }}
            >
              The Skinpeccable Promise
            </h2>
            <p
              className="font-body mt-4 mx-auto"
              style={{ fontSize: '1rem', color: 'var(--warm-taupe)', maxWidth: '480px' }}
            >
              We help every customer discover beauty, skincare and grooming products that fit their skin, routine, lifestyle and confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className={`reveal reveal-delay-${i + 1} bg-white rounded-xl p-8`}
                style={{ border: '1px solid var(--soft-border-beige)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'var(--soft-cream)', color: 'var(--deep-orange)' }}
                >
                  {pillar.icon}
                </div>
                <h3
                  className="font-display font-semibold mb-3"
                  style={{ fontSize: '1.375rem', color: 'var(--dark-chocolate)' }}
                >
                  {pillar.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--charcoal)' }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIFESTYLE FULL-WIDTH BANNER ── */}
      <section className="relative overflow-hidden" style={{ height: '480px' }}>
        <img
          src={HERO_IMG_2}
          alt="Skinpeccable curated beauty products"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 flex items-center"
          style={{ background: 'linear-gradient(90deg, rgba(90,52,32,0.75) 0%, rgba(90,52,32,0.2) 60%, transparent 100%)' }}
        >
          <div className="container">
            <div className="max-w-lg reveal">
              <p
                className="font-body font-medium tracking-widest uppercase mb-4"
                style={{ fontSize: '0.7rem', color: 'rgba(234,223,207,0.8)', letterSpacing: '0.2em' }}
              >
                Curated for You
              </p>
              <h2
                className="font-display font-semibold mb-5"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#FFFFFF', lineHeight: 1.15 }}
              >
                Your Skin.
                <br />
                Your Standard.
              </h2>
              <p
                className="font-body mb-8"
                style={{ fontSize: '1rem', color: 'rgba(234,223,207,0.85)', lineHeight: 1.7 }}
              >
                Explore skincare, fragrance, body care and grooming essentials — all in one warm, curated boutique.
              </p>
              <Link href="/shop">
                <button className="btn-primary flex items-center gap-2">
                  Explore the Shop
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES PREVIEW ── */}
      <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="text-center mb-14 reveal">
            <div className="accent-line mx-auto mb-6" />
            <h2
              className="font-display font-semibold"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--dark-chocolate)' }}
            >
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Skincare', emoji: '✨', href: '/shop?cat=general-skincare-beauty', bg: '#EADFCF' },
              { label: 'Sunscreen & SPF', emoji: '☀️', href: '/shop?cat=sunscreen', bg: '#F6F1EB' },
              { label: 'Fragrance', emoji: '🌸', href: '/shop?cat=fragrance-cologne-edp', bg: '#EADFCF' },
              { label: 'Body Wash', emoji: '🫧', href: '/shop?cat=body-wash', bg: '#F6F1EB' },
              { label: 'Body Lotion', emoji: '🧴', href: '/shop?cat=body-lotion-butter-cream', bg: '#EADFCF' },
              { label: 'Deodorant', emoji: '🌿', href: '/shop?cat=deodorant', bg: '#F6F1EB' },
            ].map((cat, i) => (
              <Link key={cat.label} href={cat.href}>
                <div
                  className={`reveal reveal-delay-${(i % 3) + 1} rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group`}
                  style={{ backgroundColor: cat.bg, border: '1px solid var(--soft-border-beige)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(90,52,32,0.12)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="text-3xl mb-3">{cat.emoji}</div>
                  <p
                    className="font-body font-medium"
                    style={{ fontSize: '0.8rem', color: 'var(--dark-chocolate)', lineHeight: 1.3 }}
                  >
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL TAGLINE CTA ── */}
      <section
        className="py-24 text-center"
        style={{ backgroundColor: 'var(--dark-chocolate)' }}
      >
        <div className="container reveal">
          <p
            className="font-body font-medium tracking-widest uppercase mb-5"
            style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.2em' }}
          >
            Skinpeccable Glowtique
          </p>
          <h2
            className="font-display font-semibold mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#FFFFFF', lineHeight: 1.05 }}
          >
            Care for Every Skin.
            <br />
            <span style={{ color: 'var(--deep-orange)' }}>Confidence for Every Person.</span>
          </h2>
          <p
            className="font-body mx-auto mb-10"
            style={{ fontSize: '1rem', color: 'rgba(234,223,207,0.75)', maxWidth: '480px', lineHeight: 1.7 }}
          >
            Discover trusted skincare, beauty, fragrance, body care and grooming products — curated for your routine, your skin, and your confidence.
          </p>
          <Link href="/shop">
            <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.875rem 2.5rem' }}>
              Start Shopping
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}