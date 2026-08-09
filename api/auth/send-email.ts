import { Resend } from 'resend';

import { readAuthEmailConfig, type AuthEmailConfig } from '../_lib/auth-email/config.js';
import { AuthEmailDispatchError, buildAuthEmailDeliveries, type AuthEmailDelivery } from '../_lib/auth-email/dispatch.js';
import { logAuthEmailEvent } from '../_lib/auth-email/logging.js';
import { AuthEmailPayloadError, parseAuthEmailPayload } from '../_lib/auth-email/schema.js';
import { HookSignatureError, verifySupabaseHook } from '../_lib/auth-email/supabase-hook.js';

const MAX_HOOK_BODY_BYTES = 64 * 1024;
const PROVIDER_DEADLINE_MS = 3_500;

export type AuthEmailProviderInput = AuthEmailDelivery & { from: string };
export type AuthEmailProviderResult = { id: string };

export type AuthEmailRequestDependencies = {
  config: AuthEmailConfig;
  send(input: AuthEmailProviderInput): Promise<AuthEmailProviderResult>;
};

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  return Response.json(body, {
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
    status,
  });
}

function hookError(status: number, message: string, headers?: Record<string, string>): Response {
  return jsonResponse(status, { error: { http_code: status, message } }, headers);
}

async function withDeadline<T>(promise: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('email provider deadline exceeded')), PROVIDER_DEADLINE_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function productionDependencies(config: AuthEmailConfig): AuthEmailRequestDependencies {
  const resend = new Resend(config.resendApiKey);
  return {
    config,
    async send(input) {
      const { data, error } = await resend.emails.send({
        from: input.from,
        html: input.html,
        subject: input.subject,
        text: input.text,
        to: input.to,
      }, { idempotencyKey: input.idempotencyKey });
      if (error || !data?.id) throw new Error('Resend rejected authentication email delivery');
      return { id: data.id };
    },
  };
}

export async function handleSendEmailRequest(
  request: Request,
  injectedDependencies?: AuthEmailRequestDependencies,
): Promise<Response> {
  if (request.method !== 'POST') {
    return hookError(405, 'Method not allowed.', { Allow: 'POST' });
  }

  let dependencies: AuthEmailRequestDependencies;
  try {
    const config = injectedDependencies?.config ?? readAuthEmailConfig();
    dependencies = injectedDependencies ?? productionDependencies(config);
  } catch {
    return hookError(500, 'Authentication email service is not configured.');
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_HOOK_BODY_BYTES) {
    return hookError(413, 'Webhook payload is too large.');
  }

  let verified: ReturnType<typeof verifySupabaseHook>;
  try {
    const webhookHeaders: Record<string, string> = {};
    request.headers.forEach((value, name) => {
      webhookHeaders[name] = value;
    });
    verified = verifySupabaseHook(
      rawBody,
      webhookHeaders,
      dependencies.config.hookSecret,
    );
  } catch (error) {
    if (error instanceof HookSignatureError) {
      return hookError(401, 'Invalid webhook signature.');
    }
    return hookError(401, 'Invalid webhook signature.');
  }

  let deliveries: AuthEmailDelivery[];
  try {
    const payload = parseAuthEmailPayload(verified.payload);
    deliveries = await buildAuthEmailDeliveries(payload, dependencies.config, verified.webhookId);
  } catch (error) {
    if (error instanceof AuthEmailPayloadError || error instanceof AuthEmailDispatchError) {
      return hookError(400, 'Invalid authentication email payload.');
    }
    return hookError(500, 'Authentication email rendering failed.');
  }

  const startedAt = performance.now();
  const results = await Promise.allSettled(deliveries.map((delivery) => withDeadline(
    dependencies.send({ ...delivery, from: dependencies.config.from }),
  )));

  results.forEach((result, index) => {
    const delivery = deliveries[index];
    logAuthEmailEvent({
      action: delivery.action,
      durationMs: performance.now() - startedAt,
      outcome: result.status === 'fulfilled' ? 'sent' : 'failed',
      providerMessageId: result.status === 'fulfilled' ? result.value.id : undefined,
      recipient: delivery.to,
      webhookId: verified.webhookId,
    });
  });

  if (results.some((result) => result.status === 'rejected')) {
    return hookError(502, 'Authentication email delivery failed.');
  }

  return jsonResponse(200, {});
}

export default {
  fetch: handleSendEmailRequest,
};
