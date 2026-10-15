vi.mock('@/content/voiceStories', () => ({ voiceStories: [] }));
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import FieldNotes from './FieldNotes';

const { listPublished } = vi.hoisted(() => ({ listPublished: vi.fn() }));

vi.mock('@/services/field-notes', () => ({
  listPublishedFieldNotes: (...args: unknown[]) => listPublished(...args),
  getFieldNoteBySlug: vi.fn(),
}));

function record(input: {
  id: number;
  slug: string;
  title: string;
  author: string;
  authorSlug: string;
  topic: string;
  topicSlug: string;
  featured?: boolean;
}) {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    excerpt: `${input.title}的真实摘要`,
    content: `${input.title}的真实正文`,
    content_html: `<p>${input.title}的真实正文</p>`,
    language: 'zh',
    status: 'published',
    visibility: 'public',
    featured: input.featured ?? false,
    cover_media_id: null,
    published_at: `2026-08-0${input.id}T00:00:00.000Z`,
    updated_at: `2026-08-0${input.id}T00:00:00.000Z`,
    field_note_media: [],
    field_note_authors: [{
      author_order: 0,
      contribution_role: 'author',
      people: { id: input.id, slug: input.authorSlug, display_name: input.author, nature_name: null },
    }],
    field_note_topics: [{
      topic_id: input.id,
      topics: { id: input.id, slug: input.topicSlug, name_zh: input.topic, name_en: null, description: `${input.topic}说明` },
    }],
  };
}

const realArticles = [
  record({ id: 1, slug: 'tree-seasons', title: '一棵树的四季', author: '小雨', authorSlug: 'xiaoyu', topic: '自然观察', topicSlug: 'nature', featured: true }),
  record({ id: 2, slug: 'village-kitchen', title: '村庄厨房的一天', author: '阿禾', authorSlug: 'ahe', topic: '在地实践', topicSlug: 'local' }),
  record({ id: 3, slug: 'river-notes', title: '河流观察笔记', author: '小雨', authorSlug: 'xiaoyu', topic: '自然观察', topicSlug: 'nature' }),
];

function renderFieldNotes(path = '/community-stories') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LanguageProvider>
          <Routes>
            <Route path="/community-stories" element={<FieldNotes />} />
            <Route path="/community-stories/all" element={<FieldNotes />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FieldNotes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    listPublished.mockReset().mockResolvedValue(realArticles);
  });

  it('renders the article archive once without a featured view', async () => {
    renderFieldNotes();

    expect(screen.getByRole('heading', { name: '社区故事' })).toBeInTheDocument();
    expect(await screen.findAllByRole('heading', { name: '一棵树的四季' })).toHaveLength(1);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.queryByText(/这里只展示作者真实提交/)).not.toBeInTheDocument();
    expect(screen.queryByText('本期精选')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '文章档案' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '社区故事栏目' })).not.toBeInTheDocument();
    expect(screen.queryByText(/内容样稿/)).not.toBeInTheDocument();
    expect(listPublished).toHaveBeenCalledWith(undefined, 100);
  });

  it('searches across real article titles', async () => {
    renderFieldNotes('/community-stories/all');
    const search = screen.getByRole('searchbox', { name: '搜索文章或人物' });
    fireEvent.change(search, { target: { value: '厨房' } });

    await waitFor(() => expect(screen.getByText('找到 1 篇文章')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: '阅读：村庄厨房的一天' })).toHaveAttribute('href', '/community-stories/village-kitchen');
  });

  it('derives people filters from published records', async () => {
    renderFieldNotes('/community-stories/all');
    const person = await screen.findByRole('button', { name: /小雨/ });
    fireEvent.click(person);
    await waitFor(() => expect(screen.getByText('找到 2 篇文章')).toBeInTheDocument());
  });

  it('preserves topic browsing and clears the selected topic', async () => {
    renderFieldNotes('/community-stories?browse=topics&topic=local');
    expect(await screen.findByText('找到 1 篇文章')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '按题材' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
    expect(screen.getByRole('tab', { name: '按题材' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps a single collection and existing filters on the legacy all URL', async () => {
    renderFieldNotes('/community-stories/all?person=xiaoyu');
    expect(screen.getByRole('heading', { name: '社区故事' })).toBeInTheDocument();
    expect(await screen.findByText('找到 2 篇文章')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '村庄厨房的一天' })).not.toBeInTheDocument();
  });

  it('retries a failed article request', async () => {
    listPublished.mockRejectedValueOnce(new Error('Connection failed'));
    renderFieldNotes();
    expect(await screen.findByRole('alert')).toHaveTextContent('文章暂时没有加载出来');
    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
    expect(await screen.findByText('找到 3 篇文章')).toBeInTheDocument();
  });

  it('shows a real empty state without substituting sample content', async () => {
    listPublished.mockResolvedValue([]);
    renderFieldNotes();

    expect(await screen.findByRole('heading', { name: '还没有正式发布的文章' })).toBeInTheDocument();
    expect(screen.queryByText('在一条真正走过的路上，重新理解成长')).not.toBeInTheDocument();
  });
});
