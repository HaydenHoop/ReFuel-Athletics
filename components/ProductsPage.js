"use client";
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

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
      { src: '/images/Maple_jar_gel.jpeg', gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in labeled pouch' },
      { src: '/images/Maple_Front.jpeg', gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: '/images/powder_little.jpg', gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch showing formula breakdown' },
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
      { src: 'Passionfruit_jar_gel.jpeg', gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
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

// ── Bundle Modal ──────────────────────────────────────────────────────────────
const BUNDLES = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    tagline: 'The perfect intro to custom fueling',
    price: 27.04,
    originalPrice: 33.80,
    savingsLabel: '20% off',
    items: [
      { name: '1x Reusable Gel Flask',  detail: '$15.00' },
      { name: '10x Custom Gel Pouches', detail: '$18.80' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Bundle',
    tagline: 'For athletes who train seriously',
    price: 77.91,
    originalPrice: 111.30,
    savingsLabel: '30% off',
    badge: 'Most Popular',
    items: [
      { name: '2x Reusable Gel Flasks',     detail: '$30.00' },
      { name: '30x Custom Gel Pouches',      detail: '$56.40' },
      { name: '10x Race Day Gel Pouches',    detail: '$24.90' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    tagline: 'Full season, fully stocked',
    price: 132.47,
    originalPrice: 203.80,
    savingsLabel: '35% off',
    badge: 'Best Value',
    items: [
      { name: '4x Reusable Gel Flasks',   detail: '$60.00' },
      { name: '50x Custom Gel Pouches',    detail: '$94.00' },
      { name: '20x Race Day Gel Pouches',  detail: '$49.80' },
      { name: 'Season subscription included', detail: 'Auto-ship' },
    ],
  },
];

function BundleModal({ onClose, onAddBundle }) {
  const [selected, setSelected] = useState('premium');
  const bundle = BUNDLES.find(b => b.id === selected);
  const savings = (bundle.originalPrice - bundle.price).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Bundle &amp; Save</h2>
            <p className="text-xs text-gray-400">Choose a bundle that fits your training</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-2">
            {BUNDLES.map(b => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition
                  ${selected === b.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  {bundle.badge && (
                    <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                      {bundle.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-extrabold text-gray-900">{bundle.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{bundle.tagline}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-2xl font-extrabold text-gray-900">${bundle.price}</p>
                  <p className="text-xs text-gray-400 line-through">${bundle.originalPrice}</p>
                  <p className="text-xs font-bold text-green-600">Save ${savings}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2.5">
              {bundle.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{item.detail}</span>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4">
                <span className="text-sm font-semibold text-gray-600">You save</span>
                <span className="text-base font-extrabold text-green-600">${savings} ({bundle.savingsLabel})</span>
              </div>
              <button
                onClick={() => { onAddBundle(bundle); onClose(); }}
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                Add {bundle.name} to Cart — ${bundle.price}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">All bundles include free standard shipping</p>
        </div>
      </div>
    </div>
  );
}

// ── Subscription Section ──────────────────────────────────────────────────────
const GEL_TYPES = [
  { id: 'custom',   name: 'Custom Gel Powder', price: 1.88 },
  { id: 'race-day', name: 'Race Day Gel',       price: 2.49 },
];

const FLAVORS = ['Neutral / Unflavored', 'Berry Blast', 'Citrus Surge', 'Tropical', 'Watermelon'];

const POUCH_OPTIONS = [10, 20, 30, 40, 50];

const MONTHLY_DISCOUNT = 0.10;
const YEARLY_DISCOUNT  = 0.20;

function SavedFormulaLoader({ linkedFormula, onLink }) {
  const { user, getSavedFormulas } = useAuth();
  const [open, setOpen]         = useState(false);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading]   = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    if (!user) return;
    setLoading(true);
    const data = await getSavedFormulas();
    setFormulas(data);
    setLoading(false);
  };

  if (linkedFormula) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-xs font-bold text-green-800">Formula linked</p>
          <p className="text-xs text-green-600">{linkedFormula.name}</p>
        </div>
        <button onClick={() => onLink(null)} className="text-xs text-green-600 hover:text-green-800 font-semibold ml-3 flex-shrink-0">
          Remove
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-400 hover:border-gray-500 hover:text-gray-600 transition uppercase tracking-widest">
        Load saved formula
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-extrabold text-gray-900">Saved Formulas</h3>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {!user ? (
                <p className="text-sm text-gray-500 text-center py-6">Sign in to load your saved formulas.</p>
              ) : loading ? (
                <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
              ) : formulas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No saved formulas yet. Build one in the quiz and save it from your account.</p>
              ) : formulas.map(f => (
                <button key={f.id} onClick={() => { onLink(f); setOpen(false); }}
                  className="w-full text-left p-3.5 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition">
                  <p className="font-bold text-sm text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {f.carbs}g carbs · {f.caffeine}mg caffeine · {f.sodium}mg sodium · {f.flavor}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GelRow({ gelId, row, active, onToggle, onUpdate }) {
  const gel = GEL_TYPES.find(g => g.id === gelId);
  return (
    <div className={`rounded-xl border transition ${active ? 'border-gray-300 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{gel.name}</p>
          <p className="text-xs text-gray-400">${gel.price}/pouch</p>
        </div>
        <button
          onClick={() => onToggle(gelId)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0
            ${active ? 'bg-black' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
            ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {active && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pouches</p>
            <div className="flex gap-1.5">
              {POUCH_OPTIONS.map(n => (
                <button key={n} onClick={() => onUpdate(gelId, 'qty', n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition
                    ${row.qty === n ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Flavor</p>
            <select
              value={row.flavor}
              onChange={e => onUpdate(gelId, 'flavor', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-black bg-white transition">
              {FLAVORS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Load saved formula — available for both gel types */}
          <SavedFormulaLoader
            linkedFormula={row.linkedFormula}
            onLink={(formula) => onUpdate(gelId, 'linkedFormula', formula)}
          />
        </div>
      )}
    </div>
  );
}

function ShipmentConfigurator({ shipment, index, onUpdate, onToggle }) {
  const activeGels = GEL_TYPES.filter(g => shipment.gels[g.id]?.active);
  const shipTotal  = activeGels.reduce((sum, g) => sum + g.price * (shipment.gels[g.id]?.qty ?? 0), 0);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
          Shipment {index + 1}{index === 0 ? ' — Start of month' : ' — Mid month'}
        </p>
        <p className="text-xs font-semibold text-gray-400">${shipTotal.toFixed(2)} retail</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Select gels — choose one or both</p>
        {GEL_TYPES.map(gel => (
          <GelRow
            key={gel.id}
            gelId={gel.id}
            row={shipment.gels[gel.id]}
            active={shipment.gels[gel.id]?.active ?? false}
            onToggle={onToggle}
            onUpdate={onUpdate}
          />
        ))}
        {activeGels.length === 0 && (
          <p className="text-xs text-red-400 font-semibold text-center py-2">Enable at least one gel type</p>
        )}
      </div>
    </div>
  );
}

const defaultShipmentState = () => ({
  gels: {
    'custom':   { active: true,  qty: 20, flavor: 'Neutral / Unflavored', linkedFormula: null },
    'race-day': { active: false, qty: 10, flavor: 'Neutral / Unflavored', linkedFormula: null },
  },
});

function SubscriptionSection({ onSubscribe }) {
  const [billing, setBilling]     = useState('monthly');
  const [shipments, setShipments] = useState(1);
  const [ship1, setShip1]         = useState(defaultShipmentState());
  const [ship2, setShip2]         = useState(defaultShipmentState());
  const [added, setAdded]         = useState(false);

  const discount    = billing === 'yearly' ? YEARLY_DISCOUNT : MONTHLY_DISCOUNT;
  const discountPct = billing === 'yearly' ? '20%' : '10%';

  const calcShipRetail = (ship) =>
    GEL_TYPES.filter(g => ship.gels[g.id]?.active)
      .reduce((sum, g) => sum + g.price * (ship.gels[g.id]?.qty ?? 0), 0);

  const monthlyRetail = calcShipRetail(ship1) + (shipments === 2 ? calcShipRetail(ship2) : 0);
  const monthlyPrice  = +(monthlyRetail * (1 - discount)).toFixed(2);
  const yearlyTotal   = +(monthlyPrice * 12).toFixed(2);

  const updateShip = (which, gelId, field, value) => {
    const setter = which === 0 ? setShip1 : setShip2;
    setter(s => ({ ...s, gels: { ...s.gels, [gelId]: { ...s.gels[gelId], [field]: value } } }));
  };

  const toggleGel = (which, gelId) => {
    const setter = which === 0 ? setShip1 : setShip2;
    setter(s => ({
      ...s,
      gels: { ...s.gels, [gelId]: { ...s.gels[gelId], active: !s.gels[gelId].active } },
    }));
  };

  const handleSubscribe = () => {
    const s1valid = GEL_TYPES.some(g => ship1.gels[g.id]?.active);
    const s2valid = shipments < 2 || GEL_TYPES.some(g => ship2.gels[g.id]?.active);
    if (!s1valid || !s2valid) return;
    onSubscribe?.({ billing, shipments, ship1, ship2: shipments === 2 ? ship2 : null, monthlyPrice, yearlyTotal, discount });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="mt-14">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Never run out</p>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Subscribe &amp; Save</h2>
        <p className="text-gray-500 text-sm max-w-xl">
          Set up auto-ship for your formula. Choose monthly or yearly billing, one or two shipments per month, and mix gel types per shipment. Link a saved formula to any shipment. Cancel or pause anytime.
        </p>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Billing cycle</p>
          <div className="flex gap-3">
            {[
              { id: 'monthly', label: 'Monthly', sub: '10% off every shipment' },
              { id: 'yearly',  label: 'Yearly',  sub: '20% off — best value', badge: 'Save extra' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setBilling(opt.id)}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition
                  ${billing === opt.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm">{opt.label}</span>
                  {opt.badge && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${billing === opt.id ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs ${billing === opt.id ? 'text-white/60' : 'text-gray-400'}`}>{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Shipments per month</p>
          <div className="flex gap-3">
            {[
              { n: 1, label: '1 shipment', sub: 'Start of month' },
              { n: 2, label: '2 shipments', sub: 'Start + mid month' },
            ].map(opt => (
              <button key={opt.n} onClick={() => setShipments(opt.n)}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition
                  ${shipments === opt.n ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                <p className={`font-extrabold text-sm mb-0.5 ${shipments === opt.n ? 'text-white' : 'text-gray-900'}`}>{opt.label}</p>
                <p className={`text-xs ${shipments === opt.n ? 'text-white/60' : 'text-gray-400'}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Configure your shipment{shipments === 2 ? 's' : ''}</p>
          <ShipmentConfigurator
            shipment={ship1} index={0}
            onUpdate={(gelId, field, val) => updateShip(0, gelId, field, val)}
            onToggle={(gelId) => toggleGel(0, gelId)}
          />
          {shipments === 2 && (
            <ShipmentConfigurator
              shipment={ship2} index={1}
              onUpdate={(gelId, field, val) => updateShip(1, gelId, field, val)}
              onToggle={(gelId) => toggleGel(1, gelId)}
            />
          )}
        </div>

        <div className="p-5 bg-gray-50">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Your price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-400">/ month</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-xs text-gray-500 mt-0.5">Billed as ${yearlyTotal} / year</p>
              )}
              <p className="text-xs text-green-600 font-semibold mt-1">
                {discountPct} off retail · Save ${(monthlyRetail - monthlyPrice).toFixed(2)}/mo
              </p>
            </div>
            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <p>Retail: <span className="line-through">${monthlyRetail.toFixed(2)}/mo</span></p>
              <p>{shipments === 2 ? '2 shipments' : '1 shipment'} · {billing}</p>
              <p>Cancel anytime</p>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition
              ${added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
            {added
              ? '✓ Subscription added to cart'
              : `Subscribe ${billing === 'yearly' ? '(Yearly · 20% off)' : '(Monthly · 10% off)'} — $${monthlyPrice.toFixed(2)}/mo`}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">Pause, change, or cancel anytime from your account settings</p>
        </div>
      </div>
    </div>
  );
}

// ── Deals Section ─────────────────────────────────────────────────────────────
const DEALS = [
  {
    id: 'first-order',
    type: 'code',
    label: 'First Order',
    headline: '15% Off',
    subline: 'Your first order',
    detail: 'Use code FIRSTORDER at checkout for 15% off your entire order.',
    code: 'FIRSTORDER',
  },
  {
    id: 'bundle-offer',
    type: 'bundle',
    label: 'Bundles',
    headline: 'Bundle & Save',
    subline: 'Up to 35% off',
    detail: 'Starter, Premium, or Pro. Bigger bundle, bigger savings.',
  },
  {
    id: 'free-flask',
    type: 'code',
    label: 'First Order Only',
    headline: 'Free Flask',
    subline: 'With 20+ gel pouches',
    detail: 'Add 20+ custom gel pouches and use code FREEFLASK at checkout. One use per customer.',
    code: 'FREEFLASK',
  },
];

function DealsSection({ dealsRef, onOpenBundle, onCopyCode, copiedCode }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 268, behavior: 'smooth' });

  return (
    <div ref={dealsRef} className="mt-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Limited Offers</p>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Deals &amp; Bundles</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DEALS.map(deal => (
          <div
            key={deal.id}
            className="flex-shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-widest border border-white/20 text-white/60 px-2.5 py-1 rounded-full">
                  {deal.label}
                </span>
              </div>
              <p className="text-3xl font-extrabold text-white leading-none mb-1 tracking-tight">{deal.headline}</p>
              <p className="text-sm font-semibold text-white/60 mb-3">{deal.subline}</p>
              <p className="text-xs text-white/40 leading-relaxed flex-1">{deal.detail}</p>
              <div className="mt-5">
                {deal.type === 'code' && (
                  <button
                    onClick={() => onCopyCode(deal.code)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition
                      ${copiedCode === deal.code
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-white/20 text-white/80 hover:border-white/50 hover:text-white'}`}>
                    {copiedCode === deal.code ? 'Copied to clipboard' : `Copy code: ${deal.code}`}
                  </button>
                )}
                {deal.type === 'bundle' && (
                  <button
                    onClick={onOpenBundle}
                    className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-gray-900 hover:bg-gray-100 transition">
                    View Bundles
                  </button>
                )}
                {deal.type === 'info' && (
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/20 text-white/40 text-center">
                    Auto-applied at checkout
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page — modal state lives here, completely outside cards ───────────────────
export default function ProductsPage({ onGoToQuiz, onGoToRaceDayQuiz, onViewProduct, dealsRef: externalDealsRef }) {
  const { addItem } = useCart();
  const [modal, setModal]           = useState(null);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const internalDealsRef = useRef(null);
  const dealsRef = externalDealsRef || internalDealsRef;

  const handleSubscribe = (config) => {
    const label = config.billing === 'yearly'
      ? `Yearly · ${config.shipments === 2 ? '2 shipments/mo' : '1 shipment/mo'} · 20% off`
      : `Monthly · ${config.shipments === 2 ? '2 shipments/mo' : '1 shipment/mo'} · 10% off`;
    addItem({
      id: `subscription-${Date.now()}`,
      name: 'Gel Subscription',
      subtitle: label,
      price: config.monthlyPrice,
      qty: 1,
      isSubscription: true,
      subscriptionConfig: config,
    });
  };

  const handleAddToCart = (product) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      subtitle: product.tagline,
      price: product.price,
      qty: 1,
    });
  };

  const handleAddBundle = (bundle) => {
    addItem({
      id: `bundle-${bundle.id}-${Date.now()}`,
      name: bundle.name,
      subtitle: `${bundle.items.length} items · ${bundle.savingsLabel}`,
      price: bundle.price,
      qty: 1,
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <>
      <ReviewsModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        reviews={modal?.reviews ?? []}
        avg={modal?.avg ?? 0}
        total={modal?.total ?? 0}
        productName={modal?.productName ?? ''}
      />
      {bundleOpen && (
        <BundleModal
          onClose={() => setBundleOpen(false)}
          onAddBundle={handleAddBundle}
        />
      )}

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
              onCustomize={(product) => {
                if (product.id === 'race-day' && onGoToRaceDayQuiz) {
                  onGoToRaceDayQuiz();
                } else {
                  onGoToQuiz && onGoToQuiz();
                }
              }}
              onOpenModal={setModal}
            />
          ))}
        </div>

        <SubscriptionSection onSubscribe={handleSubscribe} />

        <DealsSection
          dealsRef={dealsRef}
          onOpenBundle={() => setBundleOpen(true)}
          onCopyCode={handleCopyCode}
          copiedCode={copiedCode}
        />

      </div>
    </>
  );
}