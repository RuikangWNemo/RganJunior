import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAuth from './CommunityAuth';

const { authMocks, authState, identityMocks, identityOptions } = vi.hoisted(() => ({
  authMocks: {
    requestPasswordReset: vi.fn(),
    sendEmailOtp: vi.fn(),
    sendMagicLink: vi.fn(),
    signInWithIdentifier: vi.fn(),
    signUp: vi.fn(),
    verifyEmailOtp: vi.fn(),
  },
  authState: {
    user: null,
    communityState: null,
    loading: false,
  },
  identityMocks: {
    listSignupIdentityOptions: vi.fn(),
  },
  identityOptions: [
    {
      slug: 'youth-co-creator',
      name_zh: '青年共创伙伴',
      name_en: 'Youth Co-creator',
      description_zh: '与伙伴一起共创。',
      description_en: 'Co-create with peers.',
      color: '#F2B35D',
    },
    {
      slug: 'participant',
      name_zh: '参与者',
      name_en: 'Participant',
      description_zh: '参与社群活动。',
      description_en: 'Join community activities.',
      color: '#E9C979',
    },
    {
      slug: 'adult-support',
      name_zh: '成人支持团队',
      name_en: 'Adult Support Team',
      description_zh: '连接并支持伙伴。',
      description_en: 'Connect and support people.',
      color: '#72B18A',
    },
    {
      slug: 'parent-guardian',
      name_zh: '家长守护团',
      name_en: 'Parent Guardian Circle',
      description_zh: '共同守护成长。',
      description_en: 'Care for growth together.',
      color: '#8BB5C8',
    },
  ],
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/services/auth', () => authMocks);

vi.mock('@/services/community-identities', () => identityMocks);

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
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    authMocks.requestPasswordReset.mockResolvedValue({});
    authMocks.sendEmailOtp.mockResolvedValue({});
    authMocks.sendMagicLink.mockResolvedValue({});
    authMocks.signInWithIdentifier.mockResolvedValue({});
    authMocks.signUp.mockResolvedValue({ session: null });
    authMocks.verifyEmailOtp.mockResolvedValue({ session: {} });
    identityMocks.listSignupIdentityOptions.mockResolvedValue(identityOptions);
  });

  it('starts with a focused password sign-in form', () => {
    renderAuth();

    expect(screen.getByRole('heading', { name: '欢迎回来' })).toBeInTheDocument();
    expect(screen.getByLabelText('用户名或邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: '进入社群' })).toBeInTheDocument();
  });

  it('keeps identity and age steps before registration credentials', async () => {
    renderAuth();

    fireEvent.click(screen.getByRole('tab', { name: '注册' }));

    expect(await screen.findByRole('heading', { name: '你从哪里加入？' })).toBeInTheDocument();
    expect(screen.queryByLabelText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('密码')).not.toBeInTheDocument();

    const identityButton = screen.getByRole('button', { name: '确认身份，继续' });
    expect(identityButton).toBeDisabled();
    expect(screen.queryByText('阿柑少年发起人')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /青年共创伙伴/ }));
    expect(identityButton).toBeEnabled();
    fireEvent.click(identityButton);

    expect(screen.getByRole('heading', { name: '再确认年龄范围' })).toBeInTheDocument();
    const continueButton = screen.getByRole('button', { name: '继续创建账号' });
    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: '14-17 岁' }));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);

    expect(screen.getByRole('heading', { name: '建立你的账号' })).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('确认新密码')).toHaveAttribute('autocomplete', 'new-password');

    fireEvent.click(screen.getByRole('button', { name: '修改' }));
    expect(screen.getByRole('heading', { name: '再确认年龄范围' })).toBeInTheDocument();
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

  it('sends and verifies an email code', async () => {
    renderAuth();

    fireEvent.click(screen.getByRole('button', { name: '使用邮箱验证码' }));
    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'member@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '发送验证码' }));

    expect(await screen.findByRole('heading', { name: '输入邮箱验证码' })).toBeInTheDocument();
    expect(authMocks.sendEmailOtp).toHaveBeenCalledWith('member@example.com');
    expect(screen.getByRole('button', { name: '60 秒后可重新发送' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('6 位邮箱验证码'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: '验证并登录' }));

    await waitFor(() => {
      expect(authMocks.verifyEmailOtp).toHaveBeenCalledWith('member@example.com', '123456');
    });
  });

  it('offers link and code confirmation after registration', async () => {
    renderAuth();

    fireEvent.click(screen.getByRole('tab', { name: '注册' }));
    fireEvent.click(await screen.findByRole('radio', { name: /青年共创伙伴/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: '家长守护团' }));
    fireEvent.click(screen.getByRole('button', { name: '确认身份，继续' }));
    fireEvent.click(screen.getByRole('radio', { name: '已满 18 岁' }));
    fireEvent.click(screen.getByRole('button', { name: '继续创建账号' }));
    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
    expect(screen.getByRole('button', { name: '注册账号' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '注册账号' }));

    expect(await screen.findByRole('heading', { name: '确认你的邮箱' })).toBeInTheDocument();
    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      ageBand: 'adult_18_plus',
      primaryIdentitySlug: 'youth-co-creator',
      secondaryIdentitySlugs: ['parent-guardian'],
    });
    expect(screen.getByLabelText('6 位邮箱验证码')).toBeInTheDocument();
    expect(screen.getByText(/确认链接/)).toBeInTheDocument();
  });
});
