"use client";
import { useAuth } from './AuthContext';

const TABS = [
  { id: 'products',   label: 'Shop',          icon: '⚡' },
  { id: 'quiz',       label: 'Find Your Gel',  icon: '🎯' },
  { id: 'community',  label: 'Community',      icon: '🌐' },
  { id: 'faq',        label: 'FAQ',            icon: '❓' },
  { id: 'mission',    label: 'Our Mission',    icon: '🏔' },
];

export default function Nav({ activeTab, onTabChange, cartButton, onAccountClick }) {
  const { user } = useAuth();

  return (
    <header className="w-full sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => onTabChange('products')} className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tighter">RF</span>
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight text-lg leading-none hidden sm:inline">
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

          {/* Mobile tabs — icons only */}
          <nav className="flex lg:hidden items-center gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all
                  ${activeTab === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {tab.icon}
              </button>
            ))}
          </nav>

          {/* Right side — account + cart */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onAccountClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all
                ${activeTab === 'account'
                  ? 'bg-black text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-white'
                }`}>
              <span className="text-base">👤</span>
              <span className="hidden sm:inline text-xs">{user ? user.name.split(' ')[0] : 'Account'}</span>
              {user && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
            </button>
            {cartButton}
          </div>

        </div>
      </div>
    </header>
  );
}