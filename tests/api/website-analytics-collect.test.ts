import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handler from '../../api/analytics/collect.js';

const { createSecretSupabaseClient, rpc, publicSummary } = vi.hoisted(() => ({
  createSecretSupabaseClient: vi.fn(),
  rpc: vi.fn(),
  publicSummary: vi.fn(),
}));

vi.mock('../../api/_lib/supabase.js', () => ({ createSecretSupabaseClient }));
vi.mock('../../api/_lib/website-visit-totals.js', () => ({ default: publicSummary }));

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

const validVital = {
  ...validEvent,
  eventType: 'web_vital',
  metricName: 'LCP',
  metricValue: 2300,
  metricRating: 'good',
  navigationType: 'navigate',
  effectiveConnectionType: '4g',
};
delete (validVital as Partial<typeof validEvent>).engagedSeconds;

describe('website analytics collection API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    publicSummary.mockImplementation(async (_request, response) => response.status(200).json({ publicSummary: true }));
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

  it('records only bounded Core Web Vitals through the dedicated aggregate source', async () => {
    const { response, result } = responseHarness();
    await handler({
      method: 'POST',
      headers: {
        origin: 'https://www.rganjunior.org',
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-for': '203.0.113.24',
      },
      body: validVital,
    } as never, response);

    expect(result()).toEqual({ statusCode: 202, body: { ok: true } });
    expect(rpc).toHaveBeenNthCalledWith(2, 'record_website_analytics_web_vital_server', {
      target_session_id: validVital.sessionId,
      target_view_id: validVital.viewId,
      target_path: '/about',
      target_metric_name: 'LCP',
      target_metric_value: 2300,
      target_rating: 'good',
      target_navigation_type: 'navigate',
      target_effective_connection_type: '4g',
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('203.0.113.24');
  });

  it('ignores obvious automated clients without writing an event', async () => {
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: { 'user-agent': 'Googlebot/2.1' }, body: validEvent } as never, response);
    expect(result()).toEqual({ statusCode: 202, body: { ok: true, ignored: true } });
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
  });

  it.each(['GET', 'POST'])('delegates summary %s requests to the read-only handler without collecting an event', async (method) => {
    const request = { method, query: { summary: 'website-visits' }, headers: {}, body: validEvent };
    const { response, result } = responseHarness();
    await handler(request as never, response);
    expect(publicSummary).toHaveBeenCalledExactlyOnceWith(request, response);
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
    expect(result()).toEqual({ statusCode: 200, body: { publicSummary: true } });
  });

  it('still rejects GET requests to the collection endpoint', async () => {
    const { response, result } = responseHarness();
    await handler({ method: 'GET', headers: {} } as never, response);
    expect(result()).toEqual({ statusCode: 405, body: { ok: false, code: 'METHOD_NOT_ALLOWED' } });
    expect(publicSummary).not.toHaveBeenCalled();
    expect(createSecretSupabaseClient).not.toHaveBeenCalled();
  });
});
