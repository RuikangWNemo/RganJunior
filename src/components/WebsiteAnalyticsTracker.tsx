import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useLanguage } from '@/contexts/LanguageContext';
import {
  WEBSITE_ANALYTICS_ACQUISITION_KEY,
  WEBSITE_ANALYTICS_SESSION_KEY,
  analyticsDeviceCategory,
  analyticsLanguage,
  analyticsSourceCategory,
  buildAnalyticsAcquisition,
  normalizeAnalyticsPath,
  sanitizeAnalyticsDimension,
  type AnalyticsAcquisition,
  type WebsiteAnalyticsEvent,
} from '@/lib/websiteAnalytics';
import {
  beaconWebsiteAnalyticsEvent,
  sendWebsiteAnalyticsEvent,
} from '@/services/website-analytics';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function anonymousSessionId() {
  try {
    const existing = window.sessionStorage.getItem(WEBSITE_ANALYTICS_SESSION_KEY);
    if (existing && UUID_PATTERN.test(existing)) return existing;
    const created = window.crypto.randomUUID();
    window.sessionStorage.setItem(WEBSITE_ANALYTICS_SESSION_KEY, created);
    return created;
  } catch {
    return window.crypto.randomUUID();
  }
}

function storedAcquisition(search: string): AnalyticsAcquisition {
  try {
    const stored = window.sessionStorage.getItem(WEBSITE_ANALYTICS_ACQUISITION_KEY);
    if (stored) {
      const value = JSON.parse(stored) as Partial<AnalyticsAcquisition>;
      const acquisition = {
        referrerHost: sanitizeAnalyticsDimension(value.referrerHost, 253),
        utmSource: sanitizeAnalyticsDimension(value.utmSource, 80),
        utmMedium: sanitizeAnalyticsDimension(value.utmMedium, 80),
        utmCampaign: sanitizeAnalyticsDimension(value.utmCampaign, 120),
      };
      return { ...acquisition, sourceCategory: analyticsSourceCategory(acquisition) };
    }
  } catch {
    // Treat inaccessible or malformed storage as a fresh anonymous session.
  }
  const acquisition = buildAnalyticsAcquisition({
    search,
    referrer: document.referrer,
    currentHost: window.location.host,
  });
  try {
    window.sessionStorage.setItem(WEBSITE_ANALYTICS_ACQUISITION_KEY, JSON.stringify(acquisition));
  } catch {
    // Analytics remains best effort when storage is unavailable.
  }
  return acquisition;
}

export default function WebsiteAnalyticsTracker() {
  const location = useLocation();
  const { lang } = useLanguage();
  const languageRef = useRef(lang);
  languageRef.current = lang;

  useEffect(() => {
    const path = normalizeAnalyticsPath(location.pathname);
    if (!path) return undefined;

    const sessionId = anonymousSessionId();
    const viewId = window.crypto.randomUUID();
    const acquisition = storedAcquisition(location.search);
    const shared = {
      sessionId,
      viewId,
      path,
      ...acquisition,
      deviceCategory: analyticsDeviceCategory(window.navigator.userAgent),
      language: analyticsLanguage(languageRef.current),
    } satisfies Omit<WebsiteAnalyticsEvent, 'eventType' | 'engagedSeconds'>;

    void sendWebsiteAnalyticsEvent({
      ...shared,
      eventType: 'page_view',
      engagedSeconds: 0,
    }).catch(() => undefined);

    let active = document.visibilityState === 'visible' && document.hasFocus();
    let lastMark = window.performance.now();

    const flush = (useBeacon: boolean) => {
      if (!active) return;
      const now = window.performance.now();
      const engagedSeconds = Math.min(30, Math.floor((now - lastMark) / 1000));
      lastMark = now;
      if (engagedSeconds < 1) return;
      const event: WebsiteAnalyticsEvent = {
        ...shared,
        eventType: 'engagement',
        engagedSeconds,
      };
      if (useBeacon && beaconWebsiteAnalyticsEvent(event)) return;
      void sendWebsiteAnalyticsEvent(event).catch(() => undefined);
    };

    const pause = () => {
      flush(true);
      active = false;
    };
    const resume = () => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      active = true;
      lastMark = window.performance.now();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resume();
      else pause();
    };

    const intervalId = window.setInterval(() => flush(false), 15_000);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', resume);
    window.addEventListener('blur', pause);
    window.addEventListener('pagehide', pause);

    return () => {
      window.clearInterval(intervalId);
      flush(true);
      active = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', resume);
      window.removeEventListener('blur', pause);
      window.removeEventListener('pagehide', pause);
    };
  }, [location.pathname, location.search]);

  return null;
}
