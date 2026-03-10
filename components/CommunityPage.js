"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCommunity } from './CommunityContext';
import { Avatar, ProBadge } from './ProAthleteModal';
import FormulaCompare from './FormulaCompare';
import { supabase } from '../lib/supabase';

// ── Constants ─────────────────────────────────────────────────────────────────
const FLAVORS = [
  { id: 'tropical-mango',   label: 'Tropical Mango',      color: 'from-amber-400 to-orange-400' },
  { id: 'strawberry-lemon', label: 'Strawberry Lemonade',  color: 'from-rose-400 to-pink-400' },
  { id: 'orange-citrus',    label: 'Orange Citrus',        color: 'from-orange-400 to-yellow-400' },
  { id: 'watermelon-mint',  label: 'Watermelon Mint',      color: 'from-green-400 to-emerald-400' },
  { id: 'neutral',          label: 'Neutral / Unflavored', color: 'from-gray-400 to-slate-400' },
];
const THICKNESS_LABELS = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'];
const SPORT_TAGS = ['Running', 'Cycling', 'Triathlon', 'Trail', 'Ultra', 'MTB', 'Swimming', 'General'];

// ── Profanity filter ──────────────────────────────────────────────────────────
const SWEAR_WORDS = [
  'fuck','fucker','fucking','fucked','fucks','shit','shits','shitting','shitty',
  'ass','asses','asshole','assholes','bitch','bitches','bitching','bastard','bastards',
  'cunt','cunts','dick','dicks','cock','cocks','pussy','pussies','piss','pissed',
  'damn','damned','crap','craps','hell','whore','whores','slut','sluts',
  'nigger','niggers','nigga','faggot','faggots','fag','fags',
  'retard','retards','retarded','rape','raping','raped',
];
function filterProfanity(text) {
  if (!text) return text;
  let result = text;
  SWEAR_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  });
  return result;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FlavorDot({ flavor }) {
  const f = FLAVORS.find(x => x.label === flavor);
  return (
    <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-br ${f?.color || 'from-gray-300 to-gray-400'} flex-shrink-0`} />
  );
}

function FormulaChips({ formula, small }) {
  const chips = [
    { label: `${formula.carbs}g carbs` },
    { label: `${formula.sodium}mg Na` },
    formula.potassium  && { label: `${formula.potassium}mg K` },
    formula.magnesium  && { label: `${formula.magnesium}mg Mg` },
    formula.caffeine > 0 && { label: `${formula.caffeine}mg caffeine`, accent: true },
    { label: THICKNESS_LABELS[formula.thickness] || 'Standard' },
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(chip => (
        <span key={chip.label}
          className={`rounded-full font-semibold border ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
            ${chip.accent
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          {chip.label}
        </span>
      ))}
    </div>
  );
}

// ── Fetch author profiles hook ────────────────────────────────────────────────
function useAuthorProfiles(formulas) {
  const [profiles, setProfiles] = useState({});
  useEffect(() => {
    const ids = [...new Set(formulas.filter(f => !f.anonymous && f.authorId).map(f => f.authorId))];
    if (ids.length === 0) return;
    supabase
      .from('profiles')
      .select('user_id, avatar_url, is_pro, race_results, requester_name')
      .in('user_id', ids)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(p => {
          map[p.user_id] = {
            avatarUrl:   p.avatar_url || null,
            isPro:       p.is_pro || false,
            raceResults: p.race_results || [],
            name:        p.requester_name || null,
          };
        });
        setProfiles(map);
      });
  }, [formulas]);
  return profiles;
}

const PAGE_SIZE = 20;

// ── Pro Athlete Profile Modal ─────────────────────────────────────────────────
function ProProfileModal({ authorId, authorName, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('avatar_url, is_pro, race_results, requester_name')
      .eq('user_id', authorId)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [authorId]);

  const displayName = profile?.requester_name || authorName || 'Athlete';
  const races = profile?.race_results || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pro Athlete</p>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm">
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar url={profile?.avatar_url} name={displayName} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-extrabold text-gray-900">{displayName}</h2>
                    <ProBadge />
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Pro Athlete</p>
                </div>
              </div>

              {/* Race results */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Race History</p>
                {races.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">
                    No race results added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {races.map((r, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm">{r.race_name || r.race}</p>
                              {r.distance && (
                                <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                                  {r.distance}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {r.time && <span className="text-xs text-gray-600 font-semibold">⏱ {r.time}</span>}
                              {r.position && <span className="text-xs text-gray-500">📍 {r.position}</span>}
                              {(r.date || r.year) && (
                                <span className="text-xs text-gray-400">
                                  {r.date
                                    ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                    : r.year}
                                </span>
                              )}
                            </div>
                            {r.notes && <p className="text-xs text-gray-400 mt-1 italic">{r.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Author Button (clickable only if PRO) ─────────────────────────────────────
function AuthorButton({ formula, authorProfile, onViewPro }) {
  const author = formula.anonymous ? 'Anonymous Athlete' : formula.authorName;
  const isPro  = !formula.anonymous && authorProfile?.isPro;

  if (formula.anonymous || !isPro) {
    return (
      <div className="flex items-center gap-2.5">
        <Avatar url={null} name={author} size="sm" />
        <div>
          <p className="text-xs font-semibold text-gray-700">{author}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); onViewPro(formula.authorId, formula.authorName); }}
      className="flex items-center gap-2.5 group/author"
    >
      <Avatar url={authorProfile?.avatarUrl || null} name={author} size="sm" />
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold text-gray-700 group-hover/author:text-black transition">{author}</p>
        <ProBadge />
      </div>
    </button>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({ formulas, authorProfiles, onViewPro }) {
  const top = [...formulas]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4', '5'];
  const medalBg = ['bg-amber-50 border-amber-200', 'bg-gray-50 border-gray-200', 'bg-orange-50 border-orange-200', 'bg-white border-gray-100', 'bg-white border-gray-100'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Community</p>
        <h3 className="font-black text-gray-900 text-base">Top Gels</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {top.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No formulas yet</p>
        ) : top.map((f, i) => {
          const profile = !f.anonymous ? authorProfiles?.[f.authorId] : null;
          const isPro   = profile?.isPro;
          const authorDisplay = f.anonymous ? 'Anonymous' : f.authorName;
          return (
            <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${medalBg[i]}`}>
              <span className="flex-shrink-0 text-base">{medals[i]}</span>
              <Avatar url={profile?.avatarUrl || null} name={authorDisplay} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-900 text-sm truncate">{filterProfanity(f.name)}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isPro ? (
                    <button
                      onClick={() => onViewPro(f.authorId, f.authorName)}
                      className="text-xs text-gray-400 hover:text-black transition truncate flex items-center gap-1">
                      {authorDisplay} <ProBadge />
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 truncate">{authorDisplay}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-red-400 text-xs">♥</span>
                <span className="text-xs font-bold text-gray-600">{f.likes?.length || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Community Stats ───────────────────────────────────────────────────────────
function CommunityStats({ formulas }) {
  const totalLikes    = formulas.reduce((sum, f) => sum + (f.likes?.length || 0), 0);
  const totalComments = formulas.reduce((sum, f) => sum + (f.comments?.length || 0), 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Stats</p>
      <div className="space-y-3">
        {[
          { label: 'Formulas shared', value: formulas.length },
          { label: 'Total likes',     value: totalLikes },
          { label: 'Comments',        value: totalComments },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="font-black text-gray-900 text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.proOnly,
    filters.carbs[0] > 15 || filters.carbs[1] < 90,
    filters.caffeine[1] < 150,
    filters.sodium[0] > 0 || filters.sodium[1] < 600,
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition
          ${activeCount > 0
            ? 'bg-black text-white border-black'
            : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-white text-black rounded-full w-4 h-4 flex items-center justify-center text-xs font-black leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 w-72 space-y-5">

          {/* PRO only toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                PRO Athletes only
                <span className="text-xs bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-full">PRO</span>
              </p>
              <p className="text-xs text-gray-400">Show formulas from verified pros</p>
            </div>
            <div
              onClick={() => onChange({ ...filters, proOnly: !filters.proOnly })}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer
                ${filters.proOnly ? 'bg-black' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${filters.proOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>

          <div className="h-px bg-gray-100" />

          {/* Carbs range */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">Carbs</p>
              <p className="text-xs text-gray-500 font-semibold">{filters.carbs[0]}g – {filters.carbs[1]}g</p>
            </div>
            <div className="space-y-2">
              <input type="range" min={15} max={90} step={5}
                value={filters.carbs[0]}
                onChange={e => onChange({ ...filters, carbs: [Number(e.target.value), filters.carbs[1]] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
              <input type="range" min={15} max={90} step={5}
                value={filters.carbs[1]}
                onChange={e => onChange({ ...filters, carbs: [filters.carbs[0], Number(e.target.value)] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>15g</span><span>90g</span></div>
          </div>

          {/* Caffeine range */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">Caffeine</p>
              <p className="text-xs text-gray-500 font-semibold">{filters.caffeine[0]}mg – {filters.caffeine[1]}mg</p>
            </div>
            <div className="space-y-2">
              <input type="range" min={0} max={150} step={25}
                value={filters.caffeine[0]}
                onChange={e => onChange({ ...filters, caffeine: [Number(e.target.value), filters.caffeine[1]] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
              <input type="range" min={0} max={150} step={25}
                value={filters.caffeine[1]}
                onChange={e => onChange({ ...filters, caffeine: [filters.caffeine[0], Number(e.target.value)] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>0mg</span><span>150mg</span></div>
          </div>

          {/* Sodium/electrolytes range */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">Sodium</p>
              <p className="text-xs text-gray-500 font-semibold">{filters.sodium[0]}mg – {filters.sodium[1]}mg</p>
            </div>
            <div className="space-y-2">
              <input type="range" min={0} max={600} step={25}
                value={filters.sodium[0]}
                onChange={e => onChange({ ...filters, sodium: [Number(e.target.value), filters.sodium[1]] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
              <input type="range" min={0} max={600} step={25}
                value={filters.sodium[1]}
                onChange={e => onChange({ ...filters, sodium: [filters.sodium[0], Number(e.target.value)] })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>0mg</span><span>600mg</span></div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { onChange({ proOnly: false, carbs: [15, 90], caffeine: [0, 150], sodium: [0, 600] }); setOpen(false); }}
            className="w-full text-xs font-bold text-gray-400 hover:text-gray-700 transition py-1">
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

// ── Share Formula Modal ───────────────────────────────────────────────────────
function ShareModal({ isOpen, onClose, onShared, preloadFormula }) {
  const { user }         = useAuth();
  const { shareFormula } = useCommunity();
  const [name, setName]         = useState('');
  const [description, setDesc]  = useState('');
  const [anon, setAnon]         = useState(false);
  const [tags, setTags]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [carbs, setCarbs]                 = useState(preloadFormula?.carbs ?? 30);
  const [sodium, setSodium]               = useState(preloadFormula?.sodium ?? 250);
  const [potassium, setPotassium]         = useState(preloadFormula?.potassium ?? 100);
  const [magnesium, setMagnesium]         = useState(preloadFormula?.magnesium ?? 20);
  const [caffeine, setCaffeine]           = useState(preloadFormula?.caffeine ?? 0);
  const [fructoseRatio, setFructoseRatio] = useState(preloadFormula?.fructoseRatio ?? 0.35);
  const [thickness, setThickness]         = useState(preloadFormula?.thickness ?? 3);
  const [flavor, setFlavor]               = useState(preloadFormula?.flavor ?? 'Neutral / Unflavored');

  useEffect(() => {
    if (!preloadFormula) return;
    setCarbs(preloadFormula.carbs ?? 30);
    setSodium(preloadFormula.sodium ?? 250);
    setPotassium(preloadFormula.potassium ?? 100);
    setMagnesium(preloadFormula.magnesium ?? 20);
    setCaffeine(preloadFormula.caffeine ?? 0);
    setFructoseRatio(preloadFormula.fructoseRatio ?? 0.35);
    setThickness(preloadFormula.thickness ?? 3);
    setFlavor(preloadFormula.flavor ?? 'Neutral / Unflavored');
  }, [preloadFormula]);

  const toggleTag = t => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleShare = async () => {
    setError('');
    if (!name.trim()) { setError('Please give your formula a name.'); return; }
    if (description.length > 300) { setError('Description must be under 300 characters.'); return; }
    setLoading(true);
    const result = await shareFormula(user, {
      name: filterProfanity(name.trim()), description: filterProfanity(description), anonymous: anon, tags,
      carbs, sodium, potassium, magnesium, caffeine, fructoseRatio, thickness, flavor,
    });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onShared(result.id);
    onClose();
  };

  if (!isOpen) return null;
  const maltodextrin = Math.round(carbs * (1 - fructoseRatio));
  const fructose     = Math.round(carbs * fructoseRatio);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Share Your Formula</h2>
            <p className="text-xs text-gray-400">Let the community try your build</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Formula Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={50}
              placeholder='"Race Day Rocket" or "Long Run Easy"'
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
            <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/50</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} maxLength={300} rows={3}
              placeholder="What's this formula for? Any tips on when to use it..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/300</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Sport / Use Case</label>
            <div className="flex flex-wrap gap-2">
              {SPORT_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border
                    ${tags.includes(tag) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Formula</p>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Flavor</p>
              <div className="grid grid-cols-5 gap-1.5">
                {FLAVORS.map(f => (
                  <button key={f.id} onClick={() => setFlavor(f.label)} title={f.label}
                    className={`flex flex-col items-center py-2 rounded-lg border transition-all
                      ${flavor === f.label ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${f.color} mb-1`} />
                    <span className="text-gray-500" style={{ fontSize: '9px' }}>{f.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Carbs', unit: 'g', min: 15, max: 90, val: carbs, set: setCarbs, desc: `${maltodextrin}g malto + ${fructose}g fructose` },
              { label: 'Fructose Ratio', unit: '%', min: 10, max: 50, step: 5, val: Math.round(fructoseRatio * 100), set: v => setFructoseRatio(v / 100) },
              { label: 'Sodium', unit: 'mg', min: 0, max: 600, step: 25, val: sodium, set: setSodium },
              { label: 'Potassium', unit: 'mg', min: 0, max: 300, step: 10, val: potassium, set: setPotassium },
              { label: 'Magnesium', unit: 'mg', min: 0, max: 80, step: 5, val: magnesium, set: setMagnesium },
              { label: 'Caffeine', unit: 'mg', min: 0, max: 150, step: 25, val: caffeine, set: setCaffeine },
            ].map(({ label, unit, min, max, step = 1, val, set, desc }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>{label}</span><span className="font-bold text-gray-900">{val}{unit}</span>
                </div>
                {desc && <p className="text-xs text-gray-400 mb-1">{desc}</p>}
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>{min}{unit}</span><span>{max}{unit}</span></div>
              </div>
            ))}

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Thickness</span><span className="font-bold text-gray-900">{THICKNESS_LABELS[thickness]}</span>
              </div>
              <input type="range" min={1} max={5} step={1} value={thickness}
                onChange={e => setThickness(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
              <div className="flex justify-between text-xs text-gray-300 mt-0.5"><span>Liquid</span><span>Extra Thick</span></div>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Post anonymously</p>
              <p className="text-xs text-gray-400">Your name won't appear on this formula</p>
            </div>
            <div onClick={() => setAnon(a => !a)}
              className={`relative w-11 h-6 rounded-full transition-colors ${anon ? 'bg-black' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${anon ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button onClick={handleShare} disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? 'Sharing...' : 'Share Formula →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formula Detail Modal ──────────────────────────────────────────────────────
function FormulaDetail({ formulaId, onClose, onLoadFormula, currentUser, onViewPro }) {
  const { getFormula, toggleLike, addComment, deleteComment, deleteFormula } = useCommunity();
  const [formula, setFormula]             = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [comment, setComment]             = useState('');
  const [copied, setCopied]               = useState(false);
  const [submitting, setSubmit]           = useState(false);
  const [comparing, setComparing]         = useState(false);
  const commentRef                        = useRef(null);

  useEffect(() => { getFormula(formulaId).then(setFormula); }, [formulaId]);

  useEffect(() => {
    if (!formula || formula.anonymous || !formula.authorId) return;
    supabase
      .from('profiles')
      .select('avatar_url, is_pro, race_results, requester_name')
      .eq('user_id', formula.authorId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAuthorProfile({
          avatarUrl:   data.avatar_url || null,
          isPro:       data.is_pro || false,
          raceResults: data.race_results || [],
          name:        data.requester_name || null,
        });
      });
  }, [formula?.authorId, formula?.anonymous]);

  if (!formula) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="text-white text-sm animate-pulse">Loading...</div>
    </div>
  );

  const liked   = currentUser && formula.likes?.includes(currentUser.id);
  const isOwner = currentUser && formula.authorId === currentUser.id;
  const author  = formula.anonymous ? 'Anonymous Athlete' : formula.authorName;
  const isPro   = !formula.anonymous && authorProfile?.isPro;

  const handleLike = async () => {
    if (!currentUser) return;
    await toggleLike(currentUser, formulaId);
    getFormula(formulaId).then(setFormula);
  };

  const handleComment = async () => {
    if (!comment.trim() || !currentUser) return;
    setSubmit(true);
    await addComment(currentUser, formulaId, filterProfanity(comment));
    setComment('');
    getFormula(formulaId).then(setFormula);
    setSubmit(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this formula? This cannot be undone.')) return;
    await deleteFormula(currentUser, formulaId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header with clickable author */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
            {/* Avatar — clickable if PRO */}
            {isPro ? (
              <button onClick={() => onViewPro(formula.authorId, formula.authorName)}>
                <Avatar url={authorProfile?.avatarUrl || null} name={author} size="lg" />
              </button>
            ) : (
              <Avatar url={null} name={author} size="lg" />
            )}
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-gray-900 truncate">{filterProfanity(formula.name)}</h2>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">by</span>
                {isPro ? (
                  <button
                    onClick={() => onViewPro(formula.authorId, formula.authorName)}
                    className="text-xs font-semibold text-gray-700 hover:text-black transition flex items-center gap-1">
                    {author} <ProBadge />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-gray-600">{author}</span>
                )}
                <span className="text-xs text-gray-400">· {timeAgo(formula.sharedAt)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-sm flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {formula.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{filterProfanity(formula.description)}</p>
          )}

          {formula.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formula.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <div className="bg-gray-950 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FlavorDot flavor={formula.flavor} />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{formula.flavor || 'Neutral'}</p>
            </div>
            <FormulaChips formula={formula} />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={handleLike}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition font-semibold text-sm
                ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
              <span className="text-xs">{formula.likes?.length || 0} likes</span>
            </button>
            <button onClick={() => { onLoadFormula(formula); onClose(); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border border-gray-200 text-gray-500 hover:border-black hover:text-black transition font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span className="text-xs">Load</span>
            </button>
            <button onClick={() => setComparing(true)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border border-gray-200 text-gray-500 hover:border-black hover:text-black transition font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span className="text-xs">Compare</span>
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?formula=${formulaId}`); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition font-semibold text-sm
                ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <span className="text-lg">{copied ? '✓' : '🔗'}</span>
              <span className="text-xs">{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {comparing && (
            <FormulaCompare formulaA={formula} titleA={formula.name} onClose={() => setComparing(false)} />
          )}

          {isOwner && (
            <button onClick={handleDelete} className="w-full text-xs text-red-400 hover:text-red-600 transition py-1">
              Delete this formula
            </button>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Comments ({formula.comments?.length || 0})
            </p>
            {formula.comments?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No comments yet — be the first.</p>
            )}
            <div className="space-y-4 mb-4">
              {formula.comments?.map(c => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar name={c.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-900">{c.authorName}</span>
                      <span className="text-xs text-gray-400">{timeAgo(c.postedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{filterProfanity(c.text)}</p>
                  </div>
                  {currentUser?.id === c.authorId && (
                    <button
                      onClick={() => deleteComment(currentUser, formulaId, c.id).then(() => getFormula(formulaId).then(setFormula))}
                      className="text-gray-300 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {currentUser ? (
              <div className="flex gap-2">
                <input ref={commentRef} value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  placeholder="Add a comment..." maxLength={200}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition" />
                <button onClick={handleComment} disabled={!comment.trim() || submitting}
                  className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-40">
                  Post
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">Sign in to like and comment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Formula Card ──────────────────────────────────────────────────────────────
function FormulaCard({ formula, onOpen, currentUser, onLike, authorProfile, onViewPro }) {
  const liked  = currentUser && formula.likes?.includes(currentUser.id);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <button onClick={() => onOpen(formula.id)} className="w-full text-left p-5 pb-4">
        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-3" onClick={e => e.stopPropagation()}>
          <AuthorButton formula={formula} authorProfile={authorProfile} onViewPro={onViewPro} />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{timeAgo(formula.sharedAt)}</span>
            {formula.tags?.length > 0 && (
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                {formula.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Formula name */}
        <div className="flex items-center gap-2 mb-2">
          <FlavorDot flavor={formula.flavor} />
          <h3 className="font-extrabold text-gray-900 text-base">{filterProfanity(formula.name)}</h3>
        </div>

        {formula.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed pl-4">
            {filterProfanity(formula.description)}
          </p>
        )}

        <div className="bg-gray-950 rounded-xl p-3">
          <FormulaChips formula={formula} small />
        </div>
      </button>

      {/* Action strip */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={e => { e.stopPropagation(); onLike(formula.id); }}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors
              ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <span className="text-base">{liked ? '❤️' : '♡'}</span>
            <span className="text-xs">{formula.likes?.length || 0}</span>
          </button>
          <button onClick={() => onOpen(formula.id)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span className="text-xs">{formula.comments?.length || 0}</span>
          </button>
        </div>
        <button onClick={() => onOpen(formula.id)}
          className="text-xs font-bold text-gray-400 hover:text-black transition group-hover:text-gray-700">
          View & Load →
        </button>
      </div>
    </div>
  );
}

// ── Main CommunityPage ────────────────────────────────────────────────────────
const DEFAULT_FILTERS = { proOnly: false, carbs: [15, 90], caffeine: [0, 150], sodium: [0, 600] };

export default function CommunityPage({ onLoadFormula, onSignIn }) {
  const { user }                        = useAuth();
  const { getFormulas, toggleLike }     = useCommunity();
  const [formulas, setFormulas]         = useState([]);
  const [shareOpen, setShareOpen]       = useState(false);
  const [detailId, setDetailId]         = useState(null);
  const [sharedId, setSharedId]         = useState(null);
  const [proProfileId, setProProfileId] = useState(null);   // { id, name }
  const [search, setSearch]             = useState('');
  const [filterTag, setFilterTag]       = useState('All');
  const [advFilters, setAdvFilters]     = useState(DEFAULT_FILTERS);
  const [feedLoading, setFeedLoading]   = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef                     = useRef(null);

  const authorProfiles = useAuthorProfiles(formulas);

  const refresh = () => {
    setFeedLoading(true);
    getFormulas().then(data => { setFormulas(data); setFeedLoading(false); });
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    window.__openCommunityFormula = (id) => setDetailId(id);
    return () => { delete window.__openCommunityFormula; };
  }, []);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisibleCount(prev => prev + PAGE_SIZE);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [feedLoading]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, filterTag, advFilters]);

  const handleLike = async (id) => {
    if (!user) { onSignIn?.(); return; }
    toggleLike(user, id);
    setDetailId(id);
  };

  const handleShared = (id) => {
    setSharedId(id);
    refresh();
    setTimeout(() => setSharedId(null), 4000);
  };

  const handleViewPro = (authorId, authorName) => {
    setProProfileId({ id: authorId, name: authorName });
  };

  // Filter logic
  const filtered = formulas.filter(f => {
    const profile   = !f.anonymous ? authorProfiles[f.authorId] : null;
    const matchTag  = filterTag === 'All' || f.tags?.includes(filterTag);
    const matchSearch = !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.authorName?.toLowerCase().includes(search.toLowerCase());
    const matchPro    = !advFilters.proOnly || profile?.isPro;
    const matchCarbs  = f.carbs >= advFilters.carbs[0] && f.carbs <= advFilters.carbs[1];
    const matchCaff   = (f.caffeine || 0) >= advFilters.caffeine[0] && (f.caffeine || 0) <= advFilters.caffeine[1];
    const matchSodium = (f.sodium || 0) >= advFilters.sodium[0] && (f.sodium || 0) <= advFilters.sodium[1];
    return matchTag && matchSearch && matchPro && matchCarbs && matchCaff && matchSodium;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Community</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Formula Feed</h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          See what other athletes are running on. Load any formula into your builder with one click.
        </p>
      </div>

      {/* Share CTA */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border border-gray-200"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div>
          <p className="font-extrabold text-base text-white">Share your formula with the community</p>
          <p className="text-white/50 text-sm mt-0.5">Help other athletes find what works.</p>
        </div>
        {user ? (
          <button onClick={() => setShareOpen(true)}
            className="flex-shrink-0 bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap">
            + Share Formula
          </button>
        ) : (
          <button onClick={onSignIn}
            className="flex-shrink-0 bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap">
            Sign In to Share
          </button>
        )}
      </div>

      {sharedId && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          ✓ Formula shared!
          <button onClick={() => setDetailId(sharedId)} className="underline font-semibold">View it →</button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Feed column */}
        <div className="flex-1 min-w-0">

          {/* Search + sport tags + filter button */}
          <div className="mb-5 space-y-3">
            <div className="flex gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search formulas or athletes..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition bg-white" />
              <FilterBar filters={advFilters} onChange={setAdvFilters} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All', ...SPORT_TAGS].map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border
                    ${filterTag === tag ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {feedLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-3 bg-gray-200 rounded" />
                      <div className="w-16 h-2.5 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="w-48 h-4 bg-gray-200 rounded mb-3" />
                  <div className="w-full h-16 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="font-bold text-gray-700 mb-1 text-lg">
                {formulas.length === 0 ? 'No formulas shared yet' : 'No results found'}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                {formulas.length === 0 ? 'Be the first to share your race-day formula.' : 'Try adjusting your filters.'}
              </p>
              {formulas.length === 0 && user && (
                <button onClick={() => setShareOpen(true)}
                  className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition">
                  + Share Yours
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visible.map(f => (
                  <FormulaCard
                    key={f.id}
                    formula={f}
                    onOpen={setDetailId}
                    currentUser={user}
                    onLike={handleLike}
                    authorProfile={!f.anonymous ? authorProfiles[f.authorId] : null}
                    onViewPro={handleViewPro}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {hasMore ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Loading more...
                  </div>
                ) : filtered.length > PAGE_SIZE ? (
                  <p className="text-xs text-gray-400">You've seen all {filtered.length} formulas</p>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-4 flex-shrink-0">
          <Leaderboard formulas={formulas} authorProfiles={authorProfiles} onViewPro={handleViewPro} />
          <CommunityStats formulas={formulas} />
        </div>
      </div>

      {/* Modals */}
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} onShared={handleShared} />

      {detailId && (
        <FormulaDetail
          formulaId={detailId}
          onClose={() => { setDetailId(null); refresh(); }}
          onLoadFormula={f => onLoadFormula?.(f)}
          currentUser={user}
          onViewPro={handleViewPro}
        />
      )}

      {proProfileId && (
        <ProProfileModal
          authorId={proProfileId.id}
          authorName={proProfileId.name}
          onClose={() => setProProfileId(null)}
        />
      )}
    </div>
  );
}