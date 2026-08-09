import { describe, expect, it } from 'vitest';

import {
  AuthEmailPayloadError,
  parseAuthEmailPayload,
  selectAuthEmailLocale,
} from './schema.js';

function payload(action = 'signup') {
  return {
    user: {
      id: 'user-1',
      email: 'person@example.com',
      new_email: 'next@example.com',
      app_metadata: {},
      user_metadata: {},
    },
    email_data: {
      token: '123456',
      token_hash: 'hash-current',
      redirect_to: 'https://www.rganjunior.org/community/auth/callback',
      email_action_type: action,
      site_url: 'https://www.rganjunior.org',
      token_new: '654321',
      token_hash_new: 'hash-new',
      old_email: 'old@example.com',
      old_phone: '',
      provider: '',
      factor_type: '',
    },
  };
}

describe('Auth email payload schema', () => {
  it('parses a supported action while preserving future unrelated fields', () => {
    const input = { ...payload(), future_field: { supported_later: true } };
    expect(parseAuthEmailPayload(input).email_data.email_action_type).toBe('signup');
  });

  it('rejects an unknown action instead of guessing a template', () => {
    expect(() => parseAuthEmailPayload(payload('future_admin_alert'))).toThrow(AuthEmailPayloadError);
  });

  it('rejects a malformed recipient', () => {
    const input = payload();
    input.user.email = 'not-an-email';
    expect(() => parseAuthEmailPayload(input)).toThrow(AuthEmailPayloadError);
  });
});

describe('Auth email locale selection', () => {
  it('prefers server-controlled app metadata', () => {
    expect(selectAuthEmailLocale({ locale: 'en-US' }, { locale: 'zh-CN' })).toBe('en');
  });

  it('uses user metadata only as a presentation preference', () => {
    expect(selectAuthEmailLocale({}, { locale: 'en' })).toBe('en');
  });

  it('defaults unsupported values to Simplified Chinese', () => {
    expect(selectAuthEmailLocale({}, { locale: 'fr-FR' })).toBe('zh-CN');
  });
});
