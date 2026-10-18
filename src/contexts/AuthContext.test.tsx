import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommunitySmartEntry } from '@/components/community/CommunityRouteGuards';
import { LanguageProvider } from '@/contexts/LanguageContext';

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
let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;

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
  const { communityState, loading, error, user, permissions } = useAuth();
  return <>
    <p>{loading ? 'loading' : communityState?.membership_status || 'pending'}</p>
    <p data-testid="user">{user?.id || 'signed-out'}</p>
    <p data-testid="permissions">{permissions.join(',')}</p>
    {error ? <p role="alert">{error}</p> : null}
  </>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function renderEntry() {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={['/community/enter']}>
        <AuthProvider>
          <Routes>
            <Route path="/community/enter" element={<CommunitySmartEntry />} />
            <Route path="/community/auth" element={<p>Login form</p>} />
            <Route path="/community/application" element={<p>Application status</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('AuthProvider community realtime refresh', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.setItem('rgan-lang', 'zh');
    communityChangeCallback = undefined;
    authMocks.getCurrentSession.mockResolvedValue(session);
    authMocks.subscribeToAuthChanges.mockImplementation((callback) => {
      authChangeCallback = callback;
      return { unsubscribe: vi.fn() };
    });
    getMyPermissions.mockResolvedValue([]);
    getMyCommunityState.mockResolvedValue(pendingState);
    subscribeToMyCommunityChanges.mockImplementation((_userId: string, callback: () => void) => {
      communityChangeCallback = callback;
      return { unsubscribe: unsubscribeFromCommunityChanges };
    });
  });

  afterEach(() => vi.useRealTimers());

  it('keeps sign-in pending until both community state and permissions are ready', async () => {
    authMocks.getCurrentSession.mockResolvedValue(null);
    render(<AuthProvider><CommunityStateProbe /></AuthProvider>);
    expect(await screen.findByText('pending')).toBeInTheDocument();
    const state = deferred<typeof pendingState>();
    const permissions = deferred<string[]>();
    getMyCommunityState.mockReturnValue(state.promise);
    getMyPermissions.mockReturnValue(permissions.promise);
    vi.useFakeTimers();
    await act(async () => {
      authChangeCallback('SIGNED_IN', session);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText('loading')).toBeInTheDocument();
    await act(async () => state.resolve(pendingState));
    expect(screen.getByText('loading')).toBeInTheDocument();
    await act(async () => permissions.resolve(['stories.create']));
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByTestId('permissions')).toHaveTextContent('stories.create');
  });

  it('ignores a slow initial session lookup after a newer sign-in event', async () => {
    const initial = deferred<Session | null>();
    authMocks.getCurrentSession.mockReturnValue(initial.promise);
    vi.useFakeTimers();
    render(<AuthProvider><CommunityStateProbe /></AuthProvider>);
    await act(async () => {
      authChangeCallback('SIGNED_IN', session);
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => initial.resolve(null));
    expect(screen.getByTestId('user')).toHaveTextContent('member-user');
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('does not restore old community data or permissions after sign-out', async () => {
    const state = deferred<typeof pendingState>();
    getMyCommunityState.mockReturnValue(state.promise);
    getMyPermissions.mockResolvedValue(['users.manage']);
    vi.useFakeTimers();
    render(<AuthProvider><CommunityStateProbe /></AuthProvider>);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    await act(async () => {
      authChangeCallback('SIGNED_OUT', null);
      await vi.advanceTimersByTimeAsync(0);
      state.resolve({ ...pendingState, membership_status: 'active' } as typeof pendingState);
    });
    expect(screen.getByTestId('user')).toHaveTextContent('signed-out');
    expect(screen.getByTestId('permissions')).toBeEmptyDOMElement();
    expect(screen.queryByText('active')).not.toBeInTheDocument();
  });

  it('shows retry after a community failure and enters successfully after retry', async () => {
    getMyCommunityState.mockRejectedValueOnce(new Error('Network unavailable'));
    renderEntry();
    expect(await screen.findByRole('alert')).toHaveTextContent('社群资料暂时未能加载');
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
    expect(await screen.findByText('Application status')).toBeInTheDocument();
  });

  it('ends a stalled community load with a retry and ignores its late result', async () => {
    const stale = deferred<typeof pendingState>();
    getMyCommunityState.mockReturnValueOnce(stale.promise);
    vi.useFakeTimers();
    renderEntry();
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(screen.getByRole('alert')).toHaveTextContent('社群资料暂时未能加载');
    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByText('Application status')).toBeInTheDocument();
    await act(async () => stale.resolve({ ...pendingState, destination: '/community/auth' }));
    expect(screen.getByText('Application status')).toBeInTheDocument();
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
