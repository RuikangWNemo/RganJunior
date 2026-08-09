import type { EmailLocale } from './types.js';

export const AUTH_EMAIL_COPY = {
  'zh-CN': {
    brand: '阿柑少年',
    site: 'rganjunior.org',
    common: {
      codeLabel: '或者输入验证码：',
      expires: '验证码或链接将在一段时间后失效，请勿转发。',
      ignore: '如果不是你本人操作，可以忽略这封邮件。',
    },
    signup: {
      subject: '欢迎来到阿柑少年',
      preview: '确认邮箱，继续完成阿柑少年账号注册',
      title: '欢迎来到阿柑少年',
      body: '确认你的邮箱，就可以继续完成账号注册。',
      button: '确认邮箱',
    },
    signIn: {
      subject: '你的阿柑少年登录验证码',
      preview: (token: string) => `使用验证码 ${token} 登录阿柑少年`,
      title: '欢迎回来',
      body: '这是你的登录验证码：',
      button: '登录阿柑少年',
    },
    magicLink: {
      subject: '登录阿柑少年',
      preview: '使用一次性链接或验证码登录阿柑少年',
      title: '登录阿柑少年',
      body: '使用下面的一次性链接继续登录。',
      button: '登录阿柑少年',
    },
    recovery: {
      subject: '重新设置你的阿柑少年密码',
      preview: '安全地重新设置你的阿柑少年密码',
      title: '重新设置密码',
      body: '我们收到了重新设置密码的请求。',
      button: '重新设置密码',
    },
    invite: {
      subject: '邀请你加入阿柑少年',
      preview: '你收到了一封加入阿柑少年的邀请',
      title: '邀请你加入阿柑少年',
      body: '你收到了一封加入阿柑少年的邀请。',
      button: '接受邀请',
    },
    emailChange: {
      subject: '确认你的阿柑少年邮箱变更',
      currentPreview: '请在当前邮箱确认这次邮箱变更',
      currentTitle: '在当前邮箱确认变更',
      currentBody: (newEmail: string) => `有人申请将账号邮箱更改为 ${newEmail}。请先在当前邮箱确认。`,
      currentButton: '确认邮箱变更',
      newPreview: '请确认这是你的新邮箱',
      newTitle: '确认你的新邮箱',
      newBody: '请在新邮箱完成确认，以继续这次邮箱变更。',
      newButton: '确认新邮箱',
    },
    reauthentication: {
      subject: '你的阿柑少年安全验证码',
      preview: (token: string) => `使用安全验证码 ${token} 继续操作`,
      title: '确认是你本人',
      body: '请使用下面的验证码继续这项敏感操作。',
    },
    security: {
      password: {
        subject: '你的阿柑少年密码已更改',
        title: '密码已更改',
        body: '你的账号密码最近已被更改。',
      },
      email: {
        subject: '你的阿柑少年邮箱已更改',
        title: '邮箱地址已更改',
        body: '你的账号邮箱地址最近已被更改。',
      },
      phone: {
        subject: '你的阿柑少年手机号已更改',
        title: '手机号已更改',
        body: '你的账号手机号最近已被更改。',
      },
      identity_linked: {
        subject: '阿柑少年账号新增了登录方式',
        title: '新增登录方式',
        body: '你的账号最近关联了一种新的登录方式。',
      },
      identity_unlinked: {
        subject: '阿柑少年账号移除了登录方式',
        title: '移除登录方式',
        body: '你的账号最近移除了一种登录方式。',
      },
      mfa_enrolled: {
        subject: '阿柑少年账号新增了验证方式',
        title: '新增验证方式',
        body: '你的账号最近新增了一种安全验证方式。',
      },
      mfa_unenrolled: {
        subject: '阿柑少年账号移除了验证方式',
        title: '移除验证方式',
        body: '你的账号最近移除了一种安全验证方式。',
      },
      warning: '如果这不是你本人完成的操作，请尽快重设密码并联系我们。',
    },
  },
  en: {
    brand: 'R-Gan Junior',
    site: 'rganjunior.org',
    common: {
      codeLabel: 'Or enter this verification code:',
      expires: 'This code or link expires shortly. Do not forward it.',
      ignore: 'If you did not request this, you can safely ignore this email.',
    },
    signup: {
      subject: 'Welcome to R-Gan Junior',
      preview: 'Confirm your email to finish creating your R-Gan Junior account',
      title: 'Welcome to R-Gan Junior',
      body: 'Confirm your email to finish creating your account.',
      button: 'Confirm email',
    },
    signIn: {
      subject: 'Your R-Gan Junior sign-in code',
      preview: (token: string) => `Use ${token} to sign in to R-Gan Junior`,
      title: 'Your R-Gan Junior sign-in code',
      body: 'Use this verification code to sign in:',
      button: 'Sign in to R-Gan Junior',
    },
    magicLink: {
      subject: 'Sign in to R-Gan Junior',
      preview: 'Use a single-use link or code to sign in to R-Gan Junior',
      title: 'Sign in to R-Gan Junior',
      body: 'Use the single-use link below to continue signing in.',
      button: 'Sign in to R-Gan Junior',
    },
    recovery: {
      subject: 'Reset your R-Gan Junior password',
      preview: 'Securely reset your R-Gan Junior password',
      title: 'Reset your password',
      body: 'We received a request to reset your password.',
      button: 'Reset password',
    },
    invite: {
      subject: 'You are invited to join R-Gan Junior',
      preview: 'You received an invitation to join R-Gan Junior',
      title: 'You are invited to R-Gan Junior',
      body: 'You received an invitation to join R-Gan Junior.',
      button: 'Accept invitation',
    },
    emailChange: {
      subject: 'Confirm your R-Gan Junior email change',
      currentPreview: 'Confirm this email change from your current address',
      currentTitle: 'Confirm from your current email',
      currentBody: (newEmail: string) => `A request was made to change your account email to ${newEmail}. Confirm it from your current email first.`,
      currentButton: 'Confirm email change',
      newPreview: 'Confirm that this is your new email',
      newTitle: 'Confirm your new email',
      newBody: 'Confirm this new email address to continue the change.',
      newButton: 'Confirm new email',
    },
    reauthentication: {
      subject: 'Your R-Gan Junior security code',
      preview: (token: string) => `Use security code ${token} to continue`,
      title: 'Confirm it is you',
      body: 'Use the verification code below to continue this sensitive action.',
    },
    security: {
      password: {
        subject: 'Your R-Gan Junior password was changed',
        title: 'Your password was changed',
        body: 'The password for your account was recently changed.',
      },
      email: {
        subject: 'Your R-Gan Junior email was changed',
        title: 'Your email address was changed',
        body: 'The email address for your account was recently changed.',
      },
      phone: {
        subject: 'Your R-Gan Junior phone number was changed',
        title: 'Your phone number was changed',
        body: 'The phone number for your account was recently changed.',
      },
      identity_linked: {
        subject: 'A sign-in method was added to R-Gan Junior',
        title: 'A sign-in method was added',
        body: 'A new sign-in method was recently linked to your account.',
      },
      identity_unlinked: {
        subject: 'A sign-in method was removed from R-Gan Junior',
        title: 'A sign-in method was removed',
        body: 'A sign-in method was recently removed from your account.',
      },
      mfa_enrolled: {
        subject: 'A verification method was added to R-Gan Junior',
        title: 'A verification method was added',
        body: 'A new security verification method was recently added to your account.',
      },
      mfa_unenrolled: {
        subject: 'A verification method was removed from R-Gan Junior',
        title: 'A verification method was removed',
        body: 'A security verification method was recently removed from your account.',
      },
      warning: 'If you did not make this change, reset your password and contact us immediately.',
    },
  },
} as const;

export function emailCopy(locale: EmailLocale) {
  return AUTH_EMAIL_COPY[locale];
}
