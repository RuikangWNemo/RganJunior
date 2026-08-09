import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import VerificationCode from '../components/VerificationCode.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailWithTokenProps } from '../types.js';

export default function MagicLinkEmail({ confirmationUrl, locale, token }: EmailWithTokenProps) {
  const copy = emailCopy(locale);
  return (
    <EmailLayout locale={locale} preview={copy.magicLink.preview} title={copy.magicLink.title}>
      <Text style={bodyTextStyle}>{copy.magicLink.body}</Text>
      {confirmationUrl ? <EmailButton href={confirmationUrl} label={copy.magicLink.button} /> : null}
      {token ? <>
        <Text style={bodyTextStyle}>{copy.common.codeLabel}</Text>
        <VerificationCode token={token} />
      </> : null}
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
