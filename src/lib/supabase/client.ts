import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

let browserClient: SupabaseClient<Database> | undefined;

function requireBrowserEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local and configure Supabase.`);
  }
  return value.trim();
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const url = requireBrowserEnv('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  const publishableKey = requireBrowserEnv(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );

  browserClient = createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    global: {
      headers: { 'X-Client-Info': 'rgan-junior-web' },
    },
  });

  return browserClient;
}
