import { describe, expect, it } from 'vitest';

import { getCommunityRouteMeta } from './communityNavigation';

describe('getCommunityRouteMeta', () => {
  it('gives the story editor a stable parent even without browser history', () => {
    const create = getCommunityRouteMeta('/community/stories/new');
    const edit = getCommunityRouteMeta('/community/stories/42/edit');

    expect(create.back?.to).toBe('/community/stories');
    expect(edit.back?.to).toBe('/community/stories');
    expect(edit.crumbs.map((crumb) => crumb.label.en)).toEqual(['Community', 'Stories', 'Edit story']);
  });

  it('keeps member sections connected to the community home', () => {
    for (const path of ['/community/people', '/community/practice', '/community/messages', '/community/settings']) {
      expect(getCommunityRouteMeta(path).back?.to).toBe('/community');
    }
  });

  it('provides an exit path from account and application flow pages', () => {
    expect(getCommunityRouteMeta('/community/auth').back?.to).toBe('/');
    expect(getCommunityRouteMeta('/community/application').back?.to).toBe('/');
    expect(getCommunityRouteMeta('/community/guardian-consent').back?.to).toBe('/community/application');
  });
});
