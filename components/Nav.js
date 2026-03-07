"use client";
import { useAuth } from './AuthContext';

const TABS = [
  { id: 'home',      label: 'Home',          icon: '🏠' },
  { id: 'products',  label: 'Shop',          icon: '⚡' },
  { id: 'quiz',      label: 'Find Your Gel', icon: '🎯' },
  { id: 'community', label: 'Community',     icon: '🌐' },
  { id: 'faq',       label: 'FAQ',           icon: '❓' },
  { id: 'mission',   label: 'Our Mission',   icon: '🏔' },
];

// Bottom 5 tabs shown on mobile (most important)
const MOBILE_TABS = [
  { id: 'home',      label: 'Home',    icon: '🏠' },
  { id: 'products',  label: 'Shop',    icon: '⚡' },
  { id: 'quiz',      label: 'Quiz',    icon: '🎯' },
  { id: 'community', label: 'Community', icon: '🌐' },
  { id: 'account',   label: 'Account', icon: '👤' },
];

export default function Nav({ activeTab, onTabChange, cartButton, onAccountClick }) {
  const { user, isDev } = useAuth();

  return (
    <>
      {/* ── Top header ───────────────────────────────────────────────────── */}
      <header className="w-full sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">

            {/* Logo */}
            <button onClick={() => onTabChange('home')} className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black tracking-tighter">RF</span>
              </div>
              <span className="font-extrabold text-gray-900 tracking-tight text-base md:text-lg leading-none hidden sm:inline">
                ReFuel <span className="font-normal text-gray-400">Athletics</span>
              </span>
            </button>

            {/* Desktop tabs */}
            <nav className="hidden lg:flex items-end gap-0.5 self-end pb-0">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => onTabChange(tab.id)}
                  className={`relative px-3 py-2.5 text-xs font-semibold rounded-t-xl transition-all duration-150 flex items-center gap-1.5
                    ${activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-b-0 border-gray-200 -mb-px pb-3'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl mb-1'
                    }`}>
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right side — account + cart (desktop) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={onAccountClick}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all
                  ${activeTab === 'account'
                    ? 'bg-black text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-white'
                  }`}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : user ? (
                  <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </span>
                ) : (
                  <span className="text-base">👤</span>
                )}
                <span className="text-xs">{user ? user.name.split(' ')[0] : 'Account'}</span>
                {user?.isPro && (
                  <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-1.5 py-0.5 rounded-md leading-none">PRO</span>
                )}
                {user && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
              </button>
              {/* Cart always visible */}
              {cartButton}
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-stretch h-16">
          {MOBILE_TABS.map(tab => {
            const isActive = tab.id === 'account'
              ? activeTab === 'account'
              : activeTab === tab.id;
            const handleTap = tab.id === 'account' ? onAccountClick : () => onTabChange(tab.id);
            return (
              <button key={tab.id} onClick={handleTap}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${isActive ? 'text-black' : 'text-gray-400'}`}>
                <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {tab.id === 'account' && user ? (
                    <span className="relative inline-block">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold inline-flex">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    </span>
                  ) : tab.icon}
                </span>
                <span className={`text-xs font-semibold leading-none ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  {tab.id === 'account' && user?.isPro ? '⚡ Pro' : tab.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom bar on mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
}