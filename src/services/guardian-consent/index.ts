import { getSupabaseClient } from '@/lib/supabase/client';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';

async function postJson<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const result = await response.json() as T & { code?: string; message?: string };
  if (!response.ok) {
    throw new BackendServiceError(
      result.code || 'GUARDIAN_REQUEST_FAILED',
      result.message || 'Guardian request failed.',
      response.status,
    );
  }
  return result;
}

export async function getMyGuardianConsentState() {
  const { data, error } = await getSupabaseClient().rpc('get_my_guardian_consent_state');
  throwIfSupabaseError(error, 'GUARDIAN_STATE_READ_FAILED');
  return data[0] ?? null;
}

export async function requestGuardianConsent(input: {
  applicationId?: number;
  guardianName: string;
  relationship: string;
  contactChannel: 'email' | 'phone';
  contact: string;
  language: 'zh' | 'en';
}) {
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');
  return postJson<{ ok: true; requestId: string; expiresAt: string }>(
    '/api/community/guardian-consent-request',
    input,
    data.session.access_token,
  );
}

export async function getGuardianConsentRequest(token: string) {
  const { data, error } = await getSupabaseClient().rpc('get_guardian_consent_request', {
    request_token: token,
  });
  throwIfSupabaseError(error, 'GUARDIAN_REQUEST_READ_FAILED');
  return data[0] ?? null;
}

export async function sendGuardianOtp(token: string, phone: string, language: 'zh' | 'en') {
  return postJson<{ ok: true; challengeId: string; phoneLast4: string; expiresAt: string }>(
    '/api/community/guardian-consent-otp',
    { token, phone, language },
  );
}

export async function verifyGuardianOtp(input: {
  token: string;
  challengeId: string;
  code: string;
  affirmedGuardianship: boolean;
  affirmedNoticeRead: boolean;
  affirmedJoining: boolean;
}) {
  return postJson<{ ok: true; status: 'verified' }>(
    '/api/community/guardian-consent-verify',
    input,
  );
}
