import { describe, expect, it } from 'vitest';
import { getCanonicalUrl, getDocumentTitle, getRouteDescription } from './brand';

describe('program route metadata', () => {
  it('provides a dedicated title and description for each program detail page', () => {
    expect(getDocumentTitle('/programs/life-experience-camp', 'zh')).toBe('阿柑少年生活体验营 | 阿柑少年');
    expect(getDocumentTitle('/programs/life-co-creation-camp', 'zh')).toBe('阿柑少年生活共创营 | 阿柑少年');
    expect(getDocumentTitle('/programs/action-group', 'en')).toBe(
      "R'gan Junior Action Group | R'gan Junior",
    );
    expect(getRouteDescription('/programs/public-projects', 'zh')).toContain('研究方法');
  });

  it('keeps canonical URLs on their dedicated detail route', () => {
    expect(getCanonicalUrl('/programs/life-co-creation-camp')).toBe(
      'https://www.rganjunior.org/programs/life-co-creation-camp',
    );
  });

  it('provides metadata for both public Impact pages', () => {
    expect(getDocumentTitle('/impact', 'zh')).toBe('影响与记录 | 阿柑少年');
    expect(getDocumentTitle('/impact/awards', 'en')).toBe("Recognition | R'gan Junior");
    expect(getRouteDescription('/impact/awards', 'zh')).toContain('论文发表');
  });

  it('provides dedicated metadata for the Tieniu Village story', () => {
    expect(getDocumentTitle('/about/tieniu', 'zh')).toBe('铁牛村的故事 | 阿柑少年');
    expect(getDocumentTitle('/about/tieniu', 'en')).toBe(
      "The Story of Tieniu Village | R'gan Junior",
    );
    expect(getRouteDescription('/about/tieniu', 'zh')).toContain('土地修复');
  });
});
