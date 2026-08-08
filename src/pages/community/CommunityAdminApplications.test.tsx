import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAdminApplications from './CommunityAdminApplications';

const {
  listMembershipApplications,
  refreshCommunity,
  requestMembershipApplicationChanges,
  reviewMembershipApplication,
  reviewMinorIdentity,
} = vi.hoisted(() => ({
  listMembershipApplications: vi.fn(),
  refreshCommunity: vi.fn(),
  requestMembershipApplicationChanges: vi.fn(),
  reviewMembershipApplication: vi.fn(),
  reviewMinorIdentity: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'applicant-user' },
    refreshCommunity,
  }),
}));

vi.mock('@/services/memberships', () => ({
  listMembershipApplications,
  requestMembershipApplicationChanges,
  reviewMembershipApplication,
  reviewMinorIdentity,
}));

const application = {
  id: 26,
  user_id: 'applicant-user',
  status: 'submitted',
  username: 'forest_friend',
  display_name: '山风伙伴',
  nature_name: '山风',
  age_band: 'adult_18_plus',
  guardian_consent_status: 'not_required',
  identity_verification_status: 'not_required',
};

function renderApplications() {
  return render(
    <MemoryRouter>
      <LanguageProvider initialLanguage="zh"><CommunityAdminApplications /></LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityAdminApplications', () => {
  beforeEach(() => {
    window.localStorage.setItem('rgan-lang', 'zh');
    vi.clearAllMocks();
    listMembershipApplications.mockResolvedValue([application]);
    refreshCommunity.mockResolvedValue(undefined);
    requestMembershipApplicationChanges.mockResolvedValue(undefined);
    reviewMembershipApplication.mockResolvedValue(undefined);
    reviewMinorIdentity.mockResolvedValue(undefined);
  });

  it('locks duplicate review actions, refreshes state, and preserves approval feedback', async () => {
    let finishReview: (() => void) | undefined;
    reviewMembershipApplication.mockImplementation(
      () => new Promise<void>((resolve) => { finishReview = resolve; }),
    );
    listMembershipApplications
      .mockResolvedValueOnce([application])
      .mockResolvedValueOnce([]);

    renderApplications();

    expect(await screen.findByRole('heading', { name: '山风' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('给申请人的说明（必填）'), {
      target: { value: '同意加入社群' },
    });
    fireEvent.click(screen.getByRole('button', { name: '通过' }));

    await waitFor(() => expect(reviewMembershipApplication).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: '正在处理…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '正在处理…' }));
    expect(reviewMembershipApplication).toHaveBeenCalledTimes(1);

    finishReview?.();

    expect(await screen.findByText('申请已通过，成员现在可以进入社群工作台。')).toBeInTheDocument();
    expect(refreshCommunity).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: '进入工作台' })).toHaveAttribute('href', '/community');
    expect(screen.getByText('当前没有待处理申请。')).toBeInTheDocument();
  });
});
