import { useMemo, useState } from 'react';
import { Check, Globe2, Loader2, LockKeyhole, Plus, Tag, Users, X } from 'lucide-react';

import type {
  ArticleCategory,
  FieldNoteMetadata,
  FieldNoteTag,
  FieldNoteVisibility,
} from '@/services/field-notes';

type Translate = (zh: string, en: string) => string;

export default function StoryPublishingSettings({
  categories,
  tags,
  metadata,
  language,
  editable,
  creatingTag,
  t,
  onChange,
  onCreateTag,
}: {
  categories: ArticleCategory[];
  tags: FieldNoteTag[];
  metadata: FieldNoteMetadata;
  language: 'zh' | 'en';
  editable: boolean;
  creatingTag: boolean;
  t: Translate;
  onChange: (metadata: FieldNoteMetadata) => void;
  onCreateTag: (name: string) => Promise<void> | void;
}) {
  const [tagName, setTagName] = useState('');
  const selected = useMemo(() => new Set(metadata.topicIds), [metadata.topicIds]);
  const selectedTags = tags.filter((tag) => selected.has(tag.id));
  const availableTags = tags.filter((tag) => !selected.has(tag.id));

  const categoryLabel = (category: ArticleCategory) => language === 'zh'
    ? category.name_zh
    : (category.name_en || category.name_zh);
  const tagLabel = (tag: FieldNoteTag) => language === 'zh' ? tag.name_zh : (tag.name_en || tag.name_zh);

  const addTag = (tagId: number) => {
    if (!editable || selected.has(tagId) || metadata.topicIds.length >= 12) return;
    onChange({ ...metadata, topicIds: [...metadata.topicIds, tagId] });
  };
  const removeTag = (tagId: number) => {
    if (!editable) return;
    onChange({ ...metadata, topicIds: metadata.topicIds.filter((id) => id !== tagId) });
  };
  const createTag = async () => {
    const name = tagName.trim();
    if (!name || creatingTag || metadata.topicIds.length >= 12) return;
    await onCreateTag(name);
    setTagName('');
  };

  const visibilityOptions: Array<{
    value: FieldNoteVisibility;
    icon: typeof Globe2;
    zh: string;
    en: string;
    descriptionZh: string;
    descriptionEn: string;
  }> = [
    { value: 'private', icon: LockKeyhole, zh: '仅自己', en: 'Only me', descriptionZh: '只在你的工作台可见', descriptionEn: 'Visible only in your workspace' },
    { value: 'members', icon: Users, zh: '社群成员', en: 'Members', descriptionZh: '发布后仅正式成员可见', descriptionEn: 'Visible to active members after publishing' },
    { value: 'public', icon: Globe2, zh: '公开', en: 'Public', descriptionZh: '发布后进入文章广场', descriptionEn: 'Appears in the story square after publishing' },
  ];

  return (
    <div className="community-publishing-settings">
      <div>
        <label htmlFor="story-category" className="community-story-editor__section-label">{t('主分类', 'Primary category')}</label>
        <div className="relative mt-3">
          <select
            id="story-category"
            className="community-field h-11 w-full appearance-none px-3 pr-9 text-sm"
            value={metadata.categoryId ?? ''}
            onChange={(event) => onChange({ ...metadata, categoryId: event.target.value ? Number(event.target.value) : null })}
            disabled={!editable}
          >
            <option value="">{t('选择一个分类', 'Choose a category')}</option>
            {categories.map((category) => <option value={category.id} key={category.id}>{categoryLabel(category)}</option>)}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--community-forest)/0.45)]">⌄</span>
        </div>
        {!metadata.categoryId && editable ? <p className="mt-2 text-xs leading-5 text-[hsl(var(--community-orange))]">{t('保存草稿时可以暂不选择，提交审核前必须补全。', 'Optional for drafts, required before submission.')}</p> : null}
      </div>

      <div className="border-t border-[hsl(var(--community-forest)/0.1)] pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="community-story-editor__section-label"><Tag className="size-4" />{t('标签', 'Tags')}</p>
          <span className="text-[0.68rem] text-[hsl(var(--community-forest)/0.46)]">{metadata.topicIds.length}/12</span>
        </div>

        {selectedTags.length ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label={t('已选标签', 'Selected tags')}>
            {selectedTags.map((tag) => (
              <span className="community-story-tag is-selected" key={tag.id}>
                {tagLabel(tag)}
                {editable ? <button type="button" onClick={() => removeTag(tag.id)} aria-label={`${t('移除标签', 'Remove tag')} ${tagLabel(tag)}`}><X className="size-3" /></button> : null}
              </span>
            ))}
          </div>
        ) : <p className="mt-3 text-xs leading-5 text-[hsl(var(--community-forest)/0.48)]">{t('用标签把相近的经历连接起来。', 'Use tags to connect related experiences.')}</p>}

        {editable ? (
          <>
            {availableTags.length ? (
              <div className="community-story-tag-cloud" aria-label={t('可选标签', 'Available tags')}>
                {availableTags.slice(0, 12).map((tag) => (
                  <button type="button" key={tag.id} onClick={() => addTag(tag.id)} disabled={metadata.topicIds.length >= 12}>
                    <Plus className="size-3" />{tagLabel(tag)}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex gap-2">
              <input
                className="community-field h-10 min-w-0 flex-1 px-3 text-sm"
                value={tagName}
                onChange={(event) => setTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void createTag();
                  }
                }}
                placeholder={t('新建标签', 'Create a tag')}
                maxLength={40}
                disabled={creatingTag || metadata.topicIds.length >= 12}
              />
              <button type="button" className="community-icon-button" onClick={() => void createTag()} disabled={!tagName.trim() || creatingTag || metadata.topicIds.length >= 12} aria-label={t('添加新标签', 'Add new tag')}>
                {creatingTag ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              </button>
            </div>
          </>
        ) : null}
      </div>

      <fieldset className="border-t border-[hsl(var(--community-forest)/0.1)] pt-5" disabled={!editable}>
        <legend className="community-story-editor__section-label">{t('可见范围', 'Visibility')}</legend>
        <div className="mt-3 space-y-2">
          {visibilityOptions.map(({ value, icon: Icon, zh, en, descriptionZh, descriptionEn }) => {
            const active = metadata.visibility === value;
            return (
              <label className={`community-visibility-option ${active ? 'is-active' : ''}`} key={value}>
                <input type="radio" name="story-visibility" value={value} checked={active} onChange={() => onChange({ ...metadata, visibility: value })} />
                <Icon className="size-4" aria-hidden="true" />
                <span><strong>{t(zh, en)}</strong><small>{t(descriptionZh, descriptionEn)}</small></span>
                {active ? <Check className="ml-auto size-4" aria-hidden="true" /> : null}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
