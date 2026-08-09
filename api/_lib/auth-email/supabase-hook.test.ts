import { describe, expect, it } from 'vitest';
import { Webhook } from 'standardwebhooks';

import {
  HookSignatureError,
  normalizeSupabaseHookSecret,
  verifySupabaseHook,
} from './supabase-hook.js';

const signingSecret = Buffer.alloc(32, 7).toString('base64');
const configuredSecret = `v1,whsec_${signingSecret}`;

function signedHeaders(payload: string) {
  const timestamp = new Date();
  const webhookId = 'msg_auth_email_test';
  const webhook = new Webhook(signingSecret);
  return {
    'webhook-id': webhookId,
    'webhook-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
    'webhook-signature': webhook.sign(webhookId, timestamp, payload),
  };
}

describe('Supabase Send Email Hook verification', () => {
  it('normalizes the current Supabase v1 secret format', () => {
    expect(normalizeSupabaseHookSecret(configuredSecret)).toBe(signingSecret);
    expect(normalizeSupabaseHookSecret(`whsec_${signingSecret}`)).toBe(signingSecret);
  });

  it('accepts a valid signed raw payload', () => {
    const rawBody = JSON.stringify({ user: { email: 'person@example.com' } });
    const result = verifySupabaseHook(rawBody, signedHeaders(rawBody), configuredSecret);

    expect(result.webhookId).toBe('msg_auth_email_test');
    expect(result.payload).toEqual({ user: { email: 'person@example.com' } });
  });

  it('rejects a missing signature', () => {
    expect(() => verifySupabaseHook('{}', {}, configuredSecret)).toThrow(HookSignatureError);
  });

  it('rejects an invalid signature', () => {
    const rawBody = '{}';
    const headers = signedHeaders(rawBody);
    headers['webhook-signature'] = 'v1,invalid';

    expect(() => verifySupabaseHook(rawBody, headers, configuredSecret)).toThrow(HookSignatureError);
  });

  it('rejects a modified payload', () => {
    const rawBody = JSON.stringify({ email_data: { token: '123456' } });

    expect(() => verifySupabaseHook(
      JSON.stringify({ email_data: { token: '654321' } }),
      signedHeaders(rawBody),
      configuredSecret,
    )).toThrow(HookSignatureError);
  });
});
