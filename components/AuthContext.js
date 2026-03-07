"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isDeveloper } from '../lib/devConfig';

const AuthContext = createContext(null);

// Fetch profile data separately — never blocks auth
async function fetchProfile(userId) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, is_pro, pro_status')
      .eq('user_id', userId)
      .maybeSingle();
    return {
      avatarUrl: data?.avatar_url || null,
      isPro:     data?.is_pro    || false,
      proStatus: data?.pro_status || null,
    };
  } catch {
    return { avatarUrl: null, isPro: false, proStatus: null };
  }
}

function sessionToUser(s) {
  return {
    id:        s.id,
    email:     s.email,
    name:      s.user_metadata?.name || s.email.split('@')[0],
    createdAt: s.created_at,
    avatarUrl: null,
    isPro:     false,
    proStatus: null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get session once, set user immediately, then fetch profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const base = sessionToUser(session.user);
        setUser(base);
        // Enrich with profile in background — won't block loading
        fetchProfile(base.id).then(profile => {
          setUser(prev => prev ? { ...prev, ...profile } : prev);
        });
      }
      setLoading(false);
    });

    // 2. Auth state changes: only handle sign-in/sign-out events
    //    Do NOT call fetchProfile here — it causes loops on updateUser
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const base = sessionToUser(session.user);
        setUser(prev => {
          // Preserve profile data if user is same person
          if (prev?.id === base.id) return { ...base, avatarUrl: prev.avatarUrl, isPro: prev.isPro, proStatus: prev.proStatus };
          return base;
        });
      }
      // USER_UPDATED: just update name/email from metadata, don't re-fetch profile
      if (event === 'USER_UPDATED' && session?.user) {
        setUser(prev => prev ? {
          ...prev,
          name:  session.user.user_metadata?.name || session.user.email.split('@')[0],
          email: session.user.email,
        } : prev);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ name, email, password }) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).catch(() => {});
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

  // ── Update profile (name / password) ─────────────────────────────────────
  const updateProfile = useCallback(async ({ name, currentPassword, newPassword }) => {
    if (!user) return { error: 'Not signed in.' };
    if (newPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, password: currentPassword,
      });
      if (signInError) return { error: 'Current password is incorrect.' };
      if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
    }
    if (name?.trim() && name.trim() !== user.name) {
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (error) return { error: error.message };
      // Update locally — don't wait for onAuthStateChange
      setUser(prev => prev ? { ...prev, name: name.trim() } : prev);
    }
    return { success: true };
  }, [user]);

  // ── Upload avatar ─────────────────────────────────────────────────────────
  const uploadAvatar = useCallback(async (file) => {
    if (!user) return { error: 'Not signed in.' };
    const ext  = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').upsert(
      { user_id: user.id, avatar_url: url },
      { onConflict: 'user_id' }
    );
    setUser(prev => prev ? { ...prev, avatarUrl: url } : prev);
    return { success: true, url };
  }, [user]);

  // ── Request pro status ────────────────────────────────────────────────────
  const requestPro = useCallback(async () => {
    if (!user) return { error: 'Not signed in.' };
    await supabase.from('profiles').upsert(
      { user_id: user.id, pro_status: 'pending' },
      { onConflict: 'user_id' }
    );
    fetch('/api/email/pro-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, email: user.email, userId: user.id }),
    }).catch(() => {});
    setUser(prev => prev ? { ...prev, proStatus: 'pending' } : prev);
    return { success: true };
  }, [user]);

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

  const isDev = isDeveloper(user?.email);

  return (
    <AuthContext.Provider value={{
      user, loading, isDev,
      signUp, signIn, signOut,
      saveOrder, getMyOrders,
      saveFormula, getSavedFormulas, deleteFormula,
      updateProfile, uploadAvatar, requestPro,
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