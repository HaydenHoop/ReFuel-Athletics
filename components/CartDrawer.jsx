"use client";
import { useCart } from './CartContext';

export default function CartDrawer({ onCheckout }) {
  const { items, updateQty, removeItem, subtotal, itemCount, isOpen, setIsOpen } = useCart();

  const TAX_RATE = 0.08;
  const SHIPPING = subtotal >= 50 ? 0 : 6.99;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + SHIPPING;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
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

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-xl flex-shrink-0">
                    {item.emoji}
                  </div>
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
                          className="text-gray-300 hover:text-red-400 transition text-xs"
                        >
                          🗑
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
            {/* Free shipping banner */}
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

            {/* Order breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
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
              onClick={() => { setIsOpen(false); onCheckout(); }}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition text-base"
            >
              Checkout → ${total.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
