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
    const { token, orderId } = await req.json();
    if (!token || !orderId) {
      return NextResponse.json({ error: 'Missing token or orderId' }, { status: 400 });
    }

    const supabase = getAdmin();
    const { error } = await supabase.from('review_tokens').insert({
      token,
      order_ref: orderId,
      used: false,
    });

    if (error) {
      console.error('Token insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Token route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}