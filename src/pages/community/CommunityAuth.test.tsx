import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAuth from './CommunityAuth';

const { authState } = vi.hoisted(() => ({
  authState: {
    user: null,
    communityState: null,
    loading: false,
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/services/auth', () => ({
  requestPasswordReset: vi.fn(),
  sendMagicLink: vi.fn(),
  signInWithIdentifier: vi.fn(),
  signUp: vi.fn(),
}));

function renderAuth() {
  return render(
    <MemoryRouter initialEntries={['/community/auth']}>
      <LanguageProvider>
        <CommunityAuth />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityAuth', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('starts with a focused password sign-in form', () => {
    renderAuth();

    expect(screen.getByRole('heading', { name: '欢迎回来' })).toBeInTheDocument();
    expect(screen.getByLabelText('用户名或邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: '进入社群' })).toBeInTheDocument();
  });

  it('asks for age before showing registration credentials', () => {
    renderAuth();

    fireEvent.click(screen.getByRole('tab', { name: '注册' }));

    expect(screen.getByRole('heading', { name: '先确认年龄范围' })).toBeInTheDocument();
    expect(screen.queryByLabelText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('密码')).not.toBeInTheDocument();

    const continueButton = screen.getByRole('button', { name: '继续创建账号' });
    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: '14-17 岁' }));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);

    expect(screen.getByRole('heading', { name: '建立你的账号' })).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toHaveAttribute('autocomplete', 'new-password');

    fireEvent.click(screen.getByRole('button', { name: '修改年龄范围' }));
    expect(screen.getByRole('heading', { name: '先确认年龄范围' })).toBeInTheDocument();
  });

  it('keeps Magic Link and password recovery as secondary paths', () => {
    renderAuth();

    fireEvent.click(screen.getByRole('button', { name: '使用 Magic Link' }));
    expect(screen.getByRole('heading', { name: '获取邮箱登录链接' })).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '发送登录链接' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '返回密码登录' }));
    fireEvent.click(screen.getByRole('button', { name: '找回密码' }));
    expect(screen.getByRole('heading', { name: '找回你的账号' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '发送重设邮件' })).toBeInTheDocument();
  });
});
