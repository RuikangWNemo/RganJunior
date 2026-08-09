import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handler from './guardian-consent-request.js';

const {
  assertGuardianInviteProviderConfigured,
  consumeRateLimit,
  createSecretSupabaseClient,
  requireUser,
  sendGuardianInvite,
} = vi.hoisted(() => ({
  assertGuardianInviteProviderConfigured: vi.fn(),
  consumeRateLimit: vi.fn(),
  createSecretSupabaseClient: vi.fn(),
  requireUser: vi.fn(),
  sendGuardianInvite: vi.fn(),
}));

vi.mock('../_lib/auth.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../_lib/auth.js')>(),
  requireUser,
}));

vi.mock('../_lib/community-security.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../_lib/community-security.js')>(),
  consumeRateLimit,
}));

vi.mock('../_lib/guardian-otp-provider.js', () => ({
  assertGuardianInviteProviderConfigured,
  sendGuardianInvite,
}));

vi.mock('../_lib/supabase.js', () => ({
  createSecretSupabaseClient,
}));

function responseHarness() {
  let statusCode = 0;
  let body: unknown;
  const response = {
    setHeader: vi.fn(),
    status(code: number) { statusCode = code; return response; },
    json(value: unknown) { body = value; return value; },
  };
  return { response, result: () => ({ statusCode, body }) };
}

describe('guardian-consent-request manual mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GUARDIAN_FLOW_MODE', 'manual');
    vi.stubEnv('GUARDIAN_HASH_SECRET', 'test-hash-secret-with-enough-entropy');
    vi.stubEnv('GUARDIAN_DATA_ENCRYPTION_KEY', Buffer.alloc(32, 9).toString('base64'));
    consumeRateLimit.mockResolvedValue({ allowed: true, remaining_attempts: 4, retry_after_seconds: 0 });

    const userRpc = vi.fn().mockResolvedValue({
      data: [{ age_band: 'under_14' }],
      error: null,
    });
    requireUser.mockResolvedValue({
      user: { id: 'under-14-user' },
      supabase: { rpc: userRpc },
    });

    const legalQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 8 }, error: null }),
    };
    Object.values(legalQuery).forEach((method) => {
      if (method !== legalQuery.maybeSingle) method.mockReturnValue(legalQuery);
    });
    createSecretSupabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue(legalQuery),
      rpc: vi.fn().mockResolvedValue({ data: 'request-31', error: null }),
    });
  });

  afterEach(() => vi.unstubAllEnvs());

  it('stores an encrypted contact without requiring or calling delivery webhooks', async () => {
    const { response, result } = responseHarness();
    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      body: {
        applicationId: 31,
        guardianName: '监护人甲',
        relationship: '母亲',
        contactChannel: 'phone',
        contact: '+8613800001234',
        language: 'zh',
      },
    } as never, response);

    expect(result()).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        requestId: 'request-31',
        mode: 'manual',
        delivery: 'staff_follow_up',
      },
    });
    expect(assertGuardianInviteProviderConfigured).not.toHaveBeenCalled();
    expect(sendGuardianInvite).not.toHaveBeenCalled();
    const secretClient = createSecretSupabaseClient.mock.results[0]?.value;
    expect(secretClient.rpc).toHaveBeenCalledWith(
      'create_guardian_consent_request_server',
      expect.objectContaining({
        target_application_id: 31,
        target_minor_user_id: 'under-14-user',
        target_contact_channel: 'phone',
        target_contact_last4: '1234',
      }),
    );
    expect(secretClient.rpc.mock.calls[0][1].target_contact_ciphertext).not.toContain(
      '+8613800001234',
    );
  });
});
