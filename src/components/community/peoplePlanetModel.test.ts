import { describe, expect, it } from 'vitest';

import { createAvatarIdentity, createPlanetNodes, createVisualPlanetLinks } from './peoplePlanetModel';

const people = [{ id: 41 }, { id: 7 }, { id: 19 }, { id: 3 }, { id: 88 }];

describe('peoplePlanetModel', () => {
  it('creates a stable, readable Avatar identity from person data', () => {
    expect(createAvatarIdentity(41, ' 小橘 ')).toEqual(createAvatarIdentity(41, ' 小橘 '));
    expect(createAvatarIdentity(41, ' 小橘 ').initial).toBe('小');
    expect(createAvatarIdentity(42, 'Pine').initial).toBe('P');
    expect(createAvatarIdentity(41, '小橘').primary).not.toBe(createAvatarIdentity(42, 'Pine').primary);
    expect(createAvatarIdentity(41, '小橘', true).primary).toBe('#e7783d');
  });

  it('places every person deterministically on the requested sphere', () => {
    const first = createPlanetNodes(people, 3);
    const second = createPlanetNodes([...people].reverse(), 3);

    expect(first).toEqual(second);
    expect(first).toHaveLength(people.length);
    expect(new Set(first.map((node) => node.personId)).size).toBe(people.length);

    for (const node of first) {
      expect(Math.hypot(...node.position)).toBeCloseTo(3, 8);
    }
  });

  it('creates a bounded set of unique decorative links', () => {
    const nodes = createPlanetNodes(people);
    const links = createVisualPlanetLinks(nodes, 3);
    const pairs = links.map((link) => `${link.fromPersonId}:${link.toPersonId}`);

    expect(links.length).toBeLessThanOrEqual(3);
    expect(new Set(pairs).size).toBe(links.length);
    expect(links.every((link) => link.points.length === 13)).toBe(true);
  });
});
