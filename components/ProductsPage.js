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
    tagline: 'Perfect intro to custom fueling',
    price: 34.99,
    originalPrice: 43.76,
    discount: '20% off',
    badge: null,
    accentColor: '#22c55e',
    accentBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    items: [
      { emoji: '🧴', name: '1× Reusable Gel Packet', value: '$15.00' },
      { emoji: '🧪', name: '10× Custom Gel Pouches', value: '$18.80' },
      { emoji: '📋', name: 'Formula Guide', value: 'Free' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Bundle',
    tagline: 'For athletes who train seriously',
    price: 74.99,
    originalPrice: 106.60,
    discount: '30% off',
    badge: 'Most Popular',
    accentColor: '#000',
    accentBg: '#f8fafc',
    borderColor: '#000',
    items: [
      { emoji: '🧴', name: '2× Reusable Gel Packets', value: '$30.00' },
      { emoji: '🧪', name: '30× Custom Gel Pouches', value: '$56.40' },
      { emoji: '🏃', name: 'Race Day Formula Pack (10×)', value: '$24.90' },
      { emoji: '📋', name: 'Training Fuel Plan', value: 'Free' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Bundle',
    tagline: 'Full season covered',
    price: 129.99,
    originalPrice: 199.50,
    discount: '35% off',
    badge: 'Best Value',
    accentColor: '#d97706',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    items: [
      { emoji: '🧴', name: '4× Reusable Gel Packets', value: '$60.00' },
      { emoji: '🧪', name: '50× Custom Gel Pouches', value: '$94.00' },
      { emoji: '🏃', name: 'Race Day Formula Pack (20×)', value: '$49.80' },
      { emoji: '⚡', name: 'Priority shipping (every order)', value: '$Free' },
      { emoji: '📋', name: 'Full Season Fuel Plan', value: 'Free' },
    ],
  },
];

function BundleModal({ onClose, onAddBundle }) {
  const [selected, setSelected] = useState('premium');
  const bundle = BUNDLES.find(b => b.id === selected);
  const savings = (bundle.originalPrice - bundle.price).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Bundle & Save</h2>
            <p className="text-xs text-gray-400">Choose a bundle that fits your training</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Bundle selector tabs */}
          <div className="flex gap-2">
            {BUNDLES.map(b => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition
                  ${selected === b.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Selected bundle detail */}
          <div
            className="rounded-2xl border-2 p-5 transition-all"
            style={{ borderColor: bundle.borderColor, background: bundle.accentBg }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                {bundle.badge && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full mb-1.5 inline-block"
                    style={{ background: bundle.accentColor, color: bundle.id === 'premium' ? '#fff' : '#000' }}>
                    {bundle.badge}
                  </span>
                )}
                <h3 className="text-xl font-extrabold text-gray-900">{bundle.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{bundle.tagline}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-2xl font-extrabold text-gray-900">${bundle.price}</p>
                <p className="text-xs text-gray-400 line-through">${bundle.originalPrice}</p>
                <span className="text-xs font-bold text-green-600">Save ${savings}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {bundle.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2 mb-4 border border-black/10">
              <span className="text-sm font-semibold text-gray-700">You save</span>
              <span className="text-lg font-extrabold text-green-600">
                ${savings} ({bundle.discount})
              </span>
            </div>

            <button
              onClick={() => { onAddBundle(bundle); onClose(); }}
              className="w-full py-3.5 rounded-xl font-bold text-base transition text-white"
              style={{ background: bundle.accentColor === '#000' ? '#000' : bundle.accentColor }}>
              Add {bundle.name} to Cart — ${bundle.price}
            </button>
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
    emoji: '🎁',
    label: 'FIRST ORDER',
    headline: '15% Off',
    subline: 'Your first order',
    detail: 'Use code FIRSTORDER at checkout for 15% off everything.',
    code: 'FIRSTORDER',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    badgeColor: '#3b82f6',
  },
  {
    id: 'bundle-offer',
    type: 'bundle',
    emoji: '📦',
    label: 'BUNDLES',
    headline: 'Bundle & Save',
    subline: 'Up to 35% off',
    detail: 'Choose Starter, Premium, or Pro bundle. Bigger bundle = bigger savings.',
    gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    badgeColor: '#f59e0b',
  },
  {
    id: 'free-flask',
    type: 'free-flask',
    emoji: '🧴',
    label: 'FIRST ORDER ONLY',
    headline: 'Free Flask',
    subline: 'With 20+ gel pouches',
    detail: 'Add 20+ custom gel pouches to your cart and get a flask free on your first order.',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    badgeColor: '#10b981',
  },
];

function DealsSection({ dealsRef, onOpenBundle, onCopyCode, copiedCode }) {
  const scrollRef = useRef(null);

  return (
    <div ref={dealsRef} className="mb-8">

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Limited Offers</p>
          <h2 className="text-2xl font-extrabold text-gray-900">Deals & Bundles</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition">
            ‹
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition">
            ›
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {DEALS.map(deal => (
          <div
            key={deal.id}
            className="flex-shrink-0 w-64 rounded-2xl overflow-hidden relative"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>

            {/* Background */}
            <div className="absolute inset-0 rounded-2xl" style={{ background: deal.gradient, opacity: 0.97 }} />

            {/* Content */}
            <div className="relative z-10 p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{ background: deal.badgeColor, color: '#fff' }}>
                  {deal.label}
                </span>
                <span className="text-2xl">{deal.emoji}</span>
              </div>

              <h3 className="text-3xl font-extrabold text-white leading-none mb-1">{deal.headline}</h3>
              <p className="text-white/70 text-sm font-semibold mb-2">{deal.subline}</p>
              <p className="text-white/50 text-xs leading-relaxed mb-5 flex-1">{deal.detail}</p>

              {/* CTA */}
              {deal.type === 'code' && (
                <button
                  onClick={() => onCopyCode(deal.code)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                  }}>
                  {copiedCode === deal.code ? (
                    <><span className="text-green-300">✓</span> Copied!</>
                  ) : (
                    <><span>📋</span> Copy Code: {deal.code}</>
                  )}
                </button>
              )}
              {deal.type === 'bundle' && (
                <button
                  onClick={onOpenBundle}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition"
                  style={{
                    background: '#f59e0b',
                    color: '#000',
                  }}>
                  View Bundles →
                </button>
              )}
              {deal.type === 'free-flask' && (
                <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center"
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#6ee7b7',
                  }}>
                  ✓ Auto-applied at checkout
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// quizFormula — passed from page.js, updated whenever the quiz is completed
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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleAddBundle = (bundle) => {
    addItem({
      id: `bundle-${bundle.id}-${Date.now()}`,
      name: bundle.name,
      subtitle: `${bundle.items.length} items included · ${bundle.discount}`,
      emoji: '📦',
      price: bundle.price,
      qty: 1,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      {bundleOpen && (
        <BundleModal
          onClose={() => setBundleOpen(false)}
          onAddBundle={handleAddBundle}
        />
      )}

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

      {/* ── Deals & Bundles ── */}
      <DealsSection
        dealsRef={dealsRef}
        onOpenBundle={() => setBundleOpen(true)}
        onCopyCode={handleCopyCode}
        copiedCode={copiedCode}
      />

    </div>
  );
}