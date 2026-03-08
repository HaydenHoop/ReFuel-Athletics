"use client";
import { useState } from 'react';
import { useCart } from './CartContext';
import { ProductStars, Testimonials } from './Reviews';

// ── Per-product data ──────────────────────────────────────────────────────────
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
      'Holds 60–70ml (roughly 2× a standard gel)',
      'Dishwasher safe, race-belt ready',
      'Works with any ReFuel gel formula',
      'Weighs just 28g empty',
    ],
    specs: [
      { label: 'Size',     value: '~2× standard gel packet' },
      { label: 'Capacity', value: '60–70ml fill volume' },
      { label: 'Weight',   value: '28g empty' },
      { label: 'Closure',  value: 'Twist-lock nozzle, leak-proof' },
      { label: 'Material', value: 'Food-grade silicone body, PP cap' },
      { label: 'Care',     value: 'Dishwasher safe, top rack' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', label: 'Runner with flask strapped to race belt on trail' },
      { src: null, gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)', label: 'Close-up of twist-lock nozzle detail' },
      { src: null, gradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)', label: 'Flask filled with gel, product flat lay' },
      { src: null, gradient: 'linear-gradient(135deg, #533483 0%, #1a1a2e 100%)', label: 'Flask on race belt during marathon' },
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
      { label: 'Carbs',      value: '20–60g per serving (adjustable)' },
      { label: 'Sodium',     value: '100–500mg (adjustable)' },
      { label: 'Potassium',  value: '50–200mg (adjustable)' },
      { label: 'Caffeine',   value: '0–100mg (adjustable)' },
      { label: 'Flavors',    value: 'Berry, Citrus, Tropical, Vanilla, Unflavored' },
      { label: 'Shelf life', value: '12 months sealed' },
    ],
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)', label: 'Close-up of custom gel powder in labeled pouch' },
      { src: null, gradient: 'linear-gradient(135deg, #40916c 0%, #52b788 100%)', label: 'Gel powder being scooped into flask' },
      { src: null, gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)', label: 'Labeled pouch showing formula breakdown' },
      { src: null, gradient: 'linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)', label: 'Multiple pouches of different flavors' },
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
    images: [
      { src: null, gradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b45309 100%)', label: 'Race day gel packet on running track' },
      { src: null, gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', label: 'Gel being consumed mid-race' },
      { src: null, gradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', label: 'Product lineup of all 5 flavors' },
      { src: null, gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', label: 'Close-up of ingredient label' },
    ],
  },
};

// ── Image gallery ─────────────────────────────────────────────────────────────
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
      addItem({
        id: `${productId}-${Date.now()}`,
        name: product.name,
        subtitle: product.tagline,
        price: product.price,
        qty,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } else {
      onGoToQuiz && onGoToQuiz();
    }
  };

  const total = (product.price * qty).toFixed(2);

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Back */}
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

          {/* Live stars from DB — clicking opens the review modal built into ProductStars */}
          <ProductStars productKey={product.productKey} productName={product.name} />

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
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">−</button>
              <span className="text-lg font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-full border border-gray-200 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">+</button>
              <span className="text-gray-400 text-sm">= <span className="text-gray-900 font-bold">${total}</span></span>
            </div>
          )}

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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-10">
        <div className="flex gap-6">
          {['overview', 'specs', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px
                ${activeTab === tab ? 'border-black text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
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
          </div>
          {/* Testimonials pull top-5 five-star reviews with text from DB */}
          <Testimonials />
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

      {/* Reviews tab — ProductStars already has the modal, so just render it again here as the entry point */}
      {activeTab === 'reviews' && (
        <div className="mb-16">
          <div className="flex flex-col items-center py-12 border border-gray-100 rounded-2xl">
            <p className="text-sm text-gray-500 mb-3">Click to see all reviews for {product.name}</p>
            <ProductStars productKey={product.productKey} productName={product.name} />
          </div>
        </div>
      )}

    </div>
  );
}