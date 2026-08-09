import { describe, expect, it } from 'vitest';

import { buildConfirmationUrl, sanitizeAuthRedirect } from './urls.js';

const productionRuntime = {
  canonicalSiteUrl: 'https://www.rganjunior.org',
  supabaseUrl: 'https://project-ref.supabase.co',
  production: true,
};

describe('Auth email redirect allowlist', () => {
  it('allows the canonical www domain', () => {
    expect(sanitizeAuthRedirect(
      'https://www.rganjunior.org/community/auth/callback',
      productionRuntime,
    )).toBe('https://www.rganjunior.org/community/auth/callback');
  });

  it('allows the production root domain', () => {
    expect(sanitizeAuthRedirect(
      'https://rganjunior.org/community/auth/callback',
      productionRuntime,
    )).toBe('https://rganjunior.org/community/auth/callback');
  });

  it('falls back for a third-party origin', () => {
    expect(sanitizeAuthRedirect('https://evil.example/steal', productionRuntime))
      .toBe('https://www.rganjunior.org');
  });

  it('falls back for javascript URLs', () => {
    expect(sanitizeAuthRedirect('javascript:alert(1)', productionRuntime))
      .toBe('https://www.rganjunior.org');
  });

  it('does not allow Vercel preview domains in production', () => {
    expect(sanitizeAuthRedirect('https://rgan-preview.vercel.app/callback', productionRuntime))
      .toBe('https://www.rganjunior.org');
  });
});

describe('Supabase confirmation URL construction', () => {
  it('uses the token hash and a sanitized redirect', () => {
    const url = new URL(buildConfirmationUrl({
      action: 'signup',
      redirectTo: 'https://evil.example/steal',
      tokenHash: 'safe-token-hash',
    }, productionRuntime));

    expect(url.origin).toBe('https://project-ref.supabase.co');
    expect(url.pathname).toBe('/auth/v1/verify');
    expect(url.searchParams.get('token')).toBe('safe-token-hash');
    expect(url.searchParams.get('type')).toBe('signup');
    expect(url.searchParams.get('redirect_to')).toBe('https://www.rganjunior.org');
  });
});
