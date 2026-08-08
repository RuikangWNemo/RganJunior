import {
  consumeRateLimit,
  createOtpCode,
  encryptSensitive,
  keyedHash,
  lastDigits,
  otpHash,
  sha256Hex,
} from '../_lib/community-security.js';
import { assertGuardianOtpProviderConfigured, sendGuardianOtp } from '../_lib/guardian-otp-provider.js';
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
    const phone = compactString(body.phone, 32);
    const language = body.language === 'en' ? 'en' : 'zh';
    if (token.length < 32 || !/^\+?[0-9\s()-]{7,24}$/.test(phone)) {
      return sendJson(response, 400, { ok: false, code: 'INVALID_OTP_REQUEST' });
    }
    assertGuardianOtpProviderConfigured();

    const secretClient = createSecretSupabaseClient();
    const [ipLimit, tokenLimit, phoneLimit] = await Promise.all([
      consumeRateLimit(secretClient, 'guardian-otp-ip', requestIp(request), {
        maxAttempts: 20, windowSeconds: 3600, blockSeconds: 3600,
      }),
      consumeRateLimit(secretClient, 'guardian-otp-token', sha256Hex(token), {
        maxAttempts: 5, windowSeconds: 86400, blockSeconds: 86400,
      }),
      consumeRateLimit(secretClient, 'guardian-otp-phone', phone, {
        maxAttempts: 8, windowSeconds: 86400, blockSeconds: 86400,
      }),
    ]);
    if (!ipLimit.allowed || !tokenLimit.allowed || !phoneLimit.allowed) {
      return sendJson(response, 429, { ok: false, code: 'GUARDIAN_OTP_RATE_LIMITED' });
    }

    const { data: requestRows, error: requestError } = await secretClient.rpc(
      'get_guardian_consent_request',
      { request_token: token },
    );
    const consentRequest = requestRows?.[0];
    if (requestError || !consentRequest || !consentRequest.otp_required) {
      return sendJson(response, 410, { ok: false, code: 'CONSENT_REQUEST_NOT_AVAILABLE' });
    }

    const code = createOtpCode();
    const deliveryId = await sendGuardianOtp({ phone, code, language });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { data: challengeId, error: challengeError } = await secretClient.rpc(
      'begin_guardian_otp_server',
      {
        request_token: token,
        target_otp_hash: otpHash(consentRequest.request_id, code),
        target_phone_ciphertext: encryptSensitive(phone),
        target_phone_lookup_hash: keyedHash(`guardian-phone:${phone}`),
        target_phone_last4: lastDigits(phone),
        target_provider_delivery_hash: (deliveryId
          ? keyedHash(`delivery:${deliveryId}`)
          : null) as string,
        target_expires_at: expiresAt,
      },
    );
    if (challengeError || !challengeId) throw challengeError || new Error('OTP challenge was not created.');
    return sendJson(response, 200, {
      ok: true,
      challengeId,
      phoneLast4: lastDigits(phone),
      expiresAt,
    });
  } catch (error) {
    const code = error instanceof Error && 'code' in error
      ? String((error as Error & { code: unknown }).code)
      : 'GUARDIAN_OTP_SEND_FAILED';
    console.error('guardian OTP send failed', error instanceof Error ? error.message : error);
    return sendJson(response, code.includes('NOT_CONFIGURED') ? 503 : 502, { ok: false, code });
  }
}
