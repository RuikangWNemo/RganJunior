import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSupabaseClient } from '@/lib/supabase/client';
import {
  getWebsiteAnalyticsDashboard,
  setWebsiteAnalyticsReportingStartDate,
} from './index';
import { sendWebsiteAnalyticsEvent } from './public';

vi.mock('@/lib/supabase/client', () => ({ getSupabaseClient: vi.fn() }));

const dashboard = {
  generatedAt: '2026-08-10T02:00:00.000Z',
  range: '7d',
  settings: {
    reportingStartDate: '2026-08-10',
    collectionStartedAt: '2026-08-10T00:00:00.000Z',
    earliestAvailableAt: null,
    updatedAt: '2026-08-10T00:00:00.000Z',
    canManage: true,
  },
  summary: { activeNow: 1, viewsToday: 4, sessionsToday: 2, averageEngagedSecondsToday: 35 },
  trend: [],
  popularPages: [],
  sources: [],
  recentActivity: [],
  webVitals: [],
};

describe('website analytics service', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }) },
    } as never);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('sends anonymous page events without authorization data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await sendWebsiteAnalyticsEvent({
      eventType: 'page_view',
      sessionId: 'e2000000-0000-4000-8000-000000000001',
      viewId: 'e3000000-0000-4000-8000-000000000001',
      path: '/about',
      sourceCategory: 'direct',
      referrerHost: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      deviceCategory: 'desktop',
      language: 'zh',
      engagedSeconds: 0,
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/analytics/collect', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }));
  });

  it('authenticates aggregate reads and validates the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ ok: true, dashboard }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(getWebsiteAnalyticsDashboard('7d')).resolves.toEqual(dashboard);
    expect(fetchMock).toHaveBeenCalledWith('/api/community/website-analytics', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      body: JSON.stringify({ action: 'dashboard', range: '7d' }),
    }));
  });

  it('sends reporting-date changes through the protected settings action', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ ok: true, settings: dashboard.settings }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(setWebsiteAnalyticsReportingStartDate('2026-08-01')).resolves.toEqual(dashboard.settings);
    expect(fetchMock).toHaveBeenCalledWith('/api/community/website-analytics', expect.objectContaining({
      body: JSON.stringify({ action: 'settings', reportingStartDate: '2026-08-01' }),
    }));
  });
});
