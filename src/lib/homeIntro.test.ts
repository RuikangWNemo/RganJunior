import { describe, expect, it } from 'vitest';
import {
  HOME_INTRO_REPLAY_AFTER_MS,
  HOME_INTRO_VERSION,
  completeHomeIntro,
  parseHomeIntroState,
  refreshHomeIntroVisit,
  shouldShowHomeIntro,
} from './homeIntro';

const now = Date.UTC(2026, 7, 5, 10, 0, 0);

describe('home intro visit state', () => {
  it('plays for a first visit and legacy storage values', () => {
    expect(shouldShowHomeIntro(null, now)).toBe(true);
    expect(parseHomeIntroState('brand-film-v8-paper-awakening')).toBeNull();
  });

  it('skips the intro during the seven-day return window', () => {
    const state = completeHomeIntro(now - HOME_INTRO_REPLAY_AFTER_MS + 1);

    expect(shouldShowHomeIntro(state, now)).toBe(false);
  });

  it('plays after seven days without a homepage visit', () => {
    const state = completeHomeIntro(now - HOME_INTRO_REPLAY_AFTER_MS);

    expect(shouldShowHomeIntro(state, now)).toBe(true);
  });

  it('keeps active return visitors inside the quiet window', () => {
    const completed = completeHomeIntro(now - HOME_INTRO_REPLAY_AFTER_MS + 1);
    const refreshed = refreshHomeIntroVisit(completed, now);

    expect(refreshed.lastCompletedAt).toBe(completed.lastCompletedAt);
    expect(shouldShowHomeIntro(refreshed, now + HOME_INTRO_REPLAY_AFTER_MS - 1)).toBe(false);
  });

  it('plays once when the intro version changes', () => {
    const state = {
      ...completeHomeIntro(now),
      version: `${HOME_INTRO_VERSION}-old`,
    };

    expect(shouldShowHomeIntro(state, now)).toBe(true);
  });
});
