import { describe, expect, it } from 'vitest';

import {
  analyticsDeviceCategory,
  analyticsLanguage,
  analyticsReferrerHost,
  analyticsSourceCategory,
  buildAnalyticsAcquisition,
  normalizeAnalyticsPath,
  websiteAnalyticsEventSchema,
} from './websiteAnalytics';

describe('website analytics privacy helpers', () => {
  it('normalizes public paths while excluding Community and query details', () => {
    expect(normalizeAnalyticsPath('/field-notes/?private=value#section')).toBe('/field-notes');
    expect(normalizeAnalyticsPath('/community/admin/analytics')).toBeNull();
    expect(normalizeAnalyticsPath('https://example.test/about')).toBeNull();
  });

  it('keeps only an external referrer hostname and whitelisted UTM fields', () => {
    expect(analyticsReferrerHost('https://www.baidu.com/s?wd=secret', 'www.rganjunior.org')).toBe('www.baidu.com');
    expect(analyticsReferrerHost('https://www.rganjunior.org/about', 'www.rganjunior.org')).toBeNull();
    expect(buildAnalyticsAcquisition({
      search: '?utm_source=newsletter&utm_medium=email&utm_campaign=summer&email=private@example.test',
      referrer: '',
      currentHost: 'www.rganjunior.org',
    })).toEqual({
      sourceCategory: 'campaign',
      referrerHost: null,
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'summer',
    });
  });

  it('derives broad source, device, and language categories', () => {
    expect(analyticsSourceCategory({ referrerHost: 'www.baidu.com', utmSource: null, utmMedium: null, utmCampaign: null })).toBe('search');
    expect(analyticsSourceCategory({ referrerHost: 'weibo.com', utmSource: null, utmMedium: null, utmCampaign: null })).toBe('social');
    expect(analyticsSourceCategory({ referrerHost: 'example.org', utmSource: null, utmMedium: null, utmCampaign: null })).toBe('referral');
    expect(analyticsDeviceCategory('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)')).toBe('mobile');
    expect(analyticsLanguage('zh-CN')).toBe('zh');
  });

  it('rejects private routes and impossible engagement payloads', () => {
    const base = {
      eventType: 'engagement' as const,
      sessionId: 'e2000000-0000-4000-8000-000000000001',
      viewId: 'e3000000-0000-4000-8000-000000000001',
      path: '/about',
      sourceCategory: 'direct' as const,
      referrerHost: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      deviceCategory: 'desktop' as const,
      language: 'zh' as const,
      engagedSeconds: 15,
    };
    expect(websiteAnalyticsEventSchema.safeParse(base).success).toBe(true);
    expect(websiteAnalyticsEventSchema.safeParse({ ...base, path: '/community' }).success).toBe(false);
    expect(websiteAnalyticsEventSchema.safeParse({ ...base, engagedSeconds: 31 }).success).toBe(false);
  });

  it('accepts only coarse bounded Core Web Vitals', () => {
    const vital = {
      eventType: 'web_vital' as const,
      sessionId: 'e2000000-0000-4000-8000-000000000001',
      viewId: 'e3000000-0000-4000-8000-000000000001',
      path: '/about',
      sourceCategory: 'direct' as const,
      referrerHost: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      deviceCategory: 'mobile' as const,
      language: 'zh' as const,
      metricName: 'LCP' as const,
      metricValue: 2300,
      metricRating: 'good' as const,
      navigationType: 'navigate' as const,
      effectiveConnectionType: '4g' as const,
    };

    expect(websiteAnalyticsEventSchema.safeParse(vital).success).toBe(true);
    expect(websiteAnalyticsEventSchema.safeParse({ ...vital, metricName: 'memory' }).success).toBe(false);
    expect(websiteAnalyticsEventSchema.safeParse({ ...vital, metricValue: 120_001 }).success).toBe(false);
    expect(websiteAnalyticsEventSchema.safeParse({ ...vital, query: 'private=value' }).success).toBe(false);
  });
});
