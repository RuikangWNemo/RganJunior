import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityOnboarding from './CommunityOnboarding';

const { communityState, completeCommunityOnboarding, refreshCommunity } = vi.hoisted(() => ({
  communityState: {
    age_band: 'adult_18_plus',
    guardian_consent_status: 'not_required',
    onboarding_completed: false,
  },
  completeCommunityOnboarding: vi.fn(),
  refreshCommunity: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    communityState,
    refreshCommunity,
  }),
}));

vi.mock('@/services/community-profile', () => ({
  completeCommunityOnboarding,
}));

function CurrentPath() {
  return <output aria-label="current path">{useLocation().pathname}</output>;
}

function renderOnboarding(language: 'zh' | 'en') {
  window.localStorage.setItem('rgan-lang', language);
  return render(
    <MemoryRouter initialEntries={['/community/onboarding']}>
      <LanguageProvider initialLanguage={language}>
        <CommunityOnboarding />
        <CurrentPath />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

async function submitRequiredProfile(language: 'zh' | 'en') {
  fireEvent.change(screen.getByLabelText(language === 'zh' ? '用户名 *' : 'Username *'), { target: { value: 'forest_friend' } });
  fireEvent.change(screen.getByLabelText(language === 'zh' ? '主页显示名 *' : 'Display name *'), { target: { value: '山风伙伴' } });
  fireEvent.change(screen.getByLabelText(language === 'zh' ? '中文名' : 'English name'), { target: { value: language === 'zh' ? '小林' : 'Lin' } });
  fireEvent.click(screen.getByRole('button', { name: language === 'zh' ? '保存并继续' : 'Save and continue' }));

  await waitFor(() => expect(completeCommunityOnboarding).toHaveBeenCalledTimes(1));
}

describe('CommunityOnboarding language payload', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    Object.assign(communityState, {
      age_band: 'adult_18_plus',
      guardian_consent_status: 'not_required',
      onboarding_completed: false,
    });
    completeCommunityOnboarding.mockResolvedValue(1);
    refreshCommunity.mockResolvedValue(undefined);
  });

  it('submits the canonical zh code from the Chinese interface', async () => {
    renderOnboarding('zh');
    await submitRequiredProfile('zh');

    expect(completeCommunityOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'zh' }),
    );
    await waitFor(() => expect(screen.getByLabelText('current path')).toHaveTextContent('/community/enter'));
  });

  it('submits the canonical en code from the English interface', async () => {
    renderOnboarding('en');
    await submitRequiredProfile('en');

    expect(completeCommunityOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'en' }),
    );
  });

  it('allows an under-14 applicant to complete onboarding before Guardian confirmation', () => {
    Object.assign(communityState, {
      age_band: 'under_14',
      guardian_consent_status: 'required',
    });
    renderOnboarding('zh');

    expect(screen.getByRole('heading', { name: '先让伙伴认识你。' })).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/community/onboarding');
    expect(screen.getByText('安全确认')).toBeInTheDocument();
  });
});
