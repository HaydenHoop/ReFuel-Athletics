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
      if (session?.user) fetchProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch profile (ban status, isPro, avatar) ─────────────────────────────
  const fetchProfile = async (authUser) => {
    const base = {
      id:        authUser.id,
      email:     authUser.email,
      name:      authUser.user_metadata?.name || authUser.email.split('@')[0],
      createdAt: authUser.created_at,
    };
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, pro_status, avatar_url, ban_status, ban_reason, ban_expires')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (profile?.ban_status === 'banned') {
      setUser({
        ...base,
        banned:     true,
        banReason:  profile.ban_reason,
        banExpires: profile.ban_expires,
      });
      return;
    }

    setUser({
      ...base,
      isPro:     profile?.is_pro     || false,
      proStatus: profile?.pro_status || null,
      avatarUrl: profile?.avatar_url || null,
      isDev:     authUser.email === 'haydenh.refuel@gmail.com',
    });
  };

  const isDev = user?.isDev || false;

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'Incorrect email or password.' };
      return { error: error.message };
    }
    if (data?.user) await fetchProfile(data.user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('ban_status')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (profile?.ban_status === 'banned') return { error: 'banned' };

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
      user_id:         user.id,
      order_ref:       orderData.id,
      items:           orderData.items,
      shipping:        orderData.shipping,
      subtotal:        orderData.subtotal,
      shipping_cost:   orderData.shippingCost,
      tax:             orderData.tax,
      total:           orderData.total,
      status:          orderData.status     || 'Confirmed',
      promo_code:      orderData.promoCode      || null,
      promo_discount:  orderData.promoDiscount  || 0,
      is_subscription: orderData.isSubscription || false,
      sub_interval:    orderData.subInterval    || null,
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
      id:             o.order_ref,
      date:           o.created_at,
      items:          o.items,
      shipping:       o.shipping,
      subtotal:       o.subtotal,
      shippingCost:   o.shipping_cost,
      tax:            o.tax,
      total:          o.total,
      status:         o.status,
      promoCode:      o.promo_code,
      promoDiscount:  o.promo_discount,
      isSubscription: o.is_subscription,
      subInterval:    o.sub_interval,
    }));
  }, [user]);

  // ── Save subscription ─────────────────────────────────────────────────────
  // subscriptionData: { shipments, intervalWeeks, shipping, monthlyTotal, nextBillingDate }
  const saveSubscription = useCallback(async (subscriptionData) => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id:           user.id,
        shipments:         subscriptionData.shipments,
        interval_weeks:    subscriptionData.intervalWeeks,
        shipping:          subscriptionData.shipping,
        monthly_total:     subscriptionData.monthlyTotal,
        next_billing_date: subscriptionData.nextBillingDate,
        status:            'active',
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) return { error: error.message };
    return { success: true };
  }, [user]);

  // ── Get subscription ──────────────────────────────────────────────────────
  const getMySubscription = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id:              data.id,
      shipments:       data.shipments       || [],
      intervalWeeks:   data.interval_weeks  || 4,
      shipping:        data.shipping        || {},
      monthlyTotal:    data.monthly_total   || 0,
      nextBillingDate: data.next_billing_date,
      status:          data.status          || 'active',
      createdAt:       data.created_at,
      updatedAt:       data.updated_at,
    };
  }, [user]);

  // ── Update subscription shipping ──────────────────────────────────────────
  const updateSubscriptionShipping = useCallback(async (shippingData) => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase
      .from('subscriptions')
      .update({ shipping: shippingData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) return { error: error.message };
    return { success: true };
  }, [user]);

  // ── Cancel subscription ───────────────────────────────────────────────────
  const cancelSubscription = useCallback(async () => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) return { error: error.message };
    return { success: true };
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
  const uploadAvatar = useCallback(async (blob) => {
    if (!user) return { error: 'Not signed in.' };
    const path = `avatars/${user.id}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (uploadError) return { error: uploadError.message };
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const busted = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').upsert(
      { user_id: user.id, avatar_url: busted },
      { onConflict: 'user_id' }
    );
    setUser(prev => ({ ...prev, avatarUrl: busted }));
    return { success: true };
  }, [user]);

  // ── Request Pro ───────────────────────────────────────────────────────────
  const requestPro = useCallback(async () => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, pro_status: 'pending' },
      { onConflict: 'user_id' }
    );
    if (error) return { error: error.message };
    setUser(prev => ({ ...prev, proStatus: 'pending' }));
    fetch('/api/email/pro-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, email: user.email }),
    }).catch(() => {});
    return { success: true };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, isDev,
      signUp, signIn, signOut,
      saveOrder, getMyOrders,
      saveSubscription, getMySubscription,
      updateSubscriptionShipping, cancelSubscription,
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