import { beforeEach, describe, expect, it, vi } from 'vitest';

import { completeCommunityOnboarding, type CommunityOnboardingInput } from './index';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ rpc }),
}));

function onboardingInput(language: 'zh' | 'en'): CommunityOnboardingInput {
  return {
    username: 'forest_friend',
    displayName: '山风伙伴',
    nameZh: '小林',
    nameEn: 'Lin',
    natureName: '山风',
    bio: '',
    city: '成都',
    region: '四川',
    country: '中国',
    profileVisibility: 'private',
    showRealName: false,
    allowMessages: true,
    language,
    timezone: 'Asia/Shanghai',
  };
}

describe('completeCommunityOnboarding language RPC argument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: 42, error: null });
  });

  it.each(['zh', 'en'] as const)('passes the canonical %s code to Supabase', async (language) => {
    await completeCommunityOnboarding(onboardingInput(language));

    expect(rpc).toHaveBeenCalledWith(
      'complete_community_onboarding',
      expect.objectContaining({ requested_language: language }),
    );
  });
});
