"use client";

const MISSION_CONTENT = {
  tagline: "Built for athletes who refuse to compromise.",
  intro: `ReFuel Athletics is a company built by athletes for athletes. Our mission is to give you the best nutrition for your workouts while reducing impacts on the environment. We refuse to force athletes to compromise between reducing waste and pushing your boundaries to the max.`,
  sections: [
    {
      eyebrow: "Why We Started",
      heading: "The Problem With Off-the-Shelf Gels",
      body: `We are tired of the major gel companies selling overpriced single-use gels that end up on the trails or in a landfill. The plastic used for these gels is non-recyclable and harmful to animals that eat the sweet gel packets. Why should athletes who rely so much on nature be forced to destroy it in order to use the best products?`,
    },
    {
      eyebrow: "Our Approach",
      heading: "Precision Over Guesswork",
      body: `We believe that every athlete deserves their own formula. There is no one gel fits all when you are trying to push your body to the limit, thats why we are here to elevate your limit even further. Our formula builder is backed by science to provide performance & customization everywhere it counts.`,
    },
    {
      eyebrow: "Our Promise",
      heading: "Clean Ingredients. Real Performance.",
      body: `We use ingredients that you can trust. You cant reach your limits without confidence and what better way to gain confidence then knowing what you are putting in your body's engine is scientifically backed to work with you in order to break your records.`,
    },
  ],
  values: [
    { icon: "🔬", title: "Science-Backed", description: "Every formula grounded in sports nutrition research." },
    { icon: "🎯", title: "Personalized", description: "No two athletes are the same. Neither are our gels." },
    { icon: "🌱", title: "Sustainable", description: "Reusable packets. Minimal waste. Maximum performance." },
    { icon: "🏆", title: "Race-Ready", description: "Tested by real athletes in real conditions." },
  ],
  closingQuote: `"There should be no compromise between breaking records and eliminating waste."`,
  closingAttribution: "— Hayden Hooper, Founder of ReFuel Athletics",
};

export default function MissionPage() {
  const { tagline, intro, sections, values, closingQuote, closingAttribution } = MISSION_CONTENT;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Hero block */}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white mb-16">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative z-10 px-10 py-20 md:px-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">Our Mission</p>
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-8 max-w-2xl"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            {tagline}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{intro}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-0 mb-16">
        {sections.map((s, i) => (
          <div
            key={i}
            className={`grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden mb-6 border border-gray-100 shadow-sm
              ${i % 2 === 0 ? '' : ''}`}
          >
            {/* Number column */}
            <div className={`flex flex-col justify-between p-10 ${i % 2 === 0 ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
              <span className="text-7xl font-black opacity-10 leading-none select-none">0{i + 1}</span>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${i % 2 === 0 ? 'text-gray-400' : 'text-gray-400'}`}>{s.eyebrow}</p>
                <h2 className={`text-2xl md:text-3xl font-extrabold leading-tight ${i % 2 === 0 ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {s.heading}
                </h2>
              </div>
            </div>
            {/* Body column */}
            <div className={`p-10 flex items-center ${i % 2 === 0 ? 'bg-white' : 'bg-white'}`}>
              <p className="text-gray-600 leading-relaxed text-base">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Values grid */}
      <div className="mb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">What We Stand For</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{v.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{v.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing quote */}
      <div className="bg-black text-white rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent" />
        <div className="relative z-10">
          <span className="text-6xl text-gray-600 font-serif leading-none select-none">"</span>
          <p className="text-xl md:text-2xl font-medium text-gray-100 leading-relaxed max-w-2xl mx-auto -mt-4 mb-6"
            style={{ fontFamily: "'Georgia', serif" }}>
            {closingQuote.replace(/"/g, '')}
          </p>
          <p className="text-gray-500 text-sm">{closingAttribution}</p>
        </div>
      </div>

    </div>
  );
}
