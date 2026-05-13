/*
 * SKINPECCABLE GLOWTIQUE — Shop With Us Page
 * Layout: Left sidebar (page nav) + Top horizontal category bar + Product grid + Search
 * Design: "Structured Warmth" — clean, warm, organized
 */

import { useState, useEffect, useMemo } from 'react';
import { Link, useSearch } from 'wouter';
import { Search, ShoppingBag, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES, getProductsByCategory, searchProducts, type Product } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SHOP_BANNER = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663656533692/jCCPNKSkazkgBn7bH3FjhA/shop-banner-Y3GR7Cm52Ct4QibrjbBnXi.webp';

const PAGE_NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop With Us' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    toast.success(`${product.name} added to your bag`, {
      description: `KSh ${product.price.toLocaleString()}`,
      duration: 2500,
    });
  };

  return (
    <div className="product-card group">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', backgroundColor: 'var(--light-warm-grey)' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            {product.badge === 'new' && <span className="badge-new">New</span>}
            {product.badge === 'glow' && <span className="badge-glow">Glow Pick</span>}
            {product.badge === 'offer' && <span className="badge-new" style={{ backgroundColor: 'var(--dark-chocolate)' }}>Offer</span>}
          </div>
        )}
        {/* Quick Add overlay */}
        <div
          className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          style={{ background: 'linear-gradient(to top, rgba(90,52,32,0.85), transparent)' }}
        >
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-body font-semibold text-white transition-colors"
            style={{ fontSize: '0.8rem', backgroundColor: 'var(--deep-orange)', letterSpacing: '0.04em' }}
          >
            <ShoppingBag size={14} />
            Add to Bag
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-body text-xs mb-1" style={{ color: 'var(--warm-taupe)', letterSpacing: '0.06em' }}>
          {product.brand}
        </p>
        <h3
          className="font-body font-semibold leading-snug mb-2"
          style={{ fontSize: '0.9375rem', color: 'var(--dark-chocolate)' }}
        >
          {product.name}
        </h3>
        <p className="font-body text-xs leading-relaxed mb-3" style={{ color: 'var(--charcoal)', opacity: 0.75 }}>
          {product.description.length > 80 ? product.description.slice(0, 80) + '…' : product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-body font-bold" style={{ fontSize: '1rem', color: 'var(--dark-chocolate)' }}>
            KSh {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 font-body font-semibold transition-colors duration-200 px-3 py-1.5 rounded"
            style={{
              fontSize: '0.75rem',
              color: 'var(--deep-orange)',
              border: '1px solid var(--deep-orange)',
              backgroundColor: 'transparent',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--deep-orange)';
              (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--deep-orange)';
            }}
          >
            <ShoppingBag size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  useScrollReveal();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCat = params.get('cat') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Update category from URL params with validation
  useEffect(() => {
    const p = new URLSearchParams(searchStr);
    const cat = p.get('cat');
    if (cat) {
      // Validate that the category exists in CATEGORIES
      const isValidCategory = CATEGORIES.some(c => c.id === cat);
      setActiveCategory(isValidCategory ? cat : 'all');
    }
  }, [searchStr]);

  const filteredProducts = useMemo(() => {
    // Defensive: ensure products is always an array
    let products = searchQuery.trim()
      ? searchProducts(searchQuery)
      : getProductsByCategory(activeCategory);
    
    // Safeguard against undefined/null
    if (!Array.isArray(products)) {
      console.warn(`getProductsByCategory returned non-array for category: ${activeCategory}`);
      products = [];
    }

    switch (sortBy) {
      case 'price-asc': return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...products].sort((a, b) => b.price - a.price);
      case 'name': return [...products].sort((a, b) => a.name.localeCompare(b.name));
      default: return products;
    }
  }, [activeCategory, searchQuery, sortBy]);

  const activeCategoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || 'All Products';

  return (
    <div>
      {/* ── SHOP BANNER ── */}
      <section className="relative overflow-hidden" style={{ height: '260px' }}>
        <img src={SHOP_BANNER} alt="Shop With Us" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'rgba(90,52,32,0.55)' }}
        >
          <p
            className="font-body font-medium tracking-widest uppercase mb-3"
            style={{ fontSize: '0.7rem', color: 'rgba(234,223,207,0.8)', letterSpacing: '0.2em' }}
          >
            Skinpeccable Glowtique
          </p>
          <h1
            className="font-display font-semibold"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: '#FFFFFF' }}
          >
            Shop With Us
          </h1>
          <p className="font-body mt-2" style={{ fontSize: '0.9rem', color: 'rgba(234,223,207,0.8)' }}>
            Curated beauty, skincare, fragrance and grooming essentials
          </p>
        </div>
      </section>

      {/* ── MAIN SHOP LAYOUT ── */}
      <div className="flex" style={{ minHeight: '80vh' }}>
        {/* ── LEFT SIDEBAR — Vertical Categories ── */}
        <aside
          className="hidden lg:flex flex-col flex-shrink-0"
          style={{
            width: '200px',
            borderRight: '1px solid var(--soft-border-beige)',
            backgroundColor: 'var(--light-warm-grey)',
            position: 'sticky',
            top: '80px',
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
        >
          <div className="p-6">
            <p
              className="font-body font-semibold tracking-widest uppercase mb-5"
              style={{ fontSize: '0.65rem', color: 'var(--warm-taupe)', letterSpacing: '0.18em' }}
            >
              Categories
            </p>
            <nav className="flex flex-col gap-1">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                    className="text-left font-body font-medium py-2.5 px-3 rounded transition-colors duration-200 cursor-pointer"
                    style={{
                      fontSize: '0.875rem',
                      color: isActive ? 'var(--dark-chocolate)' : 'var(--warm-taupe)',
                      backgroundColor: isActive ? 'var(--soft-cream)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--deep-orange)' : '2px solid transparent',
                      border: 'none',
                      padding: '0.625rem 0.75rem',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">
          {/* ── TOP CATEGORY BAR ── */}
          <div
            className="sticky z-30 overflow-x-auto"
            style={{
              top: '80px',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--soft-border-beige)',
              scrollbarWidth: 'none',
            }}
          >
            <div className="flex items-center px-4 lg:px-8" style={{ minWidth: 'max-content' }}>
              {/* Logo/Brand in category bar */}
              <div
                className="hidden lg:flex items-center pr-6 flex-shrink-0"
                style={{ borderRight: '1px solid var(--soft-border-beige)' }}
              >
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--dark-chocolate)' }}>
                  Skinpeccable
                </span>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SEARCH + SORT BAR ── */}
          <div
            className="px-4 lg:px-8 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            style={{ borderBottom: '1px solid var(--soft-border-beige)', backgroundColor: 'var(--light-warm-grey)' }}
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--warm-taupe)' }}
              />
              <input
                type="text"
                placeholder="Search products or brands…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full font-body text-sm pl-10 pr-10 py-2.5 rounded-lg outline-none transition-all duration-200"
                style={{
                  border: '1px solid var(--soft-border-beige)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--dark-chocolate)',
                  fontSize: '0.875rem',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--deep-orange)')}
                onBlur={e => (e.target.style.borderColor = 'var(--soft-border-beige)')}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={14} style={{ color: 'var(--warm-taupe)' }} />
                </button>
              )}
            </div>

            {/* Sort + Count */}
            <div className="flex items-center gap-4">
              <span className="font-body text-sm" style={{ color: 'var(--warm-taupe)' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="font-body text-sm py-2 pl-3 pr-8 rounded-lg appearance-none outline-none cursor-pointer"
                  style={{
                    border: '1px solid var(--soft-border-beige)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--dark-chocolate)',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A–Z</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--warm-taupe)' }}
                />
              </div>
            </div>
          </div>

          {/* ── PRODUCT GRID ── */}
          <div className="px-4 lg:px-8 py-8">
            {/* Category heading */}
            <div className="flex items-center gap-4 mb-8">
              <div className="accent-line" />
              <h2
                className="font-display font-semibold"
                style={{ fontSize: '1.5rem', color: 'var(--dark-chocolate)' }}
              >
                {searchQuery ? `Results for "${searchQuery}"` : activeCategoryLabel}
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-2xl mb-3" style={{ color: 'var(--dark-chocolate)' }}>
                  No products found
                </p>
                <p className="font-body text-sm mb-6" style={{ color: 'var(--warm-taupe)' }}>
                  Try a different search term or browse all categories.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="reveal"
                    style={{ animationDelay: `${(i % 8) * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
