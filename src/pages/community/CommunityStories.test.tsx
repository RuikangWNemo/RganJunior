import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityStories from './CommunityStories';

const listNotes = vi.fn();
const listCategories = vi.fn();
const archiveNote = vi.fn();
const restoreNote = vi.fn();
const deleteNote = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ permissions: [] }),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({ children, onSelect, disabled }: { children: ReactNode; onSelect?: () => void; disabled?: boolean }) => <button type="button" role="menuitem" disabled={disabled} onClick={onSelect}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('@/services/field-notes', () => ({
  listMyFieldNotes: (...args: unknown[]) => listNotes(...args),
  listArticleCategories: (...args: unknown[]) => listCategories(...args),
  archiveFieldNote: (...args: unknown[]) => archiveNote(...args),
  restoreFieldNote: (...args: unknown[]) => restoreNote(...args),
  permanentlyDeleteFieldNote: (...args: unknown[]) => deleteNote(...args),
  createArticleCategory: vi.fn(),
  updateArticleCategory: vi.fn(),
}));

const category = {
  id: 1,
  slug: 'people-stories',
  name_zh: '人物故事',
  name_en: 'People Stories',
  sort_order: 10,
  is_active: true,
  created_by: null,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
};

const baseNote = {
  approved_at: null,
  archived_at: null,
  category_id: 1,
  collaboration_mode: 'invite_only',
  content: '',
  content_html: null,
  content_json: null,
  content_schema_version: 1,
  cover_media_id: null,
  created_at: '2026-08-01T00:00:00.000Z',
  created_by: 'member-1',
  excerpt: '一段摘要',
  featured: false,
  language: 'zh',
  published_at: null,
  reviewed_at: null,
  seo_description: null,
  seo_title: null,
  submitted_at: null,
  subtitle: null,
  translation_of_id: null,
  visibility: 'private',
  article_categories: category,
  field_note_topics: [],
  field_note_media: [],
};

const notes = [
  { ...baseNote, id: 11, slug: 'draft-story', title: '河边的第一份草稿', status: 'draft', updated_at: '2026-08-09T09:00:00.000Z' },
  { ...baseNote, id: 22, slug: 'published-story', title: '已经发布的故事', status: 'published', visibility: 'public', published_at: '2026-08-08T09:00:00.000Z', updated_at: '2026-08-08T09:00:00.000Z' },
  { ...baseNote, id: 33, slug: 'trashed-story', title: '回收站里的草稿', status: 'archived', archived_at: '2026-08-07T09:00:00.000Z', updated_at: '2026-08-07T09:00:00.000Z' },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/community/stories']}>
      <LanguageProvider initialLanguage="zh">
        <CommunityStories />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityStories', () => {
  beforeEach(() => {
    listNotes.mockReset().mockResolvedValue(notes);
    listCategories.mockReset().mockResolvedValue([category]);
    archiveNote.mockReset().mockResolvedValue(undefined);
    restoreNote.mockReset().mockResolvedValue(undefined);
    deleteNote.mockReset().mockResolvedValue(undefined);
  });

  it('organizes owned stories by status and exposes published stories', async () => {
    renderPage();

    expect(await screen.findByText('河边的第一份草稿')).toBeInTheDocument();
    expect(screen.getByText('已经发布的故事')).toBeInTheDocument();
    expect(screen.queryByText('回收站里的草稿')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /已发布/ }));
    expect(screen.getByRole('link', { name: '查看文章' })).toHaveAttribute('href', '/field-notes/published-story');
    expect(screen.queryByText('河边的第一份草稿')).not.toBeInTheDocument();
  });

  it('restores a draft from Trash', async () => {
    renderPage();
    await screen.findByText('河边的第一份草稿');

    fireEvent.click(screen.getByRole('tab', { name: /回收站/ }));
    const trashedStory = screen.getByText('回收站里的草稿').closest('article');
    expect(trashedStory).not.toBeNull();
    fireEvent.click(within(trashedStory as HTMLElement).getByRole('button', { name: '恢复' }));

    await waitFor(() => expect(restoreNote).toHaveBeenCalledWith(33));
  });

  it('requires confirmation before moving a draft to Trash', async () => {
    renderPage();
    await screen.findByText('河边的第一份草稿');

    const draftStory = screen.getByText('河边的第一份草稿').closest('article');
    expect(draftStory).not.toBeNull();
    fireEvent.click(within(draftStory as HTMLElement).getByRole('menuitem', { name: '移入回收站' }));
    expect(screen.getByText('把草稿移入回收站？')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '移入回收站' }));
    await waitFor(() => expect(archiveNote).toHaveBeenCalledWith(11));
  });
});
