"use client";
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const METRICS = [
  { key: 'carbs',      label: 'Carbs',      unit: 'g',  icon: '⚡', color: 'bg-yellow-400', higher: true },
  { key: 'sodium',     label: 'Sodium',     unit: 'mg', icon: '🧂', color: 'bg-blue-400',   higher: false },
  { key: 'caffeine',   label: 'Caffeine',   unit: 'mg', icon: '☕', color: 'bg-amber-500',  higher: false },
  { key: 'potassium',  label: 'Potassium',  unit: 'mg', icon: '⚗️', color: 'bg-purple-400', higher: false },
  { key: 'magnesium',  label: 'Magnesium',  unit: 'mg', icon: '💊', color: 'bg-green-400',  higher: false },
];

function val(formula, key) {
  const v = parseFloat(formula?.[key] ?? 0);
  return isNaN(v) ? 0 : v;
}

function Bar({ value, max, color, side }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className="text-xs font-bold text-gray-900 w-8 text-center flex-shrink-0">
        {value || '—'}
      </span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%`, float: side === 'right' ? 'right' : 'left' }}
        />
      </div>
    </div>
  );
}

// ── FormulaCompareModal ───────────────────────────────────────────────────────
// Props:
//   formulaA  — the "base" formula being compared (object with carbs/sodium/etc)
//   onClose   — close handler
//   title     — optional header label for formula A

export default function FormulaCompare({ formulaA, onClose, titleA }) {
  const { getSavedFormulas } = useAuth();
  const [savedFormulas, setSavedFormulas] = useState([]);

  useEffect(() => {
    getSavedFormulas().then(r => setSavedFormulas(r.formulas ?? []));
  }, []);
  const [formulaB, setFormulaB] = useState(null);

  // Pick the first saved formula that isn't formulaA as default
  useEffect(() => {
    if (!formulaB && savedFormulas?.length > 0) {
      const other = savedFormulas.find(f => f.id !== formulaA?.id);
      if (other) setFormulaB(other);
    }
  }, [savedFormulas]);

  // Max value per metric across both formulas (for bar scaling)
  const maxes = METRICS.reduce((acc, m) => {
    acc[m.key] = Math.max(val(formulaA, m.key), val(formulaB, m.key), 1);
    return acc;
  }, {});

  const nameA = titleA || formulaA?.name || 'Formula A';
  const nameB = formulaB?.name || 'Formula B';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Formula Comparison</p>
            <h2 className="text-lg font-extrabold text-gray-900">Side by Side</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
            ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">

          {/* Formula B picker */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Compare against</p>
            {!savedFormulas || savedFormulas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">No saved formulas to compare with</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {savedFormulas
                  .filter(f => f.id !== formulaA?.id)
                  .map(f => (
                    <button key={f.id} onClick={() => setFormulaB(f)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border
                        ${formulaB?.id === f.id
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                      {f.name || 'Unnamed'}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black text-white rounded-xl px-3 py-2">
              <p className="text-xs font-bold truncate">{nameA}</p>
              {formulaA?.quizGenerated && (
                <span className="text-xs bg-green-600 px-1.5 py-0.5 rounded-full">Quiz</span>
              )}
            </div>
            <div className="flex items-center justify-center">
              <span className="text-lg font-black text-gray-300">VS</span>
            </div>
            <div className={`rounded-xl px-3 py-2 text-center ${formulaB ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <p className="text-xs font-bold truncate">{nameB}</p>
              {formulaB?.quizGenerated && (
                <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">Quiz</span>
              )}
            </div>
          </div>

          {/* Metric bars */}
          <div className="space-y-4">
            {METRICS.map(m => {
              const vA = val(formulaA, m.key);
              const vB = val(formulaB, m.key);
              const mx = maxes[m.key];
              const diff = vA - vB;
              const winner = diff > 0 ? 'A' : diff < 0 ? 'B' : null;

              return (
                <div key={m.key}>
                  {/* Label row */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-sm">{m.icon}</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{m.label}</p>
                    <span className="text-xs text-gray-300">({m.unit})</span>
                    {winner && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ml-1
                        ${winner === 'A' ? 'bg-black text-white' : 'bg-gray-700 text-white'}`}>
                        {winner === 'A' ? nameA.split(' ')[0] : nameB.split(' ')[0]} higher
                      </span>
                    )}
                  </div>
                  {/* Bar pair */}
                  <div className="grid grid-cols-2 gap-3">
                    <Bar value={vA} max={mx} color={m.color} side="left" />
                    <Bar value={vB} max={mx} color={formulaB ? m.color : 'bg-gray-200'} side="right" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flavor / extras row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {[formulaA, formulaB].map((f, i) => (
              <div key={i} className={`rounded-xl p-3 text-xs space-y-1 ${i === 0 ? 'bg-black text-gray-300' : 'bg-gray-800 text-gray-300'}`}>
                {f?.flavor && <p>🍓 {f.flavor}</p>}
                {f?.consistency && <p>💧 {f.consistency}</p>}
                {f?.quizGenerated && <p className="text-green-400 font-semibold">✓ Quiz generated</p>}
                {!f && <p className="text-gray-600 italic">No formula selected</p>}
              </div>
            ))}
          </div>

          {/* Summary callout */}
          {formulaB && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900 mb-2">Quick summary</p>
              {METRICS.map(m => {
                const vA = val(formulaA, m.key);
                const vB = val(formulaB, m.key);
                if (vA === 0 && vB === 0) return null;
                const diff = Math.abs(vA - vB);
                if (diff === 0) return (
                  <p key={m.key}>{m.icon} Same {m.label.toLowerCase()} ({vA}{m.unit})</p>
                );
                const higher = vA > vB ? nameA : nameB;
                return (
                  <p key={m.key}>{m.icon} <span className="font-semibold">{higher}</span> has {diff}{m.unit} more {m.label.toLowerCase()}</p>
                );
              }).filter(Boolean)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
