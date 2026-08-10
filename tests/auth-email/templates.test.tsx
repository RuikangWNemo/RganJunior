import { render } from '@react-email/components';
import { describe, expect, it } from 'vitest';

import EmailChangeEmail from '../../api/_lib/auth-email/emails/auth/EmailChangeEmail.js';
import InviteEmail from '../../api/_lib/auth-email/emails/auth/InviteEmail.js';
import MagicLinkEmail from '../../api/_lib/auth-email/emails/auth/MagicLinkEmail.js';
import PasswordResetEmail from '../../api/_lib/auth-email/emails/auth/PasswordResetEmail.js';
import ReauthenticationEmail from '../../api/_lib/auth-email/emails/auth/ReauthenticationEmail.js';
import SecurityNotificationEmail from '../../api/_lib/auth-email/emails/auth/SecurityNotificationEmail.js';
import SignInCodeEmail from '../../api/_lib/auth-email/emails/auth/SignInCodeEmail.js';
import SignupEmail from '../../api/_lib/auth-email/emails/auth/SignupEmail.js';

const confirmationUrl = 'https://project-ref.supabase.co/auth/v1/verify?token=hash&type=signup';

async function rendered(node: React.ReactNode) {
  return {
    html: await render(node),
    text: await render(node, { plainText: true }),
  };
}

describe('branded auth email templates', () => {
  it('renders a Chinese signup email with logo, CTA and copyable code', async () => {
    const result = await rendered(<SignupEmail
      confirmationUrl={confirmationUrl}
      locale="zh-CN"
      token="482913"
    />);

    expect(result.html).toContain('欢迎来到阿柑少年');
    expect(result.html).toContain('确认邮箱');
    expect(result.html).toContain('482 913');
    expect(result.html).toContain('阿柑少年官方标志');
    expect(result.html).toContain('/brand/rgan-junior-email-logo.png');
    expect(result.text).toContain('482 913');
  });

  it('renders English sign-in and Magic Link variants', async () => {
    const signIn = await rendered(<SignInCodeEmail
      confirmationUrl={confirmationUrl}
      locale="en"
      token="123456"
    />);
    const magic = await rendered(<MagicLinkEmail
      confirmationUrl={confirmationUrl}
      locale="en"
      token="123456"
    />);

    expect(signIn.text).toMatch(/Your R-Gan Junior sign-in code/i);
    expect(signIn.text).toContain('123 456');
    expect(magic.text).toContain('Sign in to R-Gan Junior');
    expect(magic.text).toContain('123 456');
  });

  it('renders recovery and invite with one clear action', async () => {
    const recovery = await rendered(<PasswordResetEmail confirmationUrl={confirmationUrl} locale="zh-CN" />);
    const invite = await rendered(<InviteEmail confirmationUrl={confirmationUrl} locale="zh-CN" />);

    expect(recovery.text).toContain('重新设置密码');
    expect(invite.text).toContain('接受邀请');
    expect(recovery.text).not.toMatch(/旧密码|old password/i);
  });

  it('distinguishes current and new address confirmations', async () => {
    const current = await rendered(<EmailChangeEmail
      confirmationUrl={confirmationUrl}
      locale="zh-CN"
      newEmail="next@example.com"
      recipientRole="current"
      token="111111"
    />);
    const next = await rendered(<EmailChangeEmail
      confirmationUrl={confirmationUrl}
      locale="zh-CN"
      newEmail="next@example.com"
      recipientRole="new"
      token="222222"
    />);

    expect(current.text).toContain('当前邮箱');
    expect(current.text).toContain('111 111');
    expect(next.text).toContain('新邮箱');
    expect(next.text).toContain('222 222');
  });

  it('supports an eight-digit reauthentication code', async () => {
    const result = await rendered(<ReauthenticationEmail locale="en" token="12345678" />);
    expect(result.text).toContain('1234 5678');
  });

  it('renders security notifications without an auth token or CTA', async () => {
    const result = await rendered(<SecurityNotificationEmail
      detail="email"
      locale="en"
      oldValue="old@example.com"
      value="new@example.com"
    />);

    expect(result.text).toMatch(/Your email address was changed/i);
    expect(result.text).toContain('old@example.com');
    expect(result.html).not.toContain('auth/v1/verify');
  });

  it('does not add tracking pixels, videos or GIFs', async () => {
    const result = await rendered(<SignupEmail
      confirmationUrl={confirmationUrl}
      locale="zh-CN"
      token="482913"
    />);

    expect(result.html).not.toMatch(/tracking|<video|\.gif/i);
  });
});
