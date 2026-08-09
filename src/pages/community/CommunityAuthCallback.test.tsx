import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CommunityAuthCallback from './CommunityAuthCallback';

const { authState, getCurrentSession } = vi.hoisted(() => ({
  authState: {
    user: null as { id: string } | null,
    loading: false,
    error: null as string | null,
  },
  getCurrentSession: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/lib/communityUi', () => ({
  useCommunityUi: () => ({ t: (zh: string) => zh }),
}));

vi.mock('@/services/auth', () => ({ getCurrentSession }));

function renderCallback() {
  return render(
    <MemoryRouter initialEntries={['/community/auth/callback']}>
      <Routes>
        <Route path="/community/auth/callback" element={<CommunityAuthCallback />} />
        <Route path="/community/enter" element={<p>进入社群</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CommunityAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    authState.loading = false;
    authState.error = null;
    window.history.replaceState({}, '', '/community/auth/callback');
  });

  it('navigates when a callback session is available', async () => {
    getCurrentSession.mockResolvedValue({ user: { id: 'user-1' } });
    renderCallback();

    expect(await screen.findByText('进入社群')).toBeInTheDocument();
  });

  it('stops loading and offers recovery when no session is created', async () => {
    getCurrentSession.mockResolvedValue(null);
    renderCallback();

    expect(await screen.findByRole('heading', { name: '登录未完成' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回登录' })).toHaveAttribute('href', '/community/auth');
  });

  it('shows an error returned in the callback URL without retrying the session', () => {
    window.history.replaceState({}, '', '/community/auth/callback#error=access_denied&error_description=OTP+expired');
    renderCallback();

    expect(screen.getByText('登录链接无效或已过期，请重新发送。')).toBeInTheDocument();
    expect(getCurrentSession).not.toHaveBeenCalled();
  });

  it('keeps a valid session when a one-time link is opened again', async () => {
    authState.user = { id: 'user-1' };
    window.history.replaceState({}, '', '/community/auth/callback#error=access_denied&error_description=OTP+expired');
    renderCallback();

    expect(await screen.findByText('进入社群')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '登录未完成' })).not.toBeInTheDocument();
    expect(getCurrentSession).not.toHaveBeenCalled();
  });
});
