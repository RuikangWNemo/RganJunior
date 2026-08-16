import { z } from 'zod';

export const WEBSITE_ANALYTICS_ENDPOINT = '/api/analytics/collect';
export const WEBSITE_ANALYTICS_SESSION_KEY = 'rgan.website-analytics.session.v1';
export const WEBSITE_ANALYTICS_ACQUISITION_KEY = 'rgan.website-analytics.acquisition.v1';

export const analyticsRanges = ['24h', '7d', '30d', '90d'] as const;
export type AnalyticsRange = (typeof analyticsRanges)[number];
export type AnalyticsSourceCategory = 'direct' | 'search' | 'social' | 'referral' | 'campaign';
export type AnalyticsDeviceCategory = 'desktop' | 'tablet' | 'mobile' | 'unknown';
export type AnalyticsLanguage = 'zh' | 'en' | 'other';
export const webVitalNames = ['LCP', 'CLS', 'INP', 'FCP', 'TTFB'] as const;
export type WebVitalName = (typeof webVitalNames)[number];
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';
export type AnalyticsNavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'other';
export type AnalyticsConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

const searchHosts = [
  'baidu.com',
  'bing.com',
  'duckduckgo.com',
  'google.com',
  'google.com.hk',
  'sogou.com',
  'so.com',
  'yahoo.com',
  'yandex.com',
];

const socialHosts = [
  'bilibili.com',
  'douyin.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'weibo.com',
  'wechat.com',
  'x.com',
  'xiaohongshu.com',
  'twitter.com',
];

function hostMatches(host: string, candidates: string[]) {
  return candidates.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
}

export function normalizeAnalyticsPath(value: string): string | null {
  const trimmed = value.trim();
  const containsControlCharacter = Array.from(trimmed).some((character) => character.charCodeAt(0) < 32);
  if (!trimmed.startsWith('/') || trimmed.length > 300 || containsControlCharacter || trimmed.includes('\\')) return null;
  const withoutQuery = trimmed.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/');
  const normalized = withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery;
  if (!normalized || /^\/community(?:\/|$)/i.test(normalized)) return null;
  return normalized;
}

export function sanitizeAnalyticsDimension(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  const compact = value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return compact || null;
}

export function analyticsReferrerHost(referrer: string, currentHost: string): string | null {
  if (!referrer) return null;
  try {
    const hostname = new URL(referrer).hostname.toLowerCase().replace(/\.$/, '');
    const ownHost = currentHost.toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
    if (!hostname || hostname === ownHost) return null;
    return hostname.slice(0, 253);
  } catch {
    return null;
  }
}

export function analyticsSourceCategory(input: {
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}): AnalyticsSourceCategory {
  if (input.utmSource || input.utmMedium || input.utmCampaign) return 'campaign';
  if (!input.referrerHost) return 'direct';
  if (hostMatches(input.referrerHost, searchHosts)) return 'search';
  if (hostMatches(input.referrerHost, socialHosts)) return 'social';
  return 'referral';
}

export type AnalyticsAcquisition = {
  sourceCategory: AnalyticsSourceCategory;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export function buildAnalyticsAcquisition(input: {
  search: string;
  referrer: string;
  currentHost: string;
}): AnalyticsAcquisition {
  const search = new URLSearchParams(input.search);
  const acquisition = {
    referrerHost: analyticsReferrerHost(input.referrer, input.currentHost),
    utmSource: sanitizeAnalyticsDimension(search.get('utm_source'), 80),
    utmMedium: sanitizeAnalyticsDimension(search.get('utm_medium'), 80),
    utmCampaign: sanitizeAnalyticsDimension(search.get('utm_campaign'), 120),
  };
  return {
    ...acquisition,
    sourceCategory: analyticsSourceCategory(acquisition),
  };
}

export function analyticsDeviceCategory(userAgent: string): AnalyticsDeviceCategory {
  const value = userAgent.toLowerCase();
  if (!value) return 'unknown';
  if (/ipad|tablet|kindle|silk/.test(value)) return 'tablet';
  if (/mobi|iphone|ipod|android/.test(value)) return 'mobile';
  return 'desktop';
}

export function analyticsLanguage(value: string): AnalyticsLanguage {
  const language = value.toLowerCase();
  if (language.startsWith('zh')) return 'zh';
  if (language.startsWith('en')) return 'en';
  return 'other';
}

export function isAnalyticsBot(userAgent: string) {
  return /bot|crawler|spider|headless|lighthouse|pagespeed|preview|slurp/i.test(userAgent);
}

const nullableShortText = (maxLength: number) => z.string().trim().min(1).max(maxLength).nullable();

const websiteAnalyticsEventBaseSchema = z.object({
  sessionId: z.string().uuid(),
  viewId: z.string().uuid(),
  path: z.string().min(1).max(300),
  sourceCategory: z.enum(['direct', 'search', 'social', 'referral', 'campaign']),
  referrerHost: z.string().trim().min(1).max(253).regex(/^[^\s/:?#]+$/).nullable(),
  utmSource: nullableShortText(80),
  utmMedium: nullableShortText(80),
  utmCampaign: nullableShortText(120),
  deviceCategory: z.enum(['desktop', 'tablet', 'mobile', 'unknown']),
  language: z.enum(['zh', 'en', 'other']),
}).strict().superRefine((event, context) => {
  if (normalizeAnalyticsPath(event.path) !== event.path) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid public analytics path', path: ['path'] });
  }
});

const websiteAnalyticsSharedShape = websiteAnalyticsEventBaseSchema.innerType().shape;

export const websiteAnalyticsEventSchema = z.discriminatedUnion('eventType', [
  z.object({
    ...websiteAnalyticsSharedShape,
    eventType: z.literal('page_view'),
    engagedSeconds: z.literal(0),
  }).strict(),
  z.object({
    ...websiteAnalyticsSharedShape,
    eventType: z.literal('engagement'),
    engagedSeconds: z.number().int().min(1).max(30),
  }).strict(),
  z.object({
    ...websiteAnalyticsSharedShape,
    eventType: z.literal('web_vital'),
    metricName: z.enum(webVitalNames),
    metricValue: z.number().finite().min(0).max(120_000),
    metricRating: z.enum(['good', 'needs-improvement', 'poor']),
    navigationType: z.enum(['navigate', 'reload', 'back_forward', 'prerender', 'other']),
    effectiveConnectionType: z.enum(['slow-2g', '2g', '3g', '4g', 'unknown']),
  }).strict(),
]).superRefine((event, context) => {
  if (normalizeAnalyticsPath(event.path) !== event.path) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid public analytics path', path: ['path'] });
  }
});

export type WebsiteAnalyticsEvent = z.infer<typeof websiteAnalyticsEventSchema>;

const analyticsSettingsSchema = z.object({
  reportingStartDate: z.string(),
  collectionStartedAt: z.string(),
  earliestAvailableAt: z.string().nullable(),
  updatedAt: z.string(),
  canManage: z.boolean(),
});

export const analyticsDashboardSchema = z.object({
  generatedAt: z.string(),
  range: z.enum(analyticsRanges),
  settings: analyticsSettingsSchema,
  summary: z.object({
    activeNow: z.number().int().nonnegative(),
    viewsToday: z.number().int().nonnegative(),
    sessionsToday: z.number().int().nonnegative(),
    averageEngagedSecondsToday: z.number().int().nonnegative(),
  }),
  trend: z.array(z.object({
    bucket: z.string(),
    views: z.number().int().nonnegative(),
    sessions: z.number().int().nonnegative(),
  })),
  popularPages: z.array(z.object({
    path: z.string(),
    views: z.number().int().nonnegative(),
    sessions: z.number().int().nonnegative(),
    averageEngagedSeconds: z.number().int().nonnegative(),
    share: z.number().nonnegative(),
  })),
  sources: z.array(z.object({
    category: z.enum(['direct', 'search', 'social', 'referral', 'campaign']),
    label: z.string(),
    views: z.number().int().nonnegative(),
    sessions: z.number().int().nonnegative(),
  })),
  recentActivity: z.array(z.object({
    occurredAt: z.string(),
    path: z.string(),
    sourceCategory: z.enum(['direct', 'search', 'social', 'referral', 'campaign']),
    referrerHost: z.string().nullable(),
    deviceCategory: z.enum(['desktop', 'tablet', 'mobile', 'unknown']),
    engagedSeconds: z.number().int().nonnegative(),
  })),
  webVitals: z.array(z.object({
    name: z.enum(webVitalNames),
    p75: z.number().nonnegative(),
    goodRatio: z.number().min(0).max(100),
    samples: z.number().int().nonnegative(),
  })).default([]),
});

export type AnalyticsDashboard = z.infer<typeof analyticsDashboardSchema>;
export type AnalyticsSettings = z.infer<typeof analyticsSettingsSchema>;

export function formatEngagedSeconds(seconds: number, language: 'zh' | 'en') {
  if (seconds < 60) return language === 'zh' ? `${seconds} 秒` : `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return language === 'zh' ? `${minutes} 分 ${remainder} 秒` : `${minutes}m ${remainder}s`;
}
