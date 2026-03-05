"use client";
import { useState } from 'react';

const questions = [
  { id: 'sport',    text: 'What is your primary sport?',                          options: ['Running', 'Cycling', 'Triathlon', 'Trail / Ultra', 'Other'] },
  { id: 'duration', text: 'Average training duration?',                           options: ['Under 1 hour', '1–2 hours', '2–3 hours', '3+ hours'] },
  { id: 'weight',   text: 'What is your body weight?',                            options: ['Under 130 lbs', '130–160 lbs', '160–190 lbs', '190+ lbs'] },
  { id: 'sweat',    text: 'How would you describe your sweat rate?',               options: ['Light', 'Moderate', 'Heavy', 'Very Heavy / Very Salty'] },
  { id: 'gut',      text: 'How sensitive is your stomach during intense efforts?', options: ['Iron Stomach', 'Normal', 'Somewhat Sensitive', 'Very Sensitive'] },
  { id: 'caffeine', text: 'Do you want caffeine in your gel?',                     options: ['Yes — every dose', 'Yes — race day only', 'No thanks'] },
  { id: 'flavor',   text: 'What flavor sounds best?',                              options: ['Tropical Mango', 'Strawberry Lemonade', 'Orange Citrus', 'Watermelon Mint', 'Neutral / Unflavored'] },
  { id: 'thickness',text: 'What gel consistency do you prefer?',                   options: ['Thin & Liquid', 'Standard Gel', 'Thick & Concentrated'] },
];

// Maps quiz answers → numeric formula values
function buildFormula(answers) {
  // Body weight in kg (midpoint of each range)
  const weightKgMap = {
    'Under 130 lbs': 56,
    '130–160 lbs':   65,
    '160–190 lbs':   79,
    '190+ lbs':      95,
  };
  const weightKg = weightKgMap[answers.weight] ?? 70;

  // Carbs — base from duration, scaled by weight
  const durationBaseMap = { 'Under 1 hour': 20, '1–2 hours': 30, '2–3 hours': 45, '3+ hours': 60 };
  const durationBase = durationBaseMap[answers.duration] ?? 30;
  const weightMultiplier = weightKg / 70;
  const carbs = Math.round(Math.min(90, Math.max(15, durationBase * weightMultiplier)));

  // Sodium — sweat rate + weight adjustment
  const sweatBaseMap = { 'Light': 100, 'Moderate': 250, 'Heavy': 400, 'Very Heavy / Very Salty': 550 };
  const sodiumBase = sweatBaseMap[answers.sweat] ?? 250;
  const sodiumWeightBump = Math.round((weightKg - 70) * 1.5);
  const sodium = Math.min(700, Math.max(50, sodiumBase + sodiumWeightBump));

  // Caffeine per kg
  const caffeineDose = {
    'Yes — every dose':    Math.round(Math.min(150, weightKg * 1.0)),
    'Yes — race day only': Math.round(Math.min(120, weightKg * 0.8)),
    'No thanks': 0,
  };
  const caffeineAnswer = answers.caffeine ?? 'No thanks';

  // If race day only: training gel has 0 caffeine, race day gel gets full dose
  const caffeine = caffeineAnswer === 'Yes — race day only' ? 0 : (caffeineDose[caffeineAnswer] ?? 0);

  const thicknessMap = { 'Thin & Liquid': 1, 'Standard Gel': 3, 'Thick & Concentrated': 5 };
  const thickness = thicknessMap[answers.thickness] ?? 3;
  const flavor = answers.flavor ?? 'Neutral / Unflavored';
  const gutMap = { 'Iron Stomach': 0.5, 'Normal': 0.35, 'Somewhat Sensitive': 0.25, 'Very Sensitive': 0.15 };
  const fructoseRatio = gutMap[answers.gut] ?? 0.35;

  const baseFormula = { carbs, sodium, caffeine, thickness, flavor, fructoseRatio, weightKg };

  // Race day formula — higher carbs, boosted sodium, full caffeine dose
  if (caffeineAnswer === 'Yes — race day only') {
    const raceDayFormula = {
      ...baseFormula,
      caffeine:      caffeineDose['Yes — race day only'],
      carbs:         Math.round(Math.min(90, carbs * 1.15)), // 15% more carbs for race intensity
      sodium:        Math.min(700, Math.round(sodium * 1.2)), // 20% more sodium for race sweat
      isRaceDay:     true,
    };
    return { ...baseFormula, raceDayFormula };
  }

  return baseFormula;
}

export default function Quiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const isLast = step === questions.length - 1;

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [questions[step].id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      onComplete(buildFormula(newAnswers));
    } else {
      setStep(step + 1);
    }
  };

  const progress = ((step) / questions.length) * 100;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
        Diagnostic — Step {step + 1} of {questions.length}
      </p>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">{questions[step].text}</h2>

      <div className="space-y-3 mb-6">
        {questions[step].options.map(option => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`w-full border py-4 px-6 rounded-xl font-medium transition text-left
              ${selected === option
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-gray-200 text-slate-700 hover:border-slate-900 hover:text-slate-900'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selected}
        className={`w-full py-4 rounded-xl font-bold transition
          ${selected
            ? 'bg-slate-900 text-white hover:bg-slate-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
      >
        {isLast ? 'Build My Formula →' : 'Next →'}
      </button>
    </div>
  );
}