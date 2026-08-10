import type { AuthEmailAction } from './schema.js';

export function maskEmailAddress(email: string): string {
  const separator = email.lastIndexOf('@');
  if (separator <= 0) return '***';
  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  return `${local.slice(0, Math.min(2, local.length))}***@${domain}`;
}

export type AuthEmailLogEvent = {
  action: AuthEmailAction;
  durationMs: number;
  outcome: 'sent' | 'failed';
  providerMessageId?: string;
  recipient: string;
  webhookId: string;
};

export function logAuthEmailEvent(event: AuthEmailLogEvent): void {
  console.info('auth-email', {
    action: event.action,
    duration_ms: Math.max(0, Math.round(event.durationMs)),
    outcome: event.outcome,
    provider_message_id: event.providerMessageId,
    recipient: maskEmailAddress(event.recipient),
    webhook_id: event.webhookId,
  });
}
