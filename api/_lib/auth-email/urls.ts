import type { AuthEmailAction } from './schema.js';

export type AuthEmailUrlRuntime = {
  canonicalSiteUrl: string;
  previewOrigins?: string[];
  production: boolean;
  supabaseUrl: string;
};

const PRODUCTION_ORIGINS = new Set([
  'https://rganjunior.org',
  'https://www.rganjunior.org',
]);

function canonicalFallback(runtime: AuthEmailUrlRuntime): string {
  return new URL(runtime.canonicalSiteUrl).origin;
}

export function sanitizeAuthRedirect(
  candidate: string,
  runtime: AuthEmailUrlRuntime,
): string {
  const fallback = canonicalFallback(runtime);
  try {
    const url = new URL(candidate);
    const allowedOrigins = new Set(PRODUCTION_ORIGINS);
    allowedOrigins.add(fallback);
    if (!runtime.production) {
      for (const previewOrigin of runtime.previewOrigins ?? []) {
        allowedOrigins.add(new URL(previewOrigin).origin);
      }
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        allowedOrigins.add(url.origin);
      }
    }
    if (!allowedOrigins.has(url.origin)) return fallback;
    if (runtime.production && url.protocol !== 'https:') return fallback;
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export function buildConfirmationUrl(
  input: {
    action: AuthEmailAction;
    redirectTo: string;
    tokenHash: string;
  },
  runtime: AuthEmailUrlRuntime,
): string {
  const confirmationUrl = new URL('/auth/v1/verify', runtime.supabaseUrl);
  confirmationUrl.searchParams.set('token', input.tokenHash);
  confirmationUrl.searchParams.set('type', input.action);
  confirmationUrl.searchParams.set(
    'redirect_to',
    sanitizeAuthRedirect(input.redirectTo, runtime),
  );
  return confirmationUrl.toString();
}
