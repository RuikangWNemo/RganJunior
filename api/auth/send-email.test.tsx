import { afterEach, describe, expect, it, vi } from 'vitest';

import handler from './send-email.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Vercel auth email function adapter', () => {
  it('ignores the runtime context passed as the second fetch argument', async () => {
    vi.stubEnv('AUTH_EMAIL_FROM', '阿柑少年 <no-reply@auth.rganjunior.org>');
    vi.stubEnv('COMMUNITY_PUBLIC_URL', 'https://www.rganjunior.org');
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('SUPABASE_SEND_EMAIL_HOOK_SECRET', 'v1,whsec_dGVzdA==');
    vi.stubEnv('SUPABASE_URL', 'https://project-ref.supabase.co');
    vi.stubEnv('VERCEL_ENV', 'production');

    const runtimeFetch = handler.fetch as (
      request: Request,
      context: unknown,
    ) => Promise<Response>;
    const response = await runtimeFetch(
      new Request('https://www.rganjunior.org/api/auth/send-email', {
        body: '{}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
      { waitUntil() {} },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        http_code: 401,
        message: 'Invalid webhook signature.',
      },
    });
  });
});
