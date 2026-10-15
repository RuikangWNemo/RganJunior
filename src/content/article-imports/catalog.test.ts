import { describe, expect, it } from 'vitest';
import catalog from './catalog.json';
import { createFieldNoteSnapshot } from '@/lib/field-note-document/server';
import { legacyTextToBlocks } from '@/lib/field-note-document/legacy';
import type { FieldNoteBlocks } from '@/lib/field-note-document/schema';

// These counts cover source media groups that can be collapsed by HTML import.
const imageCounts = [29, 10, 27, 12, 8, 14];
describe('prepared author article catalog', () => {
  it('contains the two supplied articles and all four founder stories', () => {
    expect(catalog).toHaveLength(6);
    expect(catalog[0].authorName).toBe('Nate-液态氧');
    expect(catalog[0].content).toContain('我叫“野薄荷”');
    expect(catalog[1].authorName).toBe('橙子');
    expect(new Set(catalog.map((article) => article.slug)).size).toBe(6);
    expect(catalog.filter((article) => article.requiresAccount).map((article) => article.authorSlug)).toEqual(['nate', 'nate']);
  });

  it.each(catalog.map((article, index) => [article.slug, article, imageCounts[index]] as const))(
    '%s retains every image and portable editable content', async (_slug, article, imageCount) => {
      expect(article.contentHtml.match(/<img /g)).toHaveLength(imageCount);
      expect(article.contentHtml).not.toMatch(/<script|javascript:|onerror=/);
      const snapshot = await createFieldNoteSnapshot(article.contentJson as FieldNoteBlocks);
      expect(snapshot.plainText).toBe(article.content);
      expect(snapshot.html.match(/<img /g)).toHaveLength(imageCount);
      expect(legacyTextToBlocks(article.content).length).toBeGreaterThan(1);
    },
  );
});
