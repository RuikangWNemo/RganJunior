import { getSupabaseClient } from '@/lib/supabase/client';
import { BackendServiceError } from '@/lib/supabase/errors';
import {
  WEBSITE_ANALYTICS_ENDPOINT,
  analyticsDashboardSchema,
  type AnalyticsDashboard,
  type AnalyticsRange,
  type AnalyticsSettings,
  type WebsiteAnalyticsEvent,
} from '@/lib/websiteAnalytics';

export async function sendWebsiteAnalyticsEvent(event: WebsiteAnalyticsEvent) {
  const response = await fetch(WEBSITE_ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    keepalive: true,
  });
  if (!response.ok) throw new Error('WEBSITE_ANALYTICS_COLLECTION_FAILED');
}

export function beaconWebsiteAnalyticsEvent(event: WebsiteAnalyticsEvent) {
  if (typeof navigator.sendBeacon !== 'function') return false;
  return navigator.sendBeacon(
    WEBSITE_ANALYTICS_ENDPOINT,
    new Blob([JSON.stringify(event)], { type: 'application/json' }),
  );
}

async function adminAnalyticsRequest<T>(body: Record<string, unknown>): Promise<T> {
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');
  const response = await fetch('/api/community/website-analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json() as T & { code?: string };
  if (!response.ok) {
    throw new BackendServiceError(
      result.code || 'WEBSITE_ANALYTICS_REQUEST_FAILED',
      'Website analytics request failed.',
      response.status,
    );
  }
  return result;
}

export async function getWebsiteAnalyticsDashboard(range: AnalyticsRange): Promise<AnalyticsDashboard> {
  const result = await adminAnalyticsRequest<{ ok: true; dashboard: unknown }>({
    action: 'dashboard',
    range,
  });
  const parsed = analyticsDashboardSchema.safeParse(result.dashboard);
  if (!parsed.success) throw new Error('WEBSITE_ANALYTICS_INVALID_RESPONSE');
  return parsed.data;
}

export async function setWebsiteAnalyticsReportingStartDate(reportingStartDate: string): Promise<AnalyticsSettings> {
  const result = await adminAnalyticsRequest<{ ok: true; settings: unknown }>({
    action: 'settings',
    reportingStartDate,
  });
  const parsed = analyticsDashboardSchema.shape.settings.safeParse(result.settings);
  if (!parsed.success) throw new Error('WEBSITE_ANALYTICS_INVALID_RESPONSE');
  return parsed.data;
}
