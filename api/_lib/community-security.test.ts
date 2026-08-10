import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CommunitySecurityError,
  decryptSensitive,
  encryptSensitive,
} from './community-security.js';

describe('Guardian sensitive-data encryption', () => {
  beforeEach(() => {
    vi.stubEnv('GUARDIAN_DATA_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('round-trips an authenticated AES-GCM payload without plaintext storage', () => {
    const plaintext = '+8613800001234';
    const encrypted = encryptSensitive(plaintext);

    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptSensitive(encrypted)).toBe(plaintext);
  });

  it('rejects malformed or tampered encrypted payloads', () => {
    expect(() => decryptSensitive('not-encrypted')).toThrow(CommunitySecurityError);
    const encrypted = encryptSensitive('guardian@example.test');
    expect(() => decryptSensitive(`${encrypted}tampered`)).toThrow('could not be decrypted');
  });
});
