import { describe, expect, it } from 'vitest';
import {
  isProgramSectionId,
  PROGRAM_SECTION_IDS,
  readProgramLocation,
  readProgramSectionHash,
} from './programNavigation';

describe('program navigation', () => {
  it('keeps the agreed program order', () => {
    expect(PROGRAM_SECTION_IDS).toEqual([
      'life-experience-camp',
      'life-co-creation-camp',
      'action-group',
      'public-projects',
    ]);
  });

  it('reads valid program hashes', () => {
    expect(readProgramSectionHash('#action-group')).toBe('action-group');
    expect(readProgramSectionHash('public-projects')).toBe('public-projects');
    expect(readProgramSectionHash('#life-camp')).toBe('life-co-creation-camp');
  });

  it('rejects unknown program hashes', () => {
    expect(readProgramSectionHash('#unknown')).toBeNull();
    expect(isProgramSectionId(null)).toBe(false);
  });

  it('matches overview sections and program detail routes', () => {
    expect(readProgramLocation('/programs', '')).toBe('life-experience-camp');
    expect(readProgramLocation('/programs', '#action-group')).toBe('action-group');
    expect(readProgramLocation('/programs/public-projects', '')).toBe('public-projects');
    expect(readProgramLocation('/programs/inquiry', '', '?program=action-group')).toBe('action-group');
    expect(readProgramLocation('/programs/inquiry', '')).toBe('life-experience-camp');
    expect(readProgramLocation('/programs/inquiry', '', '?program=life-camp')).toBe('life-co-creation-camp');
  });
});
