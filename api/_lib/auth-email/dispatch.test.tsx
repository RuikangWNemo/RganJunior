import { describe, expect, it } from 'vitest';

import { parseAuthEmailPayload, type AuthEmailAction } from './schema.js';
import { buildAuthEmailDeliveries } from './dispatch.js';

const runtime = {
  canonicalSiteUrl: 'https://www.rganjunior.org',
  previewOrigins: [],
  production: true,
  supabaseUrl: 'https://project-ref.supabase.co',
};

function payload(action: AuthEmailAction) {
  return parseAuthEmailPayload({
    user: {
      id: 'user-1',
      email: 'current@example.com',
      new_email: 'new@example.com',
      phone: '+8613800000000',
      app_metadata: { locale: 'zh-CN' },
      user_metadata: {},
    },
    email_data: {
      token: '111111',
      token_hash: 'hash-for-new-email',
      redirect_to: 'https://www.rganjunior.org/community/auth/callback',
      email_action_type: action,
      site_url: 'https://www.rganjunior.org',
      token_new: '222222',
      token_hash_new: 'hash-for-current-email',
      old_email: 'old@example.com',
      old_phone: '+8613900000000',
      provider: 'github',
      factor_type: 'totp',
    },
  });
}

describe('auth email action dispatch', () => {
  const cases: Array<[AuthEmailAction, string]> = [
    ['signup', '欢迎来到阿柑少年'],
    ['invite', '邀请你加入阿柑少年'],
    ['magiclink', '登录阿柑少年'],
    ['recovery', '重新设置你的阿柑少年密码'],
    ['email', '你的阿柑少年登录验证码'],
    ['reauthentication', '你的阿柑少年安全验证码'],
    ['password_changed_notification', '你的阿柑少年密码已更改'],
    ['email_changed_notification', '你的阿柑少年邮箱已更改'],
    ['phone_changed_notification', '你的阿柑少年手机号已更改'],
    ['identity_linked_notification', '阿柑少年账号新增了登录方式'],
    ['identity_unlinked_notification', '阿柑少年账号移除了登录方式'],
    ['mfa_factor_enrolled_notification', '阿柑少年账号新增了验证方式'],
    ['mfa_factor_unenrolled_notification', '阿柑少年账号移除了验证方式'],
  ];

  it.each(cases)('maps %s to a server-controlled subject', async (action, subject) => {
    const deliveries = await buildAuthEmailDeliveries(payload(action), runtime, 'hook-1');
    expect(deliveries).toHaveLength(1);
    expect(deliveries[0].subject).toBe(subject);
    expect(deliveries[0].to).toBe('current@example.com');
  });

  it('maps Secure Email Change fields exactly as documented by Supabase', async () => {
    const deliveries = await buildAuthEmailDeliveries(payload('email_change'), runtime, 'hook-email-change');

    expect(deliveries).toHaveLength(2);
    const current = deliveries.find((delivery) => delivery.recipientRole === 'current');
    const next = deliveries.find((delivery) => delivery.recipientRole === 'new');

    expect(current?.to).toBe('current@example.com');
    expect(current?.text).toContain('111 111');
    expect(current?.html).toContain('hash-for-current-email');
    expect(current?.html).not.toContain('hash-for-new-email');

    expect(next?.to).toBe('new@example.com');
    expect(next?.text).toContain('222 222');
    expect(next?.html).toContain('hash-for-new-email');
    expect(next?.html).not.toContain('hash-for-current-email');
  });

  it('sends only to the new address when Secure Email Change is disabled', async () => {
    const input = payload('email_change');
    input.email_data.token_new = '';
    input.email_data.token_hash_new = '';
    const deliveries = await buildAuthEmailDeliveries(input, runtime, 'hook-email-change-single');

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0].to).toBe('new@example.com');
    expect(deliveries[0].text).toContain('111 111');
    expect(deliveries[0].html).toContain('hash-for-new-email');
  });

  it('uses deterministic idempotency keys without tokens or recipients', async () => {
    const first = await buildAuthEmailDeliveries(payload('signup'), runtime, 'hook-stable');
    const second = await buildAuthEmailDeliveries(payload('signup'), runtime, 'hook-stable');

    expect(first[0].idempotencyKey).toBe(second[0].idempotencyKey);
    expect(first[0].idempotencyKey).not.toMatch(/111111|current@example/i);
  });
});
