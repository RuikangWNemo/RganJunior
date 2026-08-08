import { describe, expect, it } from 'vitest';
import { actionPrograms } from './actionPrograms';
import { programFaqs } from './programDetails';

describe('program content model', () => {
  it('defines unique overview and detail routes for all programs', () => {
    expect(actionPrograms).toHaveLength(4);
    expect(new Set(actionPrograms.map((program) => program.id)).size).toBe(4);
    expect(new Set(actionPrograms.map((program) => program.path)).size).toBe(4);
    expect(new Set(actionPrograms.map((program) => program.detailPath)).size).toBe(4);
  });

  it('provides a real overview image and detail metadata for every program', () => {
    actionPrograms.forEach((program) => {
      expect(program.image.src).toMatch(/^\//);
      expect(program.image.width).toBeGreaterThan(0);
      expect(program.image.height).toBeGreaterThan(0);
      expect(program.summary.zh.length).toBeGreaterThan(20);
      expect(program.seoDescription.zh.length).toBeGreaterThan(20);
    });
  });

  it('provides five to seven complete FAQ entries for every program', () => {
    actionPrograms.forEach((program) => {
      const faqs = programFaqs[program.id];
      expect(faqs.length).toBeGreaterThanOrEqual(5);
      expect(faqs.length).toBeLessThanOrEqual(7);
      faqs.forEach((faq) => {
        expect(faq.question.zh).not.toBe('');
        expect(faq.answer.zh).not.toBe('');
        expect(faq.question.en).not.toBe('');
        expect(faq.answer.en).not.toBe('');
      });
    });
  });
});
