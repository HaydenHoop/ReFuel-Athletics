"use client";
import { useState, useRef } from 'react';
import { useCart } from './CartContext';
import GelCard from './GelCard';

const SPECS_PACKET = [
  { icon: '📐', label: 'Size', value: '~2× standard gel packet' },
  { icon: '🔄', label: 'Reusable', value: 'Dishwasher safe, BPA-free' },
  { icon: '🧴', label: 'Capacity', value: '60–70ml fill volume' },
  { icon: '🔒', label: 'Closure', value: 'Twist-lock nozzle, leak-proof' },
  { icon: '⚖️', label: 'Weight', value: '28g empty' },
  { icon: '🌱', label: 'Material', value: 'Food-grade silicone body, PP cap' },
];

function AddedBadge({ show }) {
  return show ? (
    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
      ✓ Added!
    </span>
  ) : null;
}

// ── Bundle Modal ──────────────────────────────────────────────────────────────
const BUNDLES = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    tagline: 'The perfect intro to custom fueling',
    price: 34.99,
    originalPrice: 43.76,
    savingsLabel: '20% off',
    items: [
      { name: '1x Reusable Gel Packet',  detail: '$15.00' },
      { name: '10x Custom Gel Pouches',  detail: '$18.80' },
      { name: 'Formula Guide',           detail: 'Free'   },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Bundle',
    tagline: 'For athletes who train seriously',
    price: 74.99,
    originalPrice: 106.60,
    savingsLabel: '30% off',
    badge: 'Most Popular',
    items: [
      { name: '2x Reusable Gel Packets',      detail: '$30.00' },
      { name: '30x Custom Gel Pouches',        detail: '$56.40' },
      { name: 'Race Day Formula Pack (10x)',   detail: '$24.90' },
      { name: 'Training Fuel Plan',            detail: 'Free'   },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    tagline: 'Full season covered',
    price: 129.99,
    originalPrice: 199.50,
    savingsLabel: '35% off',
    badge: 'Best Value',
    items: [
      { name: '4x Reusable Gel Packets',            detail: '$60.00' },
      { name: '50x Custom Gel Pouches',              detail: '$94.00' },
      { name: 'Race Day Formula Pack (20x)',         detail: '$49.80' },
      { name: 'Priority shipping every order',       detail: 'Free'   },
      { name: 'Full Season Fuel Plan',               detail: 'Free'   },
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
          {/* Tier selector */}
          <div className="flex gap-2">
            {BUNDLES.map(b => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition
                  ${selected === b.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Bundle detail */}
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
    type: 'info',
    label: 'First Order Only',
    headline: 'Free Packet',
    subline: 'With 20+ gel pouches',
    detail: 'Add 20 or more custom gel pouches to your cart and receive a free packet on your first order. Applied automatically.',
  },
];

function DealsSection({ dealsRef, onOpenBundle, onCopyCode, copiedCode }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 268, behavior: 'smooth' });
  };

  return (
    <div ref={dealsRef} className="mt-10">
      {/* Header row */}
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

      {/* Scrollable row */}
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
              {/* Label badge */}
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-widest border border-white/20 text-white/60 px-2.5 py-1 rounded-full">
                  {deal.label}
                </span>
              </div>

              {/* Headline */}
              <p className="text-3xl font-extrabold text-white leading-none mb-1 tracking-tight">{deal.headline}</p>
              <p className="text-sm font-semibold text-white/60 mb-3">{deal.subline}</p>
              <p className="text-xs text-white/40 leading-relaxed flex-1">{deal.detail}</p>

              {/* CTA */}
              <div className="mt-5">
                {deal.type === 'code' && (
                  <button
                    onClick={() => onCopyCode(deal.code)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition
                      ${copiedCode === deal.code
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-white/20 text-white/80 hover:border-white/50 hover:text-white'}`}
                  >
                    {copiedCode === deal.code ? 'Copied to clipboard' : `Copy code: ${deal.code}`}
                  </button>
                )}
                {deal.type === 'bundle' && (
                  <button
                    onClick={onOpenBundle}
                    className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-gray-900 hover:bg-gray-100 transition"
                  >
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

// ── quizFormula — passed from page.js, updated whenever the quiz is completed ──
export default function ProductsPage({ onGoToQuiz, quizFormula, dealsRef: externalDealsRef }) {
  const { addItem } = useCart();

  const [packetQty, setPacketQty] = useState(1);
  const [packetAdded, setPacketAdded] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const internalDealsRef = useRef(null);
  const dealsRef = externalDealsRef || internalDealsRef;

  const packetTotal = (15 * packetQty).toFixed(2);

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

  const handleAddPacket = () => {
    addItem({
      id: `packet-${Date.now()}`,
      name: 'Reusable Gel Packet',
      subtitle: 'Food-grade silicone · Dishwasher safe',
      emoji: '🧴',
      price: 15,
      qty: packetQty,
    });
    setPacketAdded(true);
    setTimeout(() => setPacketAdded(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Section header */}
      <div className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">ReFuel Athletics</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Shop</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-base">
          Every product is designed around one idea: your fuel should work as hard as you do.
        </p>
      </div>

      {/* Product cards — equal height side by side */}
      <div className="grid md:grid-cols-2 gap-6 items-start mb-8">

        {/* ── Gel card — all sliders, quiz-aware ── */}
        <GelCard quizFormula={quizFormula} startOpen={false} onGoToQuiz={onGoToQuiz} />

        {/* ── Reusable Packet card ── */}
        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <AddedBadge show={packetAdded} />

          <div className="p-8 pb-4 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Hardware</span>
                <h2 className="text-2xl font-extrabold mt-1 text-gray-900">Reusable Gel Packet</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900">$15</p>
                <p className="text-gray-400 text-xs">per packet</p>
              </div>
            </div>

            {/* Illustrated packet */}
            <div className="flex justify-center py-4 mb-4">
              <div className="w-20 h-40 rounded-2xl bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500 shadow-2xl flex flex-col items-center justify-between py-3 px-2 overflow-hidden relative">
                <div className="absolute top-0 left-2 w-4 h-full bg-white/10 rounded-full blur-sm" />
                <div className="w-4 h-5 bg-slate-400 rounded-t-full rounded-b-sm border border-slate-300 shadow" />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-black text-white tracking-tight leading-none" style={{ fontSize: '9px' }}>RE</span>
                  <div className="w-6 h-px bg-slate-400" />
                  <span className="font-black text-white tracking-tight leading-none" style={{ fontSize: '9px' }}>FUEL</span>
                </div>
                <div className="flex flex-col gap-1 w-full px-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-px bg-slate-500 rounded-full" />)}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Stop tossing single-use foil after every race. Fill with your custom blend, twist shut, run. Dishwasher safe and race-belt ready.
            </p>

            <ul className="space-y-1.5 mb-4">
              {['Fill with any ReFuel gel blend', 'Roughly 2× the size of a standard gel', 'Leak-proof twist-lock nozzle', 'Dishwasher safe · BPA-free'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold text-xs">✓</span> {item}
                </li>
              ))}
            </ul>

            {/* Quantity */}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setPacketQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full border border-gray-200 text-gray-700 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">−</button>
                <span className="text-xl font-bold w-8 text-center text-gray-900">{packetQty}</span>
                <button onClick={() => setPacketQty(q => Math.min(20, q + 1))}
                  className="w-8 h-8 rounded-full border border-gray-200 text-gray-700 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">+</button>
                <span className="text-gray-400 text-sm ml-1">= <span className="text-gray-900 font-bold">${packetTotal}</span></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              {['Zero waste', 'Race-belt ready', 'BPA-free silicone'].map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 space-y-2">
            <button onClick={handleAddPacket}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition
                ${packetAdded ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
              {packetAdded ? '✓ Added to Cart!' : `Add to Cart — $${packetTotal}`}
            </button>
            <button onClick={() => setSpecsOpen(o => !o)}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-gray-400 border border-gray-200 hover:border-gray-400 hover:text-gray-700 transition">
              {specsOpen ? '▲ Hide' : '▼ View'} Full Specifications
            </button>
            {specsOpen && (
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                {SPECS_PACKET.map(s => (
                  <div key={s.label} className="flex items-start gap-2 text-sm">
                    <span>{s.icon}</span>
                    <div>
                      <p className="text-gray-400 text-xs">{s.label}</p>
                      <p className="text-gray-900 font-medium text-xs">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DealsSection
        dealsRef={dealsRef}
        onOpenBundle={() => setBundleOpen(true)}
        onCopyCode={handleCopyCode}
        copiedCode={copiedCode}
      />

      {bundleOpen && (
        <BundleModal
          onClose={() => setBundleOpen(false)}
          onAddBundle={handleAddBundle}
        />
      )}

    </div>
  );
}