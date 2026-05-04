"use client";
import { useState } from 'react';

const MAIN_QUESTIONS = [
  { id: 'sport',     text: 'What is your primary sport?',                           options: ['Running', 'Cycling', 'Triathlon', 'Trail / Ultra', 'Other'] },
  { id: 'duration',  text: 'Average training duration?',                             options: ['Under 1 hour', '1–2 hours', '2–3 hours', '3+ hours'] },
  { id: 'sweat',     text: 'How would you describe your sweat rate?',                options: ['Light', 'Moderate', 'Heavy', 'Very Heavy / Very Salty'] },
  { id: 'gut',       text: 'How sensitive is your stomach during intense efforts?',  options: ['Iron Stomach', 'Normal', 'Somewhat Sensitive', 'Very Sensitive'] },
  { id: 'caffeine',  text: 'Do you want caffeine in your gel?',                      options: ['Yes — every dose', 'Caffeine only on race day', 'No thanks'] },
  { id: 'flavor',    text: 'What flavor sounds best?',                               options: ['Tropical Mango', 'Lemon Raspberry', 'Passionfruit', 'Maple', 'Rootbeer'] },
  { id: 'thickness', text: 'What gel consistency do you prefer?',                   options: ['Thin & Liquid', 'Standard Gel', 'Thick & Concentrated'] },
];

const RACE_DAY_QUESTIONS = [
  {
    id: 'rd_distance',
    text: "What's your race distance?",
    hint: 'Longer races mean more total carbs and sodium needed.',
    options: ['5K / 10K', 'Half Marathon', 'Marathon', '50K / Ultra', 'Triathlon / Multi-sport'],
  },
  {
    id: 'rd_effort',
    text: 'How hard are you planning to push?',
    hint: 'Higher intensity increases carb burn rate and sweat loss.',
    options: ['Comfortable pace — enjoy the ride', 'Steady effort — race well', 'Hard effort — PR attempt', 'All out — leave nothing on the table'],
  },
  {
    id: 'rd_hills',
    text: 'How hilly is the course?',
    hint: 'Climbing burns more carbs; technical descents slow you but not your sweat glands.',
    options: ['Flat — minimal elevation', 'Rolling — some hills', 'Hilly — significant climbing', 'Mountain / Very technical'],
  },
  {
    id: 'rd_weather',
    text: 'What weather are you expecting?',
    hint: 'Heat dramatically increases fluid and sodium loss.',
    options: ['Cool (< 55°F / 13°C)', 'Mild (55–70°F / 13–21°C)', 'Warm (70–80°F / 21–27°C)', 'Hot (> 80°F / 27°C)'],
  },
  {
    id: 'rd_caffeine',
    text: 'How much caffeine do you want on race day?',
    hint: 'Research suggests 3–6mg/kg body weight for performance. Most athletes do well at 75–100mg per gel.',
    options: ['50mg — light edge', '75mg — moderate boost', '100mg — strong', '150mg — maximum'],
  },
  {
    id: 'rd_thickness',
    text: 'Preferred consistency for your race day gel?',
    hint: 'Thinner gels are easier to take on the run; thicker gels are more concentrated.',
    options: ['Thin & Liquid — easy to take fast', 'Standard Gel — balanced', 'Thick & Concentrated — fewer sips needed'],
  },
  {
    id: 'rd_flavor',
    text: 'Preferred flavor for your race day gel?',
    hint: 'Flavor fatigue is real on long races — choose something you genuinely enjoy.',
    options: ['Tropical Mango', 'Strawberry Lemonade', 'Orange Citrus', 'Watermelon Mint', 'Neutral / Unflavored'],
  },
  {
    id: 'rd_carbs',
    text: 'How do you want to set your race day carb load?',
    hint: 'More carbs = more fuel, but also more GI stress. Match to what your gut can handle at race pace.',
    options: ['Match my training formula', 'Bump it up — I push harder on race day', 'Max carbs — going all out'],
  },
];

// ── Formula builders ─────────────────────────────────────────────────────────

function buildMainFormula(answers) {
  const durationMap  = { 'Under 1 hour': 20, '1–2 hours': 30, '2–3 hours': 45, '3+ hours': 60 };
  const sweatMap     = { 'Light': 100, 'Moderate': 250, 'Heavy': 400, 'Very Heavy / Very Salty': 550 };
  const thicknessMap = { 'Thin & Liquid': 1, 'Standard Gel': 3, 'Thick & Concentrated': 5 };
  const gutMap       = { 'Iron Stomach': 0.5, 'Normal': 0.35, 'Somewhat Sensitive': 0.25, 'Very Sensitive': 0.15 };

  return {
    carbs:         durationMap[answers.duration]  ?? 30,
    sodium:        sweatMap[answers.sweat]         ?? 250,
    caffeine:      0,
    thickness:     thicknessMap[answers.thickness] ?? 3,
    flavor:        answers.flavor                  ?? 'Neutral / Unflavored',
    fructoseRatio: gutMap[answers.gut]             ?? 0.35,
  };
}

function buildRaceDayFormula(mainAnswers, rdAnswers) {
  const base = buildMainFormula(mainAnswers);

  // Caffeine
  const caffeineMap = {
    '50mg — light edge': 50, '75mg — moderate boost': 75,
    '100mg — strong': 100,   '150mg — maximum': 150,
  };

  // Carbs — start from main, apply distance bump, then effort bump, then hills, then user choice
  const distanceCarbBump = {
    '5K / 10K': -5, 'Half Marathon': 0, 'Marathon': 10,
    '50K / Ultra': 20, 'Triathlon / Multi-sport': 10,
  };
  const effortCarbBump = {
    'Comfortable pace — enjoy the ride': -5, 'Steady effort — race well': 0,
    'Hard effort — PR attempt': 10,          'All out — leave nothing on the table': 15,
  };
  const hillsCarbBump = {
    'Flat — minimal elevation': 0,       'Rolling — some hills': 5,
    'Hilly — significant climbing': 10,  'Mountain / Very technical': 15,
  };
  const userCarbBump = {
    'Match my training formula': 0, 'Bump it up — I push harder on race day': 10,
    'Max carbs — going all out': 25,
  };

  const totalCarbBump =
    (distanceCarbBump[rdAnswers.rd_distance] ?? 0) +
    (effortCarbBump[rdAnswers.rd_effort]     ?? 0) +
    (hillsCarbBump[rdAnswers.rd_hills]       ?? 0) +
    (userCarbBump[rdAnswers.rd_carbs]        ?? 0);

  const carbs = Math.min(90, Math.max(20, base.carbs + totalCarbBump));

  // Sodium — heat and hills push it up; distance too
  const weatherSodiumBump = {
    'Cool (< 55°F / 13°C)': -50, 'Mild (55–70°F / 13–21°C)': 0,
    'Warm (70–80°F / 21–27°C)': 75, 'Hot (> 80°F / 27°C)': 150,
  };
  const distanceSodiumBump = {
    '5K / 10K': -50, 'Half Marathon': 0, 'Marathon': 50,
    '50K / Ultra': 100, 'Triathlon / Multi-sport': 50,
  };
  const hillsSodiumBump = {
    'Flat — minimal elevation': 0, 'Rolling — some hills': 25,
    'Hilly — significant climbing': 50, 'Mountain / Very technical': 75,
  };

  const totalSodiumBump =
    (weatherSodiumBump[rdAnswers.rd_weather] ?? 0) +
    (distanceSodiumBump[rdAnswers.rd_distance] ?? 0) +
    (hillsSodiumBump[rdAnswers.rd_hills] ?? 0);

  const sodium = Math.min(600, Math.max(50, base.sodium + totalSodiumBump));

  // Thickness
  const thicknessMap = {
    'Thin & Liquid — easy to take fast': 1,
    'Standard Gel — balanced': 3,
    'Thick & Concentrated — fewer sips needed': 5,
  };

  return {
    ...base,
    carbs,
    sodium,
    caffeine:  caffeineMap[rdAnswers.rd_caffeine] ?? 75,
    thickness: thicknessMap[rdAnswers.rd_thickness] ?? base.thickness,
    flavor:    rdAnswers.rd_flavor ?? mainAnswers.flavor ?? 'Neutral / Unflavored',
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Quiz({ onComplete, raceDayOnly = false }) {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState({});
  const [selected, setSelected]   = useState(null);
  const [phase, setPhase]         = useState(raceDayOnly ? 'race-day' : 'main'); // 'main' | 'race-day-intro' | 'race-day'
  const [rdStep, setRdStep]       = useState(0);
  const [rdAnswers, setRdAnswers] = useState({});

  // ── RACE DAY INTRO ───────────────────────────────────────────────────────
  if (phase === 'race-day-intro') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-4">🏁</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Training formula locked in!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your everyday gel has been built with <strong>0mg caffeine</strong> — clean, consistent fuel for training.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Now let's build your <strong>Race Day formula</strong>. We'll ask about your race conditions so we can dial in the carbs, sodium, caffeine, and consistency specifically for race day.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setPhase('race-day')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition"
          >
            Build My Race Day Gel →
          </button>
          <button
            onClick={() => onComplete({ main: buildMainFormula(answers), raceDaySkipped: true })}
            className="w-full text-sm text-gray-400 underline underline-offset-2 hover:text-gray-700 transition py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // ── RACE DAY QUESTIONS ───────────────────────────────────────────────────
  if (phase === 'race-day') {
    const q       = RACE_DAY_QUESTIONS[rdStep];
    const isLast  = rdStep === RACE_DAY_QUESTIONS.length - 1;
    const progress = ((rdStep + 1) / RACE_DAY_QUESTIONS.length) * 100;

    const handleRdNext = () => {
      if (!selected) return;
      const newRd = { ...rdAnswers, [q.id]: selected };
      setRdAnswers(newRd);
      setSelected(null);
      if (isLast) {
        onComplete({
          main:    buildMainFormula(answers),
          raceDay: buildRaceDayFormula(answers, newRd),
        });
      } else {
        setRdStep(rdStep + 1);
      }
    };

    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            🏁 Race Day Formula
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
          <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 text-right mb-5">
          {rdStep + 1} / {RACE_DAY_QUESTIONS.length}
        </p>

        <h2 className="text-2xl font-bold mb-2 text-slate-900">{q.text}</h2>
        {q.hint && (
          <p className="text-xs text-gray-400 leading-relaxed mb-5 italic">{q.hint}</p>
        )}

        <div className="space-y-3 mb-6">
          {q.options.map(option => (
            <button key={option} onClick={() => setSelected(option)}
              className={`w-full border py-4 px-6 rounded-xl font-medium transition text-left
                ${selected === option
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-gray-200 text-slate-700 hover:border-slate-400 hover:text-slate-900'
                }`}>
              {option}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {rdStep > 0 && (
            <button
              onClick={() => { setRdStep(rdStep - 1); setSelected(rdAnswers[RACE_DAY_QUESTIONS[rdStep - 1].id] ?? null); }}
              className="px-5 py-4 rounded-xl font-semibold text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-800 transition text-sm"
            >
              ← Back
            </button>
          )}
          <button onClick={handleRdNext} disabled={!selected}
            className={`flex-1 py-4 rounded-xl font-bold transition
              ${selected
                ? 'bg-amber-500 text-white hover:bg-amber-400'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}>
            {isLast ? 'Build My Race Day Gel →' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN QUIZ ────────────────────────────────────────────────────────────
  const q       = MAIN_QUESTIONS[step];
  const isLast  = step === MAIN_QUESTIONS.length - 1;
  const progress = ((step + 1) / MAIN_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      if (newAnswers.caffeine === 'Caffeine only on race day') {
        setPhase('race-day-intro');
      } else {
        const caffeineMap = { 'Yes — every dose': 75, 'No thanks': 0 };
        onComplete({
          main: {
            ...buildMainFormula(newAnswers),
            caffeine: caffeineMap[newAnswers.caffeine] ?? 0,
          }
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
        <div className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-gray-400 text-right mb-5">
        {step + 1} / {MAIN_QUESTIONS.length}
      </p>

      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Diagnostic</p>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">{q.text}</h2>

      <div className="space-y-3 mb-6">
        {q.options.map(option => (
          <button key={option} onClick={() => setSelected(option)}
            className={`w-full border py-4 px-6 rounded-xl font-medium transition text-left
              ${selected === option
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-gray-200 text-slate-700 hover:border-slate-400 hover:text-slate-900'
              }`}>
            {option}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => { setStep(step - 1); setSelected(answers[MAIN_QUESTIONS[step - 1].id] ?? null); }}
            className="px-5 py-4 rounded-xl font-semibold text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-800 transition text-sm"
          >
            ← Back
          </button>
        )}
        <button onClick={handleNext} disabled={!selected}
          className={`flex-1 py-4 rounded-xl font-bold transition
            ${selected
              ? 'bg-slate-900 text-white hover:bg-slate-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}>
          {isLast ? 'Build My Formula →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}