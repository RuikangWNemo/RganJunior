import PasswordResetEmail from '../auth/PasswordResetEmail.js';

export default function PasswordResetPreview() {
  return <PasswordResetEmail
    confirmationUrl="https://www.rganjunior.org/community/reset-password"
    locale="zh-CN"
  />;
}
