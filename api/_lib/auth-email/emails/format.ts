export function formatVerificationCode(token: string): string {
  const compact = token.replace(/\s+/g, '');
  if (compact.length === 6) return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  if (compact.length === 8) return `${compact.slice(0, 4)} ${compact.slice(4)}`;
  return compact;
}
