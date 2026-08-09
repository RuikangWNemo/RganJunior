import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailWithLinkProps } from '../types.js';

export default function InviteEmail({ confirmationUrl, locale }: EmailWithLinkProps) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.invite.preview} title={copy.invite.title}>
      <Text style={bodyTextStyle}>{copy.invite.body}</Text>
      <EmailButton href={confirmationUrl} label={copy.invite.button} />
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
