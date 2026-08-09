import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  sendEmailOtp,
  signInWithIdentifier,
  verifyEmailOtp,
} from './index';

const { auth } = vi.hoisted(() => ({
  auth: {
    setSession: vi.fn(),
    signInWithOtp: vi.fn(),
    signInWithPassword: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

vi.mock('@/lib/authRedirect', () => ({
  buildAuthRedirectUrl: (path: string) => `https://www.rganjunior.org${path}`,
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ auth }),
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    auth.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
    auth.setSession.mockResolvedValue({ data: { session: {} }, error: null });
  });

  it('signs email identifiers in directly without the username service', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await signInWithIdentifier(' Person@Example.com ', 'password123');

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'password123',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps username identifiers on the protected resolver endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await signInWithIdentifier(' ForestFriend ', 'password123');

    expect(fetchMock).toHaveBeenCalledWith('/api/community/username-login', expect.objectContaining({
      body: JSON.stringify({ identifier: 'forestfriend', password: 'password123' }),
      method: 'POST',
    }));
    expect(auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });

  it('requests an existing-user email OTP with the canonical callback', async () => {
    await sendEmailOtp(' Person@Example.com ');

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      options: {
        emailRedirectTo: 'https://www.rganjunior.org/community/auth/callback',
        shouldCreateUser: false,
      },
    });
  });

  it('normalizes and verifies a six-digit email OTP', async () => {
    await verifyEmailOtp(' Person@Example.com ', '123 456');

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '123456',
      type: 'email',
    });
  });
});
