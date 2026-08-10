import { afterEach, describe, expect, it, vi } from 'vitest';

import { logAuthEmailEvent, maskEmailAddress } from './logging.js';

describe('Auth email operational logging', () => {
  afterEach(() => vi.restoreAllMocks());

  it('masks recipient addresses', () => {
    expect(maskEmailAddress('ruikang@example.com')).toBe('ru***@example.com');
    expect(maskEmailAddress('a@example.com')).toBe('a***@example.com');
  });

  it('emits only explicitly sanitized fields', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logAuthEmailEvent({
      action: 'signup',
      durationMs: 120,
      outcome: 'sent',
      providerMessageId: 'resend-message-1',
      recipient: 'secret.person@example.com',
      webhookId: 'webhook-1',
    });

    const serialized = JSON.stringify(info.mock.calls);
    expect(serialized).toContain('se***@example.com');
    expect(serialized).not.toContain('secret.person@example.com');
    expect(serialized).not.toMatch(/token|otp|secret/i);
  });
});
