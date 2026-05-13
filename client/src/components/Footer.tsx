/*
 * SKINPECCABLE GLOWTIQUE — Footer
 * Design: Dark Chocolate background, Soft Cream text, Deep Orange accents
 */

import { Link } from 'wouter';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--dark-chocolate)', color: 'var(--soft-cream)' }}>
      {/* Top accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--deep-orange), var(--sg-pink), var(--deep-orange))' }} />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <p className="font-display font-semibold text-2xl" style={{ color: 'var(--soft-cream)', letterSpacing: '0.02em' }}>
                Skinpeccable
              </p>
              <p className="font-body font-light tracking-widest mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--warm-taupe)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                Glowtique
              </p>
            </div>
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: 'rgba(234,223,207,0.7)' }}>
              Curated beauty, skincare, cosmetics, fragrance and grooming for every skin and every confidence.
            </p>
            <p className="font-display italic text-lg" style={{ color: 'var(--deep-orange)' }}>
              Glow. Different.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ border: '1px solid rgba(234,223,207,0.2)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--deep-orange)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(234,223,207,0.2)')}
                aria-label="Instagram"
              >
                <Instagram size={15} style={{ color: 'var(--soft-cream)' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body font-semibold mb-5 tracking-widest uppercase" style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}>
              Navigate
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop With Us' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span
                      className="font-body text-sm transition-colors duration-200 cursor-pointer"
                      style={{ color: 'rgba(234,223,207,0.7)' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--soft-cream)')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(234,223,207,0.7)')}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-body font-semibold mb-5 tracking-widest uppercase" style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}>
              Categories
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/shop?cat=skincare', label: 'Skincare' },
                { href: '/shop?cat=sunscreen', label: 'Sunscreen & SPF' },
                { href: '/shop?cat=fragrance', label: 'Fragrance & Body Mists' },
                { href: '/shop?cat=body-wash', label: 'Body Wash' },
                { href: '/shop?cat=body-lotion', label: 'Body Lotion & Butter' },
                { href: '/shop?cat=deodorant', label: 'Deodorant' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span
                      className="font-body text-sm transition-colors duration-200 cursor-pointer"
                      style={{ color: 'rgba(234,223,207,0.7)' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--soft-cream)')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(234,223,207,0.7)')}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body font-semibold mb-5 tracking-widest uppercase" style={{ fontSize: '0.7rem', color: 'var(--warm-taupe)', letterSpacing: '0.15em' }}>
              Get In Touch
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--deep-orange)' }} />
                <span className="font-body text-sm" style={{ color: 'rgba(234,223,207,0.7)' }}>
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="flex-shrink-0" style={{ color: 'var(--deep-orange)' }} />
                <a href="tel:+254700000000" className="font-body text-sm transition-colors" style={{ color: 'rgba(234,223,207,0.7)' }}>
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="flex-shrink-0" style={{ color: 'var(--deep-orange)' }} />
                <a href="mailto:hello@skinpeccable.com" className="font-body text-sm transition-colors" style={{ color: 'rgba(234,223,207,0.7)' }}>
                  hello@skinpeccable.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-14 pt-8"
          style={{ borderTop: '1px solid rgba(234,223,207,0.12)' }}
        >
          <p className="font-body text-xs" style={{ color: 'rgba(234,223,207,0.4)' }}>
            © {new Date().getFullYear()} Skinpeccable Glowtique. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Returns & Exchanges'].map(label => (
              <a
                key={label}
                href="#"
                className="font-body text-xs transition-colors"
                style={{ color: 'rgba(234,223,207,0.4)' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--soft-cream)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(234,223,207,0.4)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
