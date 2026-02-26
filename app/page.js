"use client";
import { useState } from 'react';
import Quiz from '../components/Quiz';
import GelCard from '../components/GelCard';
import ProductsPage from '../components/ProductsPage';
import MissionPage from '../components/MissionPage';
import AccountPage from '../components/AccountPage';
import Nav from '../components/Nav';
import CartButton from '../components/CartButton';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import AuthModal from '../components/AuthModal';
import { CartProvider } from '../components/CartContext';
import { AuthProvider, useAuth } from '../components/AuthContext';

function PageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [quizFormula, setQuizFormula] = useState(null);
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

      <main className="flex flex-col items-center px-4 py-12">

        {/* Shop */}
        {activeTab === 'products' && (
          <ProductsPage
            onGoToQuiz={() => setActiveTab('quiz')}
            quizFormula={quizFormula}
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
      <CartProvider>
        <PageContent />
      </CartProvider>
    </AuthProvider>
  );
}