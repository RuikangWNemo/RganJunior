import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handler from '../../api/analytics/collect.js';

const { createSecretSupabaseClient, rpc } = vi.hoisted(() => ({
  createSecretSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../../api/_lib/supabase.js', () => ({ createSecretSupabaseClient }));

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

const validEvent = {
  eventType: 'page_view',
  sessionId: 'e2000000-0000-4000-8000-000000000001',
  viewId: 'e3000000-0000-4000-8000-000000000001',
  path: '/about',
  sourceCategory: 'search',
  referrerHost: 'www.baidu.com',
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  deviceCategory: 'mobile',
  language: 'zh',
  engagedSeconds: 0,
};

describe('website analytics collection API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('COMMUNITY_PUBLIC_URL', 'https://www.rganjunior.org');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'server-secret');
    createSecretSupabaseClient.mockReturnValue({ rpc });
    rpc
      .mockResolvedValueOnce({ data: [{ allowed: true, retry_after_seconds: 0 }], error: null })
      .mockResolvedValueOnce({ data: true, error: null });
  });

  afterEach(() => vi.unstubAllEnvs());

  it('rate-limits with an irreversible key and records a validated anonymous event', async () => {
    const { response, result } = responseHarness();
    await handler({
      method: 'POST',
      headers: {
        origin: 'https://www.rganjunior.org',
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-for': '203.0.113.24',
      },
      body: validEvent,
    } as never, response);
    expect(result()).toEqual({ statusCode: 202, body: { ok: true } });
    expect(rpc).toHaveBeenNthCalledWith(1, 'consume_api_rate_limit_server', expect.objectContaining({
      target_key_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
    }));
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('203.0.113.24');
    expect(rpc).toHaveBeenNthCalledWith(2, 'record_website_analytics_event_server', expect.objectContaining({
      target_path: '/about',
      target_referrer_host: 'www.baidu.com',
    }));
  });

  it('rejects Community paths before opening the secret client', async () => {
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: {}, body: { ...validEvent, path: '/community/settings' } } as never, response);
    expect(result()).toEqual({ statusCode: 400, body: { ok: false, code: 'INVALID_WEBSITE_ANALYTICS_EVENT' } });
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
  });

  it('ignores obvious automated clients without writing an event', async () => {
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: { 'user-agent': 'Googlebot/2.1' }, body: validEvent } as never, response);
    expect(result()).toEqual({ statusCode: 202, body: { ok: true, ignored: true } });
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
  });
});
