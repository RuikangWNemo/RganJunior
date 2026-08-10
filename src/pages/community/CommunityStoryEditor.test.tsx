import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityStoryEditor from './CommunityStoryEditor';

const getBundle = vi.fn();
const checkpoint = vi.fn();
const getMetadata = vi.fn();
const listCategories = vi.fn();
const listTags = vi.fn();
const saveMetadata = vi.fn();
const createTag = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { access_token: 'session-token' },
  }),
}));

vi.mock('@/services/field-note-editor', () => ({
  getFieldNoteEditorBundle: (...args: unknown[]) => getBundle(...args),
  checkpointFieldNote: (...args: unknown[]) => checkpoint(...args),
}));

vi.mock('@/services/field-notes', () => ({
  createFieldNote: vi.fn(),
  getFieldNoteMetadata: (...args: unknown[]) => getMetadata(...args),
  listArticleCategories: (...args: unknown[]) => listCategories(...args),
  listFieldNoteTags: (...args: unknown[]) => listTags(...args),
  saveFieldNoteMetadata: (...args: unknown[]) => saveMetadata(...args),
  findOrCreateFieldNoteTag: (...args: unknown[]) => createTag(...args),
}));

vi.mock('@/components/community/editor/StoryCollaborationPanel', () => ({
  default: () => <button type="button">协作</button>,
}));

vi.mock('@/components/community/editor/CollaborativeStoryEditor', () => {
  function MockCollaborativeStoryEditor({
    onEditorReady,
    onSaveStateChange,
  }: {
    onEditorReady(editor: { document: unknown[] }): void;
    onSaveStateChange(state: string): void;
  }) {
    useEffect(() => {
      onEditorReady({ document: [{ type: 'paragraph', content: '正文' }] });
      onSaveStateChange('saved');
    }, [onEditorReady, onSaveStateChange]);
    return <div data-testid="advanced-editor">高级块编辑器</div>;
  }

  return { default: MockCollaborativeStoryEditor };
});

const bundle = {
  access: {
    fieldNoteId: 42,
    status: 'draft',
    collaborationMode: 'invite_only',
    canRead: true,
    canWrite: true,
    canComment: true,
    shareLinkUsed: false,
    collaboratorRole: null,
    title: '一起写一篇真实的文章',
    excerpt: '一段摘要',
    legacyContent: '',
    contentJson: null,
    contentSchemaVersion: 1,
    canManageCollaboration: true,
    visibility: 'private',
    language: 'zh',
    isOwner: true,
    user: { id: 'member-1', displayName: '山风', avatarMediaId: null },
  },
  collaborators: [],
  revisions: [],
  shareLink: { active: false, expiresAt: null, lastUsedAt: null },
};

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={['/community/stories/42/edit']}>
      <LanguageProvider>
        <Routes>
          <Route path="/community/stories/:noteId/edit" element={<CommunityStoryEditor />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityStoryEditor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
    getBundle.mockReset().mockResolvedValue(bundle);
    checkpoint.mockReset().mockResolvedValue({
      revisionId: 8,
      status: 'draft',
      savedAt: '2026-08-08T06:00:00.000Z',
    });
    getMetadata.mockReset().mockResolvedValue({ categoryId: 1, topicIds: [], visibility: 'private' });
    listCategories.mockReset().mockResolvedValue([{ id: 1, name_zh: '人物故事', name_en: 'People Stories', slug: 'people-stories', sort_order: 10, is_active: true }]);
    listTags.mockReset().mockResolvedValue([]);
    saveMetadata.mockReset().mockResolvedValue(undefined);
    createTag.mockReset().mockResolvedValue({ id: 8, name_zh: '乡村教育', name_en: null });
  });

  it('loads the advanced collaborative workspace with a stable return path', async () => {
    renderEditor();

    expect(await screen.findByDisplayValue('一起写一篇真实的文章')).toBeInTheDocument();
    expect(await screen.findByTestId('advanced-editor')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回文章列表' })).toHaveAttribute('href', '/community/stories');
    expect(screen.getByRole('button', { name: '提交审核' })).toBeInTheDocument();
    expect(screen.getByText('所有更改已保存')).toBeInTheDocument();
  });

  it('creates an explicit restorable version from the current block document', async () => {
    renderEditor();
    await screen.findByTestId('advanced-editor');

    fireEvent.click(screen.getByRole('button', { name: '保存版本' }));

    await waitFor(() => expect(checkpoint).toHaveBeenCalledWith(expect.objectContaining({
      noteId: 42,
      accessToken: 'session-token',
      title: '一起写一篇真实的文章',
      excerpt: '一段摘要',
      blocks: [{ type: 'paragraph', content: '正文' }],
      automatic: false,
      submit: false,
    })));
    expect(await screen.findByText('已创建一个可追溯的版本。')).toBeInTheDocument();
  });

  it('saves category, tags, and visibility before submission', async () => {
    renderEditor();
    await screen.findByTestId('advanced-editor');

    fireEvent.click(screen.getByText('公开'));
    fireEvent.change(screen.getByPlaceholderText('新建标签'), { target: { value: '乡村教育' } });
    fireEvent.click(screen.getByRole('button', { name: '添加新标签' }));
    await waitFor(() => expect(createTag).toHaveBeenCalledWith('乡村教育'));

    fireEvent.click(screen.getByRole('button', { name: '提交审核' }));

    await waitFor(() => expect(saveMetadata).toHaveBeenCalledWith(42, {
      categoryId: 1,
      topicIds: [8],
      visibility: 'public',
    }));
    expect(checkpoint).toHaveBeenCalledWith(expect.objectContaining({ submit: true }));
  });
});
