import EmailChangeEmail from '../auth/EmailChangeEmail.js';

export default function EmailChangePreview() {
  return <EmailChangeEmail
    confirmationUrl="https://www.rganjunior.org/community/auth/callback"
    locale="zh-CN"
    newEmail="new-address@example.com"
    recipientRole="new"
    token="482913"
  />;
}
