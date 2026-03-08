"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PRODUCTS_DROPDOWN = [
  { label: 'Custom Gel Powder',   sub: 'Build your formula',    section: 'gel' },
  { label: 'Reusable Gel Packet', sub: 'Fill it, race it',      section: 'packet' },
  { label: 'Race Day Bundle',     sub: 'Gel + packet together', section: 'bundle' },
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
  const dropRef = useRef(null);

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
      document.getElementById(`product-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="w-full bg-black text-white text-xs font-medium text-center py-2 tracking-wide">
        Free shipping on orders over $40 — use code <span className="font-bold underline underline-offset-2">FIRSTORDER</span> for 15% off
      </div>

      <header className="w-full sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <button onClick={() => onTabChange('products')} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-black tracking-tighter">RF</span>
              </div>
              <span className="font-extrabold text-gray-900 tracking-tight text-lg leading-none hidden sm:inline">
                ReFuel <span className="font-light text-gray-400">Athletics</span>
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(link => {
                if (link.dropdown) {
                  return (
                    <div key={link.id} ref={dropRef} className="relative">
                      {/* Clicking navigates; chevron or hover opens dropdown */}
                      <div className="flex items-center">
                        <button
                          onClick={() => { setDropdownOpen(false); onTabChange('products'); }}
                          className={`px-3 py-2 text-sm font-semibold rounded-l-lg transition-all
                            ${activeTab === 'products' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                          {link.label}
                        </button>
                        <button
                          onMouseEnter={() => setDropdownOpen(true)}
                          onClick={() => setDropdownOpen(o => !o)}
                          className={`px-1.5 py-2 text-sm rounded-r-lg transition-all
                            ${activeTab === 'products' ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
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
                      ${activeTab === link.id ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
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
                    ? 'bg-black text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}>
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
        <nav className="lg:hidden flex border-t border-gray-100">
          {[...NAV_LINKS, { id: 'account', label: user?.isPro ? 'Pro' : 'Account', dropdown: false }].map(tab => {
            const isActive = activeTab === tab.id;
            const onClick = tab.id === 'account' ? onAccountClick : () => onTabChange(tab.id);
            return (
              <button key={tab.id} onClick={onClick}
                className={`flex-1 py-2 text-center transition-colors ${isActive ? 'text-black' : 'text-gray-400'}`}>
                <span className="text-xs font-semibold block leading-tight">{tab.label}</span>
                {isActive && <div className="w-1 h-1 bg-black rounded-full mx-auto mt-0.5" />}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
}