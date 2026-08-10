import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import FieldNoteArticle from './FieldNoteArticle';

const { getBySlug, listPublished } = vi.hoisted(() => ({
  getBySlug: vi.fn(),
  listPublished: vi.fn(),
}));

vi.mock('@/services/field-notes', () => ({
  getFieldNoteBySlug: (...args: unknown[]) => getBySlug(...args),
  listPublishedFieldNotes: (...args: unknown[]) => listPublished(...args),
}));

const realNote = {
  id: 42,
  slug: 'tree-seasons',
  title: '一棵树的四季',
  excerpt: '小雨持续一年的真实观察。',
  content: '春天发芽，夏天成荫。',
  content_html: '<h2>从春天开始</h2><p>春天发芽，夏天成荫。</p>',
  language: 'zh',
  status: 'published',
  visibility: 'public',
  featured: true,
  cover_media_id: null,
  published_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
  field_note_media: [],
  field_note_authors: [{ author_order: 0, contribution_role: 'author', people: { id: 7, slug: 'xiaoyu', display_name: '小雨', nature_name: null } }],
  field_note_topics: [{ topic_id: 3, topics: { id: 3, slug: 'nature', name_zh: '自然观察', name_en: null, description: '真实的自然观察' } }],
};

function renderArticle(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <Routes><Route path="/field-notes/:slug" element={<FieldNoteArticle />} /></Routes>
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FieldNoteArticle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    getBySlug.mockReset().mockResolvedValue(realNote);
    listPublished.mockReset().mockResolvedValue([realNote]);
  });

  it('renders the stored real article snapshot without a sample banner', async () => {
    renderArticle('/field-notes/tree-seasons');

    expect(await screen.findByRole('heading', { name: '一棵树的四季' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '从春天开始' })).toBeInTheDocument();
    expect(screen.getByText('春天发芽，夏天成荫。')).toBeInTheDocument();
    expect(screen.getByText(/作者：小雨/)).toBeInTheDocument();
    expect(screen.queryByText(/内容样稿/)).not.toBeInTheDocument();
  });

  it('uses the existing not-found page when no published database record exists', async () => {
    getBySlug.mockResolvedValue(null);
    listPublished.mockResolvedValue([]);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderArticle('/field-notes/not-a-real-note');

    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
  });
});
