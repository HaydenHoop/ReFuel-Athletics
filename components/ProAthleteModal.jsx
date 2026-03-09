"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Avatar({ url, name, size = 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-20 h-20 text-xl' };
  if (url) return (
    <img src={url} alt={name}
      className={`${sizes[size]} rounded-full object-cover ring-2 ring-black/10`} />
  );
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold ring-2 ring-black/10`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full tracking-wide shadow-sm">
       PRO
    </span>
  );
}

export { Avatar, ProBadge };

export default function ProAthleteModal({ userId, userName, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, is_pro, race_results')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  const results = profile?.race_results || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pro Athlete</p>
          <button onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
        ) : (
          <div className="px-5 py-6 space-y-6">

            {/* Profile card */}
            <div className="flex items-center gap-4">
              <Avatar url={profile?.avatar_url} name={userName} size="lg" />
              <div>
                <h2 className="text-xl font-black text-gray-900">{userName}</h2>
                <div className="mt-1"><ProBadge /></div>
              </div>
            </div>

            {/* Race results */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Race Results & Achievements</p>
              {results.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="text-sm text-gray-400">Results coming soon</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{r.emoji || '🏅'}</div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{r.race}</p>
                        {r.year && <p className="text-xs text-gray-400">{r.year}</p>}
                        {r.time && (
                          <p className="text-lg font-black text-gray-900 mt-0.5">{r.time}</p>
                        )}
                        {r.placement && (
                          <p className="text-xs font-semibold text-amber-600 mt-0.5">{r.placement}</p>
                        )}
                        {r.notes && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
