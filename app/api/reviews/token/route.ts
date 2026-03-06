import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { token, orderId } = await req.json();
    if (!token || !orderId) {
      return NextResponse.json({ error: 'Missing token or orderId' }, { status: 400 });
    }

    await supabase.from('review_tokens').insert({
      token,
      order_ref: orderId,
      used: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
