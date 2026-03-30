"use client";

const MISSION_CONTENT = {
  tagline: "Built for athletes who refuse to compromise.",
  intro: `ReFuel Athletics is a company built by athletes for athletes. Our mission is to give you the best nutrition for your workouts while reducing impacts on the environment. We refuse to force athletes to compromise between reducing waste and pushing your boundaries to the max.`,
  sections: [
    {
      eyebrow: "Why We Started",
      heading: "The Problem With Off-the-Shelf Gels",
      body: `We are tired of the major gel companies selling overpriced single-use gels that end up on the trails or in a landfill. The plastic used for these gels is non-recyclable and harmful to animals that eat the sweet gel packets. Why should athletes who rely so much on nature be forced to destroy it in order to use the best products?`,
      media: {
        type: 'image',
        src: null,
        gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 60%, #111 100%)',
        placeholder: 'Single-use gel wrappers discarded on a trail',
        caption: 'Millions of single-use gel packets end up in landfills each year.',
      },
    },
    {
      eyebrow: "Our Approach",
      heading: "Precision Over Guesswork",
      body: `We believe that every athlete deserves their own formula. There is no one gel fits all when you are trying to push your body to the limit, thats why we are here to elevate your limit even further. Our formula builder is backed by science to provide performance & customization everywhere it counts.`,
      media: {
        type: 'video',
        src: null,
        gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 60%, #0a1628 100%)',
        placeholder: 'Athlete using the ReFuel formula builder',
        caption: 'The ReFuel formula builder — dial in every variable.',
      },
    },
    {
      eyebrow: "Our Promise",
      heading: "Clean Ingredients. Real Performance.",
      body: `We use ingredients that you can trust. You cant reach your limits without confidence and what better way to gain confidence then knowing what you are putting in your body's engine is scientifically backed to work with you in order to break your records.`,
      media: {
        type: 'image',
        src: null,
        gradient: 'linear-gradient(135deg, #0b1e0f 0%, #1a4a22 60%, #0a1a0e 100%)',
        placeholder: 'Pharmaceutical-grade ingredient jars and lab equipment',
        caption: 'Pharmaceutical-grade ingredients — nothing hidden, nothing filler.',
      },
    },
  ],
  values: [
    { icon: null, label: "Science-Backed",  title: "Science-Backed",  description: "Every formula grounded in sports nutrition research." },
    { icon: null, label: "Personalized",    title: "Personalized",    description: "No two athletes are the same. Neither are our gels." },
    { icon: null, label: "Sustainable",     title: "Sustainable",     description: "Reusable packets. Minimal waste. Maximum performance." },
    { icon: null, label: "Race-Ready",      title: "Race-Ready",      description: "Tested by real athletes in real conditions." },
  ],
  founderMedia: {
    type: 'image',
    src: null,
    gradient: 'linear-gradient(160deg, #111 0%, #222 100%)',
    placeholder: 'Hayden Hooper, Founder — racing at an endurance event',
    caption: 'Hayden Hooper, competing at the 2023 Rocky Mountain 100.',
  },
  closingQuote: `"There should be no compromise between breaking records and eliminating waste."`,
  closingAttribution: "— Hayden Hooper, Founder of ReFuel Athletics",
};

// ── Media Block ───────────────────────────────────────────────────────────────
function MediaBlock({ media, aspectClass = 'aspect-video' }) {
  if (!media) return null;

  const inner = media.src ? (
    media.type === 'video'
      ? <video src={media.src} className="w-full h-full object-cover" autoPlay muted loop playsInline />
      : <img src={media.src} alt={media.placeholder} className="w-full h-full object-cover" />
  ) : (
    // Placeholder state
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6"
      style={{ background: media.gradient }}>
      <div className="border border-white/10 rounded-xl px-5 py-3 text-center">
        {media.type === 'video' && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-white/30" />
            <p className="text-white/25 text-xs font-bold uppercase tracking-widest">Video</p>
          </div>
        )}
        <p className="text-white/20 text-xs leading-relaxed text-center">{media.placeholder}</p>
        <p className="text-white/12 text-xs mt-1" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Set <code className="font-mono">src</code> to enable
        </p>
      </div>
    </div>
  );

  return (
    <figure className="w-full m-0">
      <div className={`w-full ${aspectClass} overflow-hidden rounded-2xl bg-gray-100 relative`}>
        {inner}
      </div>
      {media.caption && (
        <figcaption className="mt-3 text-xs text-gray-400 leading-relaxed text-center px-2">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Value icons (SVG, no emoji) ───────────────────────────────────────────────
const VALUE_ICONS = {
  "Science-Backed": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 00.45 1.317l1.7 2.125a.75.75 0 01-.6 1.208H2.65a.75.75 0 01-.6-1.208l1.7-2.125A2.25 2.25 0 004.2 15M19.8 15H4.2" />
    </svg>
  ),
  "Personalized": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
  "Sustainable": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.249 2.249 0 0017.5 15.8l-.168-.134a1.125 1.125 0 01.004-1.76l.028-.02a1.125 1.125 0 000-1.736l-.664-.498a1.125 1.125 0 01-.277-1.398l.016-.032A2.25 2.25 0 0015.25 8.5l-.01-.003c-.34-.084-.658-.24-.932-.454" />
    </svg>
  ),
  "Race-Ready": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 9.526a2.25 2.25 0 002.18 1.849H17.25a2.25 2.25 0 002.14-1.549l1.035-3.43A1.125 1.125 0 0019.34 7.5H5.25M3 3H1.5m1.5 0h1.25m12.25 9.75v6.75m-4.5-6.75v6.75M9 20.25h6" />
    </svg>
  ),
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function MissionPage() {
  const { tagline, intro, sections, values, founderMedia, closingQuote, closingAttribution } = MISSION_CONTENT;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white mb-16 min-h-[520px] flex flex-col justify-end">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Large background number */}
        <div className="absolute top-8 right-10 text-[200px] font-black leading-none select-none pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.025)', fontFamily: 'Georgia, serif' }}>
          RF
        </div>

        <div className="relative z-10 px-10 pb-14 pt-24 md:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/35 mb-6">
            Our Mission
          </p>
          <h1 className="font-black leading-none tracking-tight mb-8 max-w-3xl"
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              lineHeight: 0.95,
              fontFamily: 'Georgia, serif',
              letterSpacing: '-0.02em',
            }}>
            {tagline}
          </h1>
          <div className="w-12 h-px bg-white/20 mb-8" />
          <p className="text-white/50 text-base leading-relaxed max-w-2xl font-light">{intro}</p>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden mb-16 border border-gray-100">
        {[
          { value: '100%', label: 'Reusable Packaging' },
          { value: '0',    label: 'Artificial Fillers' },
          { value: '5',    label: 'Natural Flavors' },
          { value: '∞',    label: 'Custom Formulas' },
        ].map((s, i) => (
          <div key={i} className="bg-white px-6 py-7 text-center">
            <p className="text-3xl font-black text-gray-900 tracking-tight">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Sections ─────────────────────────────────────────────────────── */}
      <div className="space-y-6 mb-16">
        {sections.map((s, i) => {
          const isEven = i % 2 === 0;
          return (
            <div key={i} className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-gray-100 shadow-sm">

              {/* Text side */}
              <div className={`flex flex-col justify-between p-10 md:p-12
                ${isEven ? 'bg-gray-900 text-white md:order-1' : 'bg-white text-gray-900 md:order-2'}`}>
                <span
                  className="text-[100px] font-black leading-none select-none mb-auto"
                  style={{
                    color: isEven ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 0.85,
                  }}>
                  0{i + 1}
                </span>
                <div className="mt-8">
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] mb-3
                    ${isEven ? 'text-white/35' : 'text-gray-400'}`}>
                    {s.eyebrow}
                  </p>
                  <h2 className="font-extrabold leading-tight mb-5"
                    style={{
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                      fontFamily: 'Georgia, serif',
                      color: isEven ? '#fff' : '#111827',
                      letterSpacing: '-0.015em',
                    }}>
                    {s.heading}
                  </h2>
                  <p className={`text-sm leading-relaxed ${isEven ? 'text-white/55' : 'text-gray-500'}`}>
                    {s.body}
                  </p>
                </div>
              </div>

              {/* Media side */}
              <div className={`relative min-h-[300px] md:min-h-0
                ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                {s.media.src ? (
                  s.media.type === 'video'
                    ? <video src={s.media.src} className="w-full h-full object-cover absolute inset-0" autoPlay muted loop playsInline />
                    : <img src={s.media.src} alt={s.media.placeholder} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8"
                    style={{ background: s.media.gradient }}>
                    {s.media.type === 'video' && (
                      <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center mb-1">
                        <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[12px] ml-1"
                          style={{ borderLeftColor: 'rgba(255,255,255,0.25)' }} />
                      </div>
                    )}
                    <div className="border border-white/10 rounded-xl px-5 py-3 text-center max-w-xs">
                      <p className="text-white/20 text-xs leading-relaxed">{s.media.placeholder}</p>
                    </div>
                  </div>
                )}
                {/* Caption overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white/45 text-xs leading-relaxed">{s.media.caption}</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400 mb-3">What We Stand For</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Principles we don't compromise on.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div key={i}
              className="group bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-black transition-colors">
                {VALUE_ICONS[v.title]}
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-sm mb-1.5">{v.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Founder section ──────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-16">
        {/* Image */}
        <div className="relative min-h-[360px] md:min-h-0">
          {founderMedia.src ? (
            <img src={founderMedia.src} alt={founderMedia.placeholder}
              className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8"
              style={{ background: founderMedia.gradient }}>
              <div className="border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-white/20 text-xs leading-relaxed">{founderMedia.placeholder}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white/45 text-xs">{founderMedia.caption}</p>
          </div>
        </div>
        {/* Text */}
        <div className="bg-white p-10 md:p-12 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400 mb-6">The Founders</p>
          <blockquote className="mb-6">
            <span className="text-5xl font-black text-gray-100 leading-none select-none font-serif"
              style={{ fontFamily: 'Georgia, serif' }}>"</span>
            <p className="text-xl font-semibold text-gray-900 leading-snug -mt-3"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}>
              {closingQuote.replace(/"/g, '')}
            </p>
          </blockquote>
          <p className="text-sm text-gray-400 font-medium">{closingAttribution}</p>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 leading-relaxed">
              We built ReFuel Athletics out of frustration with the status quo — as competitive endurance athletes,
              we couldn't find a gel that respected both our performance demands and the trails we train on.
            </p>
          </div>
        </div>
      </div>

      {/* ── Inline photo/video gallery ────────────────────────────────────── */}
      <div className="mb-16">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gray-400 mb-6 text-center">From The Field</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              type: 'image', src: null,
              gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
              placeholder: 'Athlete mid-race consuming a ReFuel gel',
              caption: 'Race day in the field.',
            },
            {
              type: 'video', src: null,
              gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)',
              placeholder: 'Behind the scenes — mixing and testing a new batch',
              caption: 'Product development process.',
            },
            {
              type: 'image', src: null,
              gradient: 'linear-gradient(135deg, #0b1e0f 0%, #1a4a22 100%)',
              placeholder: 'ReFuel reusable packet on a trail with scenery',
              caption: 'Built for the places you train.',
            },
          ].map((m, i) => (
            <MediaBlock key={i} media={m} aspectClass="aspect-[4/5]" />
          ))}
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white p-10 md:p-14 text-center mb-2">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/30 mb-8">Ready to start?</p>
          <h2 className="font-black tracking-tight mb-4 max-w-xl mx-auto"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}>
            Your formula. Your performance.
          </h2>
          <p className="text-white/40 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            Build a gel that fits your body, your sport, and your goals — in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-100 transition-all">
              Build Your Formula →
            </button>
            <button className="border border-white/25 text-white/70 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 hover:border-white/40 hover:text-white transition-all">
              Browse Products
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}