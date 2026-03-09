"use client";
import { useState } from 'react';

const MAIN_QUESTIONS = [
  { id: 'sport',    text: 'What is your primary sport?',                        options: ['Running', 'Cycling', 'Triathlon', 'Trail / Ultra', 'Other'] },
  { id: 'duration', text: 'Average training duration?',                          options: ['Under 1 hour', '1–2 hours', '2–3 hours', '3+ hours'] },
  { id: 'sweat',    text: 'How would you describe your sweat rate?',             options: ['Light', 'Moderate', 'Heavy', 'Very Heavy / Very Salty'] },
  { id: 'gut',      text: 'How sensitive is your stomach during intense efforts?', options: ['Iron Stomach', 'Normal', 'Somewhat Sensitive', 'Very Sensitive'] },
  { id: 'caffeine', text: 'Do you want caffeine in your gel?',                   options: ['Yes — every dose', 'Caffeine only on race day', 'No thanks'] },
  { id: 'flavor',   text: 'What flavor sounds best?',                            options: ['Tropical Mango', 'Strawberry Lemonade', 'Orange Citrus', 'Watermelon Mint', 'Neutral / Unflavored'] },
  { id: 'thickness', text: 'What gel consistency do you prefer?',                options: ['Thin & Liquid', 'Standard Gel', 'Thick & Concentrated'] },
];

const RACE_DAY_QUESTIONS = [
  { id: 'rd_caffeine', text: 'How much caffeine do you want on race day?',      options: ['50mg — light boost', '75mg — moderate', '100mg — strong', '150mg — max'] },
  { id: 'rd_flavor',   text: 'Preferred flavor for your race day gel?',          options: ['Tropical Mango', 'Strawberry Lemonade', 'Orange Citrus', 'Watermelon Mint', 'Neutral / Unflavored'] },
  { id: 'rd_carbs',    text: 'Carb level for race day?',                         options: ['Standard (match training)', 'Higher — I push harder on race day', 'Max carbs — going all out'] },
];

function buildMainFormula(answers) {
  const durationMap  = { 'Under 1 hour': 20, '1–2 hours': 30, '2–3 hours': 45, '3+ hours': 60 };
  const sweatMap     = { 'Light': 100, 'Moderate': 250, 'Heavy': 400, 'Very Heavy / Very Salty': 550 };
  const thicknessMap = { 'Thin & Liquid': 1, 'Standard Gel': 3, 'Thick & Concentrated': 5 };
  const gutMap       = { 'Iron Stomach': 0.5, 'Normal': 0.35, 'Somewhat Sensitive': 0.25, 'Very Sensitive': 0.15 };

  return {
    carbs:         durationMap[answers.duration]  ?? 30,
    sodium:        sweatMap[answers.sweat]         ?? 250,
    caffeine:      0, // always 0 — race day only or no caffeine
    thickness:     thicknessMap[answers.thickness] ?? 3,
    flavor:        answers.flavor                  ?? 'Neutral / Unflavored',
    fructoseRatio: gutMap[answers.gut]             ?? 0.35,
  };
}

function buildRaceDayFormula(mainAnswers, rdAnswers) {
  const caffeineMap = {
    '50mg — light boost': 50,
    '75mg — moderate':    75,
    '100mg — strong':     100,
    '150mg — max':        150,
  };
  const carbBump = {
    'Standard (match training)': 0,
    'Higher — I push harder on race day': 15,
    'Max carbs — going all out': 30,
  };
  const baseCarbs = buildMainFormula(mainAnswers).carbs;

  return {
    ...buildMainFormula(mainAnswers),
    caffeine: caffeineMap[rdAnswers.rd_caffeine] ?? 75,
    flavor:   rdAnswers.rd_flavor ?? mainAnswers.flavor ?? 'Neutral / Unflavored',
    carbs:    baseCarbs + (carbBump[rdAnswers.rd_carbs] ?? 0),
  };
}

export default function Quiz({ onComplete }) {
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [selected, setSelected] = useState(null);
  const [phase, setPhase]       = useState('main'); // 'main' | 'race-day-intro' | 'race-day'
  const [rdStep, setRdStep]     = useState(0);
  const [rdAnswers, setRdAnswers] = useState({});

  const isRaceDayOnly = answers.caffeine === 'Caffeine only on race day';

  // ── RACE DAY INTRO SCREEN ────────────────────────────────────────────────
  if (phase === 'race-day-intro') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-4">🏁</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Almost there!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your training gel has been built with <strong>0mg caffeine</strong> — clean fuel for every day.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Now let's dial in your <strong>Race Day formula</strong> — we'll add caffeine and fine-tune it separately so you're primed when it counts.
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
    const q      = RACE_DAY_QUESTIONS[rdStep];
    const isLast = rdStep === RACE_DAY_QUESTIONS.length - 1;
    const progress = (rdStep / RACE_DAY_QUESTIONS.length) * 100;

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
        {/* Race day indicator */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            🏁 Race Day Formula
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>

        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          Race Day — Step {rdStep + 1} of {RACE_DAY_QUESTIONS.length}
        </p>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">{q.text}</h2>

        <div className="space-y-3 mb-6">
          {q.options.map(option => (
            <button key={option} onClick={() => setSelected(option)}
              className={`w-full border py-4 px-6 rounded-xl font-medium transition text-left
                ${selected === option
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-gray-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
                }`}>
              {option}
            </button>
          ))}
        </div>

        <button onClick={handleRdNext} disabled={!selected}
          className={`w-full py-4 rounded-xl font-bold transition
            ${selected
              ? 'bg-amber-500 text-white hover:bg-amber-400'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}>
          {isLast ? 'Build My Race Day Gel →' : 'Next →'}
        </button>
      </div>
    );
  }

  // ── MAIN QUIZ ────────────────────────────────────────────────────────────
  const q       = MAIN_QUESTIONS[step];
  const isLast  = step === MAIN_QUESTIONS.length - 1;
  const progress = (step / MAIN_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      // If they chose race day only caffeine, go to race day flow
      if (newAnswers.caffeine === 'Caffeine only on race day') {
        setPhase('race-day-intro');
      } else {
        // 'Yes — every dose' maps to 75mg; 'No thanks' maps to 0
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
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
        Diagnostic — Step {step + 1} of {MAIN_QUESTIONS.length}
      </p>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">{q.text}</h2>

      <div className="space-y-3 mb-6">
        {q.options.map(option => (
          <button key={option} onClick={() => setSelected(option)}
            className={`w-full border py-4 px-6 rounded-xl font-medium transition text-left
              ${selected === option
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-gray-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
              }`}>
            {option}
          </button>
        ))}
      </div>

      <button onClick={handleNext} disabled={!selected}
        className={`w-full py-4 rounded-xl font-bold transition
          ${selected
            ? 'bg-slate-900 text-white hover:bg-slate-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}>
        {isLast ? 'Build My Formula →' : 'Next →'}
      </button>
    </div>
  );
}