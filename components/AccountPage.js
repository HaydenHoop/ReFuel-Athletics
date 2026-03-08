"use client";
import { supabase } from '../lib/supabase';
import FormulaCompare from './FormulaCompare';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { Avatar, ProBadge } from './ProAthleteModal';
import DevPanel from './DevPanel';

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
    if (!getMyOrders) return;
    getMyOrders()
      .then(data => { setOrders(data || []); setLoading(false); })
      .catch(() => { setOrders([]); setLoading(false); });
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
function SavedFormulas({ onLoadFormula }) {
  const { getSavedFormulas, deleteFormula, user } = useAuth();
  const [formulas, setFormulas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [comparing, setComparing] = useState(null); // holds the formula being compared

  const refresh = () => {
    getSavedFormulas()
      .then(data => { setFormulas(data || []); setLoading(false); })
      .catch(() => { setFormulas([]); setLoading(false); });
  };
  useEffect(() => { if (user) refresh(); }, [user?.id]);

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
    {comparing && (
      <FormulaCompare
        formulaA={comparing}
        titleA={comparing.name || 'My Formula'}
        onClose={() => setComparing(null)}
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
            <button
              onClick={() => onLoadFormula(f)}
              className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              Load →
            </button>
            <button
              onClick={() => setComparing(f)}
              className="text-gray-300 text-xs px-3 py-1.5 rounded-lg hover:text-white border border-gray-700 hover:border-gray-400 transition"
            >
              ⚖️ Compare
            </button>
            <button
              onClick={() => handleDelete(f.id)}
              className="text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:text-red-400 border border-gray-700 hover:border-red-400 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}

// ── Race Performances ────────────────────────────────────────────────────────
function RacePerformances() {
  const { user } = useAuth();
  const [races, setRaces]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null);
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState({ race_name: '', date: '', distance: '', time: '', position: '', notes: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('race_results').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setRaces(data?.race_results || []);
        setLoading(false);
      });
  }, [user?.id]);

  const handleAdd = async () => {
    if (!form.race_name.trim()) return;
    setSaving(true);
    const updated = [...races, { ...form, id: Date.now().toString() }];
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, race_results: updated },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (error) { setMsg({ type: 'error', text: error.message }); return; }
    setRaces(updated);
    setForm({ race_name: '', date: '', distance: '', time: '', position: '', notes: '' });
    setAdding(false);
    setMsg({ type: 'success', text: 'Race added!' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id) => {
    const updated = races.filter(r => r.id !== id);
    await supabase.from('profiles').upsert(
      { user_id: user.id, race_results: updated },
      { onConflict: 'user_id' }
    );
    setRaces(updated);
  };

  const DISTANCES = ['5K', '10K', 'Half Marathon', 'Marathon', '50K', '50 Mile', '100K', '100 Mile', 'Sprint Tri', 'Olympic Tri', 'Half Iron', 'Ironman', 'Other'];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Race Performances</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">Your public race history</p>
        </div>
        <button onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition">
          {adding ? '✕ Cancel' : '+ Add Race'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="p-5 bg-amber-50 border-b border-amber-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Race Name *</label>
              <input value={form.race_name} onChange={e => setForm(f => ({ ...f, race_name: e.target.value }))}
                placeholder="e.g. Boston Marathon 2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Distance</label>
              <select value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition bg-white">
                <option value="">Select...</option>
                {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Finish Time</label>
              <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                placeholder="e.g. 3:12:44"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Finish Position</label>
              <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                placeholder="e.g. 12th overall"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Notes</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. PR, windy conditions, used ReFuel gel"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={saving || !form.race_name.trim()}
            className="w-full bg-black text-white py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Race →'}
          </button>
        </div>
      )}

      {/* Race list */}
      <div className="divide-y divide-gray-50">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : races.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🏅</p>
            <p className="text-sm font-semibold text-gray-500">No races added yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your race history to show on your public pro profile</p>
          </div>
        ) : (
          races.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">{r.race_name}</p>
                  {r.distance && <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{r.distance}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {r.time && <span className="text-xs text-gray-600 font-semibold">⏱ {r.time}</span>}
                  {r.position && <span className="text-xs text-gray-500">📍 {r.position}</span>}
                  {r.date && <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1 italic">{r.notes}</p>}
              </div>
              <button onClick={() => handleDelete(r.id)}
                className="text-gray-300 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1">
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {msg && (
        <div className={`mx-5 mb-4 text-xs px-3 py-2 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

// ── Avatar Crop Modal ─────────────────────────────────────────────────────────
function AvatarCropModal({ imageSrc, onConfirm, onCancel }) {
  const canvasRef    = useRef(null);
  const [scale, setScale]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef    = useRef(null);
  const SIZE = 300; // canvas/preview size

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      // Start scale so image fills the circle
      const fit = Math.max(SIZE / img.width, SIZE / img.height);
      setScale(fit);
      setOffset({ x: (SIZE - img.width * fit) / 2, y: (SIZE - img.height * fit) / 2 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas whenever scale/offset change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, offset.x, offset.y, img.width * scale, img.height * scale);
    ctx.restore();

    // Dim outside circle
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.rect(0, 0, SIZE, SIZE);
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2, true);
    ctx.fill();

    // Circle outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset]);

  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = {
      mx: e.clientX, my: e.clientY,
      ox: offset.x,  oy: offset.y,
    };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [dragging]);
  const onMouseUp = () => setDragging(false);

  // Touch support
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragging || !dragStart.current) return;
    const t = e.touches[0];
    setOffset({
      x: dragStart.current.ox + t.clientX - dragStart.current.mx,
      y: dragStart.current.oy + t.clientY - dragStart.current.my,
    });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    // Export a clean 400x400 JPEG from the current crop
    const out = document.createElement('canvas');
    out.width = 400; out.height = 400;
    const ctx = out.getContext('2d');
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();
    // Scale offset/dimensions from preview SIZE to output 400
    const ratio = 400 / SIZE;
    ctx.drawImage(img, offset.x * ratio, offset.y * ratio, img.width * scale * ratio, img.height * scale * ratio);
    out.toBlob(blob => onConfirm(blob), 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-extrabold text-gray-900">Crop Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">Drag to reposition · Scroll or pinch to zoom</p>
        </div>

        {/* Canvas preview */}
        <div className="flex justify-center bg-gray-900 py-6">
          <canvas
            ref={canvasRef}
            width={SIZE} height={SIZE}
            className="rounded-full cursor-grab active:cursor-grabbing"
            style={{ width: SIZE, height: SIZE }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">🔍</span>
            <input type="range" min={0.1} max={4} step={0.01}
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 py-4 flex gap-3 border-t border-gray-100">
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 bg-black text-white py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Settings ──────────────────────────────────────────────────────────
function ProfileSettings() {
  const { user, updateProfile, uploadAvatar, requestPro, signOut } = useAuth();
  const [name, setName]               = useState(user?.name || '');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [msg, setMsg]                 = useState(null);
  const [loading, setLoading]         = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [proLoading, setProLoading]   = useState(false);
  const [cropSrc, setCropSrc]         = useState(null);
  const fileRef                       = useRef(null);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob) => {
    setCropSrc(null);
    setAvatarLoading(true);
    const result = await uploadAvatar(blob);
    setAvatarLoading(false);
    if (result.error) setMsg({ type: 'error', text: result.error });
    else setMsg({ type: 'success', text: 'Profile picture updated!' });
  };

  const handleRequestPro = async () => {
    setProLoading(true);
    const result = await requestPro();
    setProLoading(false);
    if (result.error) setMsg({ type: 'error', text: result.error });
    else setMsg({ type: 'success', text: 'Pro request sent! We will review it shortly.' });
  };

  return (
    <>
    {cropSrc && (
      <AvatarCropModal
        imageSrc={cropSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => { setCropSrc(null); }}
      />
    )}
    <div className="space-y-6">

      {/* Avatar + name card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile</p>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar url={user?.avatarUrl} name={user?.name} size="lg" />
            {avatarLoading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-2">
              {user?.name}
              {user?.isPro && <ProBadge />}
            </p>
            <p className="text-xs text-gray-400 mb-2">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
              Change photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition" />
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
          <input value={user?.email} disabled
            className="border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
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

      {/* Pro request */}
      {(
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900 flex items-center gap-2">
                Apply for Pro Status <ProBadge />
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-3 leading-relaxed">
                Are you a competitive athlete? Apply for a Pro tag and showcase your race results on your public profile.
              </p>
              {user?.isPro ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  ✓ Accepted — you have Pro status
                </div>
              ) : user?.proStatus === 'pending' ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                  ⏳ Request pending review
                </div>
              ) : user?.proStatus === 'rejected' ? (
                <div className="text-xs text-red-500 font-semibold">Application not approved. Contact us for details.</div>
              ) : (
                <button onClick={handleRequestPro} disabled={proLoading}
                  className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
                  {proLoading ? 'Sending...' : 'Request Pro Status →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Race Performances — only shown to Pro athletes */}
      {user?.isPro && (
        <RacePerformances />
      )}

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
    </>
  );
}

// ── Main AccountPage ──────────────────────────────────────────────────────────
export default function AccountPage({ onLoadFormula }) {
  const { user, isDev } = useAuth();
  const [tab, setTab] = useState('orders');

  const TABS = [
    { id: 'orders',   label: 'Order History', icon: '📦' },
    { id: 'formulas', label: 'Saved Formulas', icon: '🧪' },
    { id: 'profile',  label: 'Profile',        icon: '👤' },
    ...(isDev ? [{ id: 'dev', label: 'Dev', icon: '⚡' }] : []),
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">My Account</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-xl transition-all
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