export function readAuthCallbackError(search: string, hash: string) {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  const description = query.get('error_description') || fragment.get('error_description');
  const error = query.get('error') || fragment.get('error');

  return description || error || null;
}
