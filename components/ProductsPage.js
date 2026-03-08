"use client";
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import GelCard from './GelCard';
import RaceDayCard from './RaceDayCard';
import { ProductStars } from './Reviews';

// ── Specs ──────────────────────────────────────────────────────────────────
const SPECS_PACKET = [
  { icon: '📐', label: 'Size',      value: '~2× standard gel packet' },
  { icon: '🔄', label: 'Reusable',  value: 'Dishwasher safe, BPA-free' },
  { icon: '🔒', label: 'Closure',   value: 'Twist-lock nozzle' },
  { icon: '⚖️', label: 'Fill',      value: 'Approx. 50–70 ml' },
];

// ── Added badge ─────────────────────────────────────────────────────────────
function AddedBadge({ show }) {
  if (!show) return null;
  return (
    <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
      ✓ Added to cart!
    </div>
  );
}

// ── Bundle Builder ───────────────────────────────────────────────────────────
const BUNDLES = [
  {
    id: 'starter',
    name: 'Starter Kit',
    tag: 'Most Popular',
    tagColor: 'bg-black text-white',
    description: 'Everything you need to ditch single-use gels.',
    emoji: '⚡',
    items: [
      { label: '20 Training Gel pouches', qty: 20, unitPrice: 1.85, emoji: '🧪' },
      { label: '1 Reusable Flask',        qty: 1,  unitPrice: 15,   emoji: '🧴' },
    ],
    ctaColor: 'bg-black hover:bg-gray-800 text-white',
  },
  {
    id: 'race',
    name: 'Race Ready',
    tag: 'Best Value',
    tagColor: 'bg-amber-500 text-black',
    description: 'Training gel + race day formula + flask. Show up prepared.',
    emoji: '🏆',
    items: [
      { label: '20 Training Gel pouches', qty: 20, unitPrice: 1.85, emoji: '🧪' },
      { label: '5 Race Day Gel pouches',  qty: 5,  unitPrice: 2.30, emoji: '🏆' },
      { label: '1 Reusable Flask',        qty: 1,  unitPrice: 15,   emoji: '🧴' },
    ],
    ctaColor: 'bg-amber-500 hover:bg-amber-400 text-black',
  },
  {
    id: 'elite',
    name: 'Elite Pack',
    tag: 'Max Performance',
    tagColor: 'bg-gray-800 text-white',
    description: 'Full season supply. Two flasks, double the race day fuel.',
    emoji: '🥇',
    items: [
      { label: '40 Training Gel pouches', qty: 40, unitPrice: 1.85, emoji: '🧪' },
      { label: '10 Race Day Gel pouches', qty: 10, unitPrice: 2.30, emoji: '🏆' },
      { label: '2 Reusable Flasks',       qty: 2,  unitPrice: 15,   emoji: '🧴' },
    ],
    ctaColor: 'bg-gray-900 hover:bg-gray-700 text-white',
  },
];
const BUNDLE_DISCOUNT = { starter: 0.05, race: 0.10, elite: 0.15 };

function BundleBuilder({ onGoToQuiz }) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState('race');
  const [added, setAdded]       = useState(false);
  const [open, setOpen]         = useState(false);

  const bundle   = BUNDLES.find(b => b.id === selected);
  const retail   = bundle.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const discount = BUNDLE_DISCOUNT[selected];
  const price    = parseFloat((retail * (1 - discount)).toFixed(2));
  const savings  = parseFloat((retail - price).toFixed(2));

  const handleAdd = () => {
    addItem({
      id:       `bundle-${selected}-${Date.now()}`,
      name:     `${bundle.name} Bundle`,
      subtitle: bundle.items.map(i => `${i.qty}× ${i.label.split(' ').slice(-2).join(' ')}`).join(' · '),
      emoji:    bundle.emoji,
      price,
      qty:      1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div id="product-bundle">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl hover:from-gray-800 transition group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📦</span>
          <div className="text-left">
            <p className="font-extrabold text-base">Bundle & Save</p>
            <p className="text-gray-400 text-xs">Save up to 15% · 3 curated packs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">{open ? 'Close' : 'View bundles'}</span>
          <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="mt-2 bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Tier tabs */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            {BUNDLES.map(b => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className={`py-4 px-3 text-center transition-all border-b-2
                  ${selected === b.id ? 'border-white bg-gray-900' : 'border-transparent hover:bg-gray-900/50'}`}>
                <span className="text-xl block mb-1">{b.emoji}</span>
                <p className={`text-xs font-bold ${selected === b.id ? 'text-white' : 'text-gray-500'}`}>{b.name}</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${b.tagColor}`}>{b.tag}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">{bundle.name}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{bundle.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-3xl font-black text-white">${price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 line-through">${retail.toFixed(2)}</p>
                <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                  Save ${savings.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {bundle.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)} each · ${(item.qty * item.unitPrice).toFixed(2)} total</p>
                  </div>
                  <span className="text-xs font-black text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">×{item.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-5">
              <span className="text-green-400">💰</span>
              <p className="text-sm text-green-300 font-medium">
                Save <span className="font-black">${savings.toFixed(2)}</span> ({Math.round(discount * 100)}% off) vs buying separately
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdd}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition
                  ${added ? 'bg-green-500 text-white' : bundle.ctaColor}`}>
                {added ? '✓ Added to Cart!' : `Add ${bundle.name} — $${price.toFixed(2)}`}
              </button>
              <button onClick={() => { setOpen(false); onGoToQuiz?.(); }}
                className="px-4 py-3.5 rounded-xl font-bold text-sm border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition">
                Customize →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ProductsPage ────────────────────────────────────────────────────────
export default function ProductsPage({ onGoToQuiz, quizFormula, raceDayFormula }) {
  const { addItem } = useCart();
  const [packetQty,   setPacketQty]   = useState(1);
  const [packetAdded, setPacketAdded] = useState(false);
  const [specsOpen,   setSpecsOpen]   = useState(false);

  const packetTotal = (15 * packetQty).toFixed(2);

  const handleAddPacket = () => {
    addItem({
      id:       `packet-${Date.now()}`,
      name:     'Reusable Gel Flask',
      subtitle: 'Twist-lock · BPA-free · Dishwasher safe',
      emoji:    '🧴',
      price:    15 * packetQty,
      qty:      packetQty,
    });
    setPacketAdded(true);
    setTimeout(() => setPacketAdded(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-12">

      {/* Header */}
      <div className="text-center pt-8 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Everything you need</p>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Products</h1>
      </div>

      {/* ── 1. Bundle & Save ── */}
      <BundleBuilder onGoToQuiz={onGoToQuiz} />

      {/* ── 2. Reusable Flask ── */}
      <div id="product-packet" className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <AddedBadge show={packetAdded} />
        <div className="flex flex-col md:flex-row">

          {/* Left: illustration */}
          <div className="md:w-48 flex-shrink-0 bg-gray-950 flex items-center justify-center py-10 px-8">
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

          {/* Right: content */}
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Hardware</span>
              <h2 className="text-2xl font-extrabold mt-1 text-gray-900 mb-1">Reusable Gel Flask</h2>
              <ProductStars productKey="flask" productName="Reusable Gel Flask" />
              <p className="text-gray-500 text-sm leading-relaxed mb-4 mt-2">
                Stop tossing single-use foil after every race. Fill with your custom blend, twist shut, run. Dishwasher safe and race-belt ready.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                {['Fill with any ReFuel blend', 'Leak-proof twist-lock nozzle', '2× size of a standard gel', 'Dishwasher safe · BPA-free'].map(item => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="text-green-500 font-bold">✓</span> {item}
                  </span>
                ))}
              </div>
              {specsOpen && (
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 mb-4">
                  {SPECS_PACKET.map(s => (
                    <div key={s.label} className="flex items-start gap-2">
                      <span>{s.icon}</span>
                      <div>
                        <p className="text-gray-400 text-xs">{s.label}</p>
                        <p className="text-gray-900 font-medium text-xs">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setSpecsOpen(o => !o)}
                className="text-xs text-gray-400 hover:text-gray-700 transition underline underline-offset-2">
                {specsOpen ? 'Hide' : 'View'} full specs
              </button>
            </div>

            {/* Price + qty + CTA */}
            <div className="flex flex-col justify-between gap-4 md:w-44 flex-shrink-0">
              <div>
                <p className="text-3xl font-extrabold text-gray-900">$15</p>
                <p className="text-gray-400 text-xs">per flask</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Quantity</p>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setPacketQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 text-gray-700 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">−</button>
                  <span className="text-lg font-bold w-6 text-center">{packetQty}</span>
                  <button onClick={() => setPacketQty(q => Math.min(20, q + 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 text-gray-700 font-bold hover:border-gray-900 transition flex items-center justify-center text-sm">+</button>
                </div>
                <button onClick={handleAddPacket}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition
                    ${packetAdded ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}>
                  {packetAdded ? '✓ Added!' : `Add — $${packetTotal}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Training Gel ── */}
      <div id="product-gel">
        <GelCard quizFormula={quizFormula} raceDayFormula={raceDayFormula} startOpen={false} onGoToQuiz={onGoToQuiz} />
      </div>

      {/* ── 4. Race Day Gel ── */}
      <RaceDayCard quizRaceDayFormula={raceDayFormula} autoAdded={!!raceDayFormula} />

    </div>
  );
}