"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]   = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const saveTimeout         = useRef(null);

  // ── Load session and cart on mount ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadCart(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadCart(session.user.id);
      } else {
        setUserId(null);
        setItems([]); // Clear cart on sign out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load cart from Supabase ───────────────────────────────────────────────
  const loadCart = async (uid) => {
    const { data } = await supabase
      .from('saved_carts')
      .select('items')
      .eq('user_id', uid)
      .maybeSingle();
    if (data?.items?.length) {
      setItems(data.items);
    }
  };

  // ── Debounced save to Supabase ────────────────────────────────────────────
  const persistCart = useCallback((newItems, uid) => {
    if (!uid) return;
    // Debounce — wait 800ms after last change before writing to DB
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase.from('saved_carts').upsert({
        user_id:    uid,
        items:      newItems,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }, 800);
  }, []);

  // ── Cart operations ───────────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const next = existing
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)
        : [...prev, item];
      persistCart(next, userId);
      return next;
    });
    setIsOpen(true);
  }, [userId, persistCart]);

  const updateQty = useCallback((id, qty) => {
    setItems(prev => {
      const next = qty <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, qty } : i);
      persistCart(next, userId);
      return next;
    });
  }, [userId, persistCart]);

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      persistCart(next, userId);
      return next;
    });
  }, [userId, persistCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (userId) {
      supabase.from('saved_carts').upsert({
        user_id: userId, items: [], updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
  }, [userId]);

  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
