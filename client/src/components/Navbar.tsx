/*
 * SKINPECCABLE GLOWTIQUE — Navbar
 * Design: Sticky, clean white/cream header with Dark Chocolate text
 * Left: Logo/Brand name | Center: Page navigation | Right: Cart icon
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop With Us' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [location] = useLocation();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid #D8C7B8' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 20px rgba(90,52,32,0.08)' : 'none',
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex flex-col leading-none cursor-pointer group">
                <span
                  className="font-display font-semibold tracking-wide"
                  style={{ fontSize: '1.35rem', color: 'var(--dark-chocolate)', letterSpacing: '0.02em' }}
                >
                  Skinpeccable
                </span>
                <span
                  className="font-body font-light tracking-widest"
                  style={{ fontSize: '0.55rem', color: 'var(--warm-taupe)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '1px' }}
                >
                  Glowtique
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => {
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <span
                      className="relative font-body font-medium px-4 py-2 rounded transition-colors duration-200 cursor-pointer"
                      style={{
                        fontSize: '0.875rem',
                        color: isActive ? 'var(--dark-chocolate)' : 'var(--warm-taupe)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {link.label}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--deep-orange)' }}
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Cart + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-soft-cream"
                aria-label="Open cart"
              >
                <ShoppingBag size={20} style={{ color: 'var(--dark-chocolate)' }} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center font-body font-bold text-white"
                    style={{ fontSize: '0.625rem', backgroundColor: 'var(--deep-orange)' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 hover:bg-soft-cream"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X size={20} style={{ color: 'var(--dark-chocolate)' }} />
                  : <Menu size={20} style={{ color: 'var(--dark-chocolate)' }} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: mobileOpen ? '300px' : '0',
            borderTop: mobileOpen ? '1px solid #D8C7B8' : 'none',
          }}
        >
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_LINKS.map(link => {
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className="block font-body font-medium py-3 px-2 rounded transition-colors duration-200 cursor-pointer"
                    style={{
                      fontSize: '0.9375rem',
                      color: isActive ? 'var(--dark-chocolate)' : 'var(--warm-taupe)',
                      borderLeft: isActive ? '2px solid var(--deep-orange)' : '2px solid transparent',
                      paddingLeft: '1rem',
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}
