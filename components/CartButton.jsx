"use client";
import { useCart } from './CartContext';

export default function CartButton() {
  const { itemCount, subtotal, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-full shadow hover:bg-gray-800 active:scale-95 transition-all duration-150 relative"
    >
      <span className="text-sm">🛒</span>
      {itemCount > 0 ? (
        <>
          <span className="font-bold text-xs">{itemCount}</span>
          <span className="text-gray-400 text-xs">·</span>
          <span className="font-bold text-xs">${subtotal.toFixed(2)}</span>
        </>
      ) : (
        <span className="font-medium text-xs">Cart</span>
      )}
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center shadow leading-none">
          {itemCount}
        </span>
      )}
    </button>
  );
}
