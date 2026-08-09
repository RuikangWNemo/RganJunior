import { SITE_URL } from '@/lib/brand';

type AuthRedirectRuntime = {
  isProduction?: boolean;
  browserOrigin?: string;
};

export function buildAuthRedirectUrl(path: string, runtime: AuthRedirectRuntime = {}) {
  const isProduction = runtime.isProduction ?? import.meta.env.PROD;
  const origin = isProduction
    ? SITE_URL
    : runtime.browserOrigin ?? window.location.origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return new URL(normalizedPath, `${origin}/`).toString();
}
