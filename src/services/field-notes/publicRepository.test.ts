import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fieldNotesRepository, mergePublishedArticles } from './publicRepository';
import type { FieldNote } from '@/types/field-notes';

const { listPublished } = vi.hoisted(() => ({ listPublished: vi.fn() }));

vi.mock('@/services/field-notes', () => ({
  listPublishedFieldNotes: (...args: unknown[]) => listPublished(...args),
  getFieldNoteBySlug: vi.fn(),
}));

describe('public Field Notes repository', () => {
  beforeEach(() => listPublished.mockReset());

  it('deduplicates the original and managed article by stable slug', () => {
    const old = { slug: 'same-story', title: { zh: 'Old', en: 'Old' } } as FieldNote;
    const managed = { slug: 'same-story', title: { zh: 'Edited', en: 'Edited' } } as FieldNote;
    expect(mergePublishedArticles([old], [managed])).toEqual([managed]);
  });

  it('returns no synthetic samples when records are not both published and public', async () => {
    listPublished.mockResolvedValue([
      { id: 1, slug: 'draft', title: '草稿', status: 'draft', visibility: 'private' },
      { id: 2, slug: 'members-only', title: '成员文章', status: 'published', visibility: 'members' },
    ]);

    const notes = await fieldNotesRepository.listPublishedNotes({ language: 'zh' });
    expect(notes.map((note) => note.slug)).toEqual(['summer-co-creation-camp-invitation']);
    expect(notes.some((note) => ['draft', 'members-only'].includes(note.slug))).toBe(false);
  });
});
