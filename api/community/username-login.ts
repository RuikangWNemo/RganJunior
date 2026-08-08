import { setTimeout as delay } from 'node:timers/promises';

import { consumeRateLimit } from '../_lib/community-security.js';
import { compactString, readJsonBody, requestIp, sendJson, type ApiRequest, type ApiResponse } from '../_lib/http.js';
import { createPublicAuthSupabaseClient, createSecretSupabaseClient } from '../_lib/supabase.js';

const GENERIC_AUTH_ERROR = {
  ok: false,
  code: 'INVALID_LOGIN',
  message: '用户名、邮箱或密码不正确。',
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(request);
  } catch {
    return sendJson(response, 400, { ok: false, code: 'INVALID_JSON' });
  }

  const identifier = compactString(body.identifier, 128).toLowerCase();
  const password = typeof body.password === 'string' ? body.password.slice(0, 512) : '';
  if (!identifier || !password) return sendJson(response, 401, GENERIC_AUTH_ERROR);

  try {
    const secretClient = createSecretSupabaseClient();
    const ip = requestIp(request);
    const [ipLimit, identifierLimit] = await Promise.all([
      consumeRateLimit(secretClient, 'username-login-ip', ip, {
        maxAttempts: 20,
        windowSeconds: 15 * 60,
        blockSeconds: 30 * 60,
      }),
      consumeRateLimit(secretClient, 'username-login-identifier', identifier, {
        maxAttempts: 8,
        windowSeconds: 15 * 60,
        blockSeconds: 30 * 60,
      }),
    ]);
    if (!ipLimit.allowed || !identifierLimit.allowed) {
      const retryAfter = Math.max(ipLimit.retry_after_seconds, identifierLimit.retry_after_seconds, 1);
      response.setHeader('Retry-After', String(retryAfter));
      return sendJson(response, 429, { ok: false, code: 'LOGIN_RATE_LIMITED', retryAfter });
    }

    const { data: resolvedEmail, error: resolveError } = await secretClient.rpc(
      'resolve_login_email_server',
      { login_identifier: identifier },
    );
    if (resolveError) throw resolveError;
    if (!resolvedEmail) {
      await delay(180);
      return sendJson(response, 401, GENERIC_AUTH_ERROR);
    }

    const authClient = createPublicAuthSupabaseClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });
    if (error || !data.session || !data.user) {
      return sendJson(response, 401, GENERIC_AUTH_ERROR);
    }

    return sendJson(response, 200, {
      ok: true,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('username-login failed', error instanceof Error ? error.message : error);
    return sendJson(response, 503, {
      ok: false,
      code: 'COMMUNITY_AUTH_UNAVAILABLE',
      message: '登录服务暂时不可用，请稍后再试。',
    });
  }
}
