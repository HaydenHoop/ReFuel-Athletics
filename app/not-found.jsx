"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 overflow-hidden relative">

      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(46,68,96,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(26,37,53,0.6) 0%, transparent 50%)',
        }} />

      {/* Giant 404 */}
      <div
        className={`select-none transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0ms' }}
      >
        <p
          className="font-black text-center leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(8rem, 28vw, 22rem)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.08)',
            userSelect: 'none',
            lineHeight: 0.85,
          }}
        >
          404
        </p>
      </div>

      {/* Content card */}
      <div
        className={`relative z-10 -mt-8 sm:-mt-16 text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '150ms' }}
      >
        {/* RF logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black text-xs font-black tracking-tighter">RF</span>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/30 mb-4">
          ReFuel Athletics
        </p>

        <h1 className="text-white font-black text-3xl sm:text-4xl tracking-tight mb-4"
          style={{ lineHeight: 1.1 }}>
          Page not found.
        </h1>

        <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed mb-10">
          Looks like this route hit a wall. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all hover:gap-3">
            Back to Home
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/shop"
            className="flex items-center gap-2 border border-white/20 text-white/70 px-7 py-3.5 rounded-full font-semibold text-sm hover:border-white/40 hover:text-white transition-all">
            Shop Products
          </Link>
        </div>
      </div>

      {/* Bottom scroll cue / label */}
      <div
        className={`absolute bottom-8 left-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '400ms' }}
      >
        <p className="text-white/15 text-xs font-bold uppercase tracking-[0.3em]">Error 404</p>
      </div>
    </div>
  );
}
