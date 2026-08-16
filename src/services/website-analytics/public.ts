import {
  WEBSITE_ANALYTICS_ENDPOINT,
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
