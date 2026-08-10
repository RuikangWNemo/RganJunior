import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  subscribeToApplicationReviewChanges,
  unsubscribeFromApplicationReviewChanges,
} = vi.hoisted(() => ({
  listMembershipApplications: vi.fn(),
  refreshCommunity: vi.fn(),
  requestMembershipApplicationChanges: vi.fn(),
  reviewMembershipApplication: vi.fn(),
  reviewMinorIdentity: vi.fn(),
  listAdminIdentityLabels: vi.fn(),
  subscribeToApplicationReviewChanges: vi.fn(),
  unsubscribeFromApplicationReviewChanges: vi.fn(),
}));

let applicationChangeCallback: (() => void) | undefined;

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

vi.mock('@/services/community-realtime', () => ({
  subscribeToApplicationReviewChanges,
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
  motivation: '想和伙伴一起长期学习，也愿意分享自己的自然观察。',
  hopes: '认识可以一起行动的朋友。',
  contribution: '每月分享一次观察记录。',
  additional_info: null,
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
    applicationChangeCallback = undefined;
    subscribeToApplicationReviewChanges.mockImplementation((callback: () => void) => {
      applicationChangeCallback = callback;
      return { unsubscribe: unsubscribeFromApplicationReviewChanges };
    });
  });

  it('shows the application reason and reloads when a realtime change arrives', async () => {
    const nextApplication = {
      ...application,
      id: 27,
      user_id: 'new-applicant',
      username: 'new_friend',
      display_name: '新伙伴',
      nature_name: '溪流',
      motivation: '想参与长期共学。',
    };
    listMembershipApplications
      .mockResolvedValueOnce([application])
      .mockResolvedValueOnce([nextApplication, application]);

    const { unmount } = renderApplications();

    expect(await screen.findByText('想和伙伴一起长期学习，也愿意分享自己的自然观察。')).toBeInTheDocument();
    expect(screen.getByText('认识可以一起行动的朋友。')).toBeInTheDocument();
    expect(applicationChangeCallback).toBeTypeOf('function');

    act(() => applicationChangeCallback?.());

    expect(await screen.findByRole('heading', { name: '溪流' })).toBeInTheDocument();
    expect(listMembershipApplications).toHaveBeenCalledTimes(2);

    unmount();
    expect(unsubscribeFromApplicationReviewChanges).toHaveBeenCalledTimes(1);
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
