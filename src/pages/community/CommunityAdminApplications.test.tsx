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
  listAdminIdentityLabels,
} = vi.hoisted(() => ({
  listMembershipApplications: vi.fn(),
  refreshCommunity: vi.fn(),
  requestMembershipApplicationChanges: vi.fn(),
  reviewMembershipApplication: vi.fn(),
  reviewMinorIdentity: vi.fn(),
  listAdminIdentityLabels: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'applicant-user' },
    permissions: ['people.manage'],
    refreshCommunity,
  }),
}));

vi.mock('@/services/community-identities', () => ({
  listAdminIdentityLabels,
  listSignupIdentityOptions: vi.fn(),
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
  declared_primary_identity_slug: 'participant',
  declared_secondary_identity_slugs: ['parent-guardian'],
};

const identityLabels = [
  { id: 1, slug: 'rgan-founder', name_zh: '阿柑少年发起人', name_en: 'Founder', color: '#F08A4B', is_active: true },
  { id: 2, slug: 'participant', name_zh: '参与者', name_en: 'Participant', color: '#E9C979', is_active: true },
  { id: 3, slug: 'parent-guardian', name_zh: '家长守护团', name_en: 'Guardian', color: '#8BB5C8', is_active: true },
];

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
    listAdminIdentityLabels.mockResolvedValue(identityLabels);
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
    expect(listMembershipApplications).toHaveBeenCalledWith([
      'pending_guardian',
      'submitted',
      'under_review',
      'more_info_requested',
    ]);
    fireEvent.change(screen.getByPlaceholderText('给申请人的说明（必填）'), {
      target: { value: '同意加入社群' },
    });
    fireEvent.click(screen.getByRole('button', { name: '通过' }));

    await waitFor(() => expect(reviewMembershipApplication).toHaveBeenCalledTimes(1));
    expect(reviewMembershipApplication).toHaveBeenCalledWith(
      26,
      'approve',
      '同意加入社群',
      undefined,
      'participant',
      ['parent-guardian'],
    );
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
