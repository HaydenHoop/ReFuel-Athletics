"use client";
import { useState } from 'react';
import { useCart } from './CartContext';

// ── Product data ──────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'flask',
    category: 'Hardware',
    name: 'Reusable Gel Flask',
    tagline: 'Fill it, race it, repeat.',
    price: 15,
    priceLabel: 'per flask',
    rating: 4.8,
    reviewCount: 142,
    action: 'add',
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', label: 'Runner with flask strapped to race belt on trail' },
      { src: null, gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)', label: 'Close-up of twist-lock nozzle detail' },
      { src: null, gradient: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)', label: 'Flask filled with gel, product flat lay' },
    ],
  },
  {
    id: 'custom-gel',
    category: 'Custom Formula',
    name: 'Custom Gel Powder',
    tagline: 'Your formula. Your race.',
    price: 1.88,
    priceLabel: 'per pouch',
    rating: 4.9,
    reviewCount: 318,
    action: 'customize',
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in pouch' },
      { src: null, gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: null, gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch with formula breakdown' },
    ],
  },
  {
    id: 'race-day',
    category: 'Ready to Race',
    name: 'Race Day Gel',
    tagline: 'Peak performance, sealed fresh.',
    price: 2.49,
    priceLabel: 'per pouch',
    rating: 4.7,
    reviewCount: 89,
    action: 'customize',
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)', label: 'Race day gel packet on running track' },
      { src: null, gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
      { src: null, gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', label: 'Product lineup of all flavors' },
    ],
  },
];

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Image slideshow for each product card ─────────────────────────────────────
function ProductImageSlideshow({ images }) {
  const [idx, setIdx] = useState(0);
  const img = images[idx];

  return (
    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
      {img.src ? (
        <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-end justify-center pb-4"
          style={{ background: img.gradient }}>
          <p className="text-white/30 text-xs text-center px-4 leading-relaxed">{img.label}</p>
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
            <svg className="w-3 h-3 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
            <svg className="w-3 h-3 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onViewProduct, onAddToCart, onCustomize }) {
  const [added, setAdded] = useState(false);

  const handleAction = (e) => {
    e.stopPropagation();
    if (product.action === 'add') {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      onCustomize(product);
    }
  };

  return (
    <div onClick={() => onViewProduct(product.id)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      <ProductImageSlideshow images={product.images} />

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
        <h3 className="font-extrabold text-gray-900 text-base leading-tight mb-1">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-3">{product.tagline}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="text-xl font-black text-gray-900">${product.price}</span>
            <span className="text-gray-400 text-xs ml-1">{product.priceLabel}</span>
          </div>
          <button onClick={handleAction}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
            {added ? '✓ Added' : product.action === 'add' ? 'Add to Cart' : 'Customize'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hero feature banner ───────────────────────────────────────────────────────
function HeroBanner({ reverse, gradient, placeholderLabel, title, subtitle, cta, onCta }) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6`}>
      <div className="w-full md:w-2/3 min-h-[420px] md:min-h-[520px] flex items-end justify-center pb-4"
        style={{ background: gradient }}>
        <p className="text-white/25 text-xs text-center px-6">{placeholderLabel}</p>
      </div>
      <div className="w-full md:w-1/3 p-10 flex flex-col justify-center bg-white">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{subtitle}</p>
        <div>
          <button onClick={onCta}
            className="bg-black text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-gray-800 transition">
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProductsPage({ onGoToQuiz, onViewProduct }) {
  const { addItem } = useCart();

  const handleAddToCart = (product) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      subtitle: product.tagline,
      price: product.price,
      qty: 1,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Page header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">ReFuel Athletics</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Shop</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-base">
          Every product is designed around one idea: your fuel should work as hard as you do.
        </p>
      </div>

      {/* Hero banners */}
      <HeroBanner
        gradient="linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)"
        placeholderLabel="Athlete running with ReFuel gel flask strapped to race belt"
        title="The Reusable Gel Flask"
        subtitle="Stop tossing single-use foil after every race. Fill with your custom blend, twist shut, run. Dishwasher safe and race-belt ready."
        cta="Shop Flask"
        onCta={() => onViewProduct && onViewProduct('flask')}
      />
      <HeroBanner
        reverse
        gradient="linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)"
        placeholderLabel="Close-up of ReFuel custom gel powder being poured into flask"
        title="Custom Gel Powder"
        subtitle="Dial in your exact formula — carbs, electrolytes, caffeine, flavor. Mixed fresh to order and shipped within 24 hours."
        cta="Build Your Formula"
        onCta={() => onGoToQuiz && onGoToQuiz()}
      />

      {/* Product grid */}
      <div className="mb-6 mt-10">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Shop the Full Lineup</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {PRODUCTS.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onViewProduct={(id) => onViewProduct && onViewProduct(id)}
            onAddToCart={handleAddToCart}
            onCustomize={() => onGoToQuiz && onGoToQuiz()}
          />
        ))}
      </div>

      {/* Bundle nudge */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-extrabold text-lg">Better together</p>
          <p className="text-gray-400 text-sm">Pair the reusable flask with your custom gel blend for a zero-waste race setup.</p>
        </div>
        <button onClick={() => onGoToQuiz && onGoToQuiz()}
          className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap">
          Personalize Your Formula →
        </button>
      </div>

    </div>
  );
}