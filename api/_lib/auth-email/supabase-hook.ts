import { Webhook } from 'standardwebhooks';

export class HookSignatureError extends Error {
  constructor(message = 'Invalid Supabase Send Email Hook signature') {
    super(message);
    this.name = 'HookSignatureError';
  }
}

export function normalizeSupabaseHookSecret(secret: string): string {
  let normalized = secret.trim();
  if (normalized.startsWith('v1,')) normalized = normalized.slice(3);
  if (normalized.startsWith('whsec_')) normalized = normalized.slice('whsec_'.length);
  if (!normalized) throw new HookSignatureError('Supabase Send Email Hook secret is empty');
  return normalized;
}

function lowerCaseHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
  );
}

export function verifySupabaseHook(
  rawBody: string,
  headers: Record<string, string>,
  configuredSecret: string,
): { payload: unknown; webhookId: string } {
  const normalizedHeaders = lowerCaseHeaders(headers);
  const webhookId = normalizedHeaders['webhook-id'];
  try {
    const verifier = new Webhook(normalizeSupabaseHookSecret(configuredSecret));
    const payload = verifier.verify(rawBody, normalizedHeaders);
    if (!webhookId) throw new Error('missing webhook id');
    return { payload, webhookId };
  } catch {
    throw new HookSignatureError();
  }
}
