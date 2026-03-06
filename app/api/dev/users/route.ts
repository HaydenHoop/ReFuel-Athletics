import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing env vars', users: [] }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) throw error;

    const users = (data?.users ?? []).map(u => ({
      id:        u.id,
      email:     u.email ?? '',
      name:      (u.user_metadata as any)?.name || u.email?.split('@')[0] || 'Unknown',
      createdAt: u.created_at,
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Dev users API error:', err);
    return NextResponse.json({ error: err.message, users: [] }, { status: 500 });
  }
}