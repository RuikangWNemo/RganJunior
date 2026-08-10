import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAdminAnalytics from './CommunityAdminAnalytics';

const mocks = vi.hoisted(() => ({
  getWebsiteAnalyticsDashboard: vi.fn(),
  setWebsiteAnalyticsReportingStartDate: vi.fn(),
}));

vi.mock('@/services/website-analytics', () => mocks);

const dashboard = {
  generatedAt: '2026-08-10T02:00:00.000Z',
  range: '7d' as const,
  settings: {
    reportingStartDate: '2026-08-01',
    collectionStartedAt: '2026-08-01T00:00:00.000Z',
    earliestAvailableAt: '2026-08-02T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
    canManage: true,
  },
  summary: { activeNow: 3, viewsToday: 128, sessionsToday: 72, averageEngagedSecondsToday: 95 },
  trend: [
    { bucket: '2026-08-09T00:00:00.000Z', views: 42, sessions: 21 },
    { bucket: '2026-08-10T00:00:00.000Z', views: 86, sessions: 51 },
  ],
  popularPages: [{ path: '/about', views: 68, sessions: 40, averageEngagedSeconds: 82, share: 53.1 }],
  sources: [{ category: 'search' as const, label: 'www.baidu.com', views: 70, sessions: 39 }],
  recentActivity: [{ occurredAt: '2026-08-10T01:58:00.000Z', path: '/about', sourceCategory: 'search' as const, referrerHost: 'www.baidu.com', deviceCategory: 'mobile' as const, engagedSeconds: 45 }],
};

describe('CommunityAdminAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWebsiteAnalyticsDashboard.mockResolvedValue(dashboard);
    mocks.setWebsiteAnalyticsReportingStartDate.mockResolvedValue(dashboard.settings);
  });

  it('shows real aggregate sections and saves the reporting start date', async () => {
    render(
      <MemoryRouter initialEntries={['/community/admin/analytics']}>
        <LanguageProvider initialLanguage="zh"><CommunityAdminAnalytics /></LanguageProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: '此刻与今天' })).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '访问趋势' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '热门页面' })).toBeInTheDocument();
    expect(screen.getByText('www.baidu.com')).toBeInTheDocument();
    expect(screen.getByText(/网站始终匿名采集/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('起算日期'), { target: { value: '2026-08-05' } });
    fireEvent.click(screen.getByRole('button', { name: '保存起算日期' }));
    await waitFor(() => expect(mocks.setWebsiteAnalyticsReportingStartDate).toHaveBeenCalledWith('2026-08-05'));
  });

  it('reloads historical aggregates when the range changes', async () => {
    render(
      <MemoryRouter initialEntries={['/community/admin/analytics']}>
        <LanguageProvider initialLanguage="zh"><CommunityAdminAnalytics /></LanguageProvider>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: '访问趋势' });
    fireEvent.click(screen.getByRole('button', { name: '30 天' }));
    await waitFor(() => expect(mocks.getWebsiteAnalyticsDashboard).toHaveBeenCalledWith('30d'));
  });
});
