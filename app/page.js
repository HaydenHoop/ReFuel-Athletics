"use client";
import { useState, useEffect, useRef } from 'react';
import Quiz from '../components/Quiz';
import GelCard from '../components/GelCard';
import ProductsPage from '../components/ProductsPage';
import ProductDetailPage from '../components/ProductDetailPage';
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

// ── Quiz landing — choose path before anything starts ─────────────────────────
function QuizLanding({ onChoose }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 text-center border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">How would you like to start?</p>
        <h2 className="text-2xl font-extrabold text-gray-900">Build Your Formula</h2>
      </div>
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        <button
          onClick={() => onChoose('quiz')}
          className="p-8 text-left hover:bg-gray-50 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg mb-2 group-hover:text-black">Take the Quiz</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Answer 7 questions about your sport, sweat rate, and goals. We'll dial in your formula automatically.</p>
          <p className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-widest">Recommended · ~2 min</p>
        </button>

        <button
          onClick={() => onChoose('manual')}
          className="p-8 text-left hover:bg-gray-50 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg mb-2 group-hover:text-black">Customize Yourself</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Know exactly what you want? Jump straight to the sliders and build your formula from scratch.</p>
          <p className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-widest">Full control</p>
        </button>
      </div>
    </div>
  );
}

function PageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]     = useState('products');
  const [activeProduct, setActiveProduct] = useState(null);
  const [quizFormula, setQuizFormula] = useState(null);
  const [quizDone, setQuizDone]       = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [authMode, setAuthMode]       = useState('signin');

  // 'landing' | 'quiz' | 'manual' | 'race-day-quiz' | 'race-day-manual'
  const [quizMode, setQuizMode]       = useState('landing');

  const builderRef = useRef(null);

  const scrollToBuilder = () => {
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleQuizComplete = (result) => {
    setQuizFormula(result);
    setQuizDone(true);
    scrollToBuilder();
  };

  const resetQuiz = () => {
    setQuizFormula(null);
    setQuizDone(false);
    setQuizMode('landing');
  };

  const goToQuiz = () => {
    setQuizMode('landing');
    setActiveTab('quiz');
  };

  const goToRaceDayQuiz = () => {
    setQuizMode('race-day-quiz');
    setActiveTab('quiz');
    setQuizFormula(null);
    setQuizDone(false);
  };

  const handleAccountClick = () => {
    if (user) { setActiveTab('account'); }
    else { setAuthMode('signin'); setAuthOpen(true); }
  };

  const handleLoadFormula = (formula) => {
    setQuizFormula(formula);
    setQuizDone(false);
    setQuizMode('manual');
    setActiveTab('quiz');
    scrollToBuilder();
  };

  // When tab changes away from quiz, reset to landing so next visit starts fresh
  const handleTabChange = (tab) => {
    if (tab !== 'quiz') setQuizMode('landing');
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Nav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartButton={<CartButton />}
        onAccountClick={handleAccountClick}
      />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} onViewAccount={() => setActiveTab('account')} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />

      <main className="flex flex-col items-center px-4 pt-[100px] pb-12">

        {/* Shop */}
        {activeTab === 'products' && !activeProduct && (
          <ProductsPage
            onGoToQuiz={goToQuiz}
            onGoToRaceDayQuiz={goToRaceDayQuiz}
            onViewProduct={(id) => { setActiveProduct(id); setActiveTab('product-detail'); }}
            quizFormula={quizFormula}
          />
        )}

        {/* Product Detail */}
        {activeTab === 'product-detail' && (
          <ProductDetailPage
            productId={activeProduct}
            onBack={() => { setActiveProduct(null); setActiveTab('products'); }}
            onGoToQuiz={goToQuiz}
          />
        )}

        {/* Find Your Gel */}
        {activeTab === 'quiz' && (
          <div className="w-full max-w-3xl">

            {/* Page header */}
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Personalized Nutrition</p>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                {quizMode === 'race-day-quiz' || quizMode === 'race-day-manual'
                  ? 'Race Day Gel'
                  : 'Find Your Gel'}
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto">
                {quizMode === 'race-day-quiz' || quizMode === 'race-day-manual'
                  ? 'Dial in your race day formula — caffeine, carbs, and electrolytes tuned for race conditions.'
                  : 'Answer 7 quick questions and we will dial in your ideal formula. Then fine-tune every slider and add to cart.'}
              </p>
            </div>

            {/* ── LANDING CHOICE ── */}
            {quizMode === 'landing' && (
              <QuizLanding onChoose={(choice) => setQuizMode(choice)} />
            )}

            {/* ── TRAINING QUIZ ── */}
            {quizMode === 'quiz' && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
                    Take the Diagnostic
                  </h2>
                  {quizDone ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Formula Generated</h3>
                      <p className="text-gray-500 text-sm mb-6">
                        Your personalized blend is loaded below. Fine-tune the sliders or add to cart as-is.
                      </p>
                      <button onClick={resetQuiz} className="text-sm text-slate-500 underline hover:text-slate-800 transition">
                        Start over
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

                <div ref={builderRef}>
                  <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">2</span>
                    Fine-Tune Your Formula & Add to Cart
                  </h2>
                  <GelCard quizFormula={quizFormula} startOpen={true} />
                </div>
              </>
            )}

            {/* ── MANUAL TRAINING BUILD ── */}
            {quizMode === 'manual' && (
              <div ref={builderRef}>
                <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
                  Build Your Formula
                </h2>
                <GelCard quizFormula={quizFormula} startOpen={true} />
              </div>
            )}

            {/* ── RACE DAY QUIZ ── */}
            {quizMode === 'race-day-quiz' && (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
                      Race Day Diagnostic
                    </h2>
                    <button
                      onClick={() => { setQuizMode('race-day-manual'); setQuizFormula(null); setQuizDone(false); }}
                      className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition"
                    >
                      Skip — customize manually
                    </button>
                  </div>

                  {quizDone ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Race Day Formula Generated</h3>
                      <p className="text-gray-500 text-sm mb-6">
                        Your race day gel is loaded below — adjust any slider before adding to cart.
                      </p>
                      <button onClick={() => { setQuizDone(false); setQuizFormula(null); }} className="text-sm text-slate-500 underline hover:text-slate-800 transition">
                        Retake the quiz
                      </button>
                    </div>
                  ) : (
                    // Pass raceDayOnly flag so Quiz starts directly in race-day phase
                    <Quiz onComplete={handleQuizComplete} raceDayOnly={true} />
                  )}
                </div>

                <div className="flex justify-center my-8">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-8 bg-amber-200" />
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M4 10l6 6 6-6" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div ref={builderRef}>
                  <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs font-black flex items-center justify-center">2</span>
                    Your Race Day Formula
                  </h2>
                  {/* Always render the race day GelCard — shows defaults until quiz completes */}
                  <GelCard
                    quizFormula={quizFormula ? quizFormula : { main: null, raceDay: { caffeine: 75, carbs: 45, sodium: 300, thickness: 3, fructoseRatio: 0.35, flavor: 'Neutral / Unflavored' } }}
                    raceDayOnly={true}
                    startOpen={true}
                  />
                </div>
              </>
            )}

            {/* ── RACE DAY MANUAL ── */}
            {quizMode === 'race-day-manual' && (
              <div ref={builderRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
                    Build Your Race Day Formula
                  </h2>
                  <button
                    onClick={() => setQuizMode('race-day-quiz')}
                    className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition"
                  >
                    Take the quiz instead
                  </button>
                </div>
                <GelCard
                  quizFormula={{ main: null, raceDay: { caffeine: 75, carbs: 45, sodium: 300, thickness: 3, fructoseRatio: 0.35, flavor: 'Neutral / Unflavored' } }}
                  raceDayOnly={true}
                  startOpen={true}
                />
              </div>
            )}

            {/* Back to landing link */}
            {quizMode !== 'landing' && (
              <button
                onClick={resetQuiz}
                className="mt-8 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition block mx-auto"
              >
                Back to options
              </button>
            )}
          </div>
        )}

        {/* Mission */}
        {activeTab === 'mission' && <MissionPage />}

        {/* FAQ */}
        {activeTab === 'faq' && <FAQPage onGoToQuiz={goToQuiz} />}

        {/* Community */}
        {activeTab === 'community' && (
          <CommunityPage
            onLoadFormula={(formula) => {
              setQuizFormula(formula);
              setQuizMode('manual');
              setActiveTab('quiz');
              scrollToBuilder();
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