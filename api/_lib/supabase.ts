import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../src/lib/supabase/database.types.js';

function requireServerEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function createUserScopedSupabaseClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(
    requireServerEnv('SUPABASE_URL'),
    requireServerEnv('SUPABASE_PUBLISHABLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    },
  );
}

export function createPublicAuthSupabaseClient(): SupabaseClient<Database> {
  return createClient<Database>(
    requireServerEnv('SUPABASE_URL'),
    requireServerEnv('SUPABASE_PUBLISHABLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

export function createSecretSupabaseClient(): SupabaseClient<Database> {
  return createClient<Database>(
    requireServerEnv('SUPABASE_URL'),
    requireServerEnv('SUPABASE_SECRET_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
