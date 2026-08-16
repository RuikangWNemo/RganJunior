/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const publicAnalyticsSource = readFileSync(
  resolve(process.cwd(), 'src/services/website-analytics/public.ts'),
  'utf8',
);
const vercelConfig = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

describe('cold-load boundaries', () => {
  it('keeps non-home routes and the complete Community surface behind dynamic imports', () => {
    expect(appSource).toContain("const About = lazy(() => import('./pages/About'))");
    expect(appSource).toContain("const CommunityRoutes = lazy(() => import('./pages/community/CommunityRoutes'))");
    expect(appSource).not.toContain("from '@/contexts/AuthContext'");
    expect(appSource).not.toContain("from '@/components/community/CommunityShell'");
  });

  it('keeps the public analytics sender independent from Supabase and administrator services', () => {
    expect(publicAnalyticsSource).not.toContain('supabase');
    expect(publicAnalyticsSource).not.toContain('/api/community/');
  });

  it('uses immutable caching only for hashed build assets and versioned fonts', () => {
    const headers = vercelConfig.headers ?? [];
    const cacheValue = (source: string) => headers
      .find((entry) => entry.source === source)
      ?.headers.find((header) => header.key.toLowerCase() === 'cache-control')
      ?.value;

    expect(cacheValue('/assets/(.*)')).toBe('public, max-age=31536000, immutable');
    expect(cacheValue('/fonts/(.*)')).toBe('public, max-age=31536000, immutable');
    expect(cacheValue('/images/(.*)')).toContain('stale-while-revalidate=2592000');
    expect(headers.some((entry) => entry.source.includes('index.html'))).toBe(false);
    expect(headers.some((entry) => entry.source === '/(.*)')).toBe(false);
  });
});
