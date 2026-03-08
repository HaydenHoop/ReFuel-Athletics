import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton — prevents multiple instances during Next.js hot reload / multiple tabs.
// Without this, each module reload creates a new client that fights over the auth session,
// causing sign-in hangs, community not loading, and random freezes.
const globalKey = '__supabase_singleton__';

function getClient() {
  if (typeof globalThis[globalKey] !== 'undefined') {
    return globalThis[globalKey];
  }
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
      // All tabs/windows share the same session via localStorage
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  globalThis[globalKey] = client;
  return client;
}

export const supabase = getClient();