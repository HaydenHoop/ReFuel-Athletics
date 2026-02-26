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

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-gray-300 shadow-sm' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`text-sm font-semibold leading-snug transition-colors ${open ? 'text-gray-900' : 'text-gray-700'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${open ? 'bg-black text-white rotate-45' : 'bg-gray-100 text-gray-500'}`}
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="w-full h-px bg-gray-100 mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage({ onGoToQuiz }) {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Got Questions?</p>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">FAQ</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Everything you need to know about our gel formulas and reusable packet. Can't find what you're looking for?{' '}
          <a href="mailto:haydenh.refuel@gmail.com" className="text-black font-semibold underline hover:no-underline">
            Email us directly.
          </a>
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-2xl">
        {FAQS.map(section => (
          <button
            key={section.category}
            onClick={() => setActiveCategory(section.category)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all
              ${activeCategory === section.category ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span>{section.icon}</span>
            <span className="hidden sm:inline">{section.category}</span>
            <span className="sm:hidden">{section.category.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Questions */}
      {FAQS.filter(s => s.category === activeCategory).map(section => (
        <div key={section.category} className="space-y-3">
          {section.questions.map(item => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      ))}

      {/* Bottom CTA */}
      <div className="mt-12 bg-black text-white rounded-2xl p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Still unsure?</p>
        <h3 className="text-xl font-extrabold mb-2">Let the quiz decide for you.</h3>
        <p className="text-gray-400 text-sm mb-5">
          Answer 7 questions and we'll build a formula matched to your sport, sweat rate, and gut.
        </p>
        <button
          onClick={onGoToQuiz}
          className="inline-block bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition text-sm">
          Take the Diagnostic →
        </button>
      </div>

    </div>
  );
}
