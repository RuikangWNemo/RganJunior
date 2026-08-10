import InviteEmail from '../auth/InviteEmail.js';

export default function InvitePreview() {
  return <InviteEmail
    confirmationUrl="https://www.rganjunior.org/community/auth/callback"
    locale="zh-CN"
  />;
}
