import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import VerificationCode from '../components/VerificationCode.js';
import { formatVerificationCode } from '../format.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailWithTokenProps } from '../types.js';

export default function SignInCodeEmail({ confirmationUrl, locale, token }: EmailWithTokenProps) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.signIn.preview(formatVerificationCode(token))} title={copy.signIn.title}>
      <Text style={bodyTextStyle}>{copy.signIn.body}</Text>
      <VerificationCode token={token} />
      {confirmationUrl ? <EmailButton href={confirmationUrl} label={copy.signIn.button} /> : null}
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
