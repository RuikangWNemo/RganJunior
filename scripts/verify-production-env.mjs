import { loadEnv } from 'vite';

// Vercel can omit sensitive variables when pulling local build configuration.
// Public browser connection values must be present before producing a release.
if (process.env.VERCEL_ENV === 'production') {
  const config = loadEnv('production', process.cwd(), 'VITE_');
  const url = config.VITE_SUPABASE_URL?.trim();
  const key = config.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (url !== 'https://sronjswselrxewaqfcar.supabase.co' || !key?.startsWith('sb_publishable_')) {
    throw new Error('Production build blocked: configure this project’s public VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before building. Do not use a server secret.');
  }
  console.log('Production public Supabase configuration verified.');
}
