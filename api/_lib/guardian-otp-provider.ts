export class GuardianProviderError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'GuardianProviderError';
    this.code = code;
  }
}

function providerConfig(kind: 'invite' | 'otp') {
  const prefix = kind === 'invite' ? 'GUARDIAN_INVITE' : 'GUARDIAN_OTP';
  const url = process.env[`${prefix}_WEBHOOK_URL`]?.trim();
  const secret = process.env[`${prefix}_WEBHOOK_SECRET`]?.trim();
  if (!url || !secret) {
    throw new GuardianProviderError(
      kind === 'invite'
        ? 'GUARDIAN_INVITE_PROVIDER_NOT_CONFIGURED'
        : 'GUARDIAN_OTP_NOT_CONFIGURED',
      `${prefix}_WEBHOOK_URL and ${prefix}_WEBHOOK_SECRET are required.`,
    );
  }
  return { url, secret };
}

async function postProvider(kind: 'invite' | 'otp', payload: Record<string, unknown>) {
  const config = providerConfig(kind);
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.secret}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new GuardianProviderError(
      kind === 'invite' ? 'GUARDIAN_INVITE_DELIVERY_FAILED' : 'GUARDIAN_OTP_DELIVERY_FAILED',
      `Guardian provider returned ${response.status}.`,
    );
  }

  const body = await response.json().catch(() => ({})) as { deliveryId?: unknown };
  return typeof body.deliveryId === 'string' ? body.deliveryId : null;
}

export async function sendGuardianInvite(input: {
  channel: 'email' | 'phone';
  contact: string;
  guardianName: string;
  confirmationUrl: string;
  language: 'zh' | 'en';
}) {
  return postProvider('invite', {
    template: 'rgan-guardian-community-invite',
    ...input,
  });
}

export async function sendGuardianOtp(input: {
  phone: string;
  code: string;
  language: 'zh' | 'en';
}) {
  return postProvider('otp', {
    template: 'rgan-guardian-community-otp',
    ...input,
  });
}

export function assertGuardianInviteProviderConfigured() {
  providerConfig('invite');
}

export function assertGuardianOtpProviderConfigured() {
  providerConfig('otp');
}
