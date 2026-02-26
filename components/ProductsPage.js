"use client";
import { useState } from 'react';
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

// quizFormula — passed from page.js, updated whenever the quiz is completed
export default function ProductsPage({ onGoToQuiz, quizFormula }) {
  const { addItem } = useCart();

  const [packetQty, setPacketQty] = useState(1);
  const [packetAdded, setPacketAdded] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

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

      {/* Bundle nudge */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-extrabold text-lg">Better together</p>
          <p className="text-gray-400 text-sm">Pair the reusable packet with your custom gel blend for a zero-waste race setup.</p>
        </div>
        <button
          onClick={() => { onGoToQuiz && onGoToQuiz(); }}
          className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap"
        >
          🎯 Personalize Your Formula →
        </button>
      </div>

    </div>
  );
}