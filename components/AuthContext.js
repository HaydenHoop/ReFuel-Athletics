"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isDeveloper } from '../lib/devConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount + listen for auth changes ───────────────────
  useEffect(() => {
    // Set basic user from session immediately — no async DB calls inside the listener
    const fromSession = (supabaseUser) => ({
      id:        supabaseUser.id,
      email:     supabaseUser.email,
      name:      supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
      createdAt: supabaseUser.created_at,
      isPro:     false,
      proStatus: null,
      avatarUrl: null,
    });

    // Fetch profile data separately — never called from inside onAuthStateChange
    const fetchProfile = (userId) => {
      supabase
        .from('profiles')
        .select('is_pro, pro_status, avatar_url, ban_status, ban_reason, ban_expires')
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data: profile }) => {
          // If banned, sign out immediately and surface banned state to UI
          if (profile?.ban_status === 'banned') {
            supabase.auth.signOut();
            setUser({ banned: true, banReason: profile.ban_reason || null, banExpires: profile.ban_expires || null });
            setLoading(false);
            return;
          }
          if (!profile) return;
          setUser(prev => {
            if (!prev || prev.id !== userId) return prev; // guard stale update
            return {
              ...prev,
              isPro:     profile.is_pro     || false,
              proStatus: profile.pro_status || null,
              avatarUrl: profile.avatar_url || null,
            };
          });
        });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(fromSession(session.user));
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(prev => {
          // If same user, keep existing profile enrichment (isPro etc) — don't wipe it
          if (prev?.id === session.user.id) return prev;
          fetchProfile(session.user.id);
          return fromSession(session.user);
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
    // Check ban status before allowing through
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ban_status, ban_reason, ban_expires')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (profile?.ban_status === 'banned') {
        await supabase.auth.signOut();
        setUser({ banned: true, banReason: profile.ban_reason || null, banExpires: profile.ban_expires || null });
        return { banned: true, banReason: profile.ban_reason };
      }
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


  // ── Upload avatar ─────────────────────────────────────────────────────────
  // Accepts a Blob (always JPEG from the crop canvas)
  const uploadAvatar = useCallback(async (blob) => {
    if (!user) return { error: 'Not signed in.' };
    // Fixed .jpg path — avoids extension mismatches across uploads
    const path = `${user.id}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (uploadError) return { error: uploadError.message };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${publicUrl}?v=${Date.now()}`;
    const { error: profileError } = await supabase.from('profiles').upsert(
      { user_id: user.id, avatar_url: url },
      { onConflict: 'user_id' }
    );
    if (profileError) return { error: profileError.message };
    setUser(prev => prev ? { ...prev, avatarUrl: url } : prev);
    return { success: true, url };
  }, [user]);

  // ── Request pro status ────────────────────────────────────────────────────
  const requestPro = useCallback(async () => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, pro_status: 'pending', requester_name: user.name, requester_email: user.email },
      { onConflict: 'user_id' }
    );
    if (error) return { error: error.message };
    fetch('/api/email/pro-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, email: user.email, userId: user.id }),
    }).catch(() => {});
    setUser(prev => prev ? { ...prev, proStatus: 'pending' } : prev);
    return { success: true };
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