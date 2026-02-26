"use client";
import { useState } from 'react';

const questions = [
  { id: 'sport', text: 'What is your primary sport?', options: ['Running', 'Cycling', 'Triathlon', 'Trail / Ultra', 'Other'] },
  { id: 'duration', text: 'Average training duration?', options: ['Under 1 hour', '1–2 hours', '2–3 hours', '3+ hours'] },
  { id: 'sweat', text: 'How would you describe your sweat rate?', options: ['Light', 'Moderate', 'Heavy', 'Very Heavy / Very Salty'] },
  { id: 'gut', text: 'How sensitive is your stomach during intense efforts?', options: ['Iron Stomach', 'Normal', 'Somewhat Sensitive', 'Very Sensitive'] },
  { id: 'caffeine', text: 'Do you want caffeine in your gel?', options: ['Yes — every dose', 'Yes — race day only', 'No thanks'] },
  { id: 'flavor', text: 'What flavor sounds best?', options: ['Tropical Mango', 'Strawberry Lemonade', 'Orange Citrus', 'Watermelon Mint', 'Neutral / Unflavored'] },
  { id: 'thickness', text: 'What gel consistency do you prefer?', options: ['Thin & Liquid', 'Standard Gel', 'Thick & Concentrated'] },
];

// Maps quiz answers → numeric formula values
function buildFormula(answers) {
  // Carbs
  const durationMap = { 'Under 1 hour': 20, '1–2 hours': 30, '2–3 hours': 45, '3+ hours': 60 };
  const carbs = durationMap[answers.duration] ?? 30;

  // Sodium
  const sweatMap = { 'Light': 100, 'Moderate': 250, 'Heavy': 400, 'Very Heavy / Very Salty': 550 };
  const sodium = sweatMap[answers.sweat] ?? 250;

  // Caffeine
  const caffeineMap = { 'Yes — every dose': 75, 'Yes — race day only': 50, 'No thanks': 0 };
  const caffeine = caffeineMap[answers.caffeine] ?? 0;

  // Thickness (1–5 scale)
  const thicknessMap = { 'Thin & Liquid': 1, 'Standard Gel': 3, 'Thick & Concentrated': 5 };
  const thickness = thicknessMap[answers.thickness] ?? 3;

  // Flavor
  const flavor = answers.flavor ?? 'Neutral / Unflavored';

  // Gut sensitivity → fructose ratio (lower fructose = gentler)
  const gutMap = { 'Iron Stomach': 0.5, 'Normal': 0.35, 'Somewhat Sensitive': 0.25, 'Very Sensitive': 0.15 };
  const fructoseRatio = gutMap[answers.gut] ?? 0.35;

  return { carbs, sodium, caffeine, thickness, flavor, fructoseRatio };
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