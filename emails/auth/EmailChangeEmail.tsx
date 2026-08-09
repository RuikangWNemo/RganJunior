import { Text } from '@react-email/components';

import { emailCopy } from '../copy.js';
import EmailButton from '../components/EmailButton.js';
import EmailLayout from '../components/EmailLayout.js';
import VerificationCode from '../components/VerificationCode.js';
import { bodyTextStyle } from '../styles.js';
import type { EmailLocale } from '../types.js';

export type EmailChangeEmailProps = {
  confirmationUrl: string;
  locale: EmailLocale;
  newEmail: string;
  recipientRole: 'current' | 'new';
  token: string;
};

export default function EmailChangeEmail(props: EmailChangeEmailProps) {
  const copy = emailCopy(props.locale);
  const current = props.recipientRole === 'current';
  const title = current ? copy.emailChange.currentTitle : copy.emailChange.newTitle;
  const preview = current ? copy.emailChange.currentPreview : copy.emailChange.newPreview;
  const body = current ? copy.emailChange.currentBody(props.newEmail) : copy.emailChange.newBody;
  const button = current ? copy.emailChange.currentButton : copy.emailChange.newButton;
  return (
    <EmailLayout locale={props.locale} preview={preview} title={title}>
      <Text style={bodyTextStyle}>{body}</Text>
      <EmailButton href={props.confirmationUrl} label={button} />
      {props.token ? <>
        <Text style={bodyTextStyle}>{copy.common.codeLabel}</Text>
        <VerificationCode token={props.token} />
      </> : null}
      <Text style={bodyTextStyle}>{copy.common.expires}</Text>
      <Text style={bodyTextStyle}>{copy.common.ignore}</Text>
    </EmailLayout>
  );
}
