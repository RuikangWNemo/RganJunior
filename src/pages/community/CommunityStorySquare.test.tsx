import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityStorySquare from './CommunityStorySquare';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ permissions: ['field_notes.publish'] }),
}));

const listSquare = vi.fn();
const listCategories = vi.fn();

vi.mock('@/services/field-notes', () => ({
  listCommunitySquareFieldNotes: (...args: unknown[]) => listSquare(...args),
  listArticleCategories: (...args: unknown[]) => listCategories(...args),
}));

const categories = [
  { id: 1, name_zh: '人物故事', name_en: 'People Stories', slug: 'people-stories', sort_order: 10, is_active: true },
  { id: 2, name_zh: '自然观察', name_en: 'Nature Observation', slug: 'nature-observation', sort_order: 20, is_active: true },
];

function squareNote(input: { id: number; title: string; slug: string; categoryId: number; tagId: number; tag: string }) {
  const category = categories.find((item) => item.id === input.categoryId)!;
  return {
    id: input.id,
    title: input.title,
    slug: input.slug,
    category_id: input.categoryId,
    status: 'published',
    visibility: 'public',
    excerpt: `${input.title}的摘要`,
    published_at: `2026-08-0${input.id}T00:00:00.000Z`,
    updated_at: `2026-08-0${input.id}T00:00:00.000Z`,
    article_categories: category,
    field_note_topics: [{ topic_id: input.tagId, topics: { id: input.tagId, name_zh: input.tag, name_en: null } }],
    field_note_authors: [{ author_order: 0, contribution_role: 'author', people: { id: input.id, slug: `author-${input.id}`, nature_name: `作者${input.id}`, display_name: '' } }],
    field_note_media: [],
  };
}

describe('CommunityStorySquare', () => {
  beforeEach(() => {
    listCategories.mockReset().mockResolvedValue(categories);
    listSquare.mockReset().mockResolvedValue([
      squareNote({ id: 1, title: '一棵树的四季', slug: 'tree-seasons', categoryId: 2, tagId: 8, tag: '自然' }),
      squareNote({ id: 2, title: '外婆的茶厨房', slug: 'grandma-tea', categoryId: 1, tagId: 9, tag: '食物' }),
    ]);
  });

  it('renders public stories as an editorial feature and feed', async () => {
    render(
      <MemoryRouter initialEntries={['/community/stories/square']}>
        <LanguageProvider initialLanguage="zh"><CommunityStorySquare /></LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: '一棵树的四季' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '外婆的茶厨房' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '管理我的文章' })).toHaveAttribute('href', '/community/stories');
    expect(screen.getByRole('link', { name: '管理发布与精选' })).toHaveAttribute('href', '/community/admin/field-notes');
    expect(screen.getByRole('link', { name: '阅读这篇文章' })).toHaveAttribute('href', '/field-notes/tree-seasons');
  });

  it('filters stories by category and keyword', async () => {
    render(
      <MemoryRouter initialEntries={['/community/stories/square']}>
        <LanguageProvider initialLanguage="zh"><CommunityStorySquare /></LanguageProvider>
      </MemoryRouter>,
    );
    await screen.findByText('一棵树的四季');

    fireEvent.click(screen.getByRole('button', { name: '人物故事' }));
    expect(screen.queryByText('一棵树的四季')).not.toBeInTheDocument();
    expect(screen.getByText('外婆的茶厨房')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('搜索故事、作者或标签'), { target: { value: '不存在' } });
    expect(screen.getByText('没有符合条件的文章')).toBeInTheDocument();
  });
});
