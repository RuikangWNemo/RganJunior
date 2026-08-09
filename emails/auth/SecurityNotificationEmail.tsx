import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailLayout from '../components/EmailLayout.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailLocale } from '../types.js';

export type SecurityNotificationDetail =
  | 'password'
  | 'email'
  | 'phone'
  | 'identity_linked'
  | 'identity_unlinked'
  | 'mfa_enrolled'
  | 'mfa_unenrolled';

export type SecurityNotificationEmailProps = {
  detail: SecurityNotificationDetail;
  locale: EmailLocale;
  oldValue?: string;
  value?: string;
};

export default function SecurityNotificationEmail({ detail, locale, oldValue, value }: SecurityNotificationEmailProps) {
  const copy = emailCopy(locale);
  const notification = copy.security[detail];
  return (
    <EmailLayout locale={locale} preview={notification.subject} title={notification.title}>
      <Text style={bodyTextStyle}>{notification.body}</Text>
      {oldValue && value ? (
        <Text style={{ ...bodyTextStyle, backgroundColor: '#f5f0e6', borderRadius: '12px', padding: '12px 14px' }}>
          {oldValue} → {value}
        </Text>
      ) : value ? (
        <Text style={{ ...bodyTextStyle, backgroundColor: '#f5f0e6', borderRadius: '12px', padding: '12px 14px' }}>
          {value}
        </Text>
      ) : null}
      <Text style={bodyTextStyle}>{copy.security.warning}</Text>
    </EmailLayout>
  );
}
