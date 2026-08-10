import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiAuthError } from '../../api/_lib/auth.js';
import handler from '../../api/community/website-analytics.js';

const { requirePermission, rpc } = vi.hoisted(() => ({ requirePermission: vi.fn(), rpc: vi.fn() }));

vi.mock('../../api/_lib/auth.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../api/_lib/auth.js')>(),
  requirePermission,
}));

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

const settings = {
  reportingStartDate: '2026-08-10',
  collectionStartedAt: '2026-08-10T00:00:00.000Z',
  earliestAvailableAt: null,
  updatedAt: '2026-08-10T00:00:00.000Z',
  canManage: true,
};
const dashboard = {
  generatedAt: '2026-08-10T02:00:00.000Z',
  range: '7d',
  settings,
  summary: { activeNow: 1, viewsToday: 4, sessionsToday: 2, averageEngagedSecondsToday: 35 },
  trend: [],
  popularPages: [],
  sources: [],
  recentActivity: [],
};

describe('Community website analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ supabase: { rpc } });
  });

  it('checks read permission and returns a strict aggregate payload', async () => {
    rpc.mockResolvedValue({ data: dashboard, error: null });
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { action: 'dashboard', range: '7d' } } as never, response);
    expect(result()).toEqual({ statusCode: 200, body: { ok: true, dashboard } });
    expect(requirePermission).toHaveBeenCalledWith(expect.anything(), 'analytics.read');
  });

  it('requires manage permission for reporting-date changes', async () => {
    rpc.mockResolvedValue({ data: settings, error: null });
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: { authorization: 'Bearer test' }, body: { action: 'settings', reportingStartDate: '2026-08-01' } } as never, response);
    expect(result()).toEqual({ statusCode: 200, body: { ok: true, settings } });
    expect(requirePermission).toHaveBeenCalledWith(expect.anything(), 'analytics.manage');
  });

  it('returns permission denial without querying analytics', async () => {
    requirePermission.mockRejectedValue(new ApiAuthError(403, 'PERMISSION_DENIED', 'denied'));
    const { response, result } = responseHarness();
    await handler({ method: 'POST', headers: {}, body: { action: 'dashboard', range: '7d' } } as never, response);
    expect(result()).toEqual({ statusCode: 403, body: { ok: false, code: 'PERMISSION_DENIED' } });
    expect(rpc).not.toHaveBeenCalled();
  });
});
