"use client";
import { createContext, useContext, useState, useCallback } from 'react';

const COMMUNITY_KEY = 'refuel_community';

function getData() {
  try { return JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '{"formulas":[]}'); }
  catch { return { formulas: [] }; }
}
function saveData(data) {
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(data));
}

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {

  // Force re-renders when data changes
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  // ── Get all formulas sorted by likes ─────────────────────────────────────
  const getFormulas = useCallback(() => {
    const { formulas } = getData();
    return [...formulas].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  }, [tick]);

  // ── Share a new formula ───────────────────────────────────────────────────
  const shareFormula = useCallback((user, formulaData) => {
    if (!user) return { error: 'You must be signed in to share a formula.' };
    const data = getData();
    const id = `formula_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newFormula = {
      id,
      name: formulaData.name || 'Untitled Formula',
      description: formulaData.description || '',
      anonymous: formulaData.anonymous || false,
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
      // Formula values
      carbs: formulaData.carbs,
      sodium: formulaData.sodium,
      potassium: formulaData.potassium,
      magnesium: formulaData.magnesium,
      caffeine: formulaData.caffeine,
      fructoseRatio: formulaData.fructoseRatio,
      thickness: formulaData.thickness,
      flavor: formulaData.flavor,
      // Sport/use context tags
      tags: formulaData.tags || [],
      likes: [],
      comments: [],
      sharedAt: new Date().toISOString(),
    };
    data.formulas.unshift(newFormula);
    saveData(data);
    refresh();
    return { success: true, id };
  }, []);

  // ── Toggle like ───────────────────────────────────────────────────────────
  const toggleLike = useCallback((user, formulaId) => {
    if (!user) return { error: 'Sign in to like formulas.' };
    const data = getData();
    const formula = data.formulas.find(f => f.id === formulaId);
    if (!formula) return { error: 'Formula not found.' };
    const idx = formula.likes.indexOf(user.id);
    if (idx === -1) formula.likes.push(user.id);
    else formula.likes.splice(idx, 1);
    saveData(data);
    refresh();
    return { success: true, liked: idx === -1 };
  }, []);

  // ── Add comment ───────────────────────────────────────────────────────────
  const addComment = useCallback((user, formulaId, text) => {
    if (!user) return { error: 'Sign in to comment.' };
    if (!text?.trim()) return { error: 'Comment cannot be empty.' };
    const data = getData();
    const formula = data.formulas.find(f => f.id === formulaId);
    if (!formula) return { error: 'Formula not found.' };
    formula.comments.push({
      id: `comment_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      text: text.trim(),
      postedAt: new Date().toISOString(),
    });
    saveData(data);
    refresh();
    return { success: true };
  }, []);

  // ── Delete comment (own only) ─────────────────────────────────────────────
  const deleteComment = useCallback((user, formulaId, commentId) => {
    if (!user) return;
    const data = getData();
    const formula = data.formulas.find(f => f.id === formulaId);
    if (!formula) return;
    formula.comments = formula.comments.filter(
      c => !(c.id === commentId && c.authorId === user.id)
    );
    saveData(data);
    refresh();
  }, []);

  // ── Delete formula (own only) ─────────────────────────────────────────────
  const deleteFormula = useCallback((user, formulaId) => {
    if (!user) return;
    const data = getData();
    data.formulas = data.formulas.filter(
      f => !(f.id === formulaId && f.authorId === user.id)
    );
    saveData(data);
    refresh();
  }, []);

  // ── Get single formula ────────────────────────────────────────────────────
  const getFormula = useCallback((formulaId) => {
    const { formulas } = getData();
    return formulas.find(f => f.id === formulaId) || null;
  }, [tick]);

  return (
    <CommunityContext.Provider value={{
      getFormulas, getFormula,
      shareFormula, toggleLike,
      addComment, deleteComment,
      deleteFormula,
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
