"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount + listen for auth changes ───────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id:        session.user.id,
          email:     session.user.email,
          name:      session.user.user_metadata?.name || session.user.email.split('@')[0],
          createdAt: session.user.created_at,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id:        session.user.id,
          email:     session.user.email,
          name:      session.user.user_metadata?.name || session.user.email.split('@')[0],
          createdAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ name, email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };

    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).catch(err => console.warn('Welcome email failed:', err));

    return { success: true };
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'Incorrect email or password.' };
      return { error: error.message };
    }
    return { success: true };
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ── Save order ────────────────────────────────────────────────────────────
  const saveOrder = useCallback(async (orderData) => {
    if (!user) return;
    await supabase.from('orders').insert({
      user_id:       user.id,
      order_ref:     orderData.id,
      items:         orderData.items,
      shipping:      orderData.shipping,
      subtotal:      orderData.subtotal,
      shipping_cost: orderData.shippingCost,
      tax:           orderData.tax,
      total:         orderData.total,
      status:        orderData.status || 'Confirmed',
    });
  }, [user]);

  // ── Get orders ────────────────────────────────────────────────────────────
  const getMyOrders = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data.map(o => ({
      id:           o.order_ref,
      date:         o.created_at,
      items:        o.items,
      shipping:     o.shipping,
      subtotal:     o.subtotal,
      shippingCost: o.shipping_cost,
      tax:          o.tax,
      total:        o.total,
      status:       o.status,
    }));
  }, [user]);

  // ── Save formula ──────────────────────────────────────────────────────────
  const saveFormula = useCallback(async (formula) => {
    if (!user) return { error: 'Sign in to save formulas.' };
    const { error } = await supabase.from('saved_formulas').insert({
      user_id:        user.id,
      name:           formula.name,
      carbs:          formula.carbs,
      sodium:         formula.sodium,
      potassium:      formula.potassium,
      magnesium:      formula.magnesium,
      caffeine:       formula.caffeine,
      fructose_ratio: formula.fructoseRatio,
      thickness:      formula.thickness,
      flavor:         formula.flavor,
      quiz_generated: formula.quizGenerated || false,
    });
    if (error) return { error: error.message };
    return { success: true };
  }, [user]);

  // ── Get saved formulas ────────────────────────────────────────────────────
  const getSavedFormulas = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('saved_formulas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return [];
    return data.map(f => ({
      id:            f.id,
      name:          f.name,
      carbs:         f.carbs,
      sodium:        f.sodium,
      potassium:     f.potassium,
      magnesium:     f.magnesium,
      caffeine:      f.caffeine,
      fructoseRatio: f.fructose_ratio,
      thickness:     f.thickness,
      flavor:        f.flavor,
      quizGenerated: f.quiz_generated,
      savedAt:       f.created_at,
    }));
  }, [user]);

  // ── Delete saved formula ──────────────────────────────────────────────────
  const deleteFormula = useCallback(async (formulaId) => {
    if (!user) return;
    await supabase.from('saved_formulas').delete().eq('id', formulaId).eq('user_id', user.id);
  }, [user]);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async ({ name, currentPassword, newPassword }) => {
    if (!user) return { error: 'Not signed in.' };
    if (newPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, password: currentPassword,
      });
      if (signInError) return { error: 'Current password is incorrect.' };
      if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) return { error: updateError.message };
    }
    if (name?.trim()) {
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (error) return { error: error.message };
      setUser(prev => ({ ...prev, name: name.trim() }));
    }
    return { success: true };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      signUp, signIn, signOut,
      saveOrder, getMyOrders,
      saveFormula, getSavedFormulas, deleteFormula,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}