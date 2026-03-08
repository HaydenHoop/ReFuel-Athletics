"use client";
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';

// ── Inline Stars (display only, no modal) ─────────────────────────────────────
function Stars({ rating, empty = false }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span key={n} className="text-sm leading-none"
          style={{ color: (!empty && n <= Math.round(rating)) ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </span>
  );
}

// ── Card-level stars: fetches data, calls onOpenModal with reviews when clicked ─
function CardStars({ productKey, productName, onOpenModal }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews/submit?limit=200&product=${productKey}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productKey]);

  const total = reviews.length;
  const avg   = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onOpenModal({ reviews, avg, total, productName });
      }}
      className="flex items-center gap-1.5 group hover:opacity-75 transition w-fit"
    >
      <Stars rating={total > 0 ? avg : 0} empty={total === 0} />
      <span className="text-xs text-gray-400 underline underline-offset-2 group-hover:text-gray-700 transition">
        {loading ? '...' : total > 0 ? `${avg.toFixed(1)} (${total})` : 'No reviews yet'}
      </span>
    </button>
  );
}

// ── Reviews modal — rendered at page level, outside all cards ─────────────────
function ReviewsModal({ isOpen, onClose, reviews, avg, total, productName }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{productName}</p>
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(avg)} />
              <span className="text-2xl font-extrabold text-gray-900">{avg.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({total} reviews)</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
            ✕
          </button>
        </div>

        {/* Distribution bars */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct   = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-gray-500 w-2">{star}</span>
                <span className="text-amber-400 text-xs leading-none">★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Review list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {reviews.filter(r => r.body).length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No written reviews yet — be the first after your order!</p>
          ) : reviews.filter(r => r.body).map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <Stars rating={r.rating} />
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {r.title && <p className="font-bold text-gray-900 text-sm mt-1">{r.title}</p>}
              {r.body  && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{r.body}</p>}
              <p className="text-xs text-gray-400 mt-2">— {r.reviewer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Product data ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'flask',
    category: 'Hardware',
    name: 'Reusable Gel Flask',
    tagline: 'Fill it, race it, repeat.',
    price: 15,
    priceLabel: 'per flask',
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
    action: 'customize',
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in labeled pouch' },
      { src: null, gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: null, gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch showing formula breakdown' },
    ],
  },
  {
    id: 'race-day',
    category: 'Ready to Race',
    name: 'Race Day Gel',
    tagline: 'Peak performance, sealed fresh.',
    price: 2.49,
    priceLabel: 'per pouch',
    action: 'customize',
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)', label: 'Race day gel packet on running track' },
      { src: null, gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
      { src: null, gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', label: 'Product lineup of all 5 flavors' },
    ],
  },
];

function ProductImageSlideshow({ images }) {
  const [idx, setIdx] = useState(0);
  const img = images[idx];
  return (
    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
      {img.src ? (
        <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-end justify-center pb-4" style={{ background: img.gradient }}>
          <p className="text-white/30 text-xs text-center px-4 leading-relaxed">{img.label}</p>
        </div>
      )}
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition">
            <svg className="w-3 h-3 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
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

// ── Product card — no modal logic inside ──────────────────────────────────────
function ProductCard({ product, onViewProduct, onAddToCart, onCustomize, onOpenModal }) {
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
        <p className="text-gray-400 text-xs mb-2">{product.tagline}</p>

        <div className="mb-3">
          <CardStars
            productKey={product.id}
            productName={product.name}
            onOpenModal={onOpenModal}
          />
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

// ── Page — modal state lives here, completely outside cards ───────────────────
export default function ProductsPage({ onGoToQuiz, onViewProduct }) {
  const { addItem } = useCart();
  const [modal, setModal] = useState(null); // { reviews, avg, total, productName }

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
    <>
      {/* Modal rendered at page root — completely outside card DOM */}
      <ReviewsModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        reviews={modal?.reviews ?? []}
        avg={modal?.avg ?? 0}
        total={modal?.total ?? 0}
        productName={modal?.productName ?? ''}
      />

      <div className="w-full max-w-5xl mx-auto">

        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">ReFuel Athletics</p>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Power Your Performance</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-base">
            Every product is designed around one idea: your fuel should work as hard as you do.
          </p>
        </div>

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
              onOpenModal={setModal}
            />
          ))}
        </div>

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
    </>
  );
}