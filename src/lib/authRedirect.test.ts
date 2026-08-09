import { describe, expect, it } from 'vitest';

import { buildAuthRedirectUrl } from './authRedirect';

describe('buildAuthRedirectUrl', () => {
  it('always uses the canonical site in production', () => {
    expect(buildAuthRedirectUrl('/community/auth/callback', {
      isProduction: true,
      browserOrigin: 'http://localhost:5173',
    })).toBe('https://www.rganjunior.org/community/auth/callback');
  });

  it('keeps the current browser origin during local development', () => {
    expect(buildAuthRedirectUrl('/community/reset-password', {
      isProduction: false,
      browserOrigin: 'http://127.0.0.1:5173',
    })).toBe('http://127.0.0.1:5173/community/reset-password');
  });

  it('normalizes a relative path against the selected origin', () => {
    expect(buildAuthRedirectUrl('community/auth/callback', {
      isProduction: true,
      browserOrigin: 'https://preview.example.com',
    })).toBe('https://www.rganjunior.org/community/auth/callback');
  });
});
