import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityApplicationStatus from './CommunityApplicationStatus';

const { getMyCommunityApplication, refreshCommunity } = vi.hoisted(() => ({
  getMyCommunityApplication: vi.fn(),
  refreshCommunity: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    communityState: {
      application_status: 'submitted',
      membership_status: null,
    },
    refreshCommunity,
  }),
}));

vi.mock('@/services/memberships', () => ({
  getMyCommunityApplication,
}));

describe('CommunityApplicationStatus', () => {
  beforeEach(() => {
    window.localStorage.setItem('rgan-lang', 'zh');
    vi.clearAllMocks();
    getMyCommunityApplication.mockResolvedValue({
      id: 26,
      status: 'approved',
      decision_reason: '欢迎进入阿柑少年社群。',
    });
    refreshCommunity.mockResolvedValue(undefined);
  });

  it('refreshes route-guard state after observing an approved application', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider initialLanguage="zh"><CommunityApplicationStatus /></LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: '申请已通过' })).toBeInTheDocument();
    await waitFor(() => expect(refreshCommunity).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('link', { name: '进入社群' })).toHaveAttribute('href', '/community');
  });
});
