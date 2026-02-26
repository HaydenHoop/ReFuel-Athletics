"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Simple but secure-enough client-side password hashing using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  // Use a consistent salt derived from the password + a site-specific secret
  // In production this would be bcrypt on the server — this is the client-safe equivalent
  const data = encoder.encode(password + 'refuel_athletics_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

const SESSION_KEY = 'refuel_session';
const USERS_KEY   = 'refuel_users';
const ORDERS_KEY  = 'refuel_orders';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, email, name, createdAt }
  const [loading, setLoading] = useState(true);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch { return {}; }
  };
  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const getOrders = () => {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '{}'); }
    catch { return {}; }
  };
  const saveOrders = (orders) => localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        // Check session hasn't expired (30-day TTL)
        if (session.expiresAt > Date.now()) {
          const users = getUsers();
          const found = users[session.userId];
          if (found) {
            setUser({ id: found.id, email: found.email, name: found.name, createdAt: found.createdAt });
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ name, email, password }) => {
    const users = getUsers();
    const emailKey = email.toLowerCase().trim();

    if (users[emailKey]) {
      return { error: 'An account with this email already exists.' };
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' };
    }

    const hashed = await hashPassword(password);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newUser = {
      id,
      email: emailKey,
      name: name.trim(),
      passwordHash: hashed,
      createdAt: new Date().toISOString(),
    };

    users[emailKey] = newUser;
    saveUsers(users);

    // Create session
    const token = generateSessionToken();
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      token,
      userId: emailKey,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }));

    setUser({ id, email: emailKey, name: newUser.name, createdAt: newUser.createdAt });

    // Send welcome email (fire and forget — don't block signup if it fails)
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUser.name, email: emailKey }),
    }).catch(err => console.warn('Welcome email failed:', err));

    return { success: true };
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const users = getUsers();
    const emailKey = email.toLowerCase().trim();
    const found = users[emailKey];

    if (!found) {
      return { error: 'No account found with that email.' };
    }

    const hashed = await hashPassword(password);
    if (hashed !== found.passwordHash) {
      return { error: 'Incorrect password.' };
    }

    const token = generateSessionToken();
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      token,
      userId: emailKey,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }));

    setUser({ id: found.id, email: emailKey, name: found.name, createdAt: found.createdAt });
    return { success: true };
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  // ── Save order to account ─────────────────────────────────────────────────
  const saveOrder = useCallback((orderData) => {
    if (!user) return;
    const orders = getOrders();
    if (!orders[user.email]) orders[user.email] = [];
    orders[user.email].unshift({
      id: `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      date: new Date().toISOString(),
      ...orderData,
    });
    saveOrders(orders);
  }, [user]);

  // ── Get orders for current user ───────────────────────────────────────────
  const getMyOrders = useCallback(() => {
    if (!user) return [];
    const orders = getOrders();
    return orders[user.email] || [];
  }, [user]);

  // ── Save formula ──────────────────────────────────────────────────────────
  const saveFormula = useCallback((formula) => {
    if (!user) return { error: 'Sign in to save formulas.' };
    const users = getUsers();
    const u = users[user.email];
    if (!u) return { error: 'User not found.' };
    if (!u.savedFormulas) u.savedFormulas = [];
    u.savedFormulas.unshift({
      id: `formula_${Date.now()}`,
      savedAt: new Date().toISOString(),
      ...formula,
    });
    // Cap at 10 saved formulas
    u.savedFormulas = u.savedFormulas.slice(0, 10);
    users[user.email] = u;
    saveUsers(users);
    return { success: true };
  }, [user]);

  const getSavedFormulas = useCallback(() => {
    if (!user) return [];
    const users = getUsers();
    return users[user.email]?.savedFormulas || [];
  }, [user]);

  const deleteFormula = useCallback((formulaId) => {
    if (!user) return;
    const users = getUsers();
    const u = users[user.email];
    if (!u) return;
    u.savedFormulas = (u.savedFormulas || []).filter(f => f.id !== formulaId);
    users[user.email] = u;
    saveUsers(users);
  }, [user]);

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async ({ name, currentPassword, newPassword }) => {
    if (!user) return { error: 'Not signed in.' };
    const users = getUsers();
    const u = users[user.email];
    if (!u) return { error: 'User not found.' };

    if (newPassword) {
      const currentHashed = await hashPassword(currentPassword);
      if (currentHashed !== u.passwordHash) return { error: 'Current password is incorrect.' };
      if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
      u.passwordHash = await hashPassword(newPassword);
    }

    if (name?.trim()) u.name = name.trim();
    users[user.email] = u;
    saveUsers(users);
    setUser(prev => ({ ...prev, name: u.name }));
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