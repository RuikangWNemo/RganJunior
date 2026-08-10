export const COMMUNITY_PASSWORD_MIN_LENGTH = 8;

export function isValidNewPassword(password: string, confirmPassword: string) {
  return password.length >= COMMUNITY_PASSWORD_MIN_LENGTH && password === confirmPassword;
}
