"use client";
import { useState } from 'react';
import { useCart } from './CartContext';

const TAX_RATE = 0.08;

// ── Promo codes ───────────────────────────────────────────────────────────────
// oneTime codes are checked/stored in localStorage — one use per browser/customer
const PROMO_CODES = {
  FIRSTORDER: {
    discount: 0.15,
    label: '15% off',
    description: 'First order discount',
    oneTime: true,
  },
  FREEFLASK: {
    discount: 0,
    label: 'Free flask',
    description: 'Free flask with 20+ gel pouches',
    oneTime: true,
    requiresPouches: 20,
    freeItem: { name: 'Reusable Gel Flask', price: 15 },
  },
};

function getUsedCodes() {
  try { return JSON.parse(localStorage.getItem('rf_used_codes') || '[]'); } catch { return []; }
}
function markCodeUsed(code) {
  const used = getUsedCodes();
  if (!used.includes(code)) {
    localStorage.setItem('rf_used_codes', JSON.stringify([...used, code]));
  }
}

// ── PromoInput ────────────────────────────────────────────────────────────────
function PromoInput({ items, appliedPromo, onApply }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    setError('');
    const code = input.trim().toUpperCase();
    if (!code) return;

    const promo = PROMO_CODES[code];
    if (!promo) {
      setError('Invalid code. Try FIRSTORDER or FREEFLASK.');
      return;
    }

    if (promo.oneTime && getUsedCodes().includes(code)) {
      setError('This code has already been used.');
      return;
    }

    if (promo.requiresPouches) {
      const pouchQty = items
        .filter(i => i.name?.toLowerCase().includes('gel') && !i.name?.toLowerCase().includes('flask'))
        .reduce((sum, i) => sum + i.qty, 0);
      if (pouchQty < promo.requiresPouches) {
        setError(`FREEFLASK requires ${promo.requiresPouches}+ gel pouches in your cart.`);
        return;
      }
    }

    onApply({ code, ...promo });
    setInput('');
  };

  const handleRemove = () => {
    onApply(null);
    setError('');
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-bold text-green-800">{appliedPromo.code}</p>
          <p className="text-xs text-green-600">{appliedPromo.label} · {appliedPromo.description}</p>
        </div>
        <button onClick={handleRemove}
          className="text-xs text-green-600 hover:text-green-800 font-semibold transition ml-3 flex-shrink-0">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Promo code"
          maxLength={20}
          className={`flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition uppercase tracking-widest
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
        />
        <button
          onClick={handleApply}
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-40 flex-shrink-0">
          Apply
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

// ── CartDrawer ────────────────────────────────────────────────────────────────
export default function CartDrawer({ onCheckout, onViewDeals }) {
  const { items, updateQty, removeItem, subtotal, itemCount, isOpen, setIsOpen } = useCart();
  const [appliedPromo, setAppliedPromo] = useState(null);

  const SHIPPING = subtotal >= 50 ? 0 : 6.99;

  const promoDiscount = (() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.freeItem) return appliedPromo.freeItem.price;
    return subtotal * appliedPromo.discount;
  })();

  const tax   = (subtotal - promoDiscount) * TAX_RATE;
  const total = subtotal - promoDiscount + tax + SHIPPING;

  const handleCheckout = () => {
    if (appliedPromo?.oneTime) markCodeUsed(appliedPromo.code);
    setIsOpen(false);
    onCheckout?.(appliedPromo);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Your Cart: DO NOT PURCHASE ANYTHING: PRODUCT STILL IN DEV</h2>
            {itemCount > 0 && (
              <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Deals nudge */}
        {items.length > 0 && (
          <button
            onClick={() => { setIsOpen(false); onViewDeals?.(); }}
            className="mx-6 mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition group"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-amber-800">Check deals to save</p>
              <p className="text-xs text-amber-600">Bundles, promo codes &amp; free flask offers</p>
            </div>
            <svg className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-3"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.subtitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-sm">${(item.price * item.qty).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-400 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">

            {subtotal < 50 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 text-center">
                Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!
              </div>
            )}
            {subtotal >= 50 && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 text-center font-medium">
                ✓ You've unlocked free shipping!
              </div>
            )}

            {/* Promo code input — only one code at a time */}
            <PromoInput
              items={items}
              appliedPromo={appliedPromo}
              onApply={setAppliedPromo}
            />

            {/* Breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>{appliedPromo.code} ({appliedPromo.label})</span>
                  <span>−${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{SHIPPING === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${SHIPPING.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition text-base flex items-center justify-between px-5"
            >
              <span>Checkout → ${total.toFixed(2)}</span>
              <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-lg tracking-wide">stripe</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}