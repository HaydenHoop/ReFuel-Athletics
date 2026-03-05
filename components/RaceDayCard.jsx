"use client";
import { useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useCommunity } from './CommunityContext';

const FLAVORS = [
  { id: 'tropical-mango',   label: 'Tropical Mango',       emoji: '🥭' },
  { id: 'strawberry-lemon', label: 'Strawberry Lemonade',  emoji: '🍓' },
  { id: 'orange-citrus',    label: 'Orange Citrus',         emoji: '🍊' },
  { id: 'watermelon-mint',  label: 'Watermelon Mint',       emoji: '🍉' },
  { id: 'neutral',          label: 'Neutral / Unflavored',  emoji: '💧' },
];

const RACE_QUIZ = [
  {
    id: 'distance',
    text: 'What is your race distance?',
    options: ['5K / 10K', 'Half Marathon', 'Marathon', '50K / 50 Mile', '100 Mile+'],
  },
  {
    id: 'temp',
    text: 'Expected race day temperature?',
    options: ['Cold (< 45°F)', 'Cool (45–60°F)', 'Moderate (60–75°F)', 'Hot (75–85°F)', 'Very Hot (85°F+)'],
  },
  {
    id: 'startTime',
    text: 'What time does your race start?',
    options: ['Early morning (before 7am)', 'Morning (7–10am)', 'Midday (10am–1pm)', 'Afternoon (1pm+)'],
  },
  {
    id: 'intensity',
    text: 'How would you describe your race pace?',
    options: ['All-out effort', 'Hard but controlled', 'Steady endurance pace', 'Survival / completion'],
  },
  {
    id: 'terrain',
    text: 'What is the race terrain like?',
    options: ['Flat road', 'Rolling hills', 'Mountainous / technical', 'Mixed trail'],
  },
];

function buildRaceFormula(answers, base) {
  let { carbs, sodium, caffeine, thickness, fructoseRatio, flavor } = base;

  // Distance → more carbs for longer races
  const distanceCarbMap = {
    '5K / 10K': 0.8, 'Half Marathon': 0.95, 'Marathon': 1.0,
    '50K / 50 Mile': 1.1, '100 Mile+': 1.15,
  };
  carbs = Math.round(Math.min(90, carbs * (distanceCarbMap[answers.distance] ?? 1.0)));

  // Temperature → more sodium when hot
  const tempSodiumMap = {
    'Cold (< 45°F)': 0.8, 'Cool (45–60°F)': 0.9, 'Moderate (60–75°F)': 1.0,
    'Hot (75–85°F)': 1.2, 'Very Hot (85°F+)': 1.4,
  };
  sodium = Math.round(Math.min(700, sodium * (tempSodiumMap[answers.temp] ?? 1.0)));

  // Start time → more caffeine for early starts (circadian boost), less midday
  const timeCaffeineMap = {
    'Early morning (before 7am)': 1.2,
    'Morning (7–10am)': 1.1,
    'Midday (10am–1pm)': 1.0,
    'Afternoon (1pm+)': 0.9,
  };
  caffeine = Math.round(Math.min(150, caffeine * (timeCaffeineMap[answers.startTime] ?? 1.0)));

  // Intensity → higher intensity = more carbs, thinner gel
  const intensityMap = {
    'All-out effort':          { carbMult: 1.1, thicknessAdj: -1 },
    'Hard but controlled':     { carbMult: 1.05, thicknessAdj: 0 },
    'Steady endurance pace':   { carbMult: 1.0, thicknessAdj: 0 },
    'Survival / completion':   { carbMult: 0.9, thicknessAdj: 1 },
  };
  const intMap = intensityMap[answers.intensity] ?? { carbMult: 1.0, thicknessAdj: 0 };
  carbs     = Math.round(Math.min(90, carbs * intMap.carbMult));
  thickness = Math.min(5, Math.max(1, thickness + intMap.thicknessAdj));

  // Terrain → trail needs more sodium (more sweat variance), thicker gel
  if (answers.terrain === 'Mountainous / technical' || answers.terrain === 'Mixed trail') {
    sodium    = Math.min(700, Math.round(sodium * 1.1));
    thickness = Math.min(5, thickness + 1);
  }

  return { carbs, sodium, caffeine, thickness, fructoseRatio, flavor, isRaceDay: true };
}

// ── Race Day Quiz Modal ───────────────────────────────────────────────────────
function RaceDayQuizModal({ isOpen, onClose, baseFormula, onComplete }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const isLast = step === RACE_QUIZ.length - 1;
  const progress = (step / RACE_QUIZ.length) * 100;

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [RACE_QUIZ[step].id]: selected };
    setAnswers(newAnswers);
    setSelected(null);
    if (isLast) {
      onComplete(buildRaceFormula(newAnswers, baseFormula));
      // reset for next time
      setStep(0); setAnswers({}); setSelected(null);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleClose = () => {
    setStep(0); setAnswers({}); setSelected(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-950 border border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Race Day Optimizer</p>
            <h2 className="text-lg font-extrabold text-white mt-0.5">Dial In Your Race Formula</h2>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Progress */}
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-5">
            <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>

          <p className="text-xs font-bold text-amber-400/60 uppercase tracking-widest mb-3">
            Step {step + 1} of {RACE_QUIZ.length}
          </p>
          <h3 className="text-xl font-bold text-white mb-5">{RACE_QUIZ[step].text}</h3>

          <div className="space-y-2.5 mb-6">
            {RACE_QUIZ[step].options.map(option => (
              <button key={option} onClick={() => setSelected(option)}
                className={`w-full border py-3.5 px-5 rounded-xl font-medium transition text-left text-sm
                  ${selected === option
                    ? 'border-amber-400 bg-amber-400/10 text-amber-200'
                    : 'border-gray-700 text-gray-300 hover:border-amber-500/50 hover:text-amber-100'
                  }`}>
                {option}
              </button>
            ))}
          </div>

          <button onClick={handleNext} disabled={!selected}
            className={`w-full py-3.5 rounded-xl font-bold transition text-sm
              ${selected ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
            {isLast ? 'Build My Race Formula →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share Modal (community) ───────────────────────────────────────────────────
function ShareToComModal({ isOpen, onClose, formula }) {
  const { user } = useAuth();
  const { shareFormula } = useCommunity();
  const [name, setName]           = useState(formula?.name || 'Race Day Formula');
  const [description, setDesc]    = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setError('');
    if (!name.trim()) { setError('Please give your formula a name.'); return; }
    setLoading(true);
    const result = await shareFormula(user, {
      name, description, anonymous,
      tags: ['race-day'],
      carbs:         formula.carbs,
      sodium:        formula.sodium,
      potassium:     formula.potassium ?? 100,
      magnesium:     formula.magnesium ?? 20,
      caffeine:      formula.caffeine,
      fructoseRatio: formula.fructoseRatio,
      thickness:     formula.thickness,
      flavor:        formula.flavor,
    });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Share to Community</h2>
            <p className="text-xs text-gray-400">Post your race day formula</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-bold text-gray-900">Shared to community!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Formula Name</label>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Description (optional)</label>
                <textarea value={description} onChange={e => setDesc(e.target.value)}
                  rows={3} maxLength={300} placeholder="What race is this for? Any tips?"
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="accent-black" />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button onClick={handleShare} disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50">
                {loading ? 'Sharing...' : 'Share Formula →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const RACE_DAY_PREMIUM = 0.45;

function Slider({ label, unit, min, max, step = 1, value, onChange, description }) {
  return (
    <div className="mb-4">
      <label className="flex justify-between text-sm font-medium text-amber-200 mb-1">
        <span>{label}</span>
        <span className="font-bold text-white">{value}{unit}</span>
      </label>
      {description && <p className="text-xs text-amber-400/60 mb-2">{description}</p>}
      <input type="range" min={min} max={max} step={step} value={value}
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

export default function RaceDayCard({ quizRaceDayFormula, autoAdded = false }) {
  const { addItem } = useCart();
  const { user }    = useAuth();

  const defaults = quizRaceDayFormula || {
    carbs: 60, sodium: 400, caffeine: 75, thickness: 3,
    fructoseRatio: 0.35, flavor: 'Tropical Mango',
  };

  const [carbs, setCarbs]                   = useState(defaults.carbs);
  const [sodium, setSodium]                 = useState(defaults.sodium);
  const [caffeine, setCaffeine]             = useState(defaults.caffeine || 75);
  const [thickness, setThickness]           = useState(defaults.thickness);
  const [fructoseRatio, setFructoseRatio]   = useState(defaults.fructoseRatio);
  const [gelFlavor, setGelFlavor]           = useState(defaults.flavor || 'Tropical Mango');
  const [gelQty, setGelQty]                 = useState(10);
  const [formulaOpen, setFormulaOpen]       = useState(false);
  const [added, setAdded]                   = useState(false);
  const [quizOpen, setQuizOpen]             = useState(false);
  const [shareOpen, setShareOpen]           = useState(false);
  const [optimized, setOptimized]           = useState(false);

  const selectedFlavor = FLAVORS.find(f => f.label === gelFlavor) || FLAVORS[0];
  const maltodextrin   = Math.round(carbs * (1 - fructoseRatio));
  const fructose       = Math.round(carbs * fructoseRatio);
  const thicknessLabel = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'][thickness] || 'Standard';

  const BASE_PRICE     = 1.20;
  const carbCost       = (maltodextrin * 0.008) + (fructose * 0.016);
  const electrolyteCost= (sodium * 0.0005) + (100 * 0.001) + (20 * 0.002);
  const caffeineCost   = caffeine * 0.008;
  const flavorCost     = gelFlavor === 'Neutral / Unflavored' ? 0 : 0.10;
  const thicknessCost  = (thickness - 1) * 0.04;
  const unitPrice      = parseFloat((BASE_PRICE + carbCost + electrolyteCost + caffeineCost + flavorCost + thicknessCost + RACE_DAY_PREMIUM).toFixed(2));
  const gelPrice       = parseFloat((gelQty * unitPrice).toFixed(2));

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

  const handleQuizComplete = (newFormula) => {
    setCarbs(newFormula.carbs);
    setSodium(newFormula.sodium);
    setCaffeine(newFormula.caffeine);
    setThickness(newFormula.thickness);
    setFructoseRatio(newFormula.fructoseRatio);
    setOptimized(true);
    setQuizOpen(false);
  };

  const currentFormula = { carbs, sodium, caffeine, thickness, fructoseRatio, flavor: gelFlavor };

  return (
    <>
      <RaceDayQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        baseFormula={currentFormula}
        onComplete={handleQuizComplete}
      />
      <ShareToComModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        formula={currentFormula}
      />

      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950 border border-amber-500/30 rounded-2xl overflow-hidden flex flex-col shadow-xl">

        {autoAdded && !optimized && (
          <div className="bg-amber-500 text-black text-xs font-bold text-center py-2 px-4 tracking-wide">
            ⚡ Quiz formula loaded — optimize further below
          </div>
        )}
        {optimized && (
          <div className="bg-green-500 text-black text-xs font-bold text-center py-2 px-4 tracking-wide">
            ✓ Formula optimized for your race
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

          <p className="text-amber-200/60 text-sm mb-4 leading-relaxed">
            Your peak-performance formula. Higher carbs, elevated sodium, and a precision caffeine hit — engineered for race day, not training.
          </p>

          {/* Race Day Quiz button */}
          <button onClick={() => setQuizOpen(true)}
            className="w-full mb-5 flex items-center justify-between px-4 py-3 rounded-xl border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 transition group">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏁</span>
              <div className="text-left">
                <p className="text-sm font-bold text-amber-300 group-hover:text-amber-200">Optimize for your race</p>
                <p className="text-xs text-amber-500/60">5 questions · distance, temp, terrain & more</p>
              </div>
            </div>
            <span className="text-amber-400 text-sm">→</span>
          </button>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Carbs',    value: `${carbs}g`,     sub: 'per pouch' },
              { label: 'Sodium',   value: `${sodium}mg`,   sub: 'electrolyte' },
              { label: 'Caffeine', value: `${caffeine}mg`, sub: 'per pouch' },
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
            {formulaOpen ? 'Hide' : 'Fine-tune'} Sliders
          </button>

          {formulaOpen && (
            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-4 mb-4 space-y-1">
              <Slider label="Carbs" unit="g" min={20} max={90} value={carbs} onChange={setCarbs}
                description="Higher is more fuel — but test gut tolerance first" />
              <Slider label="Caffeine" unit="mg" min={25} max={150} value={caffeine} onChange={setCaffeine}
                description="Recommended 1–2mg/kg body weight" />
              <Slider label="Sodium" unit="mg" min={50} max={700} value={sodium} onChange={setSodium}
                description="Match your sweat rate" />
              <Slider label="Maltodextrin : Fructose" unit="" min={0.1} max={0.6} step={0.05}
                value={fructoseRatio} onChange={setFructoseRatio}
                description={`${maltodextrin}g maltodextrin · ${fructose}g fructose`} />
              <Slider label="Consistency" unit="" min={1} max={5} value={thickness} onChange={setThickness}
                description={thicknessLabel} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 mt-auto space-y-2">
          <button onClick={handleAdd}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition
              ${added ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
            {added ? '✓ Added to Cart!' : `Add Race Day Gel — $${gelPrice.toFixed(2)}`}
          </button>
          {user && (
            <button onClick={() => setShareOpen(true)}
              className="w-full py-2.5 rounded-xl font-medium text-sm text-amber-400/70 border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-300 transition">
              🌐 Share to Community
            </button>
          )}
          <p className="text-center text-xs text-amber-400/40">+${RACE_DAY_PREMIUM.toFixed(2)}/pouch premium over training gel</p>
        </div>
      </div>
    </>
  );
}