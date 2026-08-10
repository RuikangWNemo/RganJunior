import type { User } from '@supabase/supabase-js';

import { createUserScopedSupabaseClient } from './supabase.js';

type HeaderValue = string | string[] | undefined;

export type ApiRequestLike = {
  headers: Record<string, HeaderValue>;
};

export class ApiAuthError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'ApiAuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function bearerToken(request: ApiRequestLike): string {
  const raw = request.headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = value?.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new ApiAuthError(401, 'AUTH_REQUIRED', 'A bearer token is required.');
  return match[1];
}

export async function requireUser(request: ApiRequestLike) {
  const token = bearerToken(request);
  const supabase = createUserScopedSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiAuthError(401, 'INVALID_SESSION', 'The session is invalid or expired.');
  }
  return { token, supabase, user: data.user as User };
}

export async function requirePermission(request: ApiRequestLike, permissionKey: string) {
  const context = await requireUser(request);
  const { data, error } = await context.supabase.rpc('has_permission', {
    permission_key: permissionKey,
  });
  if (error || !data) {
    throw new ApiAuthError(403, 'PERMISSION_DENIED', `Missing permission: ${permissionKey}`);
  }
  return context;
}
