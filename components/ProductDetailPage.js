"use client";
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const PRODUCT_DATA = {
  flask: {
    category: 'Hardware',
    name: 'Reusable Gel Flask',
    productKey: 'flask',
    tagline: 'Fill it, race it, repeat.',
    price: 15,
    priceLabel: 'per flask',
    action: 'add',
    description: 'Stop tossing single-use foil after every race. The ReFuel Gel Flask is built from food-grade silicone, fits any race belt, and holds up to 70ml of your custom blend. Twist shut, run hard, refill, repeat.',
    highlights: [
      'Food-grade silicone body — BPA-free',
      'Twist-lock nozzle, completely leak-proof',
      'Holds 60-70ml (roughly 2x a standard gel)',
      'Dishwasher safe, race-belt ready',
      'Works with any ReFuel gel formula',
      'Weighs just 28g empty',
    ],
    specs: [
      { label: 'Size',     value: '~2x standard gel packet' },
      { label: 'Capacity', value: '60-70ml fill volume' },
      { label: 'Weight',   value: '28g empty' },
      { label: 'Closure',  value: 'Twist-lock nozzle, leak-proof' },
      { label: 'Material', value: 'Food-grade silicone body, PP cap' },
      { label: 'Care',     value: 'Dishwasher safe, top rack' },
    ],
    testimonials: [
      { quote: 'Its easy to clean, easy to use!', name: 'Sasha Kelly', role: 'CSM Track & XC Athlete' },
      { quote: 'So comfortable, I forgot it was on.', name: 'Garrett Mackey', role: 'CSM Track & XC Athlete' },
      { quote: 'Fantastic Idea!', name: 'Grace Strongman', role: 'NCAA Double Podium Finisher, RMAC Course Record Holder' },
    ],
    images: [
      { src: '/images/Sports_Bra_Clip.jpeg', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', label: 'Runner with flask strapped to sports bra on trail' },
      { src: '/images/Julien_bending_down.jpeg', gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)', label: 'Close-up of on runner' },
      { src: '/images/Paul_image.jpeg', gradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)', label: 'Flask filled with gel, product flat lay' },
      { src: '/images/Gel_Flask_Opening.jpeg', gradient: 'linear-gradient(135deg, #533483 0%, #1a1a2e 100%)', label: 'Flask on race belt during marathon' },
    ],
  },
  'custom-gel': {
    category: 'Custom Formula',
    name: 'Custom Gel Powder',
    productKey: 'custom-gel',
    tagline: 'Your formula. Your race.',
    price: 1.88,
    priceLabel: 'per pouch',
    action: 'customize',
    description: 'Every athlete is different. Your fuel should be too. Dial in your exact carb ratio, electrolyte balance, caffeine level, and flavor — then we mix it fresh and ship it within 24 hours.',
    highlights: [
      'Fully customizable carbs, sodium, potassium',
      'Optional caffeine 0-100mg per serving',
      '5 flavor options including unflavored',
      'Mixed fresh to order, shipped in 24hr',
      'Each pouch labeled with your formula',
      'Starting at just $1.88 per pouch',
    ],
    specs: [
      { label: 'Carbs',      value: '20-60g per serving (adjustable)' },
      { label: 'Sodium',     value: '100-500mg (adjustable)' },
      { label: 'Potassium',  value: '50-200mg (adjustable)' },
      { label: 'Caffeine',   value: '0-100mg (adjustable)' },
      { label: 'Flavors',    value: 'Berry, Citrus, Tropical, Vanilla, Unflavored' },
      { label: 'Shelf life', value: '12 months sealed' },
    ],
    testimonials: [
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Marathon Runner' },
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Ultra Runner' },
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Cyclist' },
    ],
    images: [
      { src: 'all gels', gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in labeled pouch' },
      { src: '/images/Maple_jar_gel.jpeg', gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: 'fill', gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch showing formula breakdown' },
      { src: '/images/Passionfruit_jar_gel.jpeg', gradient: 'linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)', label: 'Multiple pouches of different flavors' },
    ],
  },
  'race-day': {
    category: 'Ready to Race',
    name: 'Race Day Gel',
    productKey: 'race-day',
    tagline: 'Peak performance, sealed fresh.',
    price: 2.49,
    priceLabel: 'per pouch',
    action: 'customize',
    description: 'Our Race Day formula is the result of months of sports science testing. Optimized carb blend, peak electrolytes, and just the right caffeine hit. Choose your flavor and go.',
    highlights: [
      'Optimized 2:1 maltodextrin:fructose ratio',
      'Race-tuned electrolyte blend',
      '75mg natural caffeine per serving',
      '5 flavors including caffeinated versions',
      'No artificial colors or preservatives',
    ],
    specs: [
      { label: 'Carbs',      value: '40g per serving (2:1 ratio)' },
      { label: 'Sodium',     value: '300mg per serving' },
      { label: 'Potassium',  value: '150mg per serving' },
      { label: 'Caffeine',   value: '75mg natural caffeine' },
      { label: 'Flavors',    value: 'Berry Blast, Citrus Surge, Tropical, Cola, Vanilla' },
      { label: 'Shelf life', value: '18 months sealed' },
    ],
    testimonials: [
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Marathon Runner' },
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Triathlete' },
      { quote: 'YOUR QUOTE HERE', name: 'Athlete Name', role: 'Sprinter' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)', label: 'Race day gel packet on running track' },
      { src: null, gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
      { src: null, gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', label: 'Product lineup of all 5 flavors' },
      { src: null, gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', label: 'Close-up of ingredient label' },
    ],
  },
};

const PER_PAGE = 10;

function Stars({ rating, size = 'sm', empty = false }) {
  const sz = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`${sz} leading-none`}
          style={{ color: (!empty && n <= Math.round(rating)) ? '#f59e0b' : '#e5e7eb' }}>
          ★
        </span>
      ))}
    </span>
  );
}

function ImageGallery({ images }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden"
        style={images[idx].src ? {} : { background: images[idx].gradient }}>
        {images[idx].src
          ? <img src={images[idx].src} alt={images[idx].label} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-end justify-center pb-6">
              <p className="text-white/25 text-xs text-center px-8">{images[idx].label}</p>
            </div>
        }
        <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition">
          <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button onClick={() => setIdx(i => (i + 1) % images.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition">
          <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div className="flex gap-2">
        {images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all
              ${i === idx ? 'border-black' : 'border-transparent opacity-50 hover:opacity-80'}`}
            style={img.src ? {} : { background: img.gradient }}>
            {img.src && <img src={img.src} alt="" className="w-full h-full object-cover" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// Inline reviews section — no modal, renders directly on page
function InlineReviews({ productKey, productName }) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews/submit?limit=200&product=${productKey}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productKey]);

  // Already sorted high-to-low by the API (rating desc, created_at desc)
  const withText   = reviews.filter(r => r.body);
  const total      = reviews.length;
  const avg        = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const totalPages = Math.ceil(withText.length / PER_PAGE);
  const visible    = withText.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0,
  }));

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <Stars empty size="lg" />
        <p className="text-gray-500 text-sm mt-4 mb-1">No reviews yet.</p>
        <p className="text-gray-400 text-xs">Be the first to review this product after your order.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-2xl mb-8">
        <div className="text-center flex-shrink-0">
          <p className="text-5xl font-black text-gray-900 leading-none">{avg.toFixed(1)}</p>
          <Stars rating={avg} size="md" />
          <p className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-2">
          {dist.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
              <span className="text-amber-400 text-xs leading-none">★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {withText.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">
          No written reviews yet — be the first after your order!
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {visible.map(r => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {r.reviewer?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{r.reviewer}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-gray-500 font-semibold">{r.rating}.0</span>
                  </div>
                </div>
                {r.title && <p className="font-semibold text-gray-900 text-sm mb-1">{r.title}</p>}
                <p className="text-gray-500 text-sm leading-relaxed">{r.body}</p>
                <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {page + 1} of {totalPages} &nbsp;·&nbsp; {withText.length} written reviews
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition">
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Static curated testimonials — fill in quotes/names in PRODUCT_DATA above
function InlineTestimonials({ testimonials }) {
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <p className="text-gray-400 text-sm">No testimonials yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-5">
          <p className="text-gray-700 text-sm leading-relaxed italic">"{t.quote}"</p>
          <p className="text-sm mt-3">
            <span className="font-bold text-gray-900">— {t.name}</span>
            {t.role && <span className="text-gray-400 font-normal">, {t.role}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

// Header stars widget — no modal, just scrolls to reviews tab
function HeaderStars({ reviews, onClickReviews }) {
  const total = reviews.length;
  const avg   = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  return (
    <button onClick={onClickReviews}
      className="flex items-center gap-1.5 group hover:opacity-75 transition mt-1 w-fit">
      <Stars rating={total > 0 ? avg : 0} empty={total === 0} />
      <span className="text-xs text-gray-400 underline underline-offset-2 group-hover:text-gray-700 transition">
        {total > 0 ? `${avg.toFixed(1)} (${total})` : 'No reviews yet'}
      </span>
    </button>
  );
}

export default function ProductDetailPage({ productId, onBack, onGoToQuiz }) {
  const { addItem } = useCart();
  const product = PRODUCT_DATA[productId] || PRODUCT_DATA['flask'];
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews]     = useState([]);

  // Fetch reviews once for the header stars (no modal needed — just scroll to tab)
  useEffect(() => {
    fetch(`/api/reviews/submit?limit=200&product=${product.productKey}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, [product.productKey]);

  const handleAction = () => {
    if (product.action === 'add') {
      addItem({ id: `${productId}-${Date.now()}`, name: product.name, subtitle: product.tagline, price: product.price, qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } else {
      onGoToQuiz && onGoToQuiz();
    }
  };

  const total = (product.price * qty).toFixed(2);

  return (
    <div className="w-full max-w-5xl mx-auto">

      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Shop
      </button>

      {/* Top: image + info */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <ImageGallery images={product.images} />

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{product.category}</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{product.name}</h1>
          <p className="text-gray-400 text-sm mb-3">{product.tagline}</p>

          {/* Stars — clicking scrolls to Reviews tab instead of opening modal */}
          <HeaderStars reviews={reviews} onClickReviews={() => setActiveTab('reviews')} />

          <div className="flex items-baseline gap-2 mt-5 mb-5">
            <span className="text-4xl font-black text-gray-900">${product.price}</span>
            <span className="text-gray-400 text-sm">{product.priceLabel}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          <ul className="space-y-2 mb-8">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold mt-0.5">✓</span> {h}
              </li>
            ))}
          </ul>

          {product.action === 'add' && (
            <div className="flex items-center gap-3 mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Qty</p>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">-</button>
              <span className="text-lg font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">+</button>
              <span className="text-gray-400 text-sm">= <span className="text-gray-900 font-bold">${total}</span></span>
            </div>
          )}

          <button onClick={handleAction}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all mb-3
              ${added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
            {added ? '✓ Added to Cart!' : product.action === 'add' ? `Add to Cart - $${total}` : 'Customize Your Formula →'}
          </button>

          {product.action === 'customize' && (
            <p className="text-xs text-gray-400 text-center">Takes ~2 minutes · No commitment · Cancel anytime</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-10">
        <div className="flex gap-6">
          {['overview', 'specs', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px
                ${activeTab === tab ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {tab === 'reviews'
                ? `Reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}`
                : tab.charAt(0).toUpperCase() + tab.slice(1)
              }
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">What's Included</h3>
            <ul className="space-y-3">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Athlete Testimonials</h3>
            <InlineTestimonials testimonials={product.testimonials} />
          </div>
        </div>
      )}

      {/* Specs tab */}
      {activeTab === 'specs' && (
        <div className="max-w-lg mb-16">
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
            {product.specs.map((s, i) => (
              <div key={i} className="flex justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition">
                <span className="text-sm text-gray-500 font-medium">{s.label}</span>
                <span className="text-sm text-gray-900 font-semibold text-right max-w-xs">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews tab — fully inline, no modal */}
      {activeTab === 'reviews' && (
        <div className="mb-16">
          <InlineReviews productKey={product.productKey} productName={product.name} />
        </div>
      )}

    </div>
  );
}