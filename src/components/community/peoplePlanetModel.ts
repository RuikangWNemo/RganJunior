export type PlanetVector = readonly [number, number, number];

export type PlanetNode = {
  personId: number;
  position: PlanetVector;
};

export type PlanetLink = {
  fromPersonId: number;
  toPersonId: number;
  points: PlanetVector[];
};

export type AvatarIdentity = {
  initial: string;
  primary: string;
  secondary: string;
  highlight: string;
  accent: string;
  ink: string;
};

const AVATAR_PALETTES: ReadonlyArray<Omit<AvatarIdentity, 'initial'>> = [
  { primary: '#d66d45', secondary: '#793d2d', highlight: '#f2b36f', accent: '#ffc983', ink: '#fff7e8' },
  { primary: '#4f9270', secondary: '#1d4b3b', highlight: '#9bc9a9', accent: '#c2e2c6', ink: '#fff9e9' },
  { primary: '#537f96', secondary: '#244457', highlight: '#9bc3cb', accent: '#bce2df', ink: '#fff9e9' },
  { primary: '#b66669', secondary: '#633e55', highlight: '#dfa09b', accent: '#f0b8a8', ink: '#fff8ec' },
  { primary: '#8a6aa3', secondary: '#493c68', highlight: '#c0a0ca', accent: '#dcc0d8', ink: '#fff8ee' },
  { primary: '#b08b45', secondary: '#5e512d', highlight: '#e5c375', accent: '#f0d994', ink: '#fff9e8' },
  { primary: '#4d8e8a', secondary: '#235450', highlight: '#8fc5b8', accent: '#b5ddd1', ink: '#fff9e9' },
];

const OWN_AVATAR_PALETTE: Omit<AvatarIdentity, 'initial'> = {
  primary: '#e7783d',
  secondary: '#8f3f2d',
  highlight: '#f4b15f',
  accent: '#ffc27c',
  ink: '#fff8e9',
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function createAvatarIdentity(personId: number, displayName: string, isOwn = false): AvatarIdentity {
  const normalizedId = Number.isFinite(personId) ? Math.abs(Math.trunc(personId)) : 0;
  const palette = isOwn ? OWN_AVATAR_PALETTE : AVATAR_PALETTES[normalizedId % AVATAR_PALETTES.length];
  const initial = Array.from(displayName.trim())[0]?.toLocaleUpperCase() || '·';

  return { initial, ...palette };
}

function vectorLength([x, y, z]: PlanetVector) {
  return Math.hypot(x, y, z);
}

function normalize([x, y, z]: PlanetVector): PlanetVector {
  const length = vectorLength([x, y, z]) || 1;
  return [x / length, y / length, z / length];
}

function dot(left: PlanetVector, right: PlanetVector) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function distanceSquared(left: PlanetVector, right: PlanetVector) {
  const dx = left[0] - right[0];
  const dy = left[1] - right[1];
  const dz = left[2] - right[2];
  return dx * dx + dy * dy + dz * dz;
}

export function createPlanetNodes(
  people: ReadonlyArray<{ id: number }>,
  radius = 2.55,
): PlanetNode[] {
  if (!people.length) return [];

  const sortedPeople = [...people].sort((left, right) => left.id - right.id);
  const offset = 2 / sortedPeople.length;

  return sortedPeople.map((person, index) => {
    const y = index * offset - 1 + offset / 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = index * GOLDEN_ANGLE;

    return {
      personId: person.id,
      position: [
        Math.cos(angle) * ringRadius * radius,
        y * radius,
        Math.sin(angle) * ringRadius * radius,
      ],
    };
  });
}

export function createArcPoints(
  start: PlanetVector,
  end: PlanetVector,
  segments = 12,
  lift = 0.055,
): PlanetVector[] {
  const startRadius = vectorLength(start);
  const endRadius = vectorLength(end);
  const radius = (startRadius + endRadius) / 2;
  const startUnit = normalize(start);
  const endUnit = normalize(end);
  const angle = Math.acos(Math.min(1, Math.max(-1, dot(startUnit, endUnit))));
  const angleSin = Math.sin(angle);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;
    let point: PlanetVector;

    if (angleSin < 0.0001) {
      point = normalize([
        startUnit[0] + (endUnit[0] - startUnit[0]) * progress,
        startUnit[1] + (endUnit[1] - startUnit[1]) * progress,
        startUnit[2] + (endUnit[2] - startUnit[2]) * progress,
      ]);
    } else {
      const startWeight = Math.sin((1 - progress) * angle) / angleSin;
      const endWeight = Math.sin(progress * angle) / angleSin;
      point = [
        startUnit[0] * startWeight + endUnit[0] * endWeight,
        startUnit[1] * startWeight + endUnit[1] * endWeight,
        startUnit[2] * startWeight + endUnit[2] * endWeight,
      ];
    }

    const liftedRadius = radius * (1 + Math.sin(progress * Math.PI) * lift);
    return [point[0] * liftedRadius, point[1] * liftedRadius, point[2] * liftedRadius];
  });
}

export function createVisualPlanetLinks(
  nodes: ReadonlyArray<PlanetNode>,
  maxLinks = 28,
): PlanetLink[] {
  if (nodes.length < 2 || maxLinks < 1) return [];

  const links: PlanetLink[] = [];
  const usedPairs = new Set<string>();

  for (const node of nodes) {
    const nearest = nodes
      .filter((candidate) => candidate.personId !== node.personId)
      .map((candidate) => ({
        candidate,
        distance: distanceSquared(node.position, candidate.position),
      }))
      .sort((left, right) => left.distance - right.distance || left.candidate.personId - right.candidate.personId)[0]?.candidate;

    if (!nearest) continue;

    const pair = [node.personId, nearest.personId].sort((left, right) => left - right);
    const pairKey = pair.join(':');
    if (usedPairs.has(pairKey)) continue;

    usedPairs.add(pairKey);
    links.push({
      fromPersonId: pair[0],
      toPersonId: pair[1],
      points: createArcPoints(node.position, nearest.position),
    });

    if (links.length >= maxLinks) break;
  }

  return links;
}
