import { createHash } from 'node:crypto';
import { createElement, type ReactNode } from 'react';
import { render } from '@react-email/components';

import EmailChangeEmail from './emails/auth/EmailChangeEmail.js';
import InviteEmail from './emails/auth/InviteEmail.js';
import MagicLinkEmail from './emails/auth/MagicLinkEmail.js';
import PasswordResetEmail from './emails/auth/PasswordResetEmail.js';
import ReauthenticationEmail from './emails/auth/ReauthenticationEmail.js';
import SecurityNotificationEmail, { type SecurityNotificationDetail } from './emails/auth/SecurityNotificationEmail.js';
import SignInCodeEmail from './emails/auth/SignInCodeEmail.js';
import SignupEmail from './emails/auth/SignupEmail.js';
import { emailCopy } from './emails/copy.js';
import type { EmailLocale } from './emails/types.js';
import { selectAuthEmailLocale, type AuthEmailAction, type AuthEmailPayload } from './schema.js';
import { buildConfirmationUrl, type AuthEmailUrlRuntime } from './urls.js';

export type AuthEmailRecipientRole = 'primary' | 'current' | 'new';

export type AuthEmailDelivery = {
  action: AuthEmailAction;
  html: string;
  idempotencyKey: string;
  recipientRole: AuthEmailRecipientRole;
  subject: string;
  text: string;
  to: string;
};

export class AuthEmailDispatchError extends Error {
  constructor(message = 'Invalid data for authentication email delivery') {
    super(message);
    this.name = 'AuthEmailDispatchError';
  }
}

function required(value: string, field: string): string {
  if (!value) throw new AuthEmailDispatchError(`Missing required auth email field: ${field}`);
  return value;
}

function idempotencyKey(
  webhookId: string,
  action: AuthEmailAction,
  recipientRole: AuthEmailRecipientRole,
): string {
  const digest = createHash('sha256')
    .update(`${webhookId}:${action}:${recipientRole}`)
    .digest('hex')
    .slice(0, 40);
  return `auth-${digest}`;
}

async function renderedDelivery(input: {
  action: AuthEmailAction;
  node: ReactNode;
  recipientRole: AuthEmailRecipientRole;
  subject: string;
  to: string;
  webhookId: string;
}): Promise<AuthEmailDelivery> {
  const [html, text] = await Promise.all([
    render(input.node),
    render(input.node, { plainText: true }),
  ]);
  return {
    action: input.action,
    html,
    idempotencyKey: idempotencyKey(input.webhookId, input.action, input.recipientRole),
    recipientRole: input.recipientRole,
    subject: input.subject,
    text,
    to: input.to,
  };
}

function confirmationUrl(
  payload: AuthEmailPayload,
  runtime: AuthEmailUrlRuntime,
  tokenHash: string,
): string {
  return buildConfirmationUrl({
    action: payload.email_data.email_action_type,
    redirectTo: payload.email_data.redirect_to,
    tokenHash: required(tokenHash, 'token_hash'),
  }, runtime);
}

function securityDetail(action: AuthEmailAction): SecurityNotificationDetail {
  switch (action) {
    case 'password_changed_notification': return 'password';
    case 'email_changed_notification': return 'email';
    case 'phone_changed_notification': return 'phone';
    case 'identity_linked_notification': return 'identity_linked';
    case 'identity_unlinked_notification': return 'identity_unlinked';
    case 'mfa_factor_enrolled_notification': return 'mfa_enrolled';
    case 'mfa_factor_unenrolled_notification': return 'mfa_unenrolled';
    default: throw new AuthEmailDispatchError(`Unsupported security notification action: ${action}`);
  }
}

function securityValues(payload: AuthEmailPayload): { oldValue?: string; value?: string } {
  switch (payload.email_data.email_action_type) {
    case 'email_changed_notification':
      return { oldValue: payload.email_data.old_email, value: payload.user.email };
    case 'phone_changed_notification':
      return { oldValue: payload.email_data.old_phone, value: payload.user.phone };
    case 'identity_linked_notification':
    case 'identity_unlinked_notification':
      return { value: payload.email_data.provider };
    case 'mfa_factor_enrolled_notification':
    case 'mfa_factor_unenrolled_notification':
      return { value: payload.email_data.factor_type };
    default:
      return {};
  }
}

async function buildEmailChangeDeliveries(
  payload: AuthEmailPayload,
  runtime: AuthEmailUrlRuntime,
  locale: EmailLocale,
  webhookId: string,
): Promise<AuthEmailDelivery[]> {
  const action = payload.email_data.email_action_type;
  const copy = emailCopy(locale);
  const newEmail = required(payload.user.new_email, 'user.new_email');
  const hasSecureEmailChangeField = Boolean(
    payload.email_data.token_new || payload.email_data.token_hash_new,
  );

  if (hasSecureEmailChangeField) {
    const currentToken = required(payload.email_data.token, 'token');
    const currentHash = required(payload.email_data.token_hash_new, 'token_hash_new');
    const newToken = required(payload.email_data.token_new, 'token_new');
    const newHash = required(payload.email_data.token_hash, 'token_hash');
    return Promise.all([
      renderedDelivery({
        action,
        node: createElement(EmailChangeEmail, {
          confirmationUrl: confirmationUrl(payload, runtime, currentHash),
          locale,
          newEmail,
          recipientRole: 'current',
          token: currentToken,
        }),
        recipientRole: 'current',
        subject: copy.emailChange.subject,
        to: payload.user.email,
        webhookId,
      }),
      renderedDelivery({
        action,
        node: createElement(EmailChangeEmail, {
          confirmationUrl: confirmationUrl(payload, runtime, newHash),
          locale,
          newEmail,
          recipientRole: 'new',
          token: newToken,
        }),
        recipientRole: 'new',
        subject: copy.emailChange.subject,
        to: newEmail,
        webhookId,
      }),
    ]);
  }

  const token = required(payload.email_data.token_new || payload.email_data.token, 'token');
  const tokenHash = required(payload.email_data.token_hash, 'token_hash');
  return [await renderedDelivery({
    action,
    node: createElement(EmailChangeEmail, {
      confirmationUrl: confirmationUrl(payload, runtime, tokenHash),
      locale,
      newEmail,
      recipientRole: 'new',
      token,
    }),
    recipientRole: 'new',
    subject: copy.emailChange.subject,
    to: newEmail,
    webhookId,
  })];
}

export async function buildAuthEmailDeliveries(
  payload: AuthEmailPayload,
  runtime: AuthEmailUrlRuntime,
  webhookId: string,
): Promise<AuthEmailDelivery[]> {
  const action = payload.email_data.email_action_type;
  const locale = selectAuthEmailLocale(
    payload.user.app_metadata,
    payload.user.user_metadata,
  ) as EmailLocale;
  const copy = emailCopy(locale);
  const recipient = payload.user.email;

  if (action === 'email_change') {
    return buildEmailChangeDeliveries(payload, runtime, locale, webhookId);
  }

  let node: ReactNode;
  let subject: string;
  switch (action) {
    case 'signup':
      subject = copy.signup.subject;
      node = createElement(SignupEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
        token: required(payload.email_data.token, 'token'),
      });
      break;
    case 'invite':
      subject = copy.invite.subject;
      node = createElement(InviteEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
      });
      break;
    case 'magiclink':
      subject = copy.magicLink.subject;
      node = createElement(MagicLinkEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
        token: payload.email_data.token,
      });
      break;
    case 'email':
      subject = copy.signIn.subject;
      node = createElement(SignInCodeEmail, {
        confirmationUrl: payload.email_data.token_hash
          ? confirmationUrl(payload, runtime, payload.email_data.token_hash)
          : undefined,
        locale,
        token: required(payload.email_data.token, 'token'),
      });
      break;
    case 'recovery':
      subject = copy.recovery.subject;
      node = createElement(PasswordResetEmail, {
        confirmationUrl: confirmationUrl(payload, runtime, payload.email_data.token_hash),
        locale,
      });
      break;
    case 'reauthentication':
      subject = copy.reauthentication.subject;
      node = createElement(ReauthenticationEmail, {
        locale,
        token: required(payload.email_data.token, 'token'),
      });
      break;
    default: {
      const detail = securityDetail(action);
      const notification = copy.security[detail];
      subject = notification.subject;
      node = createElement(SecurityNotificationEmail, {
        detail,
        locale,
        ...securityValues(payload),
      });
    }
  }

  return [await renderedDelivery({
    action,
    node,
    recipientRole: 'primary',
    subject,
    to: recipient,
    webhookId,
  })];
}
