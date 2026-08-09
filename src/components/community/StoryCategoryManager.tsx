import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Plus, Save, Shapes } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import {
  createArticleCategory,
  updateArticleCategory,
  type ArticleCategory,
} from '@/services/field-notes';

type Translate = (zh: string, en: string) => string;

type CategoryDraft = Pick<ArticleCategory, 'id' | 'name_zh' | 'name_en' | 'sort_order' | 'is_active'>;

export default function StoryCategoryManager({
  open,
  categories,
  t,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  categories: ArticleCategory[];
  t: Translate;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void> | void;
}) {
  const [drafts, setDrafts] = useState<CategoryDraft[]>([]);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [busyId, setBusyId] = useState<number | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(categories.map(({ id, name_zh, name_en, sort_order, is_active }) => ({
      id,
      name_zh,
      name_en,
      sort_order,
      is_active,
    })));
  }, [categories]);

  const nextSortOrder = useMemo(
    () => Math.max(0, ...categories.map((category) => category.sort_order)) + 10,
    [categories],
  );

  const handleCreate = async () => {
    if (!nameZh.trim() || busyId) return;
    setBusyId('new');
    setError(null);
    try {
      await createArticleCategory({ nameZh, nameEn, sortOrder: nextSortOrder });
      setNameZh('');
      setNameEn('');
      await onChanged();
      toast.success(t('分类已新建', 'Category created'));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t('无法新建分类。', 'Could not create the category.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleSave = async (draft: CategoryDraft) => {
    if (!draft.name_zh.trim() || busyId) return;
    setBusyId(draft.id);
    setError(null);
    try {
      await updateArticleCategory(draft.id, {
        name_zh: draft.name_zh.trim(),
        name_en: draft.name_en?.trim() || null,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
      });
      await onChanged();
      toast.success(t('分类已更新', 'Category updated'));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('无法更新分类。', 'Could not update the category.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!busyId) onOpenChange(nextOpen); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-[1.75rem] border-[hsl(var(--community-forest)/0.14)] bg-[hsl(var(--community-paper))] p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-[hsl(var(--community-forest)/0.1)] px-6 py-6 text-left sm:px-8">
          <span className="mb-2 grid size-11 place-items-center rounded-2xl rounded-bl-md bg-[hsl(var(--community-orange)/0.11)] text-[hsl(var(--community-orange))]">
            <Shapes className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle className="font-serif text-3xl text-[hsl(var(--community-forest))]">{t('管理文章分类', 'Manage story categories')}</DialogTitle>
          <DialogDescription className="max-w-xl leading-6 text-[hsl(var(--community-forest)/0.62)]">
            {t('分类构成文章广场的主要浏览结构。停用后不会影响已经使用该分类的文章。', 'Categories shape the square’s main browsing structure. Deactivating one does not change existing stories.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-7 px-6 py-6 sm:px-8">
          {error ? <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive" role="alert">{error}</p> : null}

          <section aria-labelledby="new-story-category-title">
            <p id="new-story-category-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-orange))]">{t('新建分类', 'New category')}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <input className="community-field h-11 px-3 text-sm" value={nameZh} onChange={(event) => setNameZh(event.target.value)} placeholder={t('中文名称', 'Chinese name')} maxLength={80} />
              <input className="community-field h-11 px-3 text-sm" value={nameEn} onChange={(event) => setNameEn(event.target.value)} placeholder={t('英文名称（可选）', 'English name (optional)')} maxLength={120} />
              <button type="button" className="community-button community-button--primary min-h-11" disabled={!nameZh.trim() || Boolean(busyId)} onClick={() => void handleCreate()}>
                {busyId === 'new' ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}{t('添加', 'Add')}
              </button>
            </div>
          </section>

          <section className="border-t border-[hsl(var(--community-forest)/0.1)] pt-6" aria-labelledby="story-category-list-title">
            <div className="flex items-center justify-between gap-4">
              <p id="story-category-list-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-forest)/0.5)]">{t('现有分类', 'Existing categories')}</p>
              <span className="text-xs text-[hsl(var(--community-forest)/0.48)]">{categories.length}</span>
            </div>
            <div className="mt-3 divide-y divide-[hsl(var(--community-forest)/0.09)] border-y border-[hsl(var(--community-forest)/0.09)]">
              {drafts.map((draft, index) => (
                <div key={draft.id} className="grid gap-3 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-center">
                  <span className="text-xs font-semibold text-[hsl(var(--community-forest)/0.4)]">{String(index + 1).padStart(2, '0')}</span>
                  <input
                    className="community-field h-10 px-3 text-sm"
                    value={draft.name_zh}
                    onChange={(event) => setDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, name_zh: event.target.value } : item))}
                    aria-label={t('分类中文名称', 'Chinese category name')}
                  />
                  <input
                    className="community-field h-10 px-3 text-sm"
                    value={draft.name_en || ''}
                    onChange={(event) => setDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, name_en: event.target.value } : item))}
                    aria-label={t('分类英文名称', 'English category name')}
                  />
                  <button
                    type="button"
                    className={`community-category-visibility ${draft.is_active ? 'is-active' : ''}`}
                    onClick={() => setDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, is_active: !item.is_active } : item))}
                    aria-pressed={draft.is_active}
                  >
                    {draft.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    {draft.is_active ? t('启用', 'Active') : t('停用', 'Inactive')}
                  </button>
                  <button type="button" className="community-icon-button" disabled={Boolean(busyId) || !draft.name_zh.trim()} onClick={() => void handleSave(draft)} aria-label={t('保存分类', 'Save category')}>
                    {busyId === draft.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
