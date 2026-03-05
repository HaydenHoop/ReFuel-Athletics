"use client";
import { useState } from 'react';
import { useCart } from './CartContext';

const FLAVORS = [
  { id: 'tropical-mango',    label: 'Tropical Mango',      emoji: '🥭' },
  { id: 'strawberry-lemon',  label: 'Strawberry Lemonade', emoji: '🍓' },
  { id: 'orange-citrus',     label: 'Orange Citrus',       emoji: '🍊' },
  { id: 'watermelon-mint',   label: 'Watermelon Mint',     emoji: '🍉' },
  { id: 'neutral',           label: 'Neutral / Unflavored',emoji: '💧' },
];

function Slider({ label, unit, min, max, step = 1, value, onChange, description }) {
  return (
    <div className="mb-4">
      <label className="flex justify-between text-sm font-medium text-amber-200 mb-1">
        <span>{label}</span>
        <span className="font-bold text-white">{value}{unit}</span>
      </label>
      {description && <p className="text-xs text-amber-400/60 mb-2">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
        style={{ background: `linear-gradient(to right, #f59e0b ${((value-min)/(max-min))*100}%, #44403c ${((value-min)/(max-min))*100}%)` }}
      />
      <div className="flex justify-between text-xs text-amber-700 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// RACE_DAY_PREMIUM — flat premium over equivalent training gel
const RACE_DAY_PREMIUM = 0.45;

export default function RaceDayCard({ quizRaceDayFormula, autoAdded = false }) {
  const { addItem } = useCart();

  // Default to a sensible high-performance race formula
  const defaults = quizRaceDayFormula || {
    carbs: 60, sodium: 400, caffeine: 75, thickness: 3,
    fructoseRatio: 0.35, flavor: 'Tropical Mango',
  };

  const [carbs, setCarbs]               = useState(defaults.carbs);
  const [sodium, setSodium]             = useState(defaults.sodium);
  const [caffeine, setCaffeine]         = useState(defaults.caffeine || 75);
  const [thickness, setThickness]       = useState(defaults.thickness);
  const [fructoseRatio, setFructoseRatio] = useState(defaults.fructoseRatio);
  const [gelFlavor, setGelFlavor]       = useState(defaults.flavor || 'Tropical Mango');
  const [gelQty, setGelQty]             = useState(10);
  const [formulaOpen, setFormulaOpen]   = useState(false);
  const [added, setAdded]               = useState(false);

  const selectedFlavor = FLAVORS.find(f => f.label === gelFlavor) || FLAVORS[0];
  const maltodextrin   = Math.round(carbs * (1 - fructoseRatio));
  const fructose       = Math.round(carbs * fructoseRatio);

  // Same pricing logic as GelCard + RACE_DAY_PREMIUM
  const BASE_PRICE     = 1.20;
  const carbCost       = (maltodextrin * 0.008) + (fructose * 0.016);
  const electrolyteCost= (sodium * 0.0005) + (100 * 0.001) + (20 * 0.002);
  const caffeineCost   = caffeine * 0.008;
  const flavorCost     = gelFlavor === 'Neutral / Unflavored' ? 0 : 0.10;
  const thicknessCost  = (thickness - 1) * 0.04;

  const unitPrice = parseFloat((BASE_PRICE + carbCost + electrolyteCost + caffeineCost + flavorCost + thicknessCost + RACE_DAY_PREMIUM).toFixed(2));
  const gelPrice  = parseFloat((gelQty * unitPrice).toFixed(2));

  const thicknessLabel = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'][thickness] || 'Standard';

  const handleAdd = () => {
    addItem({
      id:       `raceday-${Date.now()}`,
      name:     `Race Day Gel (${gelQty} pouches)`,
      subtitle: `${carbs}g carbs · ${sodium}mg sodium · ${caffeine}mg caffeine · ${gelFlavor.split(' ')[0]} · $${unitPrice}/pouch`,
      emoji:    '🏆',
      price:    gelPrice,
      qty:      1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950 border border-amber-500/30 rounded-2xl overflow-hidden flex flex-col shadow-xl">

      {/* Auto-added banner */}
      {autoAdded && (
        <div className="bg-amber-500 text-black text-xs font-bold text-center py-2 px-4 tracking-wide">
          ⚡ Added based on your quiz — race day formula ready
        </div>
      )}

      {added && (
        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          ✓ Added!
        </span>
      )}

      <div className="p-8 pb-4 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Race Day Formula</span>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">PREMIUM</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Race Day Gel</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-white">${unitPrice.toFixed(2)}</p>
            <p className="text-amber-400/70 text-xs">per pouch</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-amber-200/60 text-sm mb-5 leading-relaxed">
          Your peak-performance formula. Higher carbs, elevated sodium, and a precision caffeine hit — engineered for race day, not training.
        </p>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Carbs',    value: `${carbs}g`,      sub: 'per pouch' },
            { label: 'Sodium',   value: `${sodium}mg`,    sub: 'electrolyte' },
            { label: 'Caffeine', value: `${caffeine}mg`,  sub: 'per pouch' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-amber-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-400/70 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-xs text-amber-400/50">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Flavor selector */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400/70 mb-2">Flavor</p>
          <div className="flex flex-wrap gap-2">
            {FLAVORS.map(f => (
              <button key={f.id} onClick={() => setGelFlavor(f.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
                  ${gelFlavor === f.label
                    ? 'bg-amber-500 border-amber-400 text-black'
                    : 'border-amber-500/20 text-amber-300/60 hover:border-amber-400/50 hover:text-amber-200'
                  }`}>
                {f.emoji} {f.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Qty */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400/70 mb-2">Pouches</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setGelQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-amber-500/30 text-amber-300 font-bold hover:border-amber-400 transition flex items-center justify-center text-sm">−</button>
            <span className="text-xl font-bold w-8 text-center text-white">{gelQty}</span>
            <button onClick={() => setGelQty(q => Math.min(50, q + 1))}
              className="w-8 h-8 rounded-full border border-amber-500/30 text-amber-300 font-bold hover:border-amber-400 transition flex items-center justify-center text-sm">+</button>
            <span className="text-amber-400/60 text-sm ml-1">= <span className="text-white font-bold">${gelPrice.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Customize toggle */}
        <button onClick={() => setFormulaOpen(o => !o)}
          className="w-full text-left text-xs font-bold uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition flex items-center gap-2 mb-2">
          <span>{formulaOpen ? '▲' : '▼'}</span>
          {formulaOpen ? 'Hide' : 'Customize'} Formula
        </button>

        {formulaOpen && (
          <div className="bg-white/5 border border-amber-500/20 rounded-xl p-4 mb-4 space-y-1">
            <Slider label="Carbs" unit="g" min={20} max={90} value={carbs} onChange={setCarbs}
              description="Higher is more fuel — but test your gut tolerance first" />
            <Slider label="Caffeine" unit="mg" min={25} max={150} value={caffeine} onChange={setCaffeine}
              description="Recommended 1–2mg/kg body weight" />
            <Slider label="Sodium" unit="mg" min={50} max={700} value={sodium} onChange={setSodium}
              description="Match your sweat rate" />
            <Slider label="Maltodextrin : Fructose" unit="" min={0.1} max={0.6} step={0.05}
              value={fructoseRatio} onChange={setFructoseRatio}
              description={`${Math.round(carbs*(1-fructoseRatio))}g maltodextrin · ${Math.round(carbs*fructoseRatio)}g fructose`} />
            <Slider label="Consistency" unit="" min={1} max={5} value={thickness} onChange={setThickness}
              description={thicknessLabel} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-2 mt-auto">
        <button onClick={handleAdd}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition
            ${added
              ? 'bg-green-500 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
            }`}>
          {added ? '✓ Added to Cart!' : `Add Race Day Gel — $${gelPrice.toFixed(2)}`}
        </button>
        <p className="text-center text-xs text-amber-400/40 mt-2">+${RACE_DAY_PREMIUM.toFixed(2)}/pouch premium over training gel</p>
      </div>
    </div>
  );
}
