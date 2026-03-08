"use client";
import { useState, useEffect, useRef } from 'react';

// ─── Slideshow config ─────────────────────────────────────────────────────────
// Set src: '/images/your-photo.jpg' when you have real images.
// Until then, rich gradient placeholders are shown with a label overlay.
const SLIDES = [
  {
    src:   '/images/beach.jpg',   
    label: 'Coast',
    hint:  'Coastal / beach running scene',
    gradient: 'linear-gradient(160deg, #0a2540 0%, #1a5276 40%, #0d1b2a 100%)',
  },
  {
    src:   '/images/forest.jpg',  
    label: 'Trail',
    hint:  'Forest trail running scene',
    gradient: 'linear-gradient(160deg, #0b2010 0%, #1e5c2a 40%, #061209 100%)',
  },
  {
    src:   '/images/mountain.jpeg',   
    label: 'Summit',
    hint:  'Mountain / alpine racing scene',
    gradient: 'linear-gradient(160deg, #12121e 0%, #2c3e6b 40%, #0a0a14 100%)',
  },
];

const STATS = [
  { value: '100%',  label: 'Customizable' },
  { value: '$1.88', label: 'Per pouch' },
  { value: '5',     label: 'Flavor options' },
  { value: '24hr',  label: 'Mixed fresh' },
];

export default function HomePage({ onTabChange }) {
  const [loaded, setLoaded]   = useState(false);
  const [current, setCurrent] = useState(0);
  const [fading, setFading]   = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = (idx) => {
    if (idx === current || fading) return;
    clearInterval(timerRef.current);
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
      startTimer();
    }, 600);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % SLIDES.length;
        return next;
      });
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black">

        {/* Slide background */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          {slide.src ? (
            <img src={slide.src} alt={slide.label}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ filter: 'brightness(0.75)' }} />
          ) : (
            // Placeholder: rich gradient + label so you know what image goes here
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: slide.gradient }}>
              <div className="border border-white/10 rounded-2xl px-8 py-5 text-center">
                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em] mb-1">Image placeholder</p>
                <p className="text-white/30 text-sm">{slide.hint}</p>
                <p className="text-white/15 text-xs mt-1">Set <code className="font-mono">src</code> in SLIDES config</p>
              </div>
            </div>
          )}
        </div>

        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 pointer-events-none" />

        {/* Slide label — top right */}
        <div className={`absolute top-5 right-6 z-20 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">{slide.label}</span>
        </div>

        {/* ── Hero content ── */}
        <div className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-700 pt-32
          ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/40 mb-8">
            By Athletes, For Athletes
          </p>

          <h1 className="text-white font-black leading-none tracking-tight mb-8 select-none"
            style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', lineHeight: 0.9 }}>
            FUEL<br />
            <span className="text-transparent"
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.55)' }}>YOUR</span><br />
            RACE
          </h1>

          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Custom gel powder, mixed fresh. Dial in your exact formula —
            carbs, electrolytes, caffeine, flavor — then we ship it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button onClick={() => onTabChange('quiz')}
              className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all hover:gap-3">
              Find Your Formula
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={() => onTabChange('products')}
              className="flex items-center gap-2 border border-white/50 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/20 hover:border-white transition-all">
              Shop Products
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="bg-black/70 px-6 py-5 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/30 mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-400 rounded-full
                ${current === i ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1.5 text-white/20 hidden sm:flex">
          <span className="text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">The Process</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Race-day fuel, built by you.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Take the Quiz',       body: 'Answer 7 questions about your race distance, sweat rate, and caffeine tolerance. We crunch the sports science.' },
              { step: '02', title: 'Dial Your Formula',   body: 'Fine-tune every slider — carbs, sodium, potassium, caffeine, consistency. Preview your price in real time.' },
              { step: '03', title: 'We Mix & Ship',       body: 'Your formula is mixed fresh to order and shipped within 24 hours. Every pouch labeled with your exact breakdown.' },
            ].map(item => (
              <div key={item.step}>
                <p className="text-8xl font-black text-gray-300 leading-none mb-4 select-none">{item.step}</p>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-black text-white py-20 px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600 mb-4">No commitment. Cancel anytime.</p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
          Your formula.<br />Your race.
        </h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm leading-relaxed">
          Starting at $1.88 per pouch. Build the exact gel your body needs —
          not what a factory decided for you.
        </p>
        <button onClick={() => onTabChange('quiz')}
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all">
          Start for Free
        </button>
      </section>

    </div>
  );
}