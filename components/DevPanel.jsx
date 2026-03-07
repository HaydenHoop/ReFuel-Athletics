"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ── Shared ────────────────────────────────────────────────────────────────────
function DevSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-red-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-red-50 hover:bg-red-100 transition text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-red-900">{title}</span>
        </div>
        <span className={`text-red-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="p-5 bg-white">{children}</div>}
    </div>
  );
}

// ── User Directory ────────────────────────────────────────────────────────────
function UserProfile({ user: u, onBack }) {
  const [tab, setTab]       = useState('orders');
  const [data, setData]     = useState({ orders: [], formulas: [], reviews: [], posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, formulasRes, reviewsRes, postsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        supabase.from('saved_formulas').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('reviewer', u.name ?? u.email).order('created_at', { ascending: false }),
        supabase.from('community_formulas').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
      ]);
      setData({
        orders:   ordersRes.data   ?? [],
        formulas: formulasRes.data ?? [],
        reviews:  reviewsRes.data  ?? [],
        posts:    postsRes.data    ?? [],
      });
      setLoading(false);
    }
    load();
  }, [u.id, u.name, u.email]);

  const TABS = [
    { id: 'orders',   label: `Orders (${data.orders.length})` },
    { id: 'formulas', label: `Formulas (${data.formulas.length})` },
    { id: 'reviews',  label: `Reviews (${data.reviews.length})` },
    { id: 'posts',    label: `Posts (${data.posts.length})` },
  ];

  return (
    <div>
      <button onClick={onBack} className="text-xs text-red-500 font-bold mb-4 hover:text-red-700 transition flex items-center gap-1">
        ← Back to users
      </button>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
          {u.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-bold text-gray-900">{u.name}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
          <p className="text-xs text-gray-300 font-mono mt-0.5">{u.id}</p>
        </div>
      </div>

      {loading ? <p className="text-sm text-gray-400 py-4 text-center">Loading...</p> : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition
                  ${tab === t.id ? 'bg-red-500 text-white' : 'border border-gray-200 text-gray-500 hover:border-red-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <div className="space-y-2">
              {data.orders.length === 0 ? <p className="text-sm text-gray-400">No orders.</p> :
                data.orders.map(o => (
                  <div key={o.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">{o.order_ref}</span>
                      <span className="font-bold">${o.total?.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                      {o.is_subscription && ' · 🔄 Sub'}
                    </p>
                    <p className="text-xs text-gray-500">{o.shipping?.city}, {o.shipping?.state}</p>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'formulas' && (
            <div className="space-y-2">
              {data.formulas.length === 0 ? <p className="text-sm text-gray-400">No saved formulas.</p> :
                data.formulas.map(f => (
                  <div key={f.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <p className="font-bold">{f.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-400">{f.carbs}g carbs · {f.sodium}mg sodium{f.caffeine > 0 ? ` · ${f.caffeine}mg caffeine` : ''}</p>
                    <p className="text-xs text-gray-300">{new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-2">
              {data.reviews.length === 0 ? <p className="text-sm text-gray-400">No reviews.</p> :
                data.reviews.map(r => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    {r.title && <p className="font-bold mt-1">{r.title}</p>}
                    {r.body  && <p className="text-gray-500 text-xs mt-0.5">{r.body}</p>}
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'posts' && (
            <div className="space-y-2">
              {data.posts.length === 0 ? <p className="text-sm text-gray-400">No community posts.</p> :
                data.posts.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <p className="font-bold">{p.name || 'Unnamed Formula'}</p>
                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                    <p className="text-xs text-gray-300">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UserDirectory() {
  const [users, setUsers]     = useState([]);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Use admin API to list all auth users
    fetch('/api/dev/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false); })
      .catch(() => {
        // fallback: pull from orders if admin endpoint not yet set up
        supabase.from('orders').select('user_id, shipping, created_at')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            const seen = new Set();
            const uniq = [];
            for (const row of (data ?? [])) {
              if (!seen.has(row.user_id)) {
                seen.add(row.user_id);
                uniq.push({
                  id:    row.user_id,
                  name:  `${row.shipping?.firstName ?? ''} ${row.shipping?.lastName ?? ''}`.trim() || 'Unknown',
                  email: row.shipping?.email ?? '',
                });
              }
            }
            setUsers(uniq);
            setLoading(false);
          });
      });
  }, []);

  if (selected) return <UserProfile user={selected} onBack={() => setSelected(null)} />;

  const filtered = users.filter(u =>
    (u.name  ?? '').toLowerCase().includes(query.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 mb-4" />
      {loading ? <p className="text-sm text-gray-400">Loading users...</p> :
        filtered.length === 0 ? <p className="text-sm text-gray-400">No users found.</p> :
        <div className="space-y-2">
          {filtered.map(u => (
            <button key={u.id} onClick={() => setSelected(u)}
              className="w-full flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-red-300 hover:bg-red-50 transition text-left group">
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {u.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{u.name || 'No name'}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <span className="text-gray-300 group-hover:text-red-400 transition text-sm">→</span>
            </button>
          ))}
        </div>
      }
      <p className="text-xs text-gray-400 mt-3">{filtered.length} of {users.length} users</p>
    </div>
  );
}

// ── Review Manager (add + delete) ─────────────────────────────────────────────
function ReviewManager() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [adding, setAdding]   = useState(false);

  // New review form state
  const [newRating,   setNewRating]   = useState(5);
  const [newReviewer, setNewReviewer] = useState('');
  const [newTitle,    setNewTitle]    = useState('');
  const [newBody,     setNewBody]     = useState('');
  const [newProduct,  setNewProduct]  = useState('gel');
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data ?? []); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!newBody.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:    `dev-${Date.now()}`,
          orderId:  'DEV-ADDED',
          rating:   newRating,
          title:    newTitle.trim() || null,
          body:     newBody.trim(),
          reviewer: newReviewer.trim() || 'Verified Athlete',
          product:  newProduct,
        }),
      });
      const data = await res.json();
      if (data.error) { alert('Error: ' + data.error); }
    } catch (e) {
      alert('Failed to add review: ' + e.message);
    }
    setSaving(false);
    setAdding(false);
    setNewRating(5); setNewReviewer(''); setNewTitle(''); setNewBody('');
    load();
  };

  const toggleApprove = async (id, current) => {
    await supabase.from('reviews').update({ approved: !current }).eq('id', id);
    load();
  };

  const deleteReview = async (id) => {
    await supabase.from('reviews').delete().eq('id', id);
    load();
  };

  const filtered = filter === 'all' ? reviews :
    filter === 'approved' ? reviews.filter(r => r.approved) :
    reviews.filter(r => !r.approved);

  return (
    <div>
      {/* Add review button */}
      <div className="mb-4">
        {!adding ? (
          <button onClick={() => setAdding(true)}
            className="w-full py-3 border-2 border-dashed border-red-200 text-red-400 rounded-xl text-sm font-bold hover:border-red-400 hover:text-red-600 transition">
            + Add Review / Testimonial
          </button>
        ) : (
          <div className="border-2 border-red-300 rounded-xl p-4 bg-red-50/30 space-y-3">
            <p className="font-bold text-red-900 text-sm">Add Review</p>

            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setNewRating(n)}
                  className={`text-2xl transition-transform hover:scale-110 leading-none`}
                  style={{ color: n <= newRating ? '#f59e0b' : '#d1d5db' }}>★</button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={newReviewer} onChange={e => setNewReviewer(e.target.value)}
                placeholder="Reviewer name" maxLength={50}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
              <select value={newProduct} onChange={e => setNewProduct(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 bg-white">
                <option value="gel">Training Gel</option>
                <option value="raceday">Race Day Gel</option>
                <option value="flask">Flask</option>
              </select>
            </div>

            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="Review title (optional)" maxLength={80}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />

            <textarea value={newBody} onChange={e => setNewBody(e.target.value)}
              placeholder="Review text *" rows={3} maxLength={600}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none" />

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving || !newBody.trim()}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Add & Approve'}
              </button>
              <button onClick={() => setAdding(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-400 transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','approved','pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize
              ${filter === f ? 'bg-red-500 text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            {f} ({f==='all' ? reviews.length : f==='approved' ? reviews.filter(r=>r.approved).length : reviews.filter(r=>!r.approved).length})
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-400">Loading...</p> :
        filtered.length === 0 ? <p className="text-sm text-gray-400">No reviews.</p> :
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`border rounded-xl p-4 ${r.approved ? 'border-green-200 bg-green-50/20' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-amber-400 text-sm leading-none">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.approved ? 'Live' : 'Pending'}
                    </span>
                    {r.product && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.product}</span>}
                  </div>
                  {r.title && <p className="font-bold text-sm text-gray-900">{r.title}</p>}
                  {r.body  && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.body}</p>}
                  <p className="text-xs text-gray-300 mt-1">— {r.reviewer} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleApprove(r.id, r.approved)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition
                      ${r.approved ? 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                    {r.approved ? 'Unpublish' : 'Approve'}
                  </button>
                  <button onClick={() => deleteReview(r.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ── Test Email Sender ─────────────────────────────────────────────────────────
function TestEmailSender() {
  const { user } = useAuth();
  const [sending, setSending] = useState({});
  const [results, setResults] = useState({});

  const send = async (id, endpoint, body) => {
    setSending(s => ({ ...s, [id]: true }));
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, email: user.email, firstName: user.name }),
      });
      const data = await res.json();
      setResults(r => ({ ...r, [id]: data.error ? `❌ ${data.error}` : '✓ Sent!' }));
    } catch (e) {
      setResults(r => ({ ...r, [id]: `❌ ${e.message}` }));
    }
    setSending(s => ({ ...s, [id]: false }));
    setTimeout(() => setResults(r => { const n = {...r}; delete n[id]; return n; }), 5000);
  };

  const SCENARIOS = [
    {
      id: 'welcome',
      label: 'Welcome Email',
      desc: 'Sent on signup',
      icon: '👋',
      action: () => send('welcome', '/api/email/welcome', { name: user.name }),
    },
    {
      id: 'order',
      label: 'Order Confirmation',
      desc: 'Sent after checkout',
      icon: '📦',
      action: () => send('order', '/api/email/order', {
        orderId: 'TEST-001',
        items: [{ name: 'Custom Gel Powder (10 pouches)', emoji: '🧪', qty: 1, price: 18.80 }],
        shipping: { firstName: user.name, email: user.email, address: '123 Test St', city: 'Boulder', state: 'CO', zip: '80301', shippingMethod: 'standard' },
        subtotal: 18.80, shippingCost: 6.99, tax: 1.50, total: 27.29,
      }),
    },
    {
      id: 'review',
      label: 'Review Request Email',
      desc: 'Sends immediately (test mode)',
      icon: '⭐',
      action: () => send('review', '/api/email/review-request', {
        orderId: 'TEST-001',
        items: [{ name: 'Custom Gel Powder', emoji: '🧪' }],
        shippingMethod: 'standard',
        reviewToken: `test-${Date.now()}`,
        test: true,  // ← bypasses the shipping delay
      }),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-2">All test emails send to <strong className="text-gray-700">{user.email}</strong></p>
      {SCENARIOS.map(s => (
        <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="font-bold text-sm text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {results[s.id] && (
              <span className={`text-xs font-medium ${results[s.id].startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {results[s.id]}
              </span>
            )}
            <button onClick={s.action} disabled={sending[s.id]}
              className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition disabled:opacity-50 whitespace-nowrap">
              {sending[s.id] ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

// ── Pro Request Manager ───────────────────────────────────────────────────────
function ProRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // user being viewed

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, avatar_url, is_pro, pro_status, race_results, requester_name, requester_email')
      .in('pro_status', ['pending', 'approved', 'rejected'])
      .order('user_id');
    setRequests((data || []).map(p => ({
      ...p,
      name:  p.requester_name  || p.user_id.slice(0, 8) + '...',
      email: p.requester_email || '',
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (userId, status) => {
    await supabase.from('profiles').upsert(
      { user_id: userId, pro_status: status, is_pro: status === 'approved' },
      { onConflict: 'user_id' }
    );
    load();
  };

  if (selected) return (
    <ProAthleteEditor
      profile={selected}
      onBack={() => { setSelected(null); load(); }}
    />
  );

  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>;
  if (requests.length === 0) return <p className="text-sm text-gray-400">No pro requests yet.</p>;

  return (
    <div className="space-y-3">
      {requests.map(r => (
        <div key={r.user_id} className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold overflow-hidden">
                {r.avatar_url
                  ? <img src={r.avatar_url} className="w-full h-full object-cover" alt="" />
                  : r.name?.[0]?.toUpperCase()
                }
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  {r.name}
                  {r.is_pro && <span className="bg-amber-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full">⚡ PRO</span>}
                </p>
                <p className="text-xs text-gray-400">{r.email}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              r.pro_status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
              r.pro_status === 'approved' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {r.pro_status}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.pro_status !== 'approved' && (
              <button onClick={() => setStatus(r.user_id, 'approved')}
                className="text-xs font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition">
                ✓ Approve
              </button>
            )}
            {r.pro_status !== 'rejected' && (
              <button onClick={() => setStatus(r.user_id, 'rejected')}
                className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition">
                ✕ Reject
              </button>
            )}
            <button onClick={() => setSelected(r)}
              className="text-xs font-bold border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-gray-400 transition">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pro Athlete Editor ────────────────────────────────────────────────────────
function ProAthleteEditor({ profile, onBack }) {
  const [results, setResults] = useState(profile.race_results || []);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const addResult = () => setResults(r => [...r, { race: '', year: '', time: '', placement: '', notes: '', emoji: '🏅' }]);
  const removeResult = (i) => setResults(r => r.filter((_, idx) => idx !== i));
  const updateResult = (i, key, val) => setResults(r => r.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert(
      { user_id: profile.user_id, race_results: results },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <button onClick={onBack} className="text-xs text-red-500 font-bold mb-4 flex items-center gap-1 hover:text-red-700">
        ← Back to requests
      </button>
      <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold overflow-hidden">
          {profile.avatar_url
            ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
            : profile.name?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <p className="font-bold text-sm">{profile.name}</p>
          <p className="text-xs text-gray-400">{profile.email}</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Race Results</p>
      <div className="space-y-4 mb-4">
        {results.map((r, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-500">Result #{i + 1}</p>
              <button onClick={() => removeResult(i)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
            </div>
            {[
              { key: 'emoji',     label: 'Emoji',     placeholder: '🏅' },
              { key: 'race',      label: 'Race Name', placeholder: 'Ironman World Championship' },
              { key: 'year',      label: 'Year',      placeholder: '2024' },
              { key: 'time',      label: 'Finish Time', placeholder: '8:45:32' },
              { key: 'placement', label: 'Placement', placeholder: '3rd Overall AG' },
              { key: 'notes',     label: 'Notes',     placeholder: 'Optional extra details' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400">{label}</label>
                <input value={r[key] || ''} onChange={e => updateResult(i, key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-black mt-0.5" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addResult}
          className="flex-1 border border-dashed border-gray-300 text-gray-500 text-sm py-2.5 rounded-xl hover:border-gray-400 transition">
          + Add Result
        </button>
        <button onClick={save} disabled={saving}
          className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition ${saved ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'} disabled:opacity-50`}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Results'}
        </button>
      </div>
    </div>
  );
}

export default function DevPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="font-extrabold text-red-900">Developer Panel</p>
          <p className="text-xs text-red-400">These controls are only visible to dev accounts</p>
        </div>
      </div>
      <DevSection title="User Directory" icon="👥"><UserDirectory /></DevSection>
      <DevSection title="Pro Athlete Requests" icon="⚡"><ProRequestManager /></DevSection>
      <DevSection title="Review & Testimonial Management" icon="⭐"><ReviewManager /></DevSection>
      <DevSection title="Test Emails" icon="📧"><TestEmailSender /></DevSection>
    </div>
  );
}