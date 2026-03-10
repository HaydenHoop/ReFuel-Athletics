"use client";
import { useState } from 'react';

const FAQS = [
  {
    category: 'Product & Ingredients',
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
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

      {/* Clean white base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #f8f9fa 0%, #f0f2f5 40%, #e8ecf0 100%)',
      }} />

      {/* Subtle ambient blobs */}
      <div style={{
        position: 'absolute', top: '5%', left: '10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,215,255,0.35) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', top: '35%', right: '8%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(210,225,255,0.28) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '30%',
        width: '700px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(195,210,240,0.22) 0%, transparent 65%)',
        filter: 'blur(80px)',
      }} />


      {/* Soft edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(180,190,210,0.2) 100%)',
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
      border: open ? '1px solid rgba(0,0,0,0.10)' : '1px solid rgba(0,0,0,0.07)',
      background: open ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: open
        ? '0 6px 32px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9)'
        : '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
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
          color: open ? '#111827' : '#374151',
          transition: 'color 0.2s',
        }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700,
          background: open ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)',
          color: open ? '#111827' : '#9ca3af',
          border: open ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(0,0,0,0.08)',
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
            background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
            marginBottom: '14px',
          }} />
          <p style={{
            fontSize: '13px', color: '#6b7280',
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
            textTransform: 'uppercase', color: 'rgba(100,116,139,0.8)',
            marginBottom: '10px', margin: '0 0 10px',
          }}>
            Got Questions?
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 60px)', fontWeight: 900,
            color: '#111827', letterSpacing: '-0.025em',
            margin: '0 0 16px',
            textShadow: 'none',
          }}>
            FAQ
          </h1>
          <p style={{
            fontSize: '14px', color: '#6b7280',
            lineHeight: 1.75, maxWidth: '440px', margin: '0 auto',
          }}>
            Everything you need to know about our gel formulas and reusable packet. Can't find what you're looking for?{' '}
            <a
              href="mailto:haydenh.refuel@gmail.com"
              style={{
                color: '#111827', fontWeight: 600,
                textDecoration: 'underline',
                textDecorationColor: 'rgba(0,0,0,0.25)',
              }}
            >
              Email us directly.
            </a>
          </p>
        </div>

        {/* Glass tab switcher */}
        <div style={{
          display: 'flex', gap: '5px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '16px', padding: '4px',
          boxShadow: '0 4px 28px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
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
                  border: active ? '1px solid rgba(0,0,0,0.09)' : '1px solid transparent',
                  background: active ? 'rgba(255,255,255,0.90)' : 'transparent',
                  color: active ? '#111827' : '#9ca3af',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active
                    ? '0 2px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)'
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
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}>
          <p style={{
            fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(100,116,139,0.8)',
            margin: '0 0 10px',
          }}>
            Still unsure?
          </p>
          <h3 style={{
            fontSize: '21px', fontWeight: 800, color: '#111827',
            margin: '0 0 10px', letterSpacing: '-0.01em',
          }}>
            Let the quiz decide for you.
          </h3>
          <p style={{
            fontSize: '13px', color: '#6b7280',
            margin: '0 0 26px', lineHeight: 1.65,
          }}>
            Answer 7 questions and we'll build a formula matched to your sport, sweat rate, and gut.
          </p>
          <button
            onClick={onGoToQuiz}
            style={{
              background: '#111827',
              color: '#ffffff', padding: '13px 30px',
              borderRadius: '11px', fontWeight: 700, fontSize: '13.5px',
              border: '1px solid rgba(0,0,0,0.15)',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1f2937';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
            }}
          >
            Take the Diagnostic →
          </button>
        </div>
      </div>
    </div>
  );
}