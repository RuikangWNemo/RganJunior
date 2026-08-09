import { describe, expect, it, vi } from 'vitest';
import { Webhook } from 'standardwebhooks';

import {
  handleSendEmailRequest,
  type AuthEmailProviderResult,
  type AuthEmailRequestDependencies,
} from '../../api/auth/send-email.js';

const signingSecret = Buffer.alloc(32, 9).toString('base64');
const hookSecret = `v1,whsec_${signingSecret}`;
const config = {
  canonicalSiteUrl: 'https://www.rganjunior.org',
  from: '阿柑少年 <no-reply@auth.rganjunior.org>',
  hookSecret,
  previewOrigins: [],
  production: true,
  resendApiKey: 're_test_only',
  supabaseUrl: 'https://project-ref.supabase.co',
};

function payload() {
  return {
    user: {
      id: 'user-1',
      email: 'person@example.com',
      app_metadata: {},
      user_metadata: {},
    },
    email_data: {
      token: '123456',
      token_hash: 'token-hash',
      redirect_to: 'https://www.rganjunior.org/community/auth/callback',
      email_action_type: 'signup',
      site_url: 'https://www.rganjunior.org',
    },
  };
}

function signedRequest(body: string, method = 'POST') {
  const timestamp = new Date();
  const webhookId = 'hook-endpoint-test';
  const webhook = new Webhook(signingSecret);
  return new Request('https://www.rganjunior.org/api/auth/send-email', {
    body: method === 'POST' ? body : undefined,
    headers: {
      'content-type': 'application/json',
      'webhook-id': webhookId,
      'webhook-signature': webhook.sign(webhookId, timestamp, body),
      'webhook-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
    },
    method,
  });
}

function dependencies(send = vi.fn().mockResolvedValue({ id: 'resend-message-1' })) {
  return {
    config,
    send,
  } satisfies AuthEmailRequestDependencies;
}

describe('POST /api/auth/send-email', () => {
  it('rejects methods other than POST', async () => {
    const response = await handleSendEmailRequest(signedRequest('', 'GET'), dependencies());
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });

  it('returns 401 for missing or invalid signatures', async () => {
    const request = new Request('https://www.rganjunior.org/api/auth/send-email', {
      body: JSON.stringify(payload()),
      method: 'POST',
    });
    const response = await handleSendEmailRequest(request, dependencies());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { http_code: 401, message: 'Invalid webhook signature.' },
    });
  });

  it('sends verified server-rendered deliveries and returns an empty object', async () => {
    const send = vi.fn().mockResolvedValue({ id: 'resend-message-1' });
    const body = JSON.stringify(payload());
    const response = await handleSendEmailRequest(signedRequest(body), dependencies(send));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      from: config.from,
      subject: '欢迎来到阿柑少年',
      to: 'person@example.com',
    }));
  });

  it('propagates provider failure instead of returning a false success', async () => {
    const send = vi.fn().mockRejectedValue(new Error('provider rejected'));
    const body = JSON.stringify(payload());
    const response = await handleSendEmailRequest(signedRequest(body), dependencies(send));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: { http_code: 502, message: 'Authentication email delivery failed.' },
    });
  });

  it('fails within the hook deadline when the provider never responds', async () => {
    vi.useFakeTimers();
    try {
      const send = vi.fn(() => new Promise<AuthEmailProviderResult>(() => undefined));
      const body = JSON.stringify(payload());
      const responsePromise = handleSendEmailRequest(signedRequest(body), dependencies(send));
      await Promise.resolve();
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(3_501);
      const response = await responsePromise;

      expect(response.status).toBe(502);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects an unknown action without calling the provider', async () => {
    const send = vi.fn();
    const input = payload();
    input.email_data.email_action_type = 'future_action';
    const body = JSON.stringify(input);
    const response = await handleSendEmailRequest(signedRequest(body), dependencies(send));

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });
});
