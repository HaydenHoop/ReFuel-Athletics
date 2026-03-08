"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PRODUCTS_DROPDOWN = [
  { label: 'Reusable Gel Flask',  sub: 'Fill it, race it',          section: 'packet' },
  { label: 'Custom Gel Powder',   sub: 'Build your formula',         section: 'gel'    },
  { label: 'Race Day Gel',        sub: 'Peak performance formula',   section: 'raceday' },
];

const NAV_LINKS = [
  { id: 'home',      label: 'Home',          dropdown: false },
  { id: 'products',  label: 'Products',      dropdown: true  },
  { id: 'quiz',      label: 'Find Your Gel', dropdown: false },
  { id: 'community', label: 'Community',     dropdown: false },
  { id: 'faq',       label: 'FAQ',           dropdown: false },
  { id: 'mission',   label: 'Our Mission',   dropdown: false },
];

export default function Nav({ activeTab, onTabChange, cartButton, onAccountClick }) {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHero = activeTab === 'home';
  const glassy = isHero && !scrolled;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleProductSection = (section) => {
    setDropdownOpen(false);
    onTabChange('products');
    setTimeout(() => {
      const el = document.getElementById(`product-${section}`);
      if (!el) return;
      const navHeight = document.querySelector('header')?.offsetHeight ?? 100;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="w-full fixed top-0 left-0 right-0 z-50 bg-black text-white text-xs font-medium text-center py-2 tracking-wide">
        Free shipping on orders over $40 — use code <span className="font-bold underline underline-offset-2">FIRSTORDER</span> for 15% off
      </div>

      <header className={`w-full fixed top-8 left-0 right-0 z-40 transition-all duration-300 border-b
        ${glassy
          ? 'bg-white/10 backdrop-blur-xl border-white/20 shadow-[0_2px_20px_rgba(255,255,255,0.08)]'
          : 'bg-white/90 backdrop-blur-md border-gray-200/60 shadow-sm'
        }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <button onClick={() => onTabChange('products')} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-black tracking-tighter">RF</span>
              </div>
              <span className={`font-extrabold tracking-tight text-lg leading-none hidden sm:inline ${glassy ? 'text-white' : 'text-gray-900'}`}>
                ReFuel <span className={`font-light ${glassy ? 'text-white/50' : 'text-gray-400'}`}>Athletics</span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(link => {
                if (link.dropdown) {
                  return (
                    <div key={link.id} ref={dropRef} className="relative">
                      <div className="flex items-center">
                        <button
                          onClick={() => { setDropdownOpen(false); onTabChange('products'); }}
                          className={`px-3 py-2 text-sm font-semibold rounded-l-lg transition-all
                            ${activeTab === 'products'
                              ? glassy ? 'text-white bg-white/20' : 'text-gray-900 bg-gray-100'
                              : glassy ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                          {link.label}
                        </button>
                        <button
                          onMouseEnter={() => setDropdownOpen(true)}
                          onClick={() => setDropdownOpen(o => !o)}
                          className={`px-1.5 py-2 text-sm rounded-r-lg transition-all
                            ${activeTab === 'products'
                              ? glassy ? 'text-white bg-white/20' : 'text-gray-900 bg-gray-100'
                              : glassy ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                          <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {dropdownOpen && (
                        <div onMouseLeave={() => setDropdownOpen(false)}
                          className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                          {PRODUCTS_DROPDOWN.map(item => (
                            <button key={item.section} onClick={() => handleProductSection(item.section)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group">
                              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button key={link.id} onClick={() => onTabChange(link.id)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all
                      ${activeTab === link.id
                        ? glassy ? 'text-white bg-white/20' : 'text-gray-900 bg-gray-100'
                        : glassy ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: account + cart */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={onAccountClick}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${activeTab === 'account'
                    ? glassy ? 'bg-white/30 text-white border border-white/40' : 'bg-black text-white border border-black'
                    : glassy ? 'border border-white/30 text-white/80 hover:border-white/60 hover:text-white bg-white/10' : 'border border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : user ? (
                  <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                )}
                <span className="text-xs">{user ? user.name.split(' ')[0] : 'Account'}</span>
                {user?.isPro && (
                  <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-1.5 py-0.5 rounded-md leading-none">PRO</span>
                )}
                {user && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
              </button>
              {cartButton}
            </div>

          </div>
        </div>

        {/* Mobile bottom strip */}
        <nav className={`lg:hidden flex border-t ${glassy ? 'border-white/20' : 'border-gray-100'}`}>
          {[...NAV_LINKS, { id: 'account', label: user?.isPro ? 'Pro' : 'Account', dropdown: false }].map(tab => {
            const isActive = activeTab === tab.id;
            const onClick = tab.id === 'account' ? onAccountClick : () => onTabChange(tab.id);
            return (
              <button key={tab.id} onClick={onClick}
                className={`flex-1 py-2 text-center transition-colors ${isActive ? (glassy ? 'text-white' : 'text-black') : (glassy ? 'text-white/50' : 'text-gray-400')}`}>
                <span className="text-xs font-semibold block leading-tight">{tab.label}</span>
                {isActive && <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${glassy ? 'bg-white' : 'bg-black'}`} />}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
}