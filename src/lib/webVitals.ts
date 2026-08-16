import type {
  AnalyticsConnectionType,
  AnalyticsNavigationType,
  WebVitalName,
  WebVitalRating,
} from './websiteAnalytics';

export type ObservedWebVital = {
  name: WebVitalName;
  value: number;
  rating: WebVitalRating;
  navigationType: AnalyticsNavigationType;
  effectiveConnectionType: AnalyticsConnectionType;
};

type LayoutShiftEntry = PerformanceEntry & {
  value: number;
  hadRecentInput: boolean;
};

type EventTimingEntry = PerformanceEntry & {
  duration: number;
  interactionId?: number;
};

const thresholds: Record<WebVitalName, readonly [number, number]> = {
  LCP: [2500, 4000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export function rateWebVital(name: WebVitalName, value: number): WebVitalRating {
  const [good, poor] = thresholds[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

export function analyticsNavigationType(value: string | undefined): AnalyticsNavigationType {
  if (value === 'navigate' || value === 'reload' || value === 'back_forward' || value === 'prerender') return value;
  return 'other';
}

export function analyticsConnectionType(): AnalyticsConnectionType {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const value = connection?.effectiveType;
  if (value === 'slow-2g' || value === '2g' || value === '3g' || value === '4g') return value;
  return 'unknown';
}

export function observeWebVitals(report: (metric: ObservedWebVital) => void) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const navigationType = analyticsNavigationType(navigation?.type);
  const effectiveConnectionType = analyticsConnectionType();
  const observers: PerformanceObserver[] = [];
  const reported = new Set<WebVitalName>();
  let largestContentfulPaint = 0;
  let cumulativeLayoutShift = 0;
  let interactionToNextPaint = 0;
  let finalMetricsFlushed = false;

  const emit = (name: WebVitalName, value: number) => {
    if (reported.has(name) || !Number.isFinite(value) || value < 0) return;
    reported.add(name);
    report({
      name,
      value: name === 'CLS' ? Number(value.toFixed(4)) : Math.round(value),
      rating: rateWebVital(name, value),
      navigationType,
      effectiveConnectionType,
    });
  };

  const observe = (type: string, callback: PerformanceObserverCallback) => {
    if (typeof PerformanceObserver === 'undefined') return false;
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ type, buffered: true });
      observers.push(observer);
      return true;
    } catch {
      return false;
    }
  };

  if (navigation) {
    const activationStart = (navigation as PerformanceNavigationTiming & { activationStart?: number }).activationStart ?? 0;
    emit('TTFB', Math.max(0, navigation.responseStart - activationStart));
  }

  const existingFcp = performance.getEntriesByName('first-contentful-paint')[0];
  if (existingFcp) emit('FCP', existingFcp.startTime);
  else observe('paint', (list) => {
    const fcp = list.getEntries().find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) emit('FCP', fcp.startTime);
  });

  observe('largest-contentful-paint', (list) => {
    const entry = list.getEntries().at(-1);
    if (entry) largestContentfulPaint = Math.max(largestContentfulPaint, entry.startTime);
  });

  const clsSupported = observe('layout-shift', (list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
    }
  });

  observe('event', (list) => {
    for (const entry of list.getEntries() as EventTimingEntry[]) {
      if ((entry.interactionId ?? 0) > 0) interactionToNextPaint = Math.max(interactionToNextPaint, entry.duration);
    }
  });

  const flushFinalMetrics = () => {
    if (finalMetricsFlushed) return;
    finalMetricsFlushed = true;
    if (largestContentfulPaint > 0) emit('LCP', largestContentfulPaint);
    if (clsSupported) emit('CLS', cumulativeLayoutShift);
    if (interactionToNextPaint > 0) emit('INP', interactionToNextPaint);
    observers.forEach((observer) => observer.disconnect());
  };

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') flushFinalMetrics();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', flushFinalMetrics);

  return () => {
    flushFinalMetrics();
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', flushFinalMetrics);
  };
}
