import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAdminFieldNotes from './CommunityAdminFieldNotes';

const listNotes = vi.fn();
const transition = vi.fn();
const publish = vi.fn();
const feature = vi.fn();
const resolvePreview = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    permissions: ['field_notes.review', 'field_notes.approve', 'field_notes.publish'],
  }),
}));

vi.mock('@/services/field-notes', () => ({
  listEditorialFieldNotes: (...args: unknown[]) => listNotes(...args),
  transitionFieldNote: (...args: unknown[]) => transition(...args),
  publishFieldNote: (...args: unknown[]) => publish(...args),
  setFieldNoteFeatured: (...args: unknown[]) => feature(...args),
  resolveEditorialPreviewHtml: (...args: unknown[]) => resolvePreview(...args),
}));

function note(id: number, status: string, input: { featured?: boolean; title?: string } = {}) {
  return {
    id,
    slug: `real-story-${id}`,
    title: input.title || `真实投稿 ${id}`,
    excerpt: `真实投稿 ${id} 的摘要`,
    content: `真实投稿 ${id} 的正文`,
    content_html: `<p>真实投稿 ${id} 的正文</p>`,
    status,
    visibility: status === 'published' ? 'public' : 'private',
    featured: input.featured ?? false,
    language: 'zh',
    category_id: 1,
    collaboration_mode: 'invite_only',
    cover_media_id: null,
    created_by: 'member-1',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: `2026-08-0${id}T00:00:00.000Z`,
    submitted_at: null,
    reviewed_at: null,
    approved_at: null,
    published_at: null,
    archived_at: null,
    content_json: null,
    content_schema_version: 1,
    seo_description: null,
    seo_title: null,
    subtitle: null,
    translation_of_id: null,
    article_categories: null,
    field_note_topics: [],
    field_note_media: [],
    field_note_authors: [{ author_order: 0, contribution_role: 'author', people: { id, slug: `author-${id}`, display_name: `作者 ${id}`, nature_name: null } }],
  };
}

const notes = [
  note(1, 'submitted'),
  note(2, 'in_review'),
  note(3, 'approved'),
  note(4, 'published'),
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/community/admin/field-notes']}>
      <LanguageProvider initialLanguage="zh"><CommunityAdminFieldNotes /></LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityAdminFieldNotes', () => {
  beforeEach(() => {
    listNotes.mockReset().mockResolvedValue(notes);
    transition.mockReset().mockResolvedValue(undefined);
    publish.mockReset().mockResolvedValue(undefined);
    feature.mockReset().mockResolvedValue(undefined);
    resolvePreview.mockReset().mockResolvedValue('<h2>真实预览正文</h2>');
  });

  it('moves real submissions through the review workflow', async () => {
    renderPage();
    await screen.findByText('真实投稿 1');

    fireEvent.click(screen.getByRole('button', { name: '开始审核' }));
    await waitFor(() => expect(transition).toHaveBeenCalledWith(1, 'in_review'));

    fireEvent.click(screen.getByRole('button', { name: '批准' }));
    await waitFor(() => expect(transition).toHaveBeenCalledWith(2, 'approved'));

    fireEvent.click(screen.getByRole('button', { name: '公开发布' }));
    await waitFor(() => expect(publish).toHaveBeenCalledWith(3));
  });

  it('previews stored content and manages featured published stories', async () => {
    renderPage();
    await screen.findByText('真实投稿 1');

    fireEvent.click(screen.getAllByRole('button', { name: '预览原文' })[0]);
    expect(await screen.findByRole('heading', { name: '真实预览正文' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    const publishedTab = await screen.findByRole('tab', { name: /已发布/ });
    fireEvent.click(publishedTab);
    fireEvent.click(screen.getByRole('button', { name: '设为精选' }));
    await waitFor(() => expect(feature).toHaveBeenCalledWith(4, true));
  });
});
