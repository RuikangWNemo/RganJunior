import { describe, expect, it } from 'vitest';

import { AuthEmailConfigurationError, readAuthEmailConfig } from './config.js';

const baseEnvironment = {
  AUTH_EMAIL_FROM: '阿柑少年 <no-reply@auth.rganjunior.org>',
  COMMUNITY_PUBLIC_URL: 'https://www.rganjunior.org',
  RESEND_API_KEY: 're_test',
  SUPABASE_SEND_EMAIL_HOOK_SECRET: 'v1,whsec_test',
  SUPABASE_URL: 'https://project-ref.supabase.co',
};

describe('auth email environment configuration', () => {
  it('reads only server-side production configuration', () => {
    expect(readAuthEmailConfig({ ...baseEnvironment, VERCEL_ENV: 'production' })).toEqual({
      canonicalSiteUrl: 'https://www.rganjunior.org',
      from: baseEnvironment.AUTH_EMAIL_FROM,
      hookSecret: baseEnvironment.SUPABASE_SEND_EMAIL_HOOK_SECRET,
      previewOrigins: [],
      production: true,
      resendApiKey: baseEnvironment.RESEND_API_KEY,
      supabaseUrl: 'https://project-ref.supabase.co',
    });
  });

  it('allows an explicit Vercel preview origin only outside production', () => {
    const result = readAuthEmailConfig({
      ...baseEnvironment,
      VERCEL_ENV: 'preview',
      VERCEL_URL: 'rgan-preview.vercel.app',
    });
    expect(result.production).toBe(false);
    expect(result.previewOrigins).toEqual(['https://rgan-preview.vercel.app']);
  });

  it('fails closed when a secret is missing', () => {
    expect(() => readAuthEmailConfig({
      ...baseEnvironment,
      RESEND_API_KEY: '',
    })).toThrow(AuthEmailConfigurationError);
  });
});
