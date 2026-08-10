import { describe, expect, it } from 'vitest';

import { readAuthCallbackError } from './authCallback';

describe('readAuthCallbackError', () => {
  it('reads a Supabase error from the query string', () => {
    expect(readAuthCallbackError(
      '?error=access_denied&error_description=Email+link+is+invalid+or+expired',
      '',
    )).toBe('Email link is invalid or expired');
  });

  it('reads an implicit-flow error from the URL fragment', () => {
    expect(readAuthCallbackError(
      '',
      '#error=access_denied&error_description=OTP+expired',
    )).toBe('OTP expired');
  });

  it('returns null when the callback URL contains no error', () => {
    expect(readAuthCallbackError('?code=auth-code', '')).toBeNull();
  });
});
