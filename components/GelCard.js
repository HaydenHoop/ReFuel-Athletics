"use client";
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

const FLAVORS = [
  { id: 'tropical-mango', label: 'Tropical Mango', emoji: '🥭' },
  { id: 'strawberry-lemon', label: 'Strawberry Lemonade', emoji: '🍓' },
  { id: 'orange-citrus', label: 'Orange Citrus', emoji: '🍊' },
  { id: 'watermelon-mint', label: 'Watermelon Mint', emoji: '🍉' },
  { id: 'neutral', label: 'Neutral / Unflavored', emoji: '💧' },
];

function Slider({ label, unit, min, max, step = 1, value, onChange, description }) {
  return (
    <div className="mb-6">
      <label className="flex justify-between text-sm font-medium text-gray-300 mb-1">
        <span>{label}</span>
        <span className="font-bold text-white">{value}{unit}</span>
      </label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// quizFormula  — when set, snaps all sliders to quiz results
// startOpen    — whether the customize panel starts expanded (true on Find Your Gel page)
// onGoToQuiz   — optional link shown on Shop to jump to quiz tab
export default function GelCard({ quizFormula, startOpen = false, onGoToQuiz }) {
  const { addItem } = useCart();
  const { user, saveFormula } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [carbs, setCarbs] = useState(30);
  const [sodium, setSodium] = useState(250);
  const [caffeine, setCaffeine] = useState(0);
  const [thickness, setThickness] = useState(3);
  const [fructoseRatio, setFructoseRatio] = useState(0.35);
  const [potassium, setPotassium] = useState(100);
  const [magnesium, setMagnesium] = useState(20);
  const [gelQty, setGelQty] = useState(10);
  const [gelFlavor, setGelFlavor] = useState('Neutral / Unflavored');
  const [formulaOpen, setFormulaOpen] = useState(startOpen);
  const [added, setAdded] = useState(false);

  // When quiz completes, snap all sliders to the result
  useEffect(() => {
    if (!quizFormula) return;
    if (quizFormula.carbs !== undefined) setCarbs(quizFormula.carbs);
    if (quizFormula.sodium !== undefined) setSodium(quizFormula.sodium);
    if (quizFormula.caffeine !== undefined) setCaffeine(quizFormula.caffeine);
    if (quizFormula.thickness !== undefined) setThickness(quizFormula.thickness);
    if (quizFormula.fructoseRatio !== undefined) setFructoseRatio(quizFormula.fructoseRatio);
    if (quizFormula.flavor) setGelFlavor(quizFormula.flavor);
    // Auto-open the sliders so user can see what changed
    setFormulaOpen(true);
  }, [quizFormula]);

  const selectedFlavor = FLAVORS.find(f => f.label === gelFlavor) || FLAVORS[4];
  const maltodextrin = Math.round(carbs * (1 - fructoseRatio));
  const fructose = Math.round(carbs * fructoseRatio);
  const thicknessLabel = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'][thickness] || 'Standard';

  // ── Dynamic ingredient-based pricing ─────────────────────────────────────
  const BASE_PRICE = 1.20;
  // Maltodextrin is cheap; fructose costs ~2x more per gram
  const carbCost = (maltodextrin * 0.008) + (fructose * 0.016);
  // Sodium cheap; potassium and magnesium cost more
  const electrolyteCost = (sodium * 0.0005) + (potassium * 0.001) + (magnesium * 0.002);
  // Pharmaceutical-grade caffeine ~$0.008/mg
  const caffeineCost = caffeine * 0.008;
  // Named flavors add a small cost; neutral is free
  const flavorCost = gelFlavor === 'Neutral / Unflavored' ? 0 : 0.10;
  // Thicker gels use more binding material
  const thicknessCost = (thickness - 1) * 0.04;

  const unitPrice = parseFloat((BASE_PRICE + carbCost + electrolyteCost + caffeineCost + flavorCost + thicknessCost).toFixed(2));
  const gelPrice = parseFloat((gelQty * unitPrice).toFixed(2));

  const priceBreakdown = [
    { label: 'Base', value: BASE_PRICE },
    { label: `Carbs (${carbs}g)`, value: parseFloat(carbCost.toFixed(3)) },
    { label: 'Electrolytes', value: parseFloat(electrolyteCost.toFixed(3)) },
    ...(caffeine > 0 ? [{ label: `Caffeine (${caffeine}mg)`, value: parseFloat(caffeineCost.toFixed(3)) }] : []),
    ...(flavorCost > 0 ? [{ label: 'Flavoring', value: flavorCost }] : []),
    ...(thicknessCost > 0 ? [{ label: 'Consistency', value: parseFloat(thicknessCost.toFixed(3)) }] : []),
  ];

  const handleAdd = () => {
    addItem({
      id: `gel-${Date.now()}`,
      name: `Custom Gel Powder (${gelQty} pouches)`,
      subtitle: `${carbs}g carbs · ${sodium}mg sodium${caffeine ? ` · ${caffeine}mg caffeine` : ''} · ${gelFlavor.split(' ')[0]} · $${unitPrice}/pouch`,
      emoji: selectedFlavor.emoji,
      price: gelPrice,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleSaveFormula = () => {
    if (!user) { setSaveMsg('Sign in to save formulas.'); setTimeout(() => setSaveMsg(''), 3000); return; }
    const result = saveFormula({
      name: `${gelFlavor.split(' ')[0]} · ${carbs}g carbs${caffeine ? ` · ${caffeine}mg caffeine` : ''}`,
      carbs, sodium, caffeine, thickness, fructoseRatio, potassium, magnesium,
      flavor: gelFlavor, quizGenerated: !!quizFormula,
    });
    if (result?.success !== false) {
      setSaved(true);
      setSaveMsg('Formula saved to your account!');
      setTimeout(() => { setSaved(false); setSaveMsg(''); }, 3000);
    }
  };

  return (
    <div className="relative bg-black text-white rounded-2xl overflow-hidden flex flex-col shadow-xl">
      {/* Added badge */}
      {added && (
        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          ✓ Added!
        </span>
      )}

      {/* Quiz-personalized banner */}
      {quizFormula && (
        <div className="bg-green-600 text-white text-xs font-bold px-4 py-2 flex items-center gap-2">
          <span>🎯</span> Formula personalized from your quiz results — fine-tune below
        </div>
      )}

      <div className="p-8 pb-4 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Consumable</span>
            <h2 className="text-2xl font-extrabold mt-1">Custom Gel Powder</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">${unitPrice.toFixed(2)}</p>
            <p className="text-gray-500 text-xs">per pouch</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Your formula, mixed fresh. Dial in every variable — carbs, electrolytes, caffeine, texture — then we mix and ship.
        </p>

        {/* Flavor */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Flavor</p>
          <div className="grid grid-cols-5 gap-1.5">
            {FLAVORS.map(f => (
              <button key={f.id} onClick={() => setGelFlavor(f.label)} title={f.label}
                className={`flex flex-col items-center py-2 rounded-lg border transition-all
                  ${gelFlavor === f.label ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-500'}`}>
                <span className="text-lg">{f.emoji}</span>
                <span className="text-gray-400 mt-0.5" style={{ fontSize: '9px' }}>{f.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pouch quantity */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Pouches</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setGelQty(q => Math.max(5, q - 5))}
              className="w-8 h-8 rounded-full border border-gray-700 font-bold hover:border-white transition flex items-center justify-center text-sm">−</button>
            <span className="text-xl font-bold w-8 text-center">{gelQty}</span>
            <button onClick={() => setGelQty(q => Math.min(50, q + 5))}
              className="w-8 h-8 rounded-full border border-gray-700 font-bold hover:border-white transition flex items-center justify-center text-sm">+</button>
            <span className="text-gray-500 text-sm ml-1">= <span className="text-white font-bold">${gelPrice.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Live formula summary — always visible */}
        <div className="bg-gray-900 rounded-xl p-3 mb-4 text-xs text-gray-300 grid grid-cols-2 gap-1.5">
          <span>⚡ {carbs}g carbs ({maltodextrin}g + {fructose}g)</span>
          <span>🧂 {sodium}mg sodium</span>
          <span>⚗️ {potassium}mg potassium</span>
          <span>💊 {magnesium}mg magnesium</span>
          {caffeine > 0 && <span>☕ {caffeine}mg caffeine</span>}
          <span>💧 {thicknessLabel}</span>
        </div>

        {/* Price breakdown */}
        <div className="bg-gray-900 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Price Breakdown</p>
            <p className="text-white font-extrabold text-sm">${unitPrice.toFixed(2)} / pouch</p>
          </div>
          <div className="space-y-1">
            {priceBreakdown.map(item => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-300">${item.value.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between text-xs font-bold">
              <span className="text-gray-400">Total per pouch</span>
              <span className="text-white">${unitPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Toggle: Customize Formula */}
        <button
          onClick={() => setFormulaOpen(o => !o)}
          className="w-full border border-gray-700 text-gray-400 py-2.5 rounded-xl font-medium text-sm hover:border-gray-400 hover:text-white transition flex items-center justify-center gap-2"
        >
          {formulaOpen ? '▲ Hide Formula Builder' : '▼ Customize Formula'}
        </button>

        {/* ── All sliders ── */}
        {formulaOpen && (
          <div className="mt-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Carbohydrates</p>
              <Slider label="Total Carbs" unit="g" min={15} max={90} value={carbs} onChange={setCarbs} description="Per gel serving" />
              <Slider label="Fructose Ratio" unit="%" min={10} max={50} step={5}
                value={Math.round(fructoseRatio * 100)} onChange={v => setFructoseRatio(v / 100)}
                description={`Maltodextrin: ${maltodextrin}g · Fructose: ${fructose}g — lower is gentler on stomach`} />
            </div>

            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Electrolytes</p>
              <Slider label="Sodium" unit="mg" min={0} max={600} step={25} value={sodium} onChange={setSodium} />
              <Slider label="Potassium" unit="mg" min={0} max={300} step={10} value={potassium} onChange={setPotassium} />
              <Slider label="Magnesium" unit="mg" min={0} max={80} step={5} value={magnesium} onChange={setMagnesium} />
            </div>

            <div className="border-t border-gray-800 pt-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Performance</p>
              <Slider label="Caffeine" unit="mg" min={0} max={150} step={25} value={caffeine} onChange={setCaffeine}
                description={caffeine === 0 ? 'No caffeine' : caffeine <= 50 ? 'Light boost' : caffeine <= 100 ? 'Moderate boost' : 'Race-day kick'} />
              <div className="mb-6">
                <label className="flex justify-between text-sm font-medium text-gray-300 mb-1">
                  <span>Gel Thickness</span>
                  <span className="font-bold text-white">{thicknessLabel}</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Controls water content in your mix</p>
                <input type="range" min={1} max={5} step={1} value={thickness}
                  onChange={e => setThickness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Liquid</span><span>Extra Thick</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Customizable formula', 'Mixed fresh', 'Free shipping $50+'].map(t => (
            <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-2 space-y-2">
        <button onClick={handleAdd}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition
            ${added ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
          {added ? '✓ Added to Cart!' : `Add to Cart — ${gelQty} pouches · $${gelPrice.toFixed(2)}`}
        </button>
        <div className="flex gap-2">
          <button onClick={handleSaveFormula}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-1.5
              ${saved ? 'bg-green-900 text-green-300 border border-green-700' : 'border border-gray-700 text-gray-400 hover:border-gray-400 hover:text-white'}`}>
            {saved ? '✓ Saved!' : '🔖 Save Formula'}
          </button>
          {onGoToQuiz && (
            <button onClick={onGoToQuiz}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-gray-200 transition">
              🎯 Use Quiz →
            </button>
          )}
        </div>
        {saveMsg && (
          <p className={`text-xs text-center ${saveMsg.includes('Sign in') ? 'text-amber-400' : 'text-green-400'}`}>
            {saveMsg}
          </p>
        )}
      </div>
    </div>
  );
}