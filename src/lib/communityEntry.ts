export const COMMUNITY_ENTRY_PATH = '/community';

function trimTrailingSlashes(value?: string) {
  return value?.trim().replace(/\/+$/, '') || '';
}

export function buildCommunityEntryUrl(
  configuredOrigin?: string,
  currentOrigin?: string,
) {
  const origin = trimTrailingSlashes(configuredOrigin) || trimTrailingSlashes(currentOrigin);
  return origin ? `${origin}${COMMUNITY_ENTRY_PATH}` : COMMUNITY_ENTRY_PATH;
}

export function getCommunityEntryUrl() {
  const currentOrigin = typeof window === 'undefined' ? undefined : window.location.origin;
  return buildCommunityEntryUrl(import.meta.env.VITE_COMMUNITY_ORIGIN, currentOrigin);
}
