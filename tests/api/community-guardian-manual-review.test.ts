import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiAuthError } from '../../api/_lib/auth.js';
import { encryptSensitive } from '../../api/_lib/community-security.js';
import handler from '../../api/community/guardian-manual-review.js';

const { createSecretSupabaseClient, requirePermission, rpc } = vi.hoisted(() => ({
  createSecretSupabaseClient: vi.fn(),
  requirePermission: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../../api/_lib/auth.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../api/_lib/auth.js')>(),
  requirePermission,
}));

vi.mock('../../api/_lib/supabase.js', () => ({
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

describe('guardian-manual-review API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GUARDIAN_DATA_ENCRYPTION_KEY', Buffer.alloc(32, 4).toString('base64'));
    requirePermission.mockResolvedValue({ user: { id: 'reviewer-user' } });
    createSecretSupabaseClient.mockReturnValue({ rpc });
  });

  afterEach(() => vi.unstubAllEnvs());

  it('returns only a decrypted, permission-checked staff projection', async () => {
    const ciphertext = encryptSensitive('guardian@example.test');
    rpc.mockResolvedValue({
      data: [{
        request_id: 'request-31',
        request_status: 'pending',
        guardian_name: '监护人甲',
        guardian_relationship: '母亲',
        contact_channel: 'email',
        contact_ciphertext: ciphertext,
        contact_last4: 'test',
        legal_document_id: 8,
        document_key: 'guardian-community-consent',
        document_version: 2,
        document_locale: 'zh-CN',
        document_title: '监护人知情确认',
        document_status: 'active',
        document_effective_at: '2026-08-09T00:00:00.000Z',
        request_created_at: '2026-08-09T00:00:00.000Z',
        consented_at: null,
        verification_method: null,
        verification_basis: null,
        reviewer_note: null,
      }],
      error: null,
    });
    const { response, result } = responseHarness();

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      body: { action: 'read', applicationId: 31 },
    } as never, response);

    const output = result();
    expect(output.statusCode).toBe(200);
    expect(output.body).toMatchObject({
      ok: true,
      review: {
        contact: 'guardian@example.test',
        guardianName: '监护人甲',
        legalDocument: { id: 8, status: 'active', version: 2 },
      },
    });
    expect(JSON.stringify(output.body)).not.toContain(ciphertext);
    expect(rpc).toHaveBeenCalledWith('get_manual_guardian_review_server', {
      target_application_id: 31,
      target_actor_user_id: 'reviewer-user',
    });
  });

  it('returns permission denial before accessing the service-role client', async () => {
    requirePermission.mockRejectedValue(new ApiAuthError(403, 'PERMISSION_DENIED', 'denied'));
    const { response, result } = responseHarness();

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      body: { action: 'read', applicationId: 31 },
    } as never, response);

    expect(result()).toEqual({
      statusCode: 403,
      body: { ok: false, code: 'PERMISSION_DENIED' },
    });
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
  });

  it('rejects incomplete affirmations without writing confirmation', async () => {
    const { response, result } = responseHarness();

    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      body: {
        action: 'confirm',
        applicationId: 31,
        verificationMethod: 'manual_phone',
        confirmedAt: new Date().toISOString(),
        affirmedGuardianship: true,
        affirmedNoticeRead: true,
        affirmedJoining: false,
        verificationBasis: '电话联系监护人。',
      },
    } as never, response);

    expect(result()).toEqual({
      statusCode: 400,
      body: { ok: false, code: 'INVALID_MANUAL_CONFIRMATION' },
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});
