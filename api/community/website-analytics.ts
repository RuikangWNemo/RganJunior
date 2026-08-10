import { ApiAuthError, requirePermission } from '../_lib/auth.js';
import {
  compactString,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http.js';
import {
  analyticsDashboardSchema,
  analyticsRanges,
} from '../../src/lib/websiteAnalytics.js';

const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string) {
  if (!calendarDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function apiErrorStatus(code: string) {
  if (code === 'PERMISSION_DENIED') return 403;
  if (code.startsWith('INVALID_')) return 400;
  return 502;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  try {
    const body = await readJsonBody(request);
    const action = compactString(body.action, 24);

    if (action === 'dashboard') {
      const context = await requirePermission(request, 'analytics.read');
      const range = compactString(body.range, 8);
      if (!analyticsRanges.includes(range as (typeof analyticsRanges)[number])) {
        return sendJson(response, 400, { ok: false, code: 'INVALID_ANALYTICS_RANGE' });
      }
      const { data, error } = await context.supabase.rpc('get_website_analytics_dashboard', {
        target_range: range,
      });
      if (error) throw error;
      const parsed = analyticsDashboardSchema.safeParse(data);
      if (!parsed.success) throw new Error('WEBSITE_ANALYTICS_INVALID_RESPONSE');
      return sendJson(response, 200, { ok: true, dashboard: parsed.data });
    }

    if (action === 'settings') {
      const context = await requirePermission(request, 'analytics.manage');
      const reportingStartDate = compactString(body.reportingStartDate, 10);
      if (!isCalendarDate(reportingStartDate)) {
        return sendJson(response, 400, { ok: false, code: 'INVALID_ANALYTICS_REPORTING_DATE' });
      }
      const { data, error } = await context.supabase.rpc('set_website_analytics_reporting_start_date', {
        target_date: reportingStartDate,
      });
      if (error) throw error;
      const parsed = analyticsDashboardSchema.shape.settings.safeParse(data);
      if (!parsed.success) throw new Error('WEBSITE_ANALYTICS_INVALID_RESPONSE');
      return sendJson(response, 200, { ok: true, settings: parsed.data });
    }

    return sendJson(response, 400, { ok: false, code: 'INVALID_ANALYTICS_ACTION' });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return sendJson(response, error.statusCode, { ok: false, code: error.code });
    }
    const code = error instanceof Error ? error.message : 'WEBSITE_ANALYTICS_REQUEST_FAILED';
    console.error('website analytics request failed', code);
    return sendJson(response, apiErrorStatus(code), {
      ok: false,
      code: code.startsWith('INVALID_') || code === 'PERMISSION_DENIED'
        ? code
        : 'WEBSITE_ANALYTICS_REQUEST_FAILED',
    });
  }
}
