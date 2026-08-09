import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunitySettings from './CommunitySettings';

const { authMocks, profileMocks } = vi.hoisted(() => ({
  authMocks: {
    reauthenticate: vi.fn(),
    signOut: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
  },
  profileMocks: {
    getMyCommunityProfile: vi.fn(),
    updateMyCommunityProfile: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'member@example.com' },
    signOut: authMocks.signOut,
  }),
}));

vi.mock('@/services/auth', () => authMocks);
vi.mock('@/services/community-profile', () => profileMocks);

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/community/settings']}>
      <LanguageProvider>
        <CommunitySettings />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunitySettings password security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    profileMocks.getMyCommunityProfile.mockResolvedValue(null);
    profileMocks.updateMyCommunityProfile.mockResolvedValue({});
    authMocks.reauthenticate.mockResolvedValue({});
    authMocks.updateEmail.mockResolvedValue({});
    authMocks.updatePassword.mockResolvedValue({});
  });

  it('requires an emailed nonce and matching password confirmation', async () => {
    renderSettings();

    const sendButton = await screen.findByRole('button', { name: '发送邮箱验证码' });
    expect(screen.queryByLabelText('新密码')).not.toBeInTheDocument();
    fireEvent.click(sendButton);

    await waitFor(() => expect(authMocks.reauthenticate).toHaveBeenCalledTimes(1));
    const codeInput = await screen.findByLabelText('6 位邮箱验证码');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'new-password-123' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'different-password' } });

    const updateButton = screen.getByRole('button', { name: '验证并修改密码' });
    expect(updateButton).toBeDisabled();
    expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'new-password-123' } });
    expect(updateButton).toBeEnabled();
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(authMocks.updatePassword).toHaveBeenCalledWith('new-password-123', '123456');
    });
    expect(screen.getByRole('status')).toHaveTextContent('密码已安全更新。');
    expect(screen.queryByLabelText('新密码')).not.toBeInTheDocument();
  });
});
