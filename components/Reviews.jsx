"use client";
import { useState, useEffect } from 'react';

function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base';
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`${sz} leading-none`}
          style={{ color: n <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

function ReviewsModal({ isOpen, onClose, reviews, summary, productName }) {
  if (!isOpen) return null;
  const withText = reviews.filter(r => r.body);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{productName}</p>
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(summary.avg)} size="md" />
              <span className="text-2xl font-extrabold text-gray-900">{summary.avg.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({summary.total} reviews)</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
        </div>
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct   = summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-gray-500 w-2">{star}</span>
                <span className="text-amber-400 text-xs leading-none">★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {withText.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No written reviews yet — be the first after your order!</p>
          ) : withText.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <Stars rating={r.rating} />
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {r.title && <p className="font-bold text-gray-900 text-sm mt-1">{r.title}</p>}
              {r.body  && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{r.body}</p>}
              <p className="text-xs text-gray-400 mt-2">— {r.reviewer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Per-product star widget ───────────────────────────────────────────────────
export function ProductStars({ productKey, productName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews/submit?limit=100&product=${productKey}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productKey]);

  const avg     = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const total   = reviews.length;
  const summary = { avg, total };

  return (
    <>
      <ReviewsModal isOpen={modalOpen} onClose={() => setModal(false)}
        reviews={reviews} summary={summary} productName={productName} />
      <button onClick={() => setModal(true)}
        className="flex items-center gap-1.5 group hover:opacity-75 transition mt-1">
        <Stars rating={total > 0 ? Math.round(avg) : 0} size="sm" />
        <span className="text-xs text-gray-400 underline underline-offset-2 group-hover:text-gray-700 transition">
          {loading ? '...' : total > 0 ? `${avg.toFixed(1)} (${total})` : 'No reviews yet'}
        </span>
      </button>
    </>
  );
}

// ── Testimonials section ──────────────────────────────────────────────────────
export function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews/submit?topFive=true')
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">From the community</p>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Testimonials</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-40" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-bold text-gray-900 mb-1">No testimonials yet</p>
          <p className="text-sm text-gray-400">Reviews will appear here after customers leave feedback</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {reviews.map(r => (
            <div key={r.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <Stars rating={r.rating ?? 5} size="sm" />
              {r.title && (
                <p className="font-extrabold text-gray-900 text-base mt-3 leading-snug">{r.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-2 leading-relaxed flex-1">"{r.body}"</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {r.reviewer?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <p className="text-xs font-semibold text-gray-700">{r.reviewer}</p>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full ml-auto">✓ Verified</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}