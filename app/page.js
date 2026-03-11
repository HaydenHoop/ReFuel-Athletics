"use client";
import { useState, useEffect, useRef } from 'react';
import ProductDetailPage from '../components/ProductDetailPage';
import HomePage from '../components/HomePage';
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
import SupportChat from '../components/SupportChat';

// ── Quiz landing choice screen ────────────────────────────────────────────────
function QuizLanding({ onChoose }) {
  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => onChoose('quiz')}
          className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #2e4460 0%, #2e4d70 60%, #2a4258 100%)' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #254880 0%, #2a5272 100%)' }} />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Recommended · ~2 min</p>
            <h3 className="font-black text-white text-2xl mb-3 tracking-tight">Take the Quiz</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">Answer 7 questions about your sport, sweat rate, and goals. We'll dial in your formula automatically.</p>
            <span className="inline-flex items-center gap-2 bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full group-hover:bg-gray-100 transition-colors">
              Start Quiz
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </button>

        <button onClick={() => onChoose('manual')}
          className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #2a3d5a 0%, #2e4870 60%, #244870 100%)' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #344f82 0%, #264462 100%)' }} />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Full control</p>
            <h3 className="font-black text-white text-2xl mb-3 tracking-tight">Customize Yourself</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">Know exactly what you want? Jump straight to the sliders and build your formula from scratch.</p>
            <span className="inline-flex items-center gap-2 border border-white/30 text-white text-xs font-bold px-5 py-2.5 rounded-full group-hover:bg-white/10 transition-colors">
              Open Builder
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Banned Wall ───────────────────────────────────────────────────────────────
function BannedWall({ banReason, banExpires }) {
  const expiryDate = banExpires
    ? new Date(banExpires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
          🚫
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Account Suspended</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your account has been suspended from ReFuel Athletics.
        </p>
        {banReason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Reason</p>
            <p className="text-sm text-gray-700 leading-relaxed">{banReason}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-6 text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">What you can do</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            You have until <strong>{expiryDate ?? '2 weeks from your ban date'}</strong> to submit an unban appeal by emailing us.
            If no appeal is received or accepted, your account will be permanently deleted.
          </p>
        </div>
        <a href="mailto:haydenh.refuel@gmail.com?subject=Unban Appeal&body=Hi, I would like to appeal my account suspension.%0A%0AMy reason for requesting an unban:%0A"
          className="inline-block w-full bg-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition text-sm">
          Submit Appeal via Email →
        </a>
        <p className="text-xs text-gray-400 mt-4">haydenh.refuel@gmail.com</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function PageContent() {
  const { user } = useAuth();

  // Show ban wall if this user is banned — replaces entire app
  if (user?.banned) {
    return <BannedWall banReason={user.banReason} banExpires={user.banExpires} />;
  }


  // Scroll to top on initial page load
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const [activeTab, setActiveTab]       = useState('home');
  const [activeProduct, setActiveProduct] = useState(null);
  const [quizFormula, setQuizFormula]   = useState(null);
  const [quizDone, setQuizDone]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen]         = useState(false);
  const [authMode, setAuthMode]         = useState('signin');
  // 'landing' | 'quiz' | 'manual' | 'race-day-quiz' | 'race-day-manual'
  const [quizMode, setQuizMode]         = useState('landing');
  const builderRef                      = useRef(null);
  const dealsRef                        = useRef(null); // ← passed to ProductsPage, scrolled to from CartDrawer

  const scrollToBuilder = () => setTimeout(() =>
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);

  const handleQuizComplete = (result) => {
    setQuizFormula(result);
    setQuizDone(true);
    scrollToBuilder();
  };

  const resetQuiz = () => { setQuizFormula(null); setQuizDone(false); setQuizMode('landing'); };

  const goToQuiz = () => {
    if (!quizFormula) setQuizMode('landing');
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

  const handleTabChange = (tab) => {
    if (tab !== 'quiz' && !quizFormula) setQuizMode('landing');
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // ← Navigate to products tab then scroll to the Deals & Bundles section
  const handleViewDeals = () => {
    setActiveTab('products');
    setTimeout(() => {
      dealsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const RACE_DAY_DEFAULT = {
    main: null,
    raceDay: { caffeine: 75, carbs: 45, sodium: 300, thickness: 3, fructoseRatio: 0.35, flavor: 'Neutral / Unflavored' }
  };

  return (
    <div className={`min-h-screen font-sans text-gray-900 transition-colors duration-300 ${activeTab === 'quiz' ? 'bg-[#1a2535]' : 'bg-gray-50'}`}>
      <Nav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartButton={<CartButton />}
        onAccountClick={handleAccountClick}
      />

      {/* ← onViewDeals wired so CartDrawer "Check Deals" button works */}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} onViewDeals={handleViewDeals} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} onViewAccount={() => setActiveTab('account')} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
      <SupportChat />

      <main>

        {/* Home — full screen hero, nav floats over, no padding wrapper */}
        {activeTab === 'home' && (
          <HomePage onTabChange={handleTabChange} />
        )}

        {/* All other tabs — pt-[100px] clears fixed nav */}
        {activeTab !== 'home' && (
          <div className="flex flex-col items-center px-4 py-12 pt-[88px] sm:pt-[100px]">

            {/* Shop — dealsRef passed so CartDrawer can scroll to deals */}
            {activeTab === 'products' && (
              <ProductsPage
                onGoToQuiz={goToQuiz}
                onGoToRaceDayQuiz={goToRaceDayQuiz}
                quizFormula={quizFormula}
                onViewProduct={(id) => { setActiveProduct(id); setActiveTab('product-detail'); }}
                dealsRef={dealsRef}
              />
            )}

            {/* Product Detail */}
            {activeTab === 'product-detail' && (
              <ProductDetailPage
                productId={activeProduct}
                onBack={() => setActiveTab('products')}
                onGoToQuiz={goToQuiz}
              />
            )}

            {/* Find Your Gel */}
            {activeTab === 'quiz' && (
              <div className="w-full max-w-3xl">

                {/* Dark immersive header */}
                <div className="relative rounded-2xl overflow-hidden mb-8 px-8 py-12 text-center"
                  style={{ background: 'linear-gradient(135deg, #2a3d54 0%, #2e4560 50%, #2a4258 100%)' }}>
                  <div className="absolute inset-0 opacity-50"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #2563eb 0%, transparent 55%), radial-gradient(circle at 80% 30%, #059669 0%, transparent 55%)' }} />
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 mb-3">Personalized Nutrition</p>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                      {quizMode === 'race-day-quiz' || quizMode === 'race-day-manual' ? 'Race Day Gel' : 'Find Your Gel'}
                    </h1>
                    <p className="text-white/70 max-w-md mx-auto text-sm leading-relaxed">
                      {quizMode === 'race-day-quiz' || quizMode === 'race-day-manual'
                        ? 'Dial in your race day formula — caffeine, carbs, and electrolytes tuned for race conditions.'
                        : 'Answer 7 quick questions and we will dial in your ideal formula. Then fine-tune every slider and add to cart.'}
                    </p>
                  </div>
                </div>

                {/* Landing choice */}
                {quizMode === 'landing' && (
                  <QuizLanding onChoose={(choice) => setQuizMode(choice)} />
                )}

                {/* Training quiz */}
                {quizMode === 'quiz' && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-white text-black text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Take the Diagnostic</h2>
                      </div>
                      {quizDone ? (
                        <div className="rounded-2xl p-8 text-center border border-white/25"
                          style={{ background: 'linear-gradient(135deg, #2e4460 0%, #344e6e 100%)' }}>
                          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <h3 className="text-xl font-black text-white mb-2">Formula Generated</h3>
                          <p className="text-white/70 text-sm mb-6">Your personalized blend is loaded below. Fine-tune the sliders or add to cart as-is.</p>
                          <button onClick={resetQuiz}
                            className="text-xs text-white/75 hover:text-white/90 transition uppercase tracking-widest">
                            Start over
                          </button>
                        </div>
                      ) : (
                        <Quiz onComplete={handleQuizComplete} />
                      )}
                    </div>

                    <div className="flex justify-center my-8">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
                      </div>
                    </div>

                    <div ref={builderRef}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-white text-black text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Fine-Tune & Add to Cart</h2>
                      </div>
                      <GelCard quizFormula={quizFormula} startOpen={true} />
                    </div>
                  </>
                )}

                {/* Manual training build */}
                {quizMode === 'manual' && (
                  <div ref={builderRef}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-7 h-7 rounded-full bg-white text-black text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Build Your Formula</h2>
                    </div>
                    <GelCard quizFormula={quizFormula} startOpen={true} />
                  </div>
                )}

                {/* Race day quiz */}
                {quizMode === 'race-day-quiz' && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Race Day Diagnostic</h2>
                        </div>
                        <button
                          onClick={() => { setQuizMode('race-day-manual'); setQuizFormula(null); setQuizDone(false); }}
                          className="text-xs text-white/75 hover:text-white/90 transition uppercase tracking-widest">
                          Skip — customize manually
                        </button>
                      </div>
                      {quizDone ? (
                        <div className="rounded-2xl p-8 text-center border border-amber-500/20"
                          style={{ background: 'linear-gradient(135deg, #4a3510 0%, #5c4418 100%)' }}>
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <h3 className="text-xl font-black text-white mb-2">Race Day Formula Ready</h3>
                          <p className="text-white/70 text-sm mb-6">Your race day gel is loaded below — adjust any slider before adding to cart.</p>
                          <button onClick={() => { setQuizDone(false); setQuizFormula(null); }}
                            className="text-xs text-white/75 hover:text-white/90 transition uppercase tracking-widest">
                            Retake the quiz
                          </button>
                        </div>
                      ) : (
                        <Quiz onComplete={handleQuizComplete} raceDayOnly={true} />
                      )}
                    </div>

                    <div className="flex justify-center my-8">
                      <div className="w-px h-10 bg-gradient-to-b from-amber-500/70 to-transparent" />
                    </div>

                    <div ref={builderRef}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Your Race Day Formula</h2>
                      </div>
                      <GelCard quizFormula={quizFormula ?? RACE_DAY_DEFAULT} raceDayOnly={true} startOpen={true} />
                    </div>
                  </>
                )}

                {/* Race day manual */}
                {quizMode === 'race-day-manual' && (
                  <div ref={builderRef}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-200">Build Your Race Day Formula</h2>
                      </div>
                      <button onClick={() => setQuizMode('race-day-quiz')}
                        className="text-xs text-white/75 hover:text-white/90 transition uppercase tracking-widest">
                        Take the quiz instead
                      </button>
                    </div>
                    <GelCard quizFormula={RACE_DAY_DEFAULT} raceDayOnly={true} startOpen={true} />
                  </div>
                )}

                {/* Back to options */}
                {quizMode !== 'landing' && (
                  <div className="mt-10 pt-8 border-t border-white/30 text-center">
                    <button onClick={resetQuiz}
                      className="inline-flex items-center gap-2 text-xs text-white/75 hover:text-white/90 transition uppercase tracking-widest">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                      </svg>
                      Back to options
                    </button>
                  </div>
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
                ? <AccountPage
                    onLoadFormula={handleLoadFormula}
                    onViewCommunityFormula={(formulaId) => {
                      setActiveTab('community');
                      // Small delay so CommunityPage mounts before we try to open detail
                      setTimeout(() => {
                        window.__openCommunityFormula?.(formulaId);
                      }, 100);
                    }}
                  />
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

          </div>
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