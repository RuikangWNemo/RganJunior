import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailWithLinkProps } from '../types.js';

export default function PasswordResetEmail({ confirmationUrl, locale }: EmailWithLinkProps) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.recovery.preview} title={copy.recovery.title}>
      <Text style={bodyTextStyle}>{copy.recovery.body}</Text>
      <EmailButton href={confirmationUrl} label={copy.recovery.button} />
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
