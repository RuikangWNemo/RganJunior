import { ApiAuthError, requirePermission } from '../_lib/auth.js';
import {
  CommunitySecurityError,
  decryptSensitive,
} from '../_lib/community-security.js';
import {
  compactString,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http.js';
import { createSecretSupabaseClient } from '../_lib/supabase.js';

const verificationMethods = new Set([
  'manual_phone',
  'manual_email',
  'manual_video',
  'manual_in_person',
  'trusted_offline_relationship',
  'other',
]);

function applicationIdFrom(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function errorStatus(code: string): number {
  if (code === 'PERMISSION_DENIED') return 403;
  if (code.includes('NOT_FOUND') || code === 'GUARDIAN_REQUEST_REQUIRED') return 404;
  if (code === 'GUARDIAN_LEGAL_DOCUMENT_NOT_ACTIVE') return 409;
  if (code.includes('STATE_CONFLICT') || code === 'GUARDIAN_REQUEST_NOT_PENDING') return 409;
  if (code === 'COMMUNITY_SECURITY_NOT_CONFIGURED') return 503;
  if (
    code.includes('REQUIRED')
    || code.startsWith('INVALID_')
    || code.endsWith('_TOO_LONG')
  ) return 400;
  return 502;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const { user } = await requirePermission(request, 'memberships.review_sensitive');
    const body = await readJsonBody(request);
    const action = compactString(body.action, 20);
    const applicationId = applicationIdFrom(body.applicationId);
    if (!applicationId || !['read', 'confirm', 'decline'].includes(action)) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_MANUAL_REVIEW_REQUEST' });
    }

    const secretClient = createSecretSupabaseClient();
    if (action === 'read') {
      const { data, error } = await secretClient.rpc('get_manual_guardian_review_server', {
        target_application_id: applicationId,
        target_actor_user_id: user.id,
      });
      if (error) throw error;
      const review = data?.[0];
      if (!review) {
        return sendJson(response, 404, { ok: false, code: 'GUARDIAN_REQUEST_NOT_FOUND' });
      }
      return sendJson(response, 200, {
        ok: true,
        review: {
          applicationId,
          requestId: review.request_id,
          requestStatus: review.request_status,
          guardianName: review.guardian_name,
          guardianRelationship: review.guardian_relationship,
          contactChannel: review.contact_channel,
          contact: decryptSensitive(review.contact_ciphertext),
          contactLast4: review.contact_last4,
          legalDocument: {
            id: review.legal_document_id,
            key: review.document_key,
            version: review.document_version,
            locale: review.document_locale,
            title: review.document_title,
            status: review.document_status,
            effectiveAt: review.document_effective_at,
          },
          requestCreatedAt: review.request_created_at,
          consentedAt: review.consented_at,
          verificationMethod: review.verification_method,
          verificationBasis: review.verification_basis,
          reviewerNote: review.reviewer_note,
        },
      });
    }

    if (action === 'decline') {
      const reason = compactString(body.reason, 500);
      if (!reason) {
        return sendJson(response, 400, { ok: false, code: 'DECLINE_REASON_REQUIRED' });
      }
      const { error } = await secretClient.rpc(
        'decline_manual_guardian_confirmation_server',
        {
          target_application_id: applicationId,
          target_actor_user_id: user.id,
          target_reason: reason,
        },
      );
      if (error) throw error;
      return sendJson(response, 200, { ok: true, status: 'declined' });
    }

    const verificationMethod = compactString(body.verificationMethod, 64);
    const verificationBasis = compactString(body.verificationBasis, 500);
    const reviewerNote = compactString(body.reviewerNote, 1000) || undefined;
    const confirmedAt = typeof body.confirmedAt === 'string'
      ? new Date(body.confirmedAt)
      : new Date(Number.NaN);
    if (
      !verificationMethods.has(verificationMethod)
      || !verificationBasis
      || Number.isNaN(confirmedAt.getTime())
      || body.affirmedGuardianship !== true
      || body.affirmedNoticeRead !== true
      || body.affirmedJoining !== true
    ) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_MANUAL_CONFIRMATION' });
    }

    const { data: consentId, error } = await secretClient.rpc(
      'record_manual_guardian_confirmation_server',
      {
        target_application_id: applicationId,
        target_actor_user_id: user.id,
        target_verification_method: verificationMethod,
        target_confirmed_at: confirmedAt.toISOString(),
        affirmed_guardianship: true,
        affirmed_notice_read: true,
        affirmed_joining: true,
        target_verification_basis: verificationBasis,
        target_reviewer_note: reviewerNote,
      },
    );
    if (error || !consentId) throw error || new Error('MANUAL_CONFIRMATION_NOT_RECORDED');
    return sendJson(response, 200, { ok: true, status: 'verified', consentId });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return sendJson(response, error.statusCode, { ok: false, code: error.code });
    }
    const code = error instanceof CommunitySecurityError
      ? error.code
      : error instanceof Error
        ? error.message
        : 'MANUAL_GUARDIAN_REVIEW_FAILED';
    console.error('manual Guardian review failed', code);
    return sendJson(response, errorStatus(code), { ok: false, code });
  }
}
