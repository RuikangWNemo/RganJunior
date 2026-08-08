import {
  consumeRateLimit,
  createConsentToken,
  encryptSensitive,
  keyedHash,
  lastDigits,
  sha256Hex,
} from '../_lib/community-security.js';
import { ApiAuthError, requireUser } from '../_lib/auth.js';
import { assertGuardianInviteProviderConfigured, sendGuardianInvite } from '../_lib/guardian-otp-provider.js';
import {
  compactString,
  readJsonBody,
  requestIp,
  requestOrigin,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http.js';
import { createSecretSupabaseClient } from '../_lib/supabase.js';

function isValidContact(channel: string, contact: string) {
  if (channel === 'email') return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
  if (channel === 'phone') return /^\+?[0-9\s()-]{7,24}$/.test(contact);
  return false;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const { user, supabase } = await requireUser(request);
    const body = await readJsonBody(request);
    const guardianName = compactString(body.guardianName, 120);
    const relationship = compactString(body.relationship, 80);
    const channel = compactString(body.contactChannel, 10);
    const contact = compactString(body.contact, 180).toLowerCase();
    const language = body.language === 'en' ? 'en' : 'zh';
    const applicationId = typeof body.applicationId === 'number' && Number.isInteger(body.applicationId)
      ? body.applicationId
      : null;

    if (!guardianName || !relationship || !isValidContact(channel, contact)) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_GUARDIAN_DETAILS' });
    }
    assertGuardianInviteProviderConfigured();

    const { data: state, error: stateError } = await supabase.rpc('get_my_guardian_consent_state');
    if (stateError || !state?.[0] || state[0].age_band === 'adult_18_plus') {
      return sendJson(response, 400, { ok: false, code: 'MINOR_ACCOUNT_REQUIRED' });
    }

    const secretClient = createSecretSupabaseClient();
    const [ipLimit, userLimit, contactLimit] = await Promise.all([
      consumeRateLimit(secretClient, 'guardian-invite-ip', requestIp(request), {
        maxAttempts: 12, windowSeconds: 3600, blockSeconds: 3600,
      }),
      consumeRateLimit(secretClient, 'guardian-invite-user', user.id, {
        maxAttempts: 5, windowSeconds: 86400, blockSeconds: 86400,
      }),
      consumeRateLimit(secretClient, 'guardian-invite-contact', contact, {
        maxAttempts: 5, windowSeconds: 86400, blockSeconds: 86400,
      }),
    ]);
    if (!ipLimit.allowed || !userLimit.allowed || !contactLimit.allowed) {
      return sendJson(response, 429, { ok: false, code: 'GUARDIAN_INVITE_RATE_LIMITED' });
    }

    const nowIso = new Date().toISOString();
    const { data: legalDocument, error: documentError } = await secretClient
      .from('legal_documents')
      .select('id')
      .eq('document_type', 'guardian_informed_consent')
      .eq('status', 'active')
      .lte('effective_at', nowIso)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (documentError) throw documentError;
    if (!legalDocument) {
      return sendJson(response, 503, {
        ok: false,
        code: 'GUARDIAN_LEGAL_DOCUMENT_NOT_ACTIVE',
        message: '监护人知情协议仍在审核，暂时不能发送确认邀请。',
      });
    }

    const token = createConsentToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data: requestId, error: requestError } = await secretClient.rpc(
      'create_guardian_consent_request_server',
      {
        target_minor_user_id: user.id,
        target_application_id: applicationId as number,
        target_guardian_name: guardianName,
        target_guardian_relationship: relationship,
        target_contact_channel: channel,
        target_contact_ciphertext: encryptSensitive(contact),
        target_contact_lookup_hash: keyedHash(`guardian-contact:${contact}`),
        target_contact_last4: lastDigits(contact),
        target_legal_document_id: legalDocument.id,
        target_token_hash: sha256Hex(token),
        target_expires_at: expiresAt,
      },
    );
    if (requestError || !requestId) throw requestError || new Error('Consent request was not created.');

    const confirmationUrl = `${requestOrigin(request)}/community/guardian-consent?token=${encodeURIComponent(token)}`;
    await sendGuardianInvite({
      channel: channel as 'email' | 'phone',
      contact,
      guardianName,
      confirmationUrl,
      language,
    });

    return sendJson(response, 200, { ok: true, requestId, expiresAt });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return sendJson(response, error.statusCode, { ok: false, code: error.code });
    }
    const code = error instanceof Error && 'code' in error
      ? String((error as Error & { code: unknown }).code)
      : 'GUARDIAN_INVITE_FAILED';
    console.error('guardian consent request failed', error instanceof Error ? error.message : error);
    return sendJson(response, code.includes('NOT_CONFIGURED') ? 503 : 502, { ok: false, code });
  }
}
