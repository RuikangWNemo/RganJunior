import { describe, expect, it } from 'vitest';
import { confirmedTranslation } from './confirmedTranslations';

describe('confirmed translations', () => {
  it('keeps the two R-Gan entities distinct even when stored English is wrong', () => {
    expect(confirmedTranslation('阿柑少年', 'Youth', 'en')).toBe('R-Gan Junior');
    expect(confirmedTranslation('阿柑青年', 'R-Gan Junior', 'en')).toBe('R-Gan Youth');
    expect(confirmedTranslation('青少年', 'Young people', 'en')).toBe('Young people');
  });

  it('applies the returned review to legacy dynamic terms and preserves Chinese names', () => {
    expect(confirmedTranslation('生活体验营', 'Life Discovery Camp', 'en')).toBe('Life Immersion Camp');
    expect(confirmedTranslation('青年共创伙伴', 'Youth Co-creator', 'en')).toBe('Youth Co-creator');
    expect(confirmedTranslation('家长守护团', 'Parent Guardian Circle', 'en')).toBe('Guardian Circle');
    expect(confirmedTranslation('陈若容', 'Rosie Chen', 'zh')).toBe('陈若容');
    expect(confirmedTranslation('黄若音', 'Ruby Huang', 'zh')).toBe('黄若音');
  });

  it('leaves legal guardians, unknown names, and sentence context intact', () => {
    expect(confirmedTranslation('监护人', 'Guardian', 'en')).toBe('Guardian');
    expect(confirmedTranslation('自定义机构', 'Custom Organization', 'en')).toBe('Custom Organization');
    const sentence = 'A program developed in Tieniu Village for young people.';
    expect(confirmedTranslation('项目介绍', sentence, 'en')).toBe(sentence);
  });
});
