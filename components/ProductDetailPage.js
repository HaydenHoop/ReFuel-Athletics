"use client";
import { useState } from 'react';
import { useCart } from './CartContext';

// ── Per-product data ──────────────────────────────────────────────────────────
const PRODUCT_DATA = {
  flask: {
    category: 'Hardware',
    name: 'Reusable Gel Flask',
    tagline: 'Fill it, race it, repeat.',
    price: 15,
    priceLabel: 'per flask',
    rating: 4.8,
    reviewCount: 142,
    action: 'add',
    description: 'Stop tossing single-use foil after every race. The ReFuel Gel Flask is built from food-grade silicone, fits any race belt, and holds up to 70ml of your custom blend. Twist shut, run hard, refill, repeat.',
    highlights: [
      'Food-grade silicone body — BPA-free',
      'Twist-lock nozzle, completely leak-proof',
      'Holds 60–70ml (roughly 2× a standard gel)',
      'Dishwasher safe, race-belt ready',
      'Works with any ReFuel gel formula',
      'Weighs just 28g empty',
    ],
    specs: [
      { label: 'Size', value: '~2× standard gel packet' },
      { label: 'Capacity', value: '60–70ml fill volume' },
      { label: 'Weight', value: '28g empty' },
      { label: 'Closure', value: 'Twist-lock nozzle, leak-proof' },
      { label: 'Material', value: 'Food-grade silicone body, PP cap' },
      { label: 'Care', value: 'Dishwasher safe, top rack' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', label: 'Runner with flask strapped to race belt on trail' },
      { src: null, gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)', label: 'Close-up of twist-lock nozzle detail' },
      { src: null, gradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)', label: 'Flask filled with gel, product flat lay' },
      { src: null, gradient: 'linear-gradient(135deg, #533483 0%, #1a1a2e 100%)', label: 'Flask on race belt during marathon' },
    ],
    reviews: [
      { name: 'Sarah K.', rating: 5, date: 'Jan 2025', title: 'Never going back to foil packs', body: 'I\'ve done 6 marathons with this flask. Zero leaks, easy to fill, and it fits perfectly on my Nathan belt. Worth every penny.' },
      { name: 'Marcus T.', rating: 5, date: 'Feb 2025', title: 'Game changer for ultras', body: 'For 50-milers, being able to refill at aid stations instead of carrying 20 gels is a total game changer. Love this thing.' },
      { name: 'Jen R.', rating: 4, date: 'Mar 2025', title: 'Great product, minor gripe', body: 'Flask itself is perfect. Only knock is it can be a little tricky to clean all the way inside, but the dishwasher handles it fine.' },
      { name: 'Dave L.', rating: 5, date: 'Mar 2025', title: 'Bought 3 of them', body: 'One for each race belt setup. Honestly the best piece of gear I\'ve added this season. No more sticky gel packets everywhere.' },
    ],
    testimonials: [
      { name: 'Alicia M.', role: 'Boston Qualifier, 3:08', quote: 'I set my PR with the ReFuel flask on course. Never once thought about my nutrition — it just worked.' },
      { name: 'Tom B.', role: 'Ultramarathon Runner', quote: 'The flask handles everything from thin energy drinks to thick gels. Finally a product built for real athletes.' },
    ],
  },

  'custom-gel': {
    category: 'Custom Formula',
    name: 'Custom Gel Powder',
    tagline: 'Your formula. Your race.',
    price: 1.88,
    priceLabel: 'per pouch',
    rating: 4.9,
    reviewCount: 318,
    action: 'customize',
    description: 'Every athlete is different. Your fuel should be too. Dial in your exact carb ratio, electrolyte balance, caffeine level, and flavor — then we mix it fresh and ship it within 24 hours. Every pouch labeled with your exact breakdown.',
    highlights: [
      'Fully customizable carbs, sodium, potassium',
      'Optional caffeine 0–100mg per serving',
      '5 flavor options including unflavored',
      'Mixed fresh to order, shipped in 24hr',
      'Each pouch labeled with your formula',
      'Starting at just $1.88 per pouch',
    ],
    specs: [
      { label: 'Carbs', value: '20–60g per serving (adjustable)' },
      { label: 'Sodium', value: '100–500mg (adjustable)' },
      { label: 'Potassium', value: '50–200mg (adjustable)' },
      { label: 'Caffeine', value: '0–100mg (adjustable)' },
      { label: 'Flavors', value: 'Berry, Citrus, Tropical, Vanilla, Unflavored' },
      { label: 'Shelf life', value: '12 months sealed' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in labeled pouch' },
      { src: null, gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: null, gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch showing formula breakdown' },
      { src: null, gradient: 'linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)', label: 'Multiple pouches of different flavors' },
    ],
    reviews: [
      { name: 'Elena V.', rating: 5, date: 'Feb 2025', title: 'Finally a gel I can tolerate', body: 'I\'ve had GI issues with every gel on the market. With ReFuel I dialed down the carbs and it\'s been a revelation. No stomach issues in 4 races.' },
      { name: 'Chris P.', rating: 5, date: 'Jan 2025', title: 'The science is real', body: 'I\'m a sports dietitian and I was skeptical. But the ability to actually customize the formula is legit. My clients love it.' },
      { name: 'Nadia S.', rating: 5, date: 'Mar 2025', title: 'Citrus flavor is perfect', body: 'Not too sweet, not too sour. After years of choking down sickly-sweet gels this is such a relief. Will order for every race.' },
      { name: 'Rob M.', rating: 4, date: 'Feb 2025', title: 'Great, just took some dialing in', body: 'Took me 2 orders to get my formula right but the customer support was amazing and they helped me tweak it. Now it\'s perfect.' },
    ],
    testimonials: [
      { name: 'Dr. Sarah J.', role: 'Sports Nutritionist', quote: 'The level of customization ReFuel offers is what I\'d prescribe to elite athletes. Now it\'s available to everyone.' },
      { name: 'Luke H.', role: 'Ironman Finisher', quote: 'I\'ve tried everything on the market. Nothing comes close to knowing exactly what\'s in your fuel and dialing it perfectly to your body.' },
    ],
  },

  'race-day': {
    category: 'Ready to Race',
    name: 'Race Day Gel',
    tagline: 'Peak performance, sealed fresh.',
    price: 2.49,
    priceLabel: 'per pouch',
    rating: 4.7,
    reviewCount: 89,
    action: 'customize',
    description: 'Our Race Day formula is the result of months of sports science testing. Optimized carb blend, peak electrolytes, and just the right caffeine hit. Choose your flavor and go.',
    highlights: [
      'Optimized 2:1 maltodextrin:fructose ratio',
      'Race-tuned electrolyte blend',
      '75mg natural caffeine per serving',
      '5 flavors including caffeinated versions',
      'No artificial colors or preservatives',
      'Used by podium finishers',
    ],
    specs: [
      { label: 'Carbs', value: '40g per serving (2:1 ratio)' },
      { label: 'Sodium', value: '300mg per serving' },
      { label: 'Potassium', value: '150mg per serving' },
      { label: 'Caffeine', value: '75mg natural caffeine' },
      { label: 'Flavors', value: 'Berry Blast, Citrus Surge, Tropical, Cola, Vanilla' },
      { label: 'Shelf life', value: '18 months sealed' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)', label: 'Race day gel packet on running track' },
      { src: null, gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
      { src: null, gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', label: 'Product lineup of all 5 flavors' },
      { src: null, gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', label: 'Close-up of ingredient label' },
    ],
    reviews: [
      { name: 'Priya N.', rating: 5, date: 'Mar 2025', title: 'Podium fuel', body: 'Ran my first AG podium finish using the Race Day cola flavor at mile 18. Felt strong all the way to the finish.' },
      { name: 'James W.', rating: 5, date: 'Feb 2025', title: 'Best pre-mixed gel I\'ve tried', body: 'Doesn\'t taste like medicine, hits fast, and doesn\'t cause the GI issues I get with other gels. Sold.' },
      { name: 'Tara B.', rating: 4, date: 'Jan 2025', title: 'Great but I prefer custom', body: 'Race Day is excellent but once I tried the custom formula I couldn\'t go back. Still buying Race Day as a backup.' },
      { name: 'Mike O.', rating: 5, date: 'Mar 2025', title: 'Berry Blast is incredible', body: 'Not too sweet, not artificial tasting. Actually looks forward to taking my gel now which is saying something.' },
    ],
    testimonials: [
      { name: 'Coach Dan F.', role: 'Elite Marathon Coach', quote: 'I recommend Race Day gel to all my athletes as a starting point. The 2:1 carb ratio is what the science says, and it shows.' },
      { name: 'Amanda R.', role: '2:58 Marathoner', quote: 'Consistent energy from mile 1 to mile 26. No spikes, no crashes. This is what race nutrition should feel like.' },
    ],
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function ImageGallery({ images }) {
  const [idx, setIdx] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden"
        style={images[idx].src ? {} : { background: images[idx].gradient }}>
        {images[idx].src
          ? <img src={images[idx].src} alt={images[idx].label} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-end justify-center pb-6">
              <p className="text-white/25 text-xs text-center px-8">{images[idx].label}</p>
            </div>
        }
        {/* Arrows */}
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
      {/* Thumbnails */}
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

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProductDetailPage({ productId, onBack, onGoToQuiz }) {
  const { addItem } = useCart();
  const product = PRODUCT_DATA[productId] || PRODUCT_DATA['flask'];
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Shop
      </button>

      {/* ── Top section: image + info ── */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">

        {/* Left: image gallery */}
        <ImageGallery images={product.images} />

        {/* Right: product info */}
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{product.category}</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{product.name}</h1>
          <p className="text-gray-400 text-sm mb-4">{product.tagline}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-5">
            <Stars rating={product.rating} size="lg" />
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black text-gray-900">${product.price}</span>
            <span className="text-gray-400 text-sm">{product.priceLabel}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Highlights */}
          <ul className="space-y-2 mb-8">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold mt-0.5">✓</span> {h}
              </li>
            ))}
          </ul>

          {/* Quantity (only for add-to-cart products) */}
          {product.action === 'add' && (
            <div className="flex items-center gap-3 mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Qty</p>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">−</button>
              <span className="text-lg font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">+</button>
              <span className="text-gray-400 text-sm">= <span className="text-gray-900 font-bold">${total}</span></span>
            </div>
          )}

          {/* CTA */}
          <button onClick={handleAction}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all mb-3
              ${added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
            {added ? '✓ Added to Cart!' : product.action === 'add' ? `Add to Cart — $${total}` : 'Customize Your Formula →'}
          </button>

          {product.action === 'customize' && (
            <p className="text-xs text-gray-400 text-center">Takes ~2 minutes · No commitment · Cancel anytime</p>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 mb-10">
        <div className="flex gap-6">
          {['overview', 'specs', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px
                ${activeTab === tab ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i+1}</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Athlete Testimonials</h3>
            <div className="space-y-4">
              {product.testimonials.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-gray-700 text-sm leading-relaxed italic mb-3">"{t.quote}"</p>
                  <div>
                    <p className="text-gray-900 font-bold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <div className="mb-16">
          {/* Summary */}
          <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">{product.rating}</p>
              <Stars rating={product.rating} size="lg" />
              <p className="text-xs text-gray-400 mt-1">{product.reviewCount} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3">{star}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-gray-400 text-xs">{r.date}</p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{r.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
