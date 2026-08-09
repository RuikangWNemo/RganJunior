import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import VerificationCode from '../components/VerificationCode.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailWithTokenProps } from '../types.js';

export default function SignupEmail({ confirmationUrl, locale, token }: EmailWithTokenProps) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.signup.preview} title={copy.signup.title}>
      <Text style={bodyTextStyle}>{copy.signup.body}</Text>
      {confirmationUrl ? <EmailButton href={confirmationUrl} label={copy.signup.button} /> : null}
      <Text style={bodyTextStyle}>{copy.common.codeLabel}</Text>
      <VerificationCode token={token} />
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
