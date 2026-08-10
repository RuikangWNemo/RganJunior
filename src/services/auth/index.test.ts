import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  reauthenticate,
  sendEmailOtp,
  signInWithIdentifier,
  updatePassword,
  verifyEmailOtp,
} from './index';

const { auth } = vi.hoisted(() => ({
  auth: {
    reauthenticate: vi.fn(),
    setSession: vi.fn(),
    signInWithOtp: vi.fn(),
    signInWithPassword: vi.fn(),
    updateUser: vi.fn(),
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
    auth.reauthenticate.mockResolvedValue({ data: {}, error: null });
    auth.updateUser.mockResolvedValue({ data: { user: {} }, error: null });
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

  it('normalizes and verifies the configured email OTP', async () => {
    await verifyEmailOtp(' Person@Example.com ', '1234 5678');

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '12345678',
      type: 'email',
    });
  });

  it('requests a password-change nonce from the current account email', async () => {
    await reauthenticate();

    expect(auth.reauthenticate).toHaveBeenCalledTimes(1);
  });

  it('normalizes the reauthentication nonce when updating a password', async () => {
    await updatePassword('new-password-123', '123 456');

    expect(auth.updateUser).toHaveBeenCalledWith({
      password: 'new-password-123',
      nonce: '123456',
    });
  });
});
