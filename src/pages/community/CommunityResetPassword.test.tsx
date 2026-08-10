import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityResetPassword from './CommunityResetPassword';

const { authMocks } = vi.hoisted(() => ({
  authMocks: { updatePassword: vi.fn() },
}));

vi.mock('@/services/auth', () => authMocks);

function renderResetPassword() {
  return render(
    <MemoryRouter initialEntries={['/community/reset-password']}>
      <LanguageProvider>
        <CommunityResetPassword />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    authMocks.updatePassword.mockResolvedValue({});
  });

  it('only saves when the new password is confirmed', async () => {
    renderResetPassword();

    const saveButton = screen.getByRole('button', { name: '保存新密码' });
    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'new-password-123' } });
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'different-password' } });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'new-password-123' } });
    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);

    await waitFor(() => expect(authMocks.updatePassword).toHaveBeenCalledWith('new-password-123'));
  });
});
