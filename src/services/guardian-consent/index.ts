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
  return postJson<{
    ok: true;
    requestId: string;
    expiresAt: string;
    mode: 'manual' | 'automated';
    delivery: 'staff_follow_up' | 'provider_invite';
  }>(
    '/api/community/guardian-consent-request',
    input,
    data.session.access_token,
  );
}

export type ManualGuardianReview = {
  applicationId: number;
  requestId: string;
  requestStatus: string;
  guardianName: string;
  guardianRelationship: string;
  contactChannel: 'email' | 'phone';
  contact: string;
  contactLast4: string;
  legalDocument: {
    id: number;
    key: string;
    version: number;
    locale: string;
    title: string;
    status: string;
    effectiveAt: string | null;
  };
  requestCreatedAt: string;
  consentedAt: string | null;
  verificationMethod: string | null;
  verificationBasis: string | null;
  reviewerNote: string | null;
};

async function postManualReview<T>(body: Record<string, unknown>): Promise<T> {
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');
  return postJson<T>(
    '/api/community/guardian-manual-review',
    body,
    data.session.access_token,
  );
}

export async function getManualGuardianReview(applicationId: number) {
  const result = await postManualReview<{ ok: true; review: ManualGuardianReview }>({
    action: 'read',
    applicationId,
  });
  return result.review;
}

export async function confirmManualGuardianReview(input: {
  applicationId: number;
  verificationMethod: string;
  confirmedAt: string;
  affirmedGuardianship: boolean;
  affirmedNoticeRead: boolean;
  affirmedJoining: boolean;
  verificationBasis: string;
  reviewerNote?: string;
}) {
  return postManualReview<{ ok: true; status: 'verified'; consentId: number }>({
    action: 'confirm',
    ...input,
  });
}

export async function declineManualGuardianReview(
  applicationId: number,
  reason: string,
) {
  return postManualReview<{ ok: true; status: 'declined' }>({
    action: 'decline',
    applicationId,
    reason,
  });
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
