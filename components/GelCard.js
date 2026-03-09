"use client";
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

const FLAVORS = [
  { id: 'tropical-mango',    label: 'Tropical Mango',       emoji: '🥭' },
  { id: 'strawberry-lemon',  label: 'Strawberry Lemonade',  emoji: '🍓' },
  { id: 'orange-citrus',     label: 'Orange Citrus',        emoji: '🍊' },
  { id: 'watermelon-mint',   label: 'Watermelon Mint',      emoji: '🍉' },
  { id: 'neutral',           label: 'Neutral / Unflavored', emoji: '💧' },
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

// GelBuilder — one instance of the formula builder (used for both training + race day)
function GelBuilder({ formula, label, accentColor = 'white', quizGenerated = false }) {
  const { addItem } = useCart();
  const { user, saveFormula } = useAuth();
  const [saved, setSaved]               = useState(false);
  const [saveMsg, setSaveMsg]           = useState('');
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [formulaName, setFormulaName]   = useState('');

  const [carbs, setCarbs]               = useState(formula?.carbs         ?? 30);
  const [sodium, setSodium]             = useState(formula?.sodium        ?? 250);
  const [caffeine, setCaffeine]         = useState(formula?.caffeine      ?? 0);
  const [thickness, setThickness]       = useState(formula?.thickness     ?? 3);
  const [fructoseRatio, setFructoseRatio] = useState(formula?.fructoseRatio ?? 0.35);
  const [potassium, setPotassium]       = useState(100);
  const [magnesium, setMagnesium]       = useState(20);
  const [gelQty, setGelQty]             = useState(10);
  const [gelFlavor, setGelFlavor]       = useState(formula?.flavor        ?? 'Neutral / Unflavored');
  const [formulaOpen, setFormulaOpen]   = useState(true);
  const [added, setAdded]               = useState(false);

  // Snap sliders when formula prop changes
  useEffect(() => {
    if (!formula) return;
    if (formula.carbs         !== undefined) setCarbs(formula.carbs);
    if (formula.sodium        !== undefined) setSodium(formula.sodium);
    if (formula.caffeine      !== undefined) setCaffeine(formula.caffeine);
    if (formula.thickness     !== undefined) setThickness(formula.thickness);
    if (formula.fructoseRatio !== undefined) setFructoseRatio(formula.fructoseRatio);
    if (formula.flavor)                      setGelFlavor(formula.flavor);
  }, [formula]);

  const selectedFlavor  = FLAVORS.find(f => f.label === gelFlavor) || FLAVORS[4];
  const maltodextrin    = Math.round(carbs * (1 - fructoseRatio));
  const fructose        = Math.round(carbs * fructoseRatio);
  const thicknessLabel  = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'][thickness] || 'Standard';

  // Pricing
  const BASE_PRICE      = 1.20;
  const carbCost        = (maltodextrin * 0.008) + (fructose * 0.016);
  const electrolyteCost = (sodium * 0.0005) + (potassium * 0.001) + (magnesium * 0.002);
  const caffeineCost    = caffeine * 0.008;
  const flavorCost      = gelFlavor === 'Neutral / Unflavored' ? 0 : 0.10;
  const thicknessCost   = (thickness - 1) * 0.04;
  const unitPrice       = parseFloat((BASE_PRICE + carbCost + electrolyteCost + caffeineCost + flavorCost + thicknessCost).toFixed(2));
  const gelPrice        = parseFloat((gelQty * unitPrice).toFixed(2));

  const priceBreakdown = [
    { label: 'Base',                           value: BASE_PRICE },
    { label: `Carbs (${carbs}g)`,              value: parseFloat(carbCost.toFixed(3)) },
    { label: 'Electrolytes',                   value: parseFloat(electrolyteCost.toFixed(3)) },
    ...(caffeine > 0 ? [{ label: `Caffeine (${caffeine}mg)`, value: parseFloat(caffeineCost.toFixed(3)) }] : []),
    ...(flavorCost > 0 ? [{ label: 'Flavoring', value: flavorCost }] : []),
    ...(thicknessCost > 0 ? [{ label: 'Consistency', value: parseFloat(thicknessCost.toFixed(3)) }] : []),
  ];

  const handleAdd = () => {
    addItem({
      id:       `gel-${Date.now()}`,
      name:     `${label} (${gelQty} pouches)`,
      subtitle: `${carbs}g carbs · ${sodium}mg sodium${caffeine ? ` · ${caffeine}mg caffeine` : ''} · ${gelFlavor.split(' ')[0]} · $${unitPrice}/pouch`,
      emoji:    selectedFlavor.emoji,
      price:    gelPrice,
      qty:      1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleSaveFormula = async () => {
    if (!user) { setSaveMsg('Sign in to save formulas.'); setTimeout(() => setSaveMsg(''), 3000); return; }
    setFormulaName(`${gelFlavor.split(' ')[0]} · ${carbs}g carbs${caffeine ? ` · ${caffeine}mg caffeine` : ''}`);
    setNamePromptOpen(true);
  };

  const handleConfirmSave = async () => {
    const result = await saveFormula({
      name: formulaName.trim() || `${gelFlavor.split(' ')[0]} · ${carbs}g carbs`,
      carbs, sodium, caffeine, thickness, fructoseRatio, potassium, magnesium,
      flavor: gelFlavor, quizGenerated,
    });
    setNamePromptOpen(false);
    if (result?.error) { setSaveMsg(result.error); setTimeout(() => setSaveMsg(''), 3000); return; }
    setSaved(true);
    setSaveMsg('Formula saved!');
    setTimeout(() => { setSaved(false); setSaveMsg(''); }, 3000);
  };

  const isRaceDay = label?.toLowerCase().includes('race day');

  return (
    <div className="relative bg-black text-white rounded-2xl overflow-hidden flex flex-col shadow-xl">

      {/* Save name prompt */}
      {namePromptOpen && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white text-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-lg mb-1">Name Your Formula</h3>
            <p className="text-xs text-gray-400 mb-4">Give it a name you'll recognise later.</p>
            <input autoFocus value={formulaName} onChange={e => setFormulaName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmSave()}
              maxLength={60} placeholder="e.g. Race Day, Long Run Easy..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition mb-1" />
            <p className="text-xs text-gray-400 text-right mb-4">{formulaName.length}/60</p>
            <div className="flex gap-2">
              <button onClick={() => setNamePromptOpen(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirmSave}
                className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition">
                Save →
              </button>
            </div>
          </div>
        </div>
      )}

      {added && (
        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          ✓ Added!
        </span>
      )}

      {/* Label banner */}
      {isRaceDay ? (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-2">
          <span>🏁</span> Race Day Formula — with caffeine
        </div>
      ) : quizGenerated ? (
        <div className="bg-green-600 text-white text-xs font-bold px-4 py-2 flex items-center gap-2">
          <span>🎯</span> Training formula from your quiz — fine-tune below
        </div>
      ) : null}

      <div className="p-8 pb-4 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Custom Gel Powder</span>
            <h2 className="text-2xl font-extrabold mt-1">{label}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">${unitPrice.toFixed(2)}</p>
            <p className="text-gray-500 text-xs">per pouch</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          {isRaceDay
            ? 'Your race day edge. Caffeine-loaded and carb-optimized — mixed fresh when you order.'
            : 'Your formula, mixed fresh. Dial in every variable — carbs, electrolytes, texture — then we mix and ship.'}
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

        {/* Qty */}
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

        {/* Live formula summary */}
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

        {/* Toggle formula builder */}
        <button onClick={() => setFormulaOpen(o => !o)}
          className="w-full border border-gray-700 text-gray-400 py-2.5 rounded-xl font-medium text-sm hover:border-gray-400 hover:text-white transition flex items-center justify-center gap-2">
          {formulaOpen ? '▲ Hide Formula Builder' : '▼ Customize Formula'}
        </button>

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
              <Slider label="Sodium"    unit="mg" min={0} max={600} step={25} value={sodium}    onChange={setSodium} />
              <Slider label="Potassium" unit="mg" min={0} max={300} step={10} value={potassium} onChange={setPotassium} />
              <Slider label="Magnesium" unit="mg" min={0} max={80}  step={5}  value={magnesium} onChange={setMagnesium} />
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

        <div className="flex flex-wrap gap-2 mt-4">
          {['Customizable formula', 'Mixed fresh', 'Free shipping $50+'].map(t => (
            <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="p-6 pt-2 space-y-2">
        <button onClick={handleAdd}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition
            ${added ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
          {added ? '✓ Added to Cart!' : `Add to Cart — ${gelQty} pouches · $${gelPrice.toFixed(2)}`}
        </button>
        <button onClick={handleSaveFormula}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-1.5
            ${saved ? 'bg-green-900 text-green-300 border border-green-700' : 'border border-gray-700 text-gray-400 hover:border-gray-400 hover:text-white'}`}>
          {saved ? '✓ Saved!' : '🔖 Save Formula'}
        </button>
        {saveMsg && (
          <p className={`text-xs text-center ${saveMsg.includes('Sign in') ? 'text-amber-400' : 'text-green-400'}`}>
            {saveMsg}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main export — renders one or two builders depending on quiz result ─────────
export default function GelCard({ quizFormula, startOpen = false, onGoToQuiz }) {
  // quizFormula shape from Quiz.js:
  //   { main: FormulaObject, raceDay?: FormulaObject, raceDaySkipped?: boolean }
  // Legacy shape (direct formula object with no .main) also supported
  const hasNewShape = quizFormula && quizFormula.main !== undefined;
  const mainFormula = hasNewShape ? quizFormula.main : quizFormula;
  const raceDayFormula = hasNewShape ? quizFormula.raceDay : null;
  const quizGenerated = !!quizFormula;

  return (
    <div className="space-y-6">
      <GelBuilder
        formula={mainFormula}
        label="Custom Gel Powder"
        quizGenerated={quizGenerated}
      />
      {raceDayFormula && (
        <GelBuilder
          formula={raceDayFormula}
          label="Race Day Gel"
          quizGenerated={true}
        />
      )}
    </div>
  );
}