import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fieldNotesRepository } from './publicRepository';

const { listPublished } = vi.hoisted(() => ({ listPublished: vi.fn() }));

vi.mock('@/services/field-notes', () => ({
  listPublishedFieldNotes: (...args: unknown[]) => listPublished(...args),
  getFieldNoteBySlug: vi.fn(),
}));

describe('public Field Notes repository', () => {
  beforeEach(() => listPublished.mockReset());

  it('returns no synthetic samples when records are not both published and public', async () => {
    listPublished.mockResolvedValue([
      { id: 1, slug: 'draft', title: '草稿', status: 'draft', visibility: 'private' },
      { id: 2, slug: 'members-only', title: '成员文章', status: 'published', visibility: 'members' },
    ]);

    await expect(fieldNotesRepository.listPublishedNotes({ language: 'zh' })).resolves.toEqual([]);
  });
});
