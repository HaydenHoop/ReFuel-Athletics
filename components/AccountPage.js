"use client";
import FormulaCompare from './FormulaCompare';
import { useState, useEffect } from 'react';
import DevPanel from './DevPanel';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useCommunity } from './CommunityContext';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      {action}
    </div>
  );
}

// ── Order History ─────────────────────────────────────────────────────────────
function OrderHistory() {
  const { getMyOrders } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [reordered, setReordered] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(data => { setOrders(data); setLoading(false); });
  }, [getMyOrders]);

  const handleReorder = (order) => {
    order.items?.forEach(item => {
      addItem({ ...item, id: `${item.id?.split('-')[0]}-${Date.now()}` });
    });
    setReordered(order.id);
    setTimeout(() => setReordered(null), 3000);
  };

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">Loading orders...</div>
  );

  if (orders.length === 0) return (
    <EmptyState icon="📦" title="No orders yet"
      description="Your completed orders will appear here with full details and tracking." />
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Order header */}
          <button
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-xs font-black">
                RF
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-extrabold text-gray-900">${order.total?.toFixed(2)}</p>
                <span className="inline-block text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  {order.status || 'Confirmed'}
                </span>
              </div>
              <span className="text-gray-400 text-xs">{expanded === order.id ? '▲' : '▼'}</span>
            </div>
          </button>

          {/* Expanded details */}
          {expanded === order.id && (
            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
              {/* Items */}
              {order.items?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.emoji} {item.name} × {item.qty}</span>
                        <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Ship to */}
              {order.shipping && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Shipped to</p>
                  <p className="text-sm text-gray-700">{order.shipping.firstName} {order.shipping.lastName}</p>
                  <p className="text-sm text-gray-500">{order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
                </div>
              )}
              {/* Cost breakdown */}
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${order.tax?.toFixed(2)}</span></div>
                <div className="flex justify-between font-extrabold text-gray-900 text-sm pt-1 border-t border-gray-200">
                  <span>Total</span><span>${order.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Reorder button */}
              <button
                onClick={() => handleReorder(order)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2
                  ${reordered === order.id
                    ? 'bg-green-500 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {reordered === order.id ? '✓ Added to Cart!' : '🔁 Order Again'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Saved Formulas ────────────────────────────────────────────────────────────
// ── Share Formula Modal (inline, for saved formulas) ─────────────────────────
function ShareFormulaModal({ isOpen, onClose, formula }) {
  const { user } = useAuth();
  const { shareFormula } = useCommunity();
  const [name, setName]           = useState(formula?.name || '');
  const [description, setDesc]    = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);

  useEffect(() => { if (formula) setName(formula.name || ''); }, [formula]);

  if (!isOpen) return null;

  const handleShare = async () => {
    setError('');
    if (!name.trim()) { setError('Please give your formula a name.'); return; }
    setLoading(true);
    const result = await shareFormula(user, {
      name, description, anonymous,
      tags: [],
      carbs:         formula.carbs,
      sodium:        formula.sodium,
      potassium:     formula.potassium ?? 100,
      magnesium:     formula.magnesium ?? 20,
      caffeine:      formula.caffeine ?? 0,
      fructoseRatio: formula.fructoseRatio ?? 0.35,
      thickness:     formula.thickness ?? 3,
      flavor:        formula.flavor ?? 'Neutral / Unflavored',
    });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Share to Community</h2>
            <p className="text-xs text-gray-400">Let others try your formula</p>
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
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1 border border-gray-100">
                <p className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-2 text-gray-400">Formula Preview</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {formula?.carbs && <span>⚡ {formula.carbs}g carbs</span>}
                  {formula?.sodium && <span>🧂 {formula.sodium}mg sodium</span>}
                  {formula?.caffeine > 0 && <span>☕ {formula.caffeine}mg caffeine</span>}
                  {formula?.flavor && <span>🍓 {formula.flavor.split(' ')[0]}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} maxLength={60}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Description (optional)</label>
                <textarea value={description} onChange={e => setDesc(e.target.value)}
                  rows={3} maxLength={300} placeholder="What makes this formula special?"
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

function SavedFormulas({ onLoadFormula }) {
  const { getSavedFormulas, deleteFormula } = useAuth();
  const [formulas, setFormulas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [shareTarget,   setShareTarget]   = useState(null);
  const [compareTarget, setCompareTarget] = useState(null);

  const refresh = () => getSavedFormulas().then(data => { setFormulas(data); setLoading(false); });
  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id) => {
    await deleteFormula(id);
    refresh();
  };

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">Loading formulas...</div>
  );

  if (formulas.length === 0) return (
    <EmptyState icon="🧪" title="No saved formulas"
      description="After customizing your gel formula, save it to quickly reorder your exact blend." />
  );

  return (
    <>
      <ShareFormulaModal
        isOpen={!!shareTarget}
        onClose={() => setShareTarget(null)}
        formula={shareTarget}
      />
      {compareTarget && (
        <FormulaCompare
          formulaA={compareTarget}
          titleA={compareTarget.name}
          onClose={() => setCompareTarget(null)}
        />
      )}
      <div className="space-y-3">
        {formulas.map(f => (
          <div key={f.id} className="bg-black text-white rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-white truncate">{f.name || 'Custom Formula'}</p>
                {f.quizGenerated && (
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Quiz
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
                {f.carbs && <span>⚡ {f.carbs}g carbs</span>}
                {f.sodium && <span>🧂 {f.sodium}mg sodium</span>}
                {f.caffeine > 0 && <span>☕ {f.caffeine}mg caffeine</span>}
                {f.flavor && <span>🍓 {f.flavor.split(' ')[0]}</span>}
                {f.potassium && <span>⚗️ {f.potassium}mg potassium</span>}
                {f.magnesium && <span>💊 {f.magnesium}mg magnesium</span>}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Saved {new Date(f.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => onLoadFormula(f)}
                className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                Load →
              </button>
              <button onClick={() => setShareTarget(f)}
                className="text-gray-400 text-xs px-3 py-1.5 rounded-lg hover:text-white border border-gray-700 hover:border-gray-400 transition">
                Share
              </button>
              <button onClick={() => setCompareTarget(f)}
                className="text-gray-400 text-xs px-3 py-1.5 rounded-lg hover:text-white border border-gray-700 hover:border-gray-400 transition">
                Compare
              </button>
              <button onClick={() => handleDelete(f.id)}
                className="text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:text-red-400 border border-gray-700 hover:border-red-400 transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Profile Settings ──────────────────────────────────────────────────────────
function ProfileSettings() {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName]               = useState(user?.name || '');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [msg, setMsg]                 = useState(null); // { type: 'success'|'error', text }
  const [loading, setLoading]         = useState(false);

  const handleSave = async () => {
    setMsg(null);
    if (newPw && newPw !== confirmPw) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    const result = await updateProfile({
      name,
      currentPassword: currentPw || undefined,
      newPassword: newPw || undefined,
    });
    setLoading(false);
    if (result.error) { setMsg({ type: 'error', text: result.error }); return; }
    setMsg({ type: 'success', text: 'Profile updated successfully.' });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile</p>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
          <input value={user?.email} disabled
            className="border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          <p className="text-xs text-gray-400">Email cannot be changed.</p>
        </div>
        <p className="text-xs text-gray-400">
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
        </p>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Change Password</p>
        {[
          { label: 'Current Password', value: currentPw, set: setCurrentPw },
          { label: 'New Password', value: newPw, set: setNewPw },
          { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
        ].map(({ label, value, set }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <input type="password" value={value} onChange={e => set(e.target.value)}
              placeholder="••••••••"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition" />
          </div>
        ))}
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2
          ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.type === 'success' ? '✓' : '⚠️'} {msg.text}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={loading}
          className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={signOut}
          className="border border-gray-200 text-gray-500 px-5 py-3 rounded-xl font-medium hover:border-red-300 hover:text-red-500 transition text-sm">
          Sign Out
        </button>
      </div>
    </div>
  );
}


// ── Subscriptions ─────────────────────────────────────────────────────────────
function Subscriptions() {
  const { getMyOrders } = useAuth();
  const [subs, setSubs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelled, setCancelled] = useState({});
  const [paused, setPaused]       = useState({});

  useEffect(() => {
    getMyOrders().then(orders => {
      const subOrders = orders.filter(o => o.isSubscription);
      setSubs(subOrders);
      setLoading(false);
    });
  }, [getMyOrders]);

  if (loading) return (
    <div className="text-center py-12 text-gray-400 text-sm">Loading subscriptions...</div>
  );

  if (subs.length === 0) return (
    <EmptyState icon="🔄" title="No active subscriptions"
      description="At checkout, choose Subscribe & Save to get 10% off and auto-ship your formula on a schedule."
    />
  );

  return (
    <div className="space-y-4">
      {subs.map(sub => {
        const isCancelled = cancelled[sub.id];
        const isPaused    = paused[sub.id];
        const nextDate    = new Date();
        nextDate.setDate(nextDate.getDate() + (sub.subInterval ?? 4) * 7);

        return (
          <div key={sub.id} className={`border rounded-2xl overflow-hidden transition-opacity ${isCancelled ? 'opacity-50' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">🔄</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Every {sub.subInterval ?? 4} weeks</p>
                  <p className="text-xs text-gray-400">Order {sub.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-gray-900">${sub.total?.toFixed(2)}</p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full
                  ${isCancelled ? 'bg-red-100 text-red-600' : isPaused ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {isCancelled ? 'Cancelled' : isPaused ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="px-5 py-4 space-y-2">
              {sub.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.emoji} {item.name} × {item.qty}</span>
                  <span className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Next shipment */}
            {!isCancelled && (
              <div className="px-5 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
                <span className="text-blue-500 text-sm">📅</span>
                <p className="text-xs text-blue-700 font-medium">
                  {isPaused ? 'Paused — resume to schedule next shipment' : `Next shipment: ${nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </p>
              </div>
            )}

            {/* Actions */}
            {!isCancelled && (
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setPaused(p => ({ ...p, [sub.id]: !p[sub.id] }))}
                  className="flex-1 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-50 transition">
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Cancel this subscription? This cannot be undone.')) {
                      setCancelled(c => ({ ...c, [sub.id]: true }));
                    }
                  }}
                  className="flex-1 border border-red-200 text-red-500 text-xs font-bold py-2.5 rounded-xl hover:bg-red-50 transition">
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
        <p className="font-bold text-gray-700 mb-1">About subscriptions</p>
        Subscriptions auto-ship your exact formula on your chosen schedule with 10% off every order.
        Changes take effect on the next shipment. To modify your formula or shipping address, cancel and reorder.
      </div>
    </div>
  );
}

// ── Main AccountPage ──────────────────────────────────────────────────────────
export default function AccountPage({ onLoadFormula }) {
  const { user, isDev } = useAuth();
  const [tab, setTab] = useState('orders');

  const TABS = [
    { id: 'orders',        label: 'Orders',      icon: '📦' },
    { id: 'subscriptions', label: 'Auto-Ship',   icon: '🔄' },
    { id: 'formulas',      label: 'Formulas',    icon: '🧪' },
    { id: 'profile',       label: 'Profile',     icon: '👤' },
    ...(isDev ? [{ id: 'dev', label: 'Dev', icon: '⚡' }] : []),
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-0">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">My Account</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-w-0
              ${t.id === 'dev' ? (tab === t.id ? 'bg-red-500 text-white shadow-sm' : 'text-red-400 hover:text-red-600') : (tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <>
          <SectionHeader title="Order History" subtitle="All your past ReFuel orders in one place." />
          <OrderHistory />
        </>
      )}
      {tab === 'subscriptions' && (
        <>
          <SectionHeader title="Auto-Ship Subscriptions" subtitle="Manage your recurring gel orders. 10% off every shipment." />
          <Subscriptions />
        </>
      )}
      {tab === 'formulas' && (
        <>
          <SectionHeader title="Saved Formulas" subtitle="Load any saved formula directly into the builder." />
          <SavedFormulas onLoadFormula={formula => { onLoadFormula(formula); }} />
        </>
      )}
      {tab === 'profile' && (
        <>
          <SectionHeader title="Profile & Security" subtitle="Manage your account details and password." />
          <ProfileSettings />
        </>
      )}
      {tab === 'dev' && isDev && (
        <DevPanel />
      )}
    </div>
  );
}