import { createHmac } from 'node:crypto';

import {
  readJsonBody,
  requestIp,
  requestOrigin,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http.js';
import { createSecretSupabaseClient } from '../_lib/supabase.js';
import {
  isAnalyticsBot,
  websiteAnalyticsEventSchema,
} from '../../src/lib/websiteAnalytics.js';

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function requestIsSameOrigin(request: ApiRequest) {
  const origin = firstHeader(request.headers.origin);
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(requestOrigin(request)).origin;
  } catch {
    return false;
  }
}

function analyticsRateLimitHash(value: string) {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secret) throw new Error('ANALYTICS_SERVER_NOT_CONFIGURED');
  return createHmac('sha256', secret)
    .update(`website-analytics-rate-limit:${value}`, 'utf8')
    .digest('hex');
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  try {
    if (!requestIsSameOrigin(request)) {
      return sendJson(response, 403, { ok: false, code: 'ANALYTICS_ORIGIN_DENIED' });
    }
    const userAgent = firstHeader(request.headers['user-agent']) || '';
    if (isAnalyticsBot(userAgent)) {
      return sendJson(response, 202, { ok: true, ignored: true });
    }
    const parsed = websiteAnalyticsEventSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_WEBSITE_ANALYTICS_EVENT' });
    }

    const client = createSecretSupabaseClient();
    const { data: rateData, error: rateError } = await client.rpc('consume_api_rate_limit_server', {
      target_scope: 'website-analytics-ip',
      target_key_hash: analyticsRateLimitHash(requestIp(request)),
      target_max_attempts: 100,
      target_window_seconds: 60,
      target_block_seconds: 60,
    });
    const rate = rateData?.[0];
    if (rateError || !rate) throw rateError || new Error('ANALYTICS_RATE_LIMIT_FAILED');
    if (!rate.allowed) {
      response.setHeader('Retry-After', String(rate.retry_after_seconds || 60));
      return sendJson(response, 429, { ok: false, code: 'ANALYTICS_RATE_LIMITED' });
    }

    const event = parsed.data;
    const { error } = await client.rpc('record_website_analytics_event_server', {
      target_event_type: event.eventType,
      target_session_id: event.sessionId,
      target_view_id: event.viewId,
      target_path: event.path,
      target_source_category: event.sourceCategory,
      target_referrer_host: event.referrerHost || undefined,
      target_utm_source: event.utmSource || undefined,
      target_utm_medium: event.utmMedium || undefined,
      target_utm_campaign: event.utmCampaign || undefined,
      target_device_category: event.deviceCategory,
      target_language: event.language,
      target_engaged_seconds: event.engagedSeconds,
    });
    if (error) throw error;
    return sendJson(response, 202, { ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'WEBSITE_ANALYTICS_COLLECTION_FAILED';
    console.error('website analytics collection failed', code);
    return sendJson(response, code === 'ANALYTICS_SERVER_NOT_CONFIGURED' ? 503 : 502, {
      ok: false,
      code: code === 'ANALYTICS_SERVER_NOT_CONFIGURED' ? code : 'WEBSITE_ANALYTICS_COLLECTION_FAILED',
    });
  }
}
