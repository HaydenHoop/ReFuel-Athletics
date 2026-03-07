"use client";
import { createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {

  // ── Get all formulas sorted by likes ─────────────────────────────────────
  const getFormulas = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_formulas')
      .select(`*, formula_likes(user_id), formula_comments(id, user_id, author_name, text, created_at)`)
      .order('created_at', { ascending: false });

    if (error) { console.error('getFormulas error:', error); return []; }

    return data
      .map(f => ({
        id:            f.id,
        name:          f.name,
        description:   f.description,
        anonymous:     f.anonymous,
        authorId:      f.user_id,
        authorName:    f.author_name,
        tags:          f.tags || [],
        carbs:         f.carbs,
        sodium:        f.sodium,
        potassium:     f.potassium,
        magnesium:     f.magnesium,
        caffeine:      f.caffeine,
        fructoseRatio: f.fructose_ratio,
        thickness:     f.thickness,
        flavor:        f.flavor,
        sharedAt:      f.created_at,
        likes:         (f.formula_likes || []).map(l => l.user_id),
        comments:      (f.formula_comments || [])
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(c => ({ id: c.id, authorId: c.user_id, authorName: c.author_name, text: c.text, postedAt: c.created_at })),
      }))
      .sort((a, b) => b.likes.length - a.likes.length);
  }, []);

  // ── Get single formula ────────────────────────────────────────────────────
  const getFormula = useCallback(async (formulaId) => {
    const { data, error } = await supabase
      .from('community_formulas')
      .select(`*, formula_likes(user_id), formula_comments(id, user_id, author_name, text, created_at)`)
      .eq('id', formulaId)
      .single();

    if (error || !data) return null;

    return {
      id:            data.id,
      name:          data.name,
      description:   data.description,
      anonymous:     data.anonymous,
      authorId:      data.user_id,
      authorName:    data.author_name,
      tags:          data.tags || [],
      carbs:         data.carbs,
      sodium:        data.sodium,
      potassium:     data.potassium,
      magnesium:     data.magnesium,
      caffeine:      data.caffeine,
      fructoseRatio: data.fructose_ratio,
      thickness:     data.thickness,
      flavor:        data.flavor,
      sharedAt:      data.created_at,
      likes:         (data.formula_likes || []).map(l => l.user_id),
      comments:      (data.formula_comments || [])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(c => ({ id: c.id, authorId: c.user_id, authorName: c.author_name, text: c.text, postedAt: c.created_at })),
    };
  }, []);

  // ── Share a formula ───────────────────────────────────────────────────────
  const shareFormula = useCallback(async (user, formulaData) => {
    if (!user) return { error: 'You must be signed in to share a formula.' };
    const { data, error } = await supabase.from('community_formulas').insert({
      user_id:        user.id,
      author_name:    formulaData.anonymous ? null : user.name,
      anonymous:      formulaData.anonymous || false,
      name:           formulaData.name,
      description:    formulaData.description || '',
      tags:           formulaData.tags || [],
      carbs:          formulaData.carbs,
      sodium:         formulaData.sodium,
      potassium:      formulaData.potassium,
      magnesium:      formulaData.magnesium,
      caffeine:       formulaData.caffeine,
      fructose_ratio: formulaData.fructoseRatio,
      thickness:      formulaData.thickness,
      flavor:         formulaData.flavor,
    }).select().single();
    if (error) return { error: error.message };
    return { success: true, id: data.id };
  }, []);

  // ── Toggle like ───────────────────────────────────────────────────────────
  const toggleLike = useCallback(async (user, formulaId) => {
    if (!user) return { error: 'Sign in to like formulas.' };
    const { data: existing } = await supabase
      .from('formula_likes')
      .select('user_id')
      .eq('formula_id', formulaId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('formula_likes').delete().eq('formula_id', formulaId).eq('user_id', user.id);
      return { success: true, liked: false };
    } else {
      await supabase.from('formula_likes').insert({ formula_id: formulaId, user_id: user.id });
      return { success: true, liked: true };
    }
  }, []);

  // ── Add comment ───────────────────────────────────────────────────────────
  const addComment = useCallback(async (user, formulaId, text) => {
    if (!user) return { error: 'Sign in to comment.' };
    if (!text?.trim()) return { error: 'Comment cannot be empty.' };
    const { error } = await supabase.from('formula_comments').insert({
      formula_id:  formulaId,
      user_id:     user.id,
      author_name: user.name,
      text:        text.trim(),
    });
    if (error) return { error: error.message };
    return { success: true };
  }, []);

  // ── Delete comment ────────────────────────────────────────────────────────
  const deleteComment = useCallback(async (user, formulaId, commentId) => {
    if (!user) return;
    await supabase.from('formula_comments').delete().eq('id', commentId).eq('user_id', user.id);
  }, []);

  // ── Delete formula ────────────────────────────────────────────────────────
  const deleteFormula = useCallback(async (user, formulaId) => {
    if (!user) return;
    await supabase.from('community_formulas').delete().eq('id', formulaId).eq('user_id', user.id);
  }, []);

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