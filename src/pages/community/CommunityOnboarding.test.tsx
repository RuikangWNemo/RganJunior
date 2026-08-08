import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityOnboarding from './CommunityOnboarding';

const { completeCommunityOnboarding, refreshCommunity } = vi.hoisted(() => ({
  completeCommunityOnboarding: vi.fn(),
  refreshCommunity: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    communityState: {
      age_band: 'adult_18_plus',
      guardian_consent_status: 'not_required',
      onboarding_completed: false,
    },
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
});
