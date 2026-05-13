/*
 * SKINPECCABLE GLOWTIQUE — Home Page
 * Design: "Structured Warmth" + VYRE-inspired dark blue hero
 * Hero: Dark blue gradient with model + product cards overlay
 * Sections: Brand story, pillars, lifestyle imagery, CTA
 */

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Sparkles, Shield, Leaf, Zap } from 'lucide-react';

const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663656533692/jCCPNKSkazkgBn7bH3FjhA/hero-vyre-style-bFdFkdEdatf2SoJctkgibU.webp';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* ── HERO SECTION — VYRE-INSPIRED DARK BLUE ── */}
      <section className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: '600px' }}>
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark blue gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(15,35,70,0.75) 0%, rgba(25,50,95,0.65) 50%, rgba(35,60,110,0.55) 100%)',
            }}
          />
        </div>

        {/* Hero content — left side text + right side product cards */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full py-20">
              {/* ── LEFT: Headline + CTA ── */}
              <div
                className="flex flex-col justify-center"
                style={{
                  animation: 'fadeInUp 0.8s ease-out',
                }}
              >
                <p
                  className="font-body font-medium tracking-widest uppercase mb-4"
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: '0.2em',
                  }}
                >
                  Skinpeccable Glowtique
                </p>

                <h1
                  className="font-display font-bold leading-tight mb-6"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    color: '#FFFFFF',
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  Glow.
                  <br />
                  <span style={{ color: 'var(--deep-orange)' }}>Different.</span>
                </h1>

                <p
                  className="font-body leading-relaxed mb-8 max-w-md"
                  style={{
                    fontSize: '1.0625rem',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: '1.7',
                  }}
                >
                  Curated beauty, skincare, fragrance and grooming essentials — selected for every skin, every routine, every confidence.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/shop">
                    <button
                      className="px-8 py-3.5 rounded font-body font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--deep-orange)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        letterSpacing: '0.04em',
                        transform: 'scale(1)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                      }}
                    >
                      SHOP WITH US <ChevronRight size={16} />
                    </button>
                  </Link>

                  <button
                    className="px-8 py-3.5 rounded font-body font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      fontSize: '0.95rem',
                      letterSpacing: '0.04em',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#FFFFFF';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    OUR STORY
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Product cards overlay (visible on desktop) ── */}
              <div className="hidden lg:flex flex-col gap-4 justify-center">
                {/* Card 1 */}
                <div
                  className="p-5 rounded-lg backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    animation: 'slideInRight 0.8s ease-out 0.2s both',
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="p-2 rounded"
                      style={{
                        backgroundColor: 'rgba(255,140,60,0.2)',
                      }}
                    >
                      <Sparkles size={18} style={{ color: 'var(--deep-orange)' }} />
                    </div>
                    <div>
                      <p
                        className="font-body font-semibold text-sm"
                        style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}
                      >
                        Premium Selection
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        Handpicked from global brands
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className="p-5 rounded-lg backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    animation: 'slideInRight 0.8s ease-out 0.4s both',
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="p-2 rounded"
                      style={{
                        backgroundColor: 'rgba(255,140,60,0.2)',
                      }}
                    >
                      <Shield size={18} style={{ color: 'var(--deep-orange)' }} />
                    </div>
                    <div>
                      <p
                        className="font-body font-semibold text-sm"
                        style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}
                      >
                        Quality Assured
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        Authentic products, guaranteed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  className="p-5 rounded-lg backdrop-blur-md border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    animation: 'slideInRight 0.8s ease-out 0.6s both',
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="p-2 rounded"
                      style={{
                        backgroundColor: 'rgba(255,140,60,0.2)',
                      }}
                    >
                      <Zap size={18} style={{ color: 'var(--deep-orange)' }} />
                    </div>
                    <div>
                      <p
                        className="font-body font-semibold text-sm"
                        style={{ color: '#FFFFFF', marginBottom: '0.25rem' }}
                      >
                        Fast Delivery
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        Nationwide shipping available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{
              animation: 'bounce 2s infinite',
            }}
          >
            <div
              className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              <div
                className="w-1 h-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND STORY SECTION ── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-1 h-8 rounded"
                  style={{ backgroundColor: 'var(--deep-orange)' }}
                />
                <p
                  className="font-body font-semibold tracking-widest uppercase"
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--warm-taupe)',
                    letterSpacing: '0.15em',
                  }}
                >
                  Our Story
                </p>
              </div>

              <h2
                className="font-display font-bold mb-6"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  color: 'var(--dark-chocolate)',
                  lineHeight: '1.2',
                }}
              >
                Beauty that celebrates you
              </h2>

              <p
                className="font-body leading-relaxed mb-6"
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--charcoal)',
                  lineHeight: '1.8',
                }}
              >
                At Skinpeccable Glowtique, we believe that true beauty is about confidence, self-care, and celebrating what makes you unique. We curate only the finest skincare, cosmetics, fragrances, and grooming essentials from trusted global brands — each product selected for quality, efficacy, and luxury.
              </p>

              <p
                className="font-body leading-relaxed mb-8"
                style={{
                  fontSize: '1rem',
                  color: 'var(--warm-taupe)',
                  lineHeight: '1.8',
                }}
              >
                Whether you're starting a new skincare routine, searching for your signature scent, or treating yourself to premium grooming, we're here to guide you every step of the way.
              </p>

              <Link href="/about">
                <button
                  className="font-body font-semibold flex items-center gap-2 transition-all duration-300"
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--deep-orange)',
                    letterSpacing: '0.04em',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)';
                  }}
                >
                  LEARN MORE <ChevronRight size={16} />
                </button>
              </Link>
            </div>

            {/* Right: Image placeholder */}
            <div
              className="h-96 rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--light-warm-grey)',
                backgroundImage: 'linear-gradient(135deg, var(--light-warm-grey) 0%, var(--soft-cream) 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles size={48} style={{ color: 'var(--warm-taupe)', opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS SECTION ── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'var(--light-warm-grey)' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="font-body font-semibold tracking-widest uppercase mb-4"
              style={{
                fontSize: '0.7rem',
                color: 'var(--warm-taupe)',
                letterSpacing: '0.15em',
              }}
            >
              Why Choose Us
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                color: 'var(--dark-chocolate)',
              }}
            >
              Three pillars of excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Curated Selection',
                desc: 'Every product is handpicked for quality, efficacy, and luxury. We partner with trusted global brands.',
              },
              {
                icon: Shield,
                title: 'Authentic & Safe',
                desc: 'All products are 100% authentic. We guarantee your satisfaction and skin safety with every purchase.',
              },
              {
                icon: Leaf,
                title: 'Conscious Beauty',
                desc: 'We celebrate sustainable and ethical beauty. Supporting brands that care for people and planet.',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-lg text-center transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--soft-border-beige)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <div
                      className="p-3 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255,140,60,0.1)',
                      }}
                    >
                      <Icon size={32} style={{ color: 'var(--deep-orange)' }} />
                    </div>
                  </div>
                  <h3
                    className="font-display font-bold mb-3"
                    style={{
                      fontSize: '1.25rem',
                      color: 'var(--dark-chocolate)',
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className="font-body leading-relaxed"
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--warm-taupe)',
                      lineHeight: '1.6',
                    }}
                  >
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIFESTYLE SECTION ── */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="font-body font-semibold tracking-widest uppercase mb-4"
              style={{
                fontSize: '0.7rem',
                color: 'var(--warm-taupe)',
                letterSpacing: '0.15em',
              }}
            >
              Featured Collection
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                color: 'var(--dark-chocolate)',
              }}
            >
              Explore our categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Skincare', icon: '✨' },
              { name: 'Fragrance', icon: '🌸' },
              { name: 'Body Care', icon: '🧴' },
              { name: 'Makeup', icon: '💄' },
              { name: 'Grooming', icon: '💈' },
              { name: 'Home Fragrance', icon: '🕯️' },
            ].map((cat, idx) => (
              <Link key={idx} href="/shop">
                <div
                  className="h-48 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group"
                  style={{
                    backgroundColor: 'var(--light-warm-grey)',
                    backgroundImage: `linear-gradient(135deg, rgba(255,140,60,0.1) 0%, rgba(90,52,32,0.05) 100%)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <span style={{ fontSize: '3rem' }}>{cat.icon}</span>
                    <p
                      className="font-display font-semibold"
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--dark-chocolate)',
                      }}
                    >
                      {cat.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section
        className="py-16 lg:py-24"
        style={{
          backgroundColor: 'var(--dark-chocolate)',
        }}
      >
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2
            className="font-display font-bold mb-6"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: '#FFFFFF',
            }}
          >
            Ready to glow differently?
          </h2>
          <p
            className="font-body mb-8 max-w-2xl mx-auto"
            style={{
              fontSize: '1.0625rem',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.7',
            }}
          >
            Discover our curated collection of premium beauty, skincare, fragrance, and grooming essentials.
          </p>
          <Link href="/shop">
            <button
              className="px-10 py-4 rounded font-body font-semibold transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--deep-orange)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              SHOP NOW
            </button>
          </Link>
        </div>
      </section>

      {/* ── ANIMATIONS ── */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
      `}</style>
    </div>
  );
}
