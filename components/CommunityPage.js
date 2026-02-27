"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCommunity } from './CommunityContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const FLAVORS = [
  { id: 'tropical-mango',   label: 'Tropical Mango',      emoji: '🥭' },
  { id: 'strawberry-lemon', label: 'Strawberry Lemonade',  emoji: '🍓' },
  { id: 'orange-citrus',    label: 'Orange Citrus',        emoji: '🍊' },
  { id: 'watermelon-mint',  label: 'Watermelon Mint',      emoji: '🍉' },
  { id: 'neutral',          label: 'Neutral / Unflavored', emoji: '💧' },
];
const THICKNESS_LABELS = ['', 'Liquid', 'Thin', 'Standard', 'Thick', 'Extra Thick'];
const SPORT_TAGS = ['Running', 'Cycling', 'Triathlon', 'Trail', 'Ultra', 'MTB', 'Swimming', 'General'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function flavorEmoji(flavor) {
  return FLAVORS.find(f => f.label === flavor)?.emoji || '💧';
}

function FormulaChips({ formula, small }) {
  const maltodextrin = Math.round((formula.carbs || 0) * (1 - (formula.fructoseRatio || 0.35)));
  const fructose     = Math.round((formula.carbs || 0) * (formula.fructoseRatio || 0.35));
  const chips = [
    `⚡ ${formula.carbs}g carbs`,
    `🧂 ${formula.sodium}mg Na`,
    formula.potassium && `⚗️ ${formula.potassium}mg K`,
    formula.magnesium && `💊 ${formula.magnesium}mg Mg`,
    formula.caffeine > 0 && `☕ ${formula.caffeine}mg caffeine`,
    `${flavorEmoji(formula.flavor)} ${(formula.flavor || 'Neutral').split(' ')[0]}`,
    `💧 ${THICKNESS_LABELS[formula.thickness] || 'Standard'}`,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(chip => (
        <span key={chip}
          className={`bg-gray-800 text-gray-300 rounded-full font-medium ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
          {chip}
        </span>
      ))}
    </div>
  );
}

// ── Share Formula Modal ───────────────────────────────────────────────────────
function ShareModal({ isOpen, onClose, onShared, preloadFormula }) {
  const { user } = useAuth();
  const { shareFormula } = useCommunity();

  const [name, setName]             = useState('');
  const [description, setDesc]      = useState('');
  const [anonymous, setAnonymous]   = useState(false);
  const [selectedTags, setTags]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Formula sliders
  const [carbs, setCarbs]                   = useState(preloadFormula?.carbs ?? 30);
  const [sodium, setSodium]                 = useState(preloadFormula?.sodium ?? 250);
  const [potassium, setPotassium]           = useState(preloadFormula?.potassium ?? 100);
  const [magnesium, setMagnesium]           = useState(preloadFormula?.magnesium ?? 20);
  const [caffeine, setCaffeine]             = useState(preloadFormula?.caffeine ?? 0);
  const [fructoseRatio, setFructoseRatio]   = useState(preloadFormula?.fructoseRatio ?? 0.35);
  const [thickness, setThickness]           = useState(preloadFormula?.thickness ?? 3);
  const [flavor, setFlavor]                 = useState(preloadFormula?.flavor ?? 'Neutral / Unflavored');

  useEffect(() => {
    if (preloadFormula) {
      setCarbs(preloadFormula.carbs ?? 30);
      setSodium(preloadFormula.sodium ?? 250);
      setPotassium(preloadFormula.potassium ?? 100);
      setMagnesium(preloadFormula.magnesium ?? 20);
      setCaffeine(preloadFormula.caffeine ?? 0);
      setFructoseRatio(preloadFormula.fructoseRatio ?? 0.35);
      setThickness(preloadFormula.thickness ?? 3);
      setFlavor(preloadFormula.flavor ?? 'Neutral / Unflavored');
    }
  }, [preloadFormula]);

  const toggleTag = (tag) => setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

  const handleShare = async () => {
    setError('');
    if (!name.trim()) { setError('Please give your formula a name.'); return; }
    if (description.length > 300) { setError('Description must be under 300 characters.'); return; }
    setLoading(true);
    const result = await shareFormula(user, {
      name, description, anonymous, tags: selectedTags,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Share Your Formula</h2>
            <p className="text-xs text-gray-400">Let the community try your build</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Formula Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
              placeholder='e.g. "Race Day Rocket" or "Long Run Easy"'
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
            <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/60</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)}
              maxLength={300} rows={3}
              placeholder="What's this formula for? Any tips on when to use it, what races it's suited to, why you built it this way..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/300</p>
          </div>

          {/* Sport tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Sport / Use Case</label>
            <div className="flex flex-wrap gap-2">
              {SPORT_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                    ${selectedTags.includes(tag)
                      ? 'bg-black text-white border-black'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Formula */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Formula</p>

            {/* Flavor */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Flavor</p>
              <div className="grid grid-cols-5 gap-1.5">
                {FLAVORS.map(f => (
                  <button key={f.id} onClick={() => setFlavor(f.label)} title={f.label}
                    className={`flex flex-col items-center py-2 rounded-lg border transition-all
                      ${flavor === f.label ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-400'}`}>
                    <span className="text-lg">{f.emoji}</span>
                    <span className="text-gray-500 mt-0.5" style={{ fontSize: '9px' }}>{f.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            {[
              { label: 'Carbs', unit: 'g', min: 15, max: 90, value: carbs, set: setCarbs, desc: `${maltodextrin}g malto + ${fructose}g fructose` },
              { label: 'Fructose Ratio', unit: '%', min: 10, max: 50, step: 5, value: Math.round(fructoseRatio * 100), set: v => setFructoseRatio(v / 100) },
              { label: 'Sodium', unit: 'mg', min: 0, max: 600, step: 25, value: sodium, set: setSodium },
              { label: 'Potassium', unit: 'mg', min: 0, max: 300, step: 10, value: potassium, set: setPotassium },
              { label: 'Magnesium', unit: 'mg', min: 0, max: 80, step: 5, value: magnesium, set: setMagnesium },
              { label: 'Caffeine', unit: 'mg', min: 0, max: 150, step: 25, value: caffeine, set: setCaffeine },
            ].map(({ label, unit, min, max, step = 1, value, set, desc }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>{label}</span>
                  <span className="font-bold text-gray-900">{value}{unit}</span>
                </div>
                {desc && <p className="text-xs text-gray-400 mb-1">{desc}</p>}
                <input type="range" min={min} max={max} step={step} value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                  <span>{min}{unit}</span><span>{max}{unit}</span>
                </div>
              </div>
            ))}

            {/* Thickness */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Thickness</span>
                <span className="font-bold text-gray-900">{THICKNESS_LABELS[thickness]}</span>
              </div>
              <input type="range" min={1} max={5} step={1} value={thickness}
                onChange={e => setThickness(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
              <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                <span>Liquid</span><span>Extra Thick</span>
              </div>
            </div>
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center justify-between cursor-pointer bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Post anonymously</p>
              <p className="text-xs text-gray-400">Your name won't appear on this formula</p>
            </div>
            <div onClick={() => setAnonymous(a => !a)}
              className={`relative w-11 h-6 rounded-full transition-colors ${anonymous ? 'bg-black' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${anonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

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
function FormulaDetail({ formulaId, onClose, onLoadFormula, currentUser }) {
  const { getFormula, toggleLike, addComment, deleteComment, deleteFormula } = useCommunity();
  const [formula, setFormula]   = useState(null);
  const [comment, setComment]   = useState('');
  const [copied, setCopied]     = useState(false);
  const [submitting, setSubmit] = useState(false);
  const commentRef              = useRef(null);

  useEffect(() => {
    getFormula(formulaId).then(setFormula);
  }, [formulaId, getFormula]);

  if (!formula) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="text-white text-sm">Loading...</div>
    </div>
  );

  const liked    = currentUser && formula.likes?.includes(currentUser.id);
  const isOwner  = currentUser && formula.authorId === currentUser.id;
  const author   = formula.anonymous ? 'Anonymous Athlete' : formula.authorName;

  const handleLike = async () => {
    if (!currentUser) return;
    await toggleLike(currentUser, formulaId);
    getFormula(formulaId).then(setFormula);
  };

  const handleComment = async () => {
    if (!comment.trim() || !currentUser) return;
    setSubmit(true);
    await addComment(currentUser, formulaId, comment);
    setComment('');
    getFormula(formulaId).then(setFormula);
    setSubmit(false);
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(currentUser, formulaId, commentId);
    getFormula(formulaId).then(setFormula);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?formula=${formulaId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this formula? This cannot be undone.')) return;
    await deleteFormula(currentUser, formulaId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-extrabold text-gray-900 truncate">{formula.name}</h2>
            <p className="text-xs text-gray-400">
              by <span className="font-semibold text-gray-600">{author}</span> · {timeAgo(formula.sharedAt)}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition flex-shrink-0">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Description */}
          {formula.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{formula.description}</p>
          )}

          {/* Tags */}
          {formula.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formula.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Formula chips */}
          <div className="bg-black rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Formula</p>
            <FormulaChips formula={formula} />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleLike}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all font-semibold text-sm
                ${liked ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
              <span className="text-xs">{formula.likes?.length || 0} {formula.likes?.length === 1 ? 'like' : 'likes'}</span>
            </button>
            <button onClick={() => { onLoadFormula(formula); onClose(); }}
              className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-400 transition font-semibold text-sm">
              <span className="text-lg">⚗️</span>
              <span className="text-xs">Load Formula</span>
            </button>
            <button onClick={handleCopyLink}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition font-semibold text-sm
                ${copied ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              <span className="text-lg">{copied ? '✓' : '🔗'}</span>
              <span className="text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Owner delete */}
          {isOwner && (
            <button onClick={handleDelete}
              className="w-full text-xs text-red-400 hover:text-red-600 transition py-1">
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

            <div className="space-y-3 mb-4">
              {formula.comments?.map(c => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">
                    {c.authorName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-900">{c.authorName}</span>
                      <span className="text-xs text-gray-400">{timeAgo(c.postedAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                  </div>
                  {currentUser && c.authorId === currentUser.id && (
                    <button onClick={() => handleDeleteComment(c.id)}
                      className="text-gray-300 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100 flex-shrink-0">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add comment */}
            {currentUser ? (
              <div className="flex gap-2">
                <input
                  ref={commentRef}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  placeholder="Add a comment..."
                  maxLength={200}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition"
                />
                <button onClick={handleComment} disabled={!comment.trim() || submitting}
                  className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-40">
                  Post
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">
                Sign in to like and comment on formulas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Formula Card (feed item) ──────────────────────────────────────────────────
function FormulaCard({ formula, onOpen, currentUser, onLike }) {
  const liked   = currentUser && formula.likes?.includes(currentUser.id);
  const author  = formula.anonymous ? 'Anonymous Athlete' : formula.authorName;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card top — clickable to open detail */}
      <button onClick={() => onOpen(formula.id)} className="w-full text-left p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-gray-900 text-base truncate">{formula.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              by <span className="font-semibold text-gray-500">{author}</span> · {timeAgo(formula.sharedAt)}
            </p>
          </div>
          {formula.tags?.length > 0 && (
            <span className="flex-shrink-0 bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-full">
              {formula.tags[0]}
            </span>
          )}
        </div>

        {formula.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{formula.description}</p>
        )}

        <div className="bg-gray-900 rounded-xl p-3">
          <FormulaChips formula={formula} small />
        </div>
      </button>

      {/* Card bottom — action strip */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onLike(formula.id); }}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors
              ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{formula.likes?.length || 0}</span>
          </button>
          <button onClick={() => onOpen(formula.id)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors font-semibold">
            <span>💬</span>
            <span>{formula.comments?.length || 0}</span>
          </button>
        </div>
        <button onClick={() => onOpen(formula.id)}
          className="text-xs text-gray-400 hover:text-gray-700 font-semibold transition-colors">
          View & Load →
        </button>
      </div>
    </div>
  );
}

// ── Main CommunityPage ────────────────────────────────────────────────────────
export default function CommunityPage({ onLoadFormula, onSignIn }) {
  const { user } = useAuth();
  const { getFormulas, toggleLike } = useCommunity();

  const [formulas, setFormulas]       = useState([]);
  const [shareOpen, setShareOpen]     = useState(false);
  const [detailId, setDetailId]       = useState(null);
  const [sharedId, setSharedId]       = useState(null);
  const [search, setSearch]           = useState('');
  const [filterTag, setFilterTag]     = useState('All');
  const [feedLoading, setFeedLoading] = useState(true);

  const refresh = () => {
    setFeedLoading(true);
    getFormulas().then(data => { setFormulas(data); setFeedLoading(false); });
  };

  useEffect(() => { refresh(); }, []);

  const handleLike = async (formulaId) => {
    if (!user) { onSignIn?.(); return; }
    await toggleLike(user, formulaId);
    refresh();
  };

  const handleShared = (id) => {
    setSharedId(id);
    refresh();
    setTimeout(() => setSharedId(null), 4000);
  };

  const handleLoadFormula = (formula) => {
    onLoadFormula?.(formula);
  };

  // Filter + search
  const filtered = formulas.filter(f => {
    const matchesTag = filterTag === 'All' || f.tags?.includes(filterTag);
    const matchesSearch = !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.authorName?.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Community</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Formula Feed</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          See what other athletes are running on. Load any formula into your builder with one click.
        </p>
      </div>

      {/* Share CTA */}
      <div className="bg-black text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-extrabold text-base">Share your formula with the community</p>
          <p className="text-gray-400 text-sm mt-0.5">Help other athletes find what works.</p>
        </div>
        {user ? (
          <button onClick={() => setShareOpen(true)}
            className="flex-shrink-0 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap">
            + Share Formula
          </button>
        ) : (
          <button onClick={onSignIn}
            className="flex-shrink-0 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition text-sm whitespace-nowrap">
            Sign In to Share
          </button>
        )}
      </div>

      {/* Success banner */}
      {sharedId && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          ✓ Your formula was shared! <button onClick={() => setDetailId(sharedId)} className="underline font-semibold">View it →</button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search formulas, athletes..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition" />
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', ...SPORT_TAGS].map(tag => (
            <button key={tag} onClick={() => setFilterTag(tag)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                ${filterTag === tag ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {feedLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading formulas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🧪</div>
          <p className="font-bold text-gray-700 mb-1">
            {formulas.length === 0 ? 'No formulas shared yet' : 'No results found'}
          </p>
          <p className="text-sm text-gray-400 mb-5">
            {formulas.length === 0 ? 'Be the first to share your race-day formula.' : 'Try a different search or filter.'}
          </p>
          {formulas.length === 0 && user && (
            <button onClick={() => setShareOpen(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
              + Share Yours
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(formula => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              onOpen={setDetailId}
              currentUser={user}
              onLike={handleLike}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        onShared={handleShared}
      />
      {detailId && (
        <FormulaDetail
          formulaId={detailId}
          onClose={() => { setDetailId(null); refresh(); }}
          onLoadFormula={handleLoadFormula}
          currentUser={user}
        />
      )}
    </div>
  );
}