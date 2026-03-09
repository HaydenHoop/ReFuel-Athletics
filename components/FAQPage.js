"use client";
import { useState } from 'react';

const FAQS = [
  {
    category: 'Product & Ingredients',
    icon: '⚗️',
    questions: [
      {
        q: 'What ingredients are in the gel?',
        a: 'Every ReFuel gel is built from pharmaceutical-grade ingredients: maltodextrin and fructose as carbohydrate sources, sodium chloride, potassium citrate, and magnesium citrate for electrolytes, and optionally caffeine anhydrous. Named flavors use natural flavoring extracts. No artificial colors, no fillers, no proprietary blends — you see exactly what goes in and at exactly what dose.',
      },
      {
        q: 'Why do you use both maltodextrin and fructose?',
        a: 'Maltodextrin and fructose are absorbed through different intestinal transporters, which means your gut can process more total carbohydrate per hour when both are present — up to 90g/hour vs around 60g/hour from a single source. The ratio matters though: too much fructose causes GI distress in some athletes. That\'s why we let you dial the ratio yourself based on your own gut sensitivity.',
      },
      {
        q: 'How much caffeine is safe per gel?',
        a: 'We offer up to 150mg of caffeine per pouch. Most sports nutrition research points to 3–6mg per kg of body weight as the effective range for performance. For reference, a standard cup of coffee is roughly 90–120mg. If you\'re caffeine sensitive or training in the evening, we recommend keeping it at 0–50mg or skipping it entirely.',
      },
      {
        q: 'Are your ingredients tested for banned substances?',
        a: 'All ingredients we source are tested by our suppliers for purity and banned substance contamination. That said, we are a small operation and our products are not yet certified by third-party programs like Informed Sport or NSF Certified for Sport. If you compete in a tested sport at a high level, we recommend checking with your governing body before use.',
      },
      {
        q: 'Is the gel vegan and gluten-free?',
        a: 'Yes — all ingredients are plant-derived or synthetically produced and contain no animal products. The formulas are also naturally gluten-free. If you have a specific allergy or intolerance, feel free to reach out and we can confirm the sourcing of any individual ingredient.',
      },
      {
        q: 'How long does a batch stay fresh?',
        a: 'Unopened pouches have a shelf life of 12 months from the mixing date when stored in a cool, dry place out of direct sunlight. Once mixed with water and loaded into your reusable packet, we recommend using within 48 hours. The high sugar concentration is naturally antimicrobial, but freshness still matters for taste and texture.',
      },
      {
        q: 'How do I mix the gel powder?',
        a: 'Each pouch is pre-measured for one serving. Mix with 20–40ml of water depending on the consistency you chose — less water for a thicker gel, more for a thinner one. Shake or stir until fully dissolved (about 30 seconds), then load into your reusable packet or a standard gel flask. You can also mix a full batch in a small bottle and portion it out before a race.',
      },
      {
        q: 'Can I mix different flavors together?',
        a: 'Absolutely — many athletes mix two flavors to avoid palate fatigue on long efforts. Tropical Mango and Watermelon Mint is a popular combination. Just order both flavors and mix to your preference when preparing your batch.',
      },
    ],
  },
  {
    category: 'The Reusable Packet',
    icon: '🧴',
    questions: [
      {
        q: 'How do I fill the reusable packet?',
        a: 'Mix your gel powder with water as described above, then unscrew the twist-lock nozzle, pour or squeeze the mixed gel in from the top, and reseal. The wide opening is designed for easy filling without a funnel. For thicker consistencies, a small squeeze bottle or syringe makes loading even easier.',
      },
      {
        q: 'How do I clean it?',
        a: 'The packet is fully dishwasher safe — top rack recommended. For a quick hand wash, rinse with warm water immediately after use, then fill with a small amount of dish soap and water, shake well, and rinse thoroughly. Make sure the nozzle thread is rinsed clean as sugar residue can make it sticky over time.',
      },
      {
        q: 'How long will the packet last?',
        a: 'With normal use and proper cleaning, the food-grade silicone body should last several years. The twist-lock PP cap is the part most subject to wear — if it ever stops sealing properly, replacement caps will be available separately.',
      },
      {
        q: 'Will it leak during a race?',
        a: 'The twist-lock nozzle is designed to be leak-proof under normal race conditions including being stored in a jersey pocket, race belt, or hydration vest. We recommend doing a quick squeeze test after filling before heading out. Do not overfill past the max fill line — leaving a small air gap helps prevent pressure buildup.',
      },
      {
        q: 'How much gel does it hold?',
        a: 'The packet holds 60–70ml of mixed gel, which is roughly double a standard single-use gel packet. Depending on your carb concentration, that works out to approximately 40–90g of carbohydrate per fill — enough for 45–90 minutes of racing depending on your formula.',
      },
      {
        q: 'Is it BPA-free?',
        a: 'Yes — the body is made from food-grade silicone which is completely BPA-free, and the cap is made from BPA-free polypropylene (PP). Both materials are FDA-approved for food contact.',
      },
      {
        q: 'Can I use it with other gel brands or homemade mixes?',
        a: 'Yes — the packet works with any pourable gel or liquid mix, not just ReFuel formulas. Some athletes use it with homemade rice cakes blended smooth, date paste, or other carbohydrate sources. As long as it flows through the nozzle it will work.',
      },
    ],
  },
];

// ── Bamboo SVG Background ─────────────────────────────────────────────────────
function BambooBackground() {
  // Each stalk: [centerX (0-1000), width, topY (0=bottom, higher=taller), opacity]
  const stalks = [
    [22,  16, 90, 0.55], [55,  11, 70, 0.35], [95,  20, 95, 0.65],
    [138, 13, 75, 0.40], [175, 22, 100,0.70], [218, 10, 60, 0.30],
    [260, 17, 85, 0.55], [305, 12, 68, 0.38], [348, 24, 98, 0.72],
    [390, 14, 80, 0.48], [428, 11, 58, 0.28], [465, 19, 92, 0.60],
    [510, 13, 72, 0.40], [550, 21, 96, 0.68], [592, 15, 78, 0.45],
    [630, 10, 55, 0.26], [668, 18, 88, 0.58], [710, 12, 66, 0.36],
    [748, 23, 97, 0.70], [790, 14, 74, 0.42], [830, 11, 62, 0.32],
    [868, 20, 91, 0.62], [908, 13, 70, 0.38], [945, 16, 82, 0.50],
    [978, 9,  50, 0.22],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

      {/* Deep forest base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(22,58,26,0.6) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 60%, rgba(14,42,18,0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(8,28,10,0.8) 0%, transparent 60%),
          linear-gradient(170deg, #071a09 0%, #0c2a10 30%, #0f3318 60%, #071408 100%)
        `,
      }} />

      {/* Subtle noise/grain texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Ambient glow pools */}
      <div style={{
        position: 'absolute', top: '5%', left: '15%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,90,35,0.14) 0%, transparent 65%)',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(18,65,22,0.12) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', left: '35%',
        width: '700px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(12,48,16,0.10) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />

      {/* Bamboo SVG */}
      <svg
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '75%' }}
      >
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#102e14" />
            <stop offset="35%"  stopColor="#1d5c22" />
            <stop offset="65%"  stopColor="#245a28" />
            <stop offset="100%" stopColor="#0c2010" />
          </linearGradient>
          <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2e7034" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#071509" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#1a5c1e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a2e0d" stopOpacity="0.4" />
          </linearGradient>
          <filter id="sf" x="-20%" y="-5%" width="140%" height="110%">
            <feDropShadow dx="3" dy="0" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {stalks.map(([cx, w, hPct, op], i) => {
          const totalH = 800;
          const stalkH = (hPct / 100) * totalH;
          const topY   = totalH - stalkH;
          const segs   = Math.max(3, Math.round(hPct / 18));
          const segH   = stalkH / segs;

          return (
            <g key={i} opacity={op} filter="url(#sf)">
              {/* Stalk body */}
              <rect x={cx - w/2} y={topY} width={w} height={stalkH} rx={w * 0.45} fill="url(#sg)" />

              {/* Highlight stripe */}
              <rect
                x={cx - w/2 + w * 0.2} y={topY + w}
                width={w * 0.18} height={stalkH - w * 2}
                rx={w * 0.09}
                fill="rgba(255,255,255,0.06)"
              />

              {/* Segment nodes */}
              {Array.from({ length: segs - 1 }, (_, j) => {
                const ny = topY + segH * (j + 1);
                const leafRight = (j + i) % 2 === 0;
                const lx = leafRight ? cx + w/2 : cx - w/2;
                const lAngle = leafRight ? -30 : 30;
                return (
                  <g key={j}>
                    {/* Node ring */}
                    <rect
                      x={cx - w/2 - 2.5} y={ny - 3.5}
                      width={w + 5} height={7}
                      rx={3.5} fill="url(#ng)"
                    />
                    {/* Leaf pair every other node */}
                    {j % 2 === 0 && (
                      <g transform={`translate(${lx}, ${ny - 6}) rotate(${lAngle})`}>
                        <ellipse cx={leafRight ? 20 : -20} cy={-4} rx={28} ry={5.5} fill="url(#lg)" />
                        <ellipse cx={leafRight ? 14 : -14} cy={-9} rx={20} ry={4} fill="url(#lg)" opacity={0.7} />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Rounded tip */}
              <ellipse cx={cx} cy={topY + w * 0.5} rx={w/2} ry={w * 0.7} fill="#122a16" opacity={0.7} />
            </g>
          );
        })}

        {/* Ground fog / fade */}
        <defs>
          <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="100%" stopColor="#030d05" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x="0" y="640" width="1000" height="160" fill="url(#gf)" />
      </svg>

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Top content fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '160px',
        background: 'linear-gradient(to bottom, rgba(5,16,7,0.65) 0%, transparent 100%)',
      }} />
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      border: open ? '1px solid rgba(90,185,100,0.22)' : '1px solid rgba(255,255,255,0.07)',
      background: open ? 'rgba(12,32,15,0.68)' : 'rgba(8,20,10,0.48)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: open
        ? '0 6px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(90,185,100,0.12)'
        : '0 2px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)',
      transition: 'all 0.22s ease',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '16px',
          padding: '18px 22px', textAlign: 'left',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{
          fontSize: '13.5px', fontWeight: 600, lineHeight: 1.55,
          color: open ? '#b8edbe' : 'rgba(200,235,205,0.80)',
          transition: 'color 0.2s',
        }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700,
          background: open ? 'rgba(60,160,70,0.28)' : 'rgba(255,255,255,0.07)',
          color: open ? '#80d885' : 'rgba(255,255,255,0.35)',
          border: open ? '1px solid rgba(80,180,90,0.30)' : '1px solid rgba(255,255,255,0.09)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'all 0.22s ease',
        }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 22px 18px' }}>
          <div style={{
            width: '100%', height: '1px',
            background: 'linear-gradient(to right, rgba(80,180,90,0.25), transparent)',
            marginBottom: '14px',
          }} />
          <p style={{
            fontSize: '13px', color: 'rgba(165,215,172,0.78)',
            lineHeight: 1.8, margin: 0,
          }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main FAQ Page ─────────────────────────────────────────────────────────────
export default function FAQPage({ onGoToQuiz }) {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <BambooBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '700px',
        margin: '0 auto', padding: '52px 20px 88px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '44px', textAlign: 'center' }}>
          <p style={{
            fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(110,195,120,0.65)',
            marginBottom: '10px', margin: '0 0 10px',
          }}>
            Got Questions?
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 60px)', fontWeight: 900,
            color: '#dff0e2', letterSpacing: '-0.025em',
            margin: '0 0 16px',
            textShadow: '0 2px 30px rgba(0,0,0,0.6)',
          }}>
            FAQ
          </h1>
          <p style={{
            fontSize: '14px', color: 'rgba(150,205,158,0.72)',
            lineHeight: 1.75, maxWidth: '440px', margin: '0 auto',
          }}>
            Everything you need to know about our gel formulas and reusable packet. Can't find what you're looking for?{' '}
            <a
              href="mailto:haydenh.refuel@gmail.com"
              style={{
                color: '#7bd880', fontWeight: 600,
                textDecoration: 'underline',
                textDecorationColor: 'rgba(123,216,128,0.35)',
              }}
            >
              Email us directly.
            </a>
          </p>
        </div>

        {/* Glass tab switcher */}
        <div style={{
          display: 'flex', gap: '5px', marginBottom: '24px',
          background: 'rgba(4,12,5,0.60)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '4px',
          boxShadow: '0 4px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          {FAQS.map(section => {
            const active = activeCategory === section.category;
            return (
              <button
                key={section.category}
                onClick={() => setActiveCategory(section.category)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '12px',
                  border: active ? '1px solid rgba(80,175,92,0.22)' : '1px solid transparent',
                  background: active ? 'rgba(22,68,28,0.75)' : 'transparent',
                  color: active ? '#a8e4ae' : 'rgba(140,195,148,0.50)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active
                    ? '0 2px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(100,200,110,0.12)'
                    : 'none',
                }}
              >
                <span style={{ fontSize: '15px' }}>{section.icon}</span>
                <span className="hidden sm:inline">{section.category}</span>
                <span className="sm:hidden">{section.category.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ items */}
        {FAQS.filter(s => s.category === activeCategory).map(section => (
          <div key={section.category} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {section.questions.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '52px', borderRadius: '22px', padding: '38px 32px',
          textAlign: 'center',
          background: 'rgba(6,18,8,0.72)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(80,175,92,0.18)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(90,185,100,0.08)',
        }}>
          <p style={{
            fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(110,195,120,0.55)',
            margin: '0 0 10px',
          }}>
            Still unsure?
          </p>
          <h3 style={{
            fontSize: '21px', fontWeight: 800, color: '#dff0e2',
            margin: '0 0 10px', letterSpacing: '-0.01em',
          }}>
            Let the quiz decide for you.
          </h3>
          <p style={{
            fontSize: '13px', color: 'rgba(150,205,158,0.65)',
            margin: '0 0 26px', lineHeight: 1.65,
          }}>
            Answer 7 questions and we'll build a formula matched to your sport, sweat rate, and gut.
          </p>
          <button
            onClick={onGoToQuiz}
            style={{
              background: 'linear-gradient(135deg, #285c2c 0%, #1b4a1f 100%)',
              color: '#c8eecb', padding: '13px 30px',
              borderRadius: '11px', fontWeight: 700, fontSize: '13.5px',
              border: '1px solid rgba(80,175,92,0.28)',
              cursor: 'pointer',
              boxShadow: '0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(140,220,148,0.18)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #316834 0%, #225a26 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(140,220,148,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #285c2c 0%, #1b4a1f 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(140,220,148,0.18)';
            }}
          >
            Take the Diagnostic →
          </button>
        </div>
      </div>
    </div>
  );
}