import { describe, expect, it, vi } from 'vitest';
import catalog from './article-imports/catalog.json';
import { voiceStories } from './voiceStories';
import { articleTranslations } from './articleTranslations';

vi.mock('@/services/field-notes', () => ({
  listPublishedFieldNotes: async () => catalog.map((a, i) => ({
    id: i + 1, slug: a.slug, title: a.title, excerpt: a.excerpt, content: a.content, content_html: a.contentHtml,
    language: 'zh', status: 'published', visibility: 'public', featured: true, published_at: '2026-10-14',
    field_note_authors: [], field_note_topics: [], field_note_media: [],
  })),
  getFieldNoteBySlug: vi.fn(),
}));

describe('public article English coverage', () => {
  it('provides a complete English counterpart for all seven public articles', async () => {
    const { fieldNotesRepository } = await import('@/services/field-notes/publicRepository');
    const notes = await fieldNotesRepository.listPublishedNotes({ language: 'en' });
    expect(notes).toHaveLength(7);
    for (const note of notes) {
      expect(note.title.en).not.toMatch(/[\u3400-\u9fff]/);
      expect(note.excerpt.en).not.toMatch(/[\u3400-\u9fff]/);
      const english = new DOMParser().parseFromString(note.contentHtmlEn || '', 'text/html');
      expect(english.body.textContent?.length).toBeGreaterThan(1000);
      expect(english.body.textContent).not.toMatch(/[\u3400-\u9fff]/);
      const chinese = new DOMParser().parseFromString(note.contentHtml || '', 'text/html');
      expect([...english.images].map((image) => image.getAttribute('src'))).toEqual([...chinese.images].map((image) => image.getAttribute('src')));
      expect([...english.images].every((image) => image.alt && !/[\u3400-\u9fff]/.test(image.alt))).toBe(true);
    }
  });

  it('keeps the established English stories and both newly translated articles', () => {
    expect(voiceStories.every((story) => story.bodyHtml.en !== story.bodyHtml.zh)).toBe(true);
    expect(Object.keys(articleTranslations)).toEqual(['believe-and-see-camp-review', 'chengzi-camp-letter']);
  });
});
