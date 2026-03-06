import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // needs service role to bypass RLS
);

export async function POST(req: NextRequest) {
  try {
    const { token, orderId, rating, title, body, reviewer } = await req.json();

    if (!token || !rating) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5.' }, { status: 400 });
    }

    // Verify token exists and hasn't been used
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('review_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenErr || !tokenRow) {
      return NextResponse.json({ error: 'This review link has expired or already been used.' }, { status: 403 });
    }

    // Insert review
    const { error: insertErr } = await supabase.from('reviews').insert({
      order_ref: orderId,
      token,
      rating,
      title:    title || null,
      body:     body || null,
      reviewer: reviewer || 'Anonymous',
      approved: rating === 5, // auto-approve 5-star; others need manual approval
    });

    if (insertErr) throw insertErr;

    // Mark token as used
    await supabase
      .from('review_tokens')
      .update({ used: true })
      .eq('token', token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Review submit error:', err);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Public: fetch approved reviews
  const { searchParams } = new URL(req.url);
  const limit  = parseInt(searchParams.get('limit')  ?? '50');
  const stars  = parseInt(searchParams.get('stars')  ?? '0');
  const topFive = searchParams.get('topFive') === 'true';

  let query = supabase
    .from('reviews')
    .select('id, rating, title, body, reviewer, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (stars > 0) query = query.eq('rating', stars);
  if (topFive)   query = query.eq('rating', 5).neq('body', null).neq('body', '').limit(5);
  else           query = query.limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reviews: data ?? [] });
}
