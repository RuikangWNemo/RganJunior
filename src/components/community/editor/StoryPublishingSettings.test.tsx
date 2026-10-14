import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StoryPublishingSettings from './StoryPublishingSettings';
import type { ArticleCategory, FieldNoteTag } from '@/services/field-notes';

describe('publishing taxonomy translations', () => {
  it('uses confirmed terms in the article language while preserving custom names and IDs', () => {
    const category: ArticleCategory = {
      id: 7, slug: 'reflections', name_zh: '生活随笔与反思', name_en: 'Old wording',
      is_active: true, sort_order: 0, created_by: null, created_at: '', updated_at: '',
    };
    const tag: FieldNoteTag = {
      id: 9, slug: 'tea', name_zh: '禅茶', name_en: 'Old tea wording',
      is_active: true, sort_order: 0, created_by: null, created_at: '', updated_at: '',
      archived_at: null, color: null, description: null, icon: null, parent_id: null,
    };
    const props = {
      categories: [category, { ...category, id: 8, slug: 'custom', name_zh: '自定义', name_en: 'My Custom Category' }],
      tags: [tag], metadata: { categoryId: 7, topicIds: [9], visibility: 'private' as const },
      editable: true, creatingTag: false, t: (zh: string) => zh,
      onChange: vi.fn(), onCreateTag: vi.fn(),
    };
    const { rerender } = render(<StoryPublishingSettings {...props} language="en" />);
    expect(screen.getByRole('option', { name: 'Essays and Reflections' })).toHaveValue('7');
    expect(screen.getByRole('option', { name: 'My Custom Category' })).toHaveValue('8');
    expect(screen.getByText('Zen Tea Practice')).toBeInTheDocument();
    expect(screen.queryByText('Old tea wording')).not.toBeInTheDocument();
    rerender(<StoryPublishingSettings {...props} language="zh" />);
    expect(screen.getByRole('option', { name: '生活随笔与反思' })).toHaveValue('7');
    expect(screen.getByText('禅茶')).toBeInTheDocument();
  });
});
