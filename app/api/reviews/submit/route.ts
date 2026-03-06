import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdmin();
    const { token, orderId, rating, title, body, reviewer, product } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5.' }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
    }

    // dev- and test- tokens skip DB validation
    const isDevToken = token.startsWith('test-') || token.startsWith('dev-');

    if (!isDevToken) {
      const { data: tokenRow, error: tokenErr } = await supabase
        .from('review_tokens')
        .select('id, used')
        .eq('token', token)
        .maybeSingle();  // maybeSingle returns null instead of error when not found

      if (tokenErr) {
        console.error('Token lookup DB error:', tokenErr);
        return NextResponse.json({ error: `Token lookup failed: ${tokenErr.message}` }, { status: 500 });
      }
      if (!tokenRow) {
        return NextResponse.json({ error: 'Review link not found. Please check your email for the correct link.' }, { status: 403 });
      }
      if (tokenRow.used) {
        return NextResponse.json({ error: 'This review has already been submitted.' }, { status: 403 });
      }
    }

    const { error: insertErr } = await supabase.from('reviews').insert({
      order_ref: orderId ?? 'unknown',
      token,
      rating,
      title:    title?.trim()    || null,
      body:     body?.trim()     || null,
      reviewer: reviewer?.trim() || 'Anonymous',
      product:  product          || null,
      approved: true,
    });

    if (insertErr) {
      console.error('Review insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    if (!isDevToken) {
      await supabase.from('review_tokens').update({ used: true }).eq('token', token);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Review submit error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = getAdmin();
  const { searchParams } = new URL(req.url);
  const limit   = parseInt(searchParams.get('limit') ?? '50');
  const topFive = searchParams.get('topFive') === 'true';
  const product = searchParams.get('product') ?? '';

  let query = supabase
    .from('reviews')
    .select('id, rating, title, body, reviewer, created_at, product')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (product) {
    query = query.eq('product', product);
  }

  if (topFive) {
    query = query.eq('rating', 5).not('body', 'is', null).limit(5);
  } else {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reviews: data ?? [], debug: { product, topFive, count: data?.length ?? 0 } });
}