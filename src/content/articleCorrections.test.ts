import { describe, expect, it } from 'vitest';
import { correctedArticleCopy } from './articleCorrections';

describe('approved article corrections', () => {
  it('corrects old stored copy without duplicating a correction already saved by an editor', () => {
    const old = '<p>阿柑少年计划：通过一颗柑橘参与可持续性发展农业的调研和实践</p>';
    const corrected = correctedArticleCopy('it-takes-a-village', old);
    expect(corrected).toContain('Agan Junior');
    expect(corrected).toContain('R-Gan Junior');
    expect(correctedArticleCopy('it-takes-a-village', corrected)).toBe(corrected);
    expect(correctedArticleCopy('technology-ecology-stars', '<strong>作为科技少年，我想做什么</strong>'))
      .toBe('<strong>作为科技少年，我想做什么</strong>');
  });

  it('limits date changes to the reviewed story and preserves unrelated markup and text', () => {
    const old = '<figure><img src="/photo.webp" /><figcaption>@2026年2月</figcaption></figure><p>新的段落</p>';
    expect(correctedArticleCopy('chengzi-camp-letter', old)).toBe(old.replace('2月', '1月'));
    expect(correctedArticleCopy('unreviewed-story', old)).toBe(old);
  });

  it('removes duplicated text when the corrected phrase is a prefix of the original', () => {
    const old = '<p class="bn-inline-content">如果有人和我有共同的兴趣兴趣，我们之后可以一起交流。</p>';
    const corrected = correctedArticleCopy('tea-kitchen-and-summer', old);
    expect(corrected).toBe(old.replace('兴趣兴趣', '兴趣'));
    expect(correctedArticleCopy('tea-kitchen-and-summer', corrected)).toBe(corrected);
  });
});
