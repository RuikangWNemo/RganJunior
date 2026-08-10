import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
} from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../src/lib/supabase/database.types.js';

type SecretClient = SupabaseClient<Database>;

export class CommunitySecurityError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CommunitySecurityError';
    this.code = code;
  }
}

function requireSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new CommunitySecurityError('COMMUNITY_SECURITY_NOT_CONFIGURED', `Missing ${name}.`);
  return value;
}

function encryptionKey(): Buffer {
  const key = Buffer.from(requireSecret('GUARDIAN_DATA_ENCRYPTION_KEY'), 'base64');
  if (key.length !== 32) {
    throw new CommunitySecurityError(
      'COMMUNITY_SECURITY_NOT_CONFIGURED',
      'GUARDIAN_DATA_ENCRYPTION_KEY must decode to 32 bytes.',
    );
  }
  return key;
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function keyedHash(value: string): string {
  return createHmac('sha256', requireSecret('GUARDIAN_HASH_SECRET'))
    .update(value, 'utf8')
    .digest('hex');
}

export function encryptSensitive(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptSensitive(value: string): string {
  const [version, ivText, tagText, ciphertextText, ...extra] = value.split('.');
  if (version !== 'v1' || !ivText || !tagText || !ciphertextText || extra.length) {
    throw new CommunitySecurityError(
      'INVALID_ENCRYPTED_PAYLOAD',
      'Encrypted Guardian data has an unsupported format.',
    );
  }
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      encryptionKey(),
      Buffer.from(ivText, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch (error) {
    if (error instanceof CommunitySecurityError) throw error;
    throw new CommunitySecurityError(
      'INVALID_ENCRYPTED_PAYLOAD',
      'Encrypted Guardian data could not be decrypted.',
    );
  }
}

export function createConsentToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function otpHash(requestId: string, challengeCode: string): string {
  return keyedHash(`guardian-otp:${requestId}:${challengeCode}`);
}

export function lastDigits(value: string, count = 4): string {
  const compact = value.replace(/\s+/g, '');
  return compact.slice(-count);
}

export async function consumeRateLimit(
  client: SecretClient,
  scope: string,
  rawKey: string,
  options: { maxAttempts: number; windowSeconds: number; blockSeconds: number },
) {
  const { data, error } = await client.rpc('consume_api_rate_limit_server', {
    target_scope: scope,
    target_key_hash: keyedHash(`rate-limit:${scope}:${rawKey}`),
    target_max_attempts: options.maxAttempts,
    target_window_seconds: options.windowSeconds,
    target_block_seconds: options.blockSeconds,
  });
  if (error || !data?.[0]) {
    throw new CommunitySecurityError('RATE_LIMIT_CHECK_FAILED', error?.message || 'Rate limit check failed.');
  }
  return data[0];
}
