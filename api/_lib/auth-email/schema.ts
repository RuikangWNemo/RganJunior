import { z } from 'zod';

export const AUTH_EMAIL_ACTIONS = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
  'reauthentication',
  'password_changed_notification',
  'email_changed_notification',
  'phone_changed_notification',
  'identity_linked_notification',
  'identity_unlinked_notification',
  'mfa_factor_enrolled_notification',
  'mfa_factor_unenrolled_notification',
] as const;

export type AuthEmailAction = typeof AUTH_EMAIL_ACTIONS[number];
export type AuthEmailLocale = 'zh-CN' | 'en';

const metadataSchema = z.record(z.unknown()).default({});
const emailActionSchema = z.enum(AUTH_EMAIL_ACTIONS);

const authEmailPayloadSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    new_email: z.union([z.string().email(), z.literal('')]).optional().default(''),
    phone: z.string().optional().default(''),
    app_metadata: metadataSchema,
    user_metadata: metadataSchema,
  }).passthrough(),
  email_data: z.object({
    token: z.string().optional().default(''),
    token_hash: z.string().optional().default(''),
    redirect_to: z.string().optional().default(''),
    email_action_type: emailActionSchema,
    site_url: z.string().optional().default(''),
    token_new: z.string().optional().default(''),
    token_hash_new: z.string().optional().default(''),
    old_email: z.string().optional().default(''),
    old_phone: z.string().optional().default(''),
    provider: z.string().optional().default(''),
    factor_type: z.string().optional().default(''),
  }).passthrough(),
}).passthrough();

export type AuthEmailPayload = z.infer<typeof authEmailPayloadSchema>;

export class AuthEmailPayloadError extends Error {
  constructor(message = 'Invalid Supabase Send Email Hook payload') {
    super(message);
    this.name = 'AuthEmailPayloadError';
  }
}

export function parseAuthEmailPayload(value: unknown): AuthEmailPayload {
  const result = authEmailPayloadSchema.safeParse(value);
  if (!result.success) throw new AuthEmailPayloadError();
  return result.data;
}

function normalizeLocale(value: unknown): AuthEmailLocale | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
  if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-hans') return 'zh-CN';
  return null;
}

export function selectAuthEmailLocale(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown>,
): AuthEmailLocale {
  return normalizeLocale(appMetadata.locale)
    ?? normalizeLocale(userMetadata.locale)
    ?? 'zh-CN';
}
