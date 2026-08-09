import MagicLinkEmail from '../auth/MagicLinkEmail.js';

export default function MagicLinkPreview() {
  return <MagicLinkEmail
    confirmationUrl="https://www.rganjunior.org/community/auth/callback"
    locale="zh-CN"
    token="482913"
  />;
}
