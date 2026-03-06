"use client";
import { useState } from 'react';
import Quiz from '../components/Quiz';
import GelCard from '../components/GelCard';
import ProductsPage from '../components/ProductsPage';
import MissionPage from '../components/MissionPage';
import AccountPage from '../components/AccountPage';
import FAQPage from '../components/FAQPage';
import CommunityPage from '../components/CommunityPage';
import Nav from '../components/Nav';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import AuthModal from '../components/AuthModal';
import { CartProvider } from '../components/CartContext';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { CommunityProvider } from '../components/CommunityContext';
import { Testimonials } from '../components/Reviews';

// ── Home / Landing Page ───────────────────────────────────────────────────────
function HomePage({ onNavigate }) {
  const NAV_BUTTONS = [
    { id: 'products',  label: 'Shop',           icon: '⚡', description: 'Training gel, race day gel & flasks' },
    { id: 'quiz',      label: 'Find Your Gel',  icon: '🎯', description: 'Take the diagnostic, build your formula' },
    { id: 'community', label: 'Community',      icon: '🌐', description: 'See what other athletes are running on' },
    { id: 'faq',       label: 'FAQ',            icon: '❓', description: 'Ingredients, packet care, mixing tips' },
    { id: 'mission',   label: 'Our Mission',    icon: '🏔', description: 'Why we built ReFuel' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Hero — matches the image */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black text-white mb-6 sm:mb-8 min-h-[340px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-10 md:p-14">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-8">Our Mission</p>
          <h1
            className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 sm:mb-8 max-w-2xl"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Built for athletes who refuse to compromise.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            ReFuel Athletics is a company built by athletes for athletes. Our mission is to give
            you the best nutrition for your workouts while reducing impacts on the environment.
            We refuse to force athletes to compromise between reducing waste and pushing your
            boundaries to the max.
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {NAV_BUTTONS.map(btn => (
          <button
            key={btn.id}
            onClick={() => onNavigate(btn.id)}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all text-left group"
          >
            <div className="w-11 h-11 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center text-xl transition-colors flex-shrink-0">
              <span className="group-hover:brightness-0 group-hover:invert transition">{btn.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm">{btn.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{btn.description}</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-gray-600 transition flex-shrink-0">→</span>
          </button>
        ))}

        {/* Shop CTA — full width, prominent */}
        <button
          onClick={() => onNavigate('products')}
          className="col-span-2 lg:col-span-3 flex items-center justify-between p-4 sm:p-5 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-xl">📦</div>
            <div>
              <p className="font-bold text-base">Bundle & Save</p>
              <p className="text-gray-400 text-xs mt-0.5">Starter Kit · Race Ready · Elite Pack — up to 15% off</p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:text-white transition text-lg">→</span>
        </button>
      </div>

      {/* Testimonials */}
      <Testimonials />

    </div>
  );
}

function PageContent() {
  const { user, isDev } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [quizFormula, setQuizFormula] = useState(null);
  const [raceDayFormula, setRaceDayFormula] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const handleQuizComplete = (result) => {
    setQuizFormula(result);
    setQuizDone(true);
    setTimeout(() => {
      document.getElementById('quiz-gel-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const resetQuiz = () => { setQuizFormula(null); setQuizDone(false); };

  const handleAccountClick = () => {
    if (user) {
      setActiveTab('account');
    } else {
      setAuthMode('signin');
      setAuthOpen(true);
    }
  };

  // When a saved formula is loaded from AccountPage, pre-load it and navigate to quiz tab
  const handleLoadFormula = (formula) => {
    setQuizFormula(formula);
    setQuizDone(false);
    setActiveTab('quiz');
    setTimeout(() => {
      document.getElementById('quiz-gel-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {isDev && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] bg-red-500 text-white text-xs font-black px-4 py-1 rounded-b-lg tracking-widest uppercase shadow-lg pointer-events-none">
          ⚡ Dev Mode
        </div>
      )}
      <Nav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartButton={<CartButton />}
        onAccountClick={handleAccountClick}
      />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onViewAccount={() => setActiveTab('account')}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />

      <main className="flex flex-col items-center px-3 sm:px-4 py-6 sm:py-12">

        {/* Home / Landing */}
        {activeTab === 'home' && (
          <HomePage onNavigate={setActiveTab} />
        )}

        {/* Shop */}
        {activeTab === 'products' && (
          <ProductsPage
            onGoToQuiz={() => setActiveTab('quiz')}
            quizFormula={quizFormula}
            raceDayFormula={raceDayFormula}
          />
        )}

        {/* Find Your Gel */}
        {activeTab === 'quiz' && (
          <div className="w-full max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Personalized Nutrition</p>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Find Your Gel</h1>
              <p className="text-gray-500 max-w-lg mx-auto">
                Answer 7 quick questions and we will dial in your ideal formula. Then fine-tune every slider and add to cart.
              </p>
            </div>

            <div className="mb-2">
              <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
                Take the Diagnostic
              </h2>
              {quizDone ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Formula Generated!</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Your personalized blend is loaded into the builder below. Fine-tune the sliders or add to cart as-is.
                  </p>
                  <button onClick={resetQuiz} className="text-sm text-slate-500 underline hover:text-slate-800 transition">
                    Retake the quiz
                  </button>
                </div>
              ) : (
                <Quiz onComplete={handleQuizComplete} />
              )}
            </div>

            <div className="flex justify-center my-8">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-gray-200" />
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10l6 6 6-6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div id="quiz-gel-builder">
              <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">2</span>
                Fine-Tune Your Formula & Add to Cart
              </h2>
              <GelCard quizFormula={quizFormula} startOpen={true} />
            </div>
          </div>
        )}

        {/* Mission */}
        {activeTab === 'mission' && <MissionPage />}

        {/* FAQ */}
        {activeTab === 'faq' && <FAQPage onGoToQuiz={() => setActiveTab('quiz')} />}

        {/* Community */}
        {activeTab === 'community' && (
          <CommunityPage
            onLoadFormula={(formula) => {
              setQuizFormula(formula);
              setActiveTab('quiz');
              setTimeout(() => {
                document.getElementById('quiz-gel-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 200);
            }}
            onSignIn={() => { setAuthMode('signin'); setAuthOpen(true); }}
          />
        )}

        {/* Account */}
        {activeTab === 'account' && (
          user
            ? <AccountPage onLoadFormula={handleLoadFormula} />
            : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Sign in to your account</h2>
                <p className="text-gray-500 mb-6">View your orders, saved formulas, and profile.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                    Sign In
                  </button>
                  <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
                    className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
                    Create Account
                  </button>
                </div>
              </div>
            )
        )}

      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <CartProvider>
          <PageContent />
        </CartProvider>
      </CommunityProvider>
    </AuthProvider>
  );
}