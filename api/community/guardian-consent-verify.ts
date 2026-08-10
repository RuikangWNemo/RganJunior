import { consumeRateLimit, keyedHash, otpHash, sha256Hex } from '../_lib/community-security.js';
import { compactString, readJsonBody, requestIp, sendJson, type ApiRequest, type ApiResponse } from '../_lib/http.js';
import { createSecretSupabaseClient } from '../_lib/supabase.js';

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = await readJsonBody(request);
    const token = compactString(body.token, 180);
    const challengeId = compactString(body.challengeId, 64);
    const code = compactString(body.code, 12);
    if (token.length < 32 || !/^[0-9a-f-]{36}$/.test(challengeId) || !/^\d{6}$/.test(code)) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_OTP_VERIFICATION' });
    }

    const secretClient = createSecretSupabaseClient();
    const [ipLimit, tokenLimit] = await Promise.all([
      consumeRateLimit(secretClient, 'guardian-verify-ip', requestIp(request), {
        maxAttempts: 30, windowSeconds: 3600, blockSeconds: 3600,
      }),
      consumeRateLimit(secretClient, 'guardian-verify-token', sha256Hex(token), {
        maxAttempts: 10, windowSeconds: 3600, blockSeconds: 3600,
      }),
    ]);
    if (!ipLimit.allowed || !tokenLimit.allowed) {
      return sendJson(response, 429, { ok: false, code: 'GUARDIAN_VERIFY_RATE_LIMITED' });
    }

    const { data: requestRows, error: requestError } = await secretClient.rpc(
      'get_guardian_consent_request',
      { request_token: token },
    );
    const consentRequest = requestRows?.[0];
    if (requestError || !consentRequest) {
      return sendJson(response, 410, { ok: false, code: 'CONSENT_REQUEST_NOT_AVAILABLE' });
    }

    const userAgent = Array.isArray(request.headers['user-agent'])
      ? request.headers['user-agent'][0]
      : request.headers['user-agent'] || 'unknown';
    const { data: verificationStatus, error: verifyError } = await secretClient.rpc(
      'verify_guardian_otp_server',
      {
        request_token: token,
        target_challenge_id: challengeId,
        submitted_otp_hash: otpHash(consentRequest.request_id, code),
        affirmed_guardianship: body.affirmedGuardianship === true,
        affirmed_notice_read: body.affirmedNoticeRead === true,
        affirmed_joining: body.affirmedJoining === true,
        target_ip_hash: keyedHash(`guardian-ip:${requestIp(request)}`),
        target_user_agent_hash: keyedHash(`guardian-user-agent:${userAgent}`),
      },
    );
    if (verifyError) throw verifyError;

    if (verificationStatus === 'verified') {
      return sendJson(response, 200, { ok: true, status: verificationStatus });
    }
    if (verificationStatus === 'locked') {
      return sendJson(response, 429, { ok: false, code: 'OTP_LOCKED' });
    }
    if (verificationStatus === 'expired') {
      return sendJson(response, 410, { ok: false, code: 'OTP_EXPIRED' });
    }
    if (verificationStatus === 'affirmations_required') {
      return sendJson(response, 400, { ok: false, code: 'AFFIRMATIONS_REQUIRED' });
    }
    return sendJson(response, 400, { ok: false, code: 'OTP_INVALID' });
  } catch (error) {
    console.error('guardian OTP verification failed', error instanceof Error ? error.message : error);
    return sendJson(response, 502, { ok: false, code: 'GUARDIAN_OTP_VERIFY_FAILED' });
  }
}
