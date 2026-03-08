"use client";
import { useState, useEffect } from 'react';

const STATS = [
  { value: '100%', label: 'Customizable' },
  { value: '$1.88', label: 'Per pouch' },
  { value: '5',    label: 'Flavor options' },
  { value: '24hr', label: 'Mixed fresh' },
];

export default function HomePage({ onTabChange }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Short delay so the transition is visible on first load
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full min-h-screen -mt-[1px]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">

        {/* Background: gradient + subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        {/* Accent lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />

        {/* Content */}
        <div className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-700
          ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">
            By Athletes, For Athletes
          </p>

          <h1 className="text-white font-black leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
            FUEL<br />
            <span className="text-transparent" style={{
              WebkitTextStroke: '2px rgba(255,255,255,0.25)'
            }}>YOUR</span><br />
            RACE
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Custom gel powder, mixed fresh. Dial in your exact formula —
            carbs, electrolytes, caffeine, flavor — then we ship it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button onClick={() => onTabChange('quiz')}
              className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all hover:gap-3">
              Find Your Formula
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={() => onTabChange('products')}
              className="flex items-center gap-2 border border-white/20 text-white/70 px-8 py-4 rounded-full font-semibold text-sm tracking-wide hover:border-white/40 hover:text-white transition-all">
              Shop Products
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="bg-black/80 px-6 py-5 text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">The Process</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Race-day fuel, built by you.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Take the Quiz', body: 'Answer 7 questions about your race distance, sweat rate, and caffeine tolerance. We crunch the sports science.' },
              { step: '02', title: 'Dial Your Formula', body: 'Fine-tune every slider — carbs, sodium, potassium, caffeine, consistency. Preview your exact price as you go.' },
              { step: '03', title: 'We Mix & Ship', body: 'Your formula is mixed fresh to order and shipped within 24 hours. Every pouch is labeled with your exact macro breakdown.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <p className="text-7xl font-black text-gray-100 leading-none mb-4 select-none">{item.step}</p>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────────── */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">No commitment. Cancel anytime.</p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
          Your formula.<br />Your race.
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">Starting at $1.88 per pouch. Build the exact gel your body needs — not what a factory decided for you.</p>
        <button onClick={() => onTabChange('quiz')}
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all">
          Start for Free
        </button>
      </section>

    </div>
  );
}
