import { act, render, screen } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './AuthContext';

const {
  authMocks,
  getMyCommunityState,
  getMyPermissions,
  subscribeToMyCommunityChanges,
  unsubscribeFromCommunityChanges,
} = vi.hoisted(() => ({
  authMocks: {
    getCurrentSession: vi.fn(),
    signOut: vi.fn(),
    subscribeToAuthChanges: vi.fn(),
  },
  getMyCommunityState: vi.fn(),
  getMyPermissions: vi.fn(),
  subscribeToMyCommunityChanges: vi.fn(),
  unsubscribeFromCommunityChanges: vi.fn(),
}));

let communityChangeCallback: (() => void) | undefined;

vi.mock('@/services/auth', () => authMocks);
vi.mock('@/services/community-state', () => ({ getMyCommunityState }));
vi.mock('@/services/permissions', () => ({ getMyPermissions }));
vi.mock('@/services/community-realtime', () => ({ subscribeToMyCommunityChanges }));

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'member-user', email: 'member@example.com' },
} as unknown as Session;

const pendingState = {
  user_id: 'member-user',
  account_status: 'active',
  onboarding_completed: true,
  age_band: 'adult_18_plus',
  guardian_consent_status: 'not_required',
  identity_verification_status: 'not_required',
  person_id: 12,
  application_status: 'submitted',
  membership_status: null,
  destination: '/community/application',
};

function CommunityStateProbe() {
  const { communityState, loading } = useAuth();
  return <p>{loading ? 'loading' : communityState?.membership_status || 'pending'}</p>;
}

describe('AuthProvider community realtime refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    communityChangeCallback = undefined;
    authMocks.getCurrentSession.mockResolvedValue(session);
    authMocks.subscribeToAuthChanges.mockReturnValue({ unsubscribe: vi.fn() });
    getMyPermissions.mockResolvedValue([]);
    getMyCommunityState.mockResolvedValue(pendingState);
    subscribeToMyCommunityChanges.mockImplementation((_userId: string, callback: () => void) => {
      communityChangeCallback = callback;
      return { unsubscribe: unsubscribeFromCommunityChanges };
    });
  });

  it('refreshes the current user state when a database broadcast arrives', async () => {
    render(<AuthProvider><CommunityStateProbe /></AuthProvider>);

    expect(await screen.findByText('pending')).toBeInTheDocument();
    expect(subscribeToMyCommunityChanges).toHaveBeenCalledWith('member-user', expect.any(Function));

    getMyCommunityState.mockResolvedValue({
      ...pendingState,
      application_status: 'approved',
      membership_status: 'active',
      destination: '/community',
    });
    await act(async () => communityChangeCallback?.());

    expect(await screen.findByText('active')).toBeInTheDocument();
  });
});
