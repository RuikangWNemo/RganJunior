export const HOME_INTRO_STORAGE_KEY = 'hasSeenSplashAnimation';
export const HOME_INTRO_VERSION = 'home-cinematic-intro-v1';
export const HOME_INTRO_REPLAY_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export interface HomeIntroState {
  version: string;
  lastVisitedAt: number;
  lastCompletedAt: number;
}

function hasFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseHomeIntroState(value: string | null): HomeIntroState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('lastVisitedAt' in parsed) ||
      !('lastCompletedAt' in parsed) ||
      typeof parsed.version !== 'string' ||
      !hasFiniteNumber(parsed.lastVisitedAt) ||
      !hasFiniteNumber(parsed.lastCompletedAt)
    ) {
      return null;
    }

    return {
      version: parsed.version,
      lastVisitedAt: parsed.lastVisitedAt,
      lastCompletedAt: parsed.lastCompletedAt,
    };
  } catch {
    return null;
  }
}

export function shouldShowHomeIntro(state: HomeIntroState | null, now: number) {
  if (!state || state.version !== HOME_INTRO_VERSION) {
    return true;
  }

  return now - state.lastVisitedAt >= HOME_INTRO_REPLAY_AFTER_MS;
}

export function refreshHomeIntroVisit(state: HomeIntroState, now: number): HomeIntroState {
  return {
    ...state,
    lastVisitedAt: now,
  };
}

export function completeHomeIntro(now: number): HomeIntroState {
  return {
    version: HOME_INTRO_VERSION,
    lastVisitedAt: now,
    lastCompletedAt: now,
  };
}
