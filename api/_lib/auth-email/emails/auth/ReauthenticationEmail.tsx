import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailLayout from '../components/EmailLayout.js';
import VerificationCode from '../components/VerificationCode.js';
import { formatVerificationCode } from '../format.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailLocale } from '../types.js';

export default function ReauthenticationEmail({ locale, token }: { locale: EmailLocale; token: string }) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.reauthentication.preview(formatVerificationCode(token))} title={copy.reauthentication.title}>
      <Text style={bodyTextStyle}>{copy.reauthentication.body}</Text>
      <VerificationCode token={token} />
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
    </EmailLayout>
  );
}
