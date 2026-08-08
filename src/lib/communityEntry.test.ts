import { describe, expect, it } from 'vitest';

import { buildCommunityEntryUrl, COMMUNITY_ENTRY_PATH } from './communityEntry';

describe('community entry URL', () => {
  it('falls back to a relative entry when no origin is available', () => {
    expect(buildCommunityEntryUrl()).toBe(COMMUNITY_ENTRY_PATH);
  });

  it('uses the current site origin by default', () => {
    expect(buildCommunityEntryUrl(undefined, 'https://rganjunior.org')).toBe(
      'https://rganjunior.org/community',
    );
  });

  it('allows a future community origin override', () => {
    expect(
      buildCommunityEntryUrl(
        'https://community.rganjunior.org///',
        'https://rganjunior.org',
      ),
    ).toBe('https://community.rganjunior.org/community');
  });
});
