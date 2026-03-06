"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function StarPicker({ value, onChange, size = 'lg' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'text-5xl' : 'text-2xl';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className={`${sz} transition-transform hover:scale-110 leading-none`}
          style={{ color: n <= (hovered || value) ? '#f59e0b' : '#e5e7eb' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

function ReviewForm() {
  const params = useSearchParams();
  const token   = params.get('token');
  const orderId = params.get('order');
  const initRating = parseInt(params.get('rating') ?? '0');

  const [rating, setRating]       = useState(initRating);
  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [name, setName]           = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!token)  { setError('Invalid review link.'); return; }
    setError('');
    setLoading(true);

    const res = await fetch('/api/reviews/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token, orderId, rating,
        title:     title.trim(),
        body:      body.trim(),
        reviewer:  anonymous ? 'Anonymous' : (name.trim() || 'Anonymous'),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🏅</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thanks for your review!</h2>
        <p className="text-gray-800 mb-6">Your feedback helps other athletes find their perfect formula.</p>
        <a href="https://refuelgel.com"
          className="inline-block bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
          Back to ReFuel →
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-black text-white px-8 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">ReFuel Athletics</p>
          <h1 className="text-2xl font-extrabold">Leave Your Review</h1>
          {orderId && <p className="text-gray-400 text-sm mt-1">Order #{orderId}</p>}
        </div>

        <div className="p-8 space-y-6">
          {/* Star rating */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-3">
              Your Rating *
            </label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-sm font-semibold text-gray-900 mt-2">{STAR_LABELS[rating]}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-2">
              Review Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. Perfect for my marathon training"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-2">
              Your Review
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              maxLength={600}
              rows={4}
              placeholder="How did the formula perform? Any tips for other athletes?"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition resize-none text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{body.length}/600</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-2">
              Your Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              placeholder="First name or nickname"
              disabled={anonymous}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition disabled:opacity-40 disabled:bg-gray-50 text-gray-900 placeholder:text-gray-400"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="accent-black" />
              <span className="text-sm text-gray-700">Post anonymously</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-base hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ReviewForm />
    </Suspense>
  );
}