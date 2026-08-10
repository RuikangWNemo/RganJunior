import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArchiveRestore,
  ArrowRight,
  BookOpenText,
  ChevronDown,
  CircleEllipsis,
  Clock3,
  FileText,
  Filter,
  Loader2,
  Newspaper,
  Plus,
  Search,
  Settings2,
  Tags,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import StoryCategoryManager from '@/components/community/StoryCategoryManager';
import StoryDeleteDialog from '@/components/community/StoryDeleteDialog';
import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communityPrimaryButtonClass,
  communitySecondaryButtonClass,
} from '@/components/community/CommunitySurface';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import {
  archiveFieldNote,
  listArticleCategories,
  listMyFieldNotes,
  permanentlyDeleteFieldNote,
  restoreFieldNote,
  type ManagedFieldNote,
} from '@/services/field-notes';

type StoryView = 'all' | 'draft' | 'review' | 'published' | 'trash';
type StorySort = 'updated_desc' | 'updated_asc' | 'title';

const reviewStatuses = new Set(['submitted', 'in_review', 'changes_requested', 'approved']);

function noteTags(note: ManagedFieldNote) {
  return note.field_note_topics
    .map((relation) => relation.topics)
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));
}

export default function CommunityStories() {
  const { permissions } = useAuth();
  const { lang, t, status, formatDateTime } = useCommunityUi();
  const canManageCategories = permissions.includes('topics.manage');
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listMyFieldNotes>>>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof listArticleCategories>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<StoryView>('all');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [sort, setSort] = useState<StorySort>('updated_desc');
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [confirming, setConfirming] = useState<{ note: ManagedFieldNote; permanent: boolean } | null>(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextNotes, nextCategories] = await Promise.all([
        listMyFieldNotes(),
        listArticleCategories({ includeInactive: canManageCategories }),
      ]);
      setNotes(nextNotes);
      setCategories(nextCategories);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('文章读取失败。', 'Could not load your stories.'));
    } finally {
      setLoading(false);
    }
  }, [canManageCategories, t]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    all: notes.filter((note) => note.status !== 'archived').length,
    draft: notes.filter((note) => note.status === 'draft').length,
    review: notes.filter((note) => reviewStatuses.has(note.status)).length,
    published: notes.filter((note) => note.status === 'published').length,
    trash: notes.filter((note) => note.status === 'archived').length,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matching = notes.filter((note) => {
      const viewMatches = view === 'all'
        ? note.status !== 'archived'
        : view === 'review'
          ? reviewStatuses.has(note.status)
          : view === 'trash'
            ? note.status === 'archived'
            : note.status === view;
      if (!viewMatches) return false;
      if (categoryId !== 'all' && note.category_id !== Number(categoryId)) return false;
      if (!normalizedQuery) return true;
      const searchText = [
        note.title,
        note.excerpt || '',
        note.article_categories?.name_zh || '',
        note.article_categories?.name_en || '',
        ...noteTags(note).flatMap((tag) => [tag.name_zh, tag.name_en || '']),
      ].join(' ').toLocaleLowerCase();
      return searchText.includes(normalizedQuery);
    });
    return [...matching].sort((left, right) => {
      if (sort === 'title') return left.title.localeCompare(right.title, lang === 'zh' ? 'zh-CN' : 'en-US');
      const direction = sort === 'updated_asc' ? 1 : -1;
      return left.updated_at.localeCompare(right.updated_at) * direction;
    });
  }, [categoryId, lang, notes, query, sort, view]);

  const handleConfirmedDelete = async () => {
    if (!confirming || mutationBusy) return;
    setMutationBusy(true);
    try {
      if (confirming.permanent) {
        await permanentlyDeleteFieldNote(confirming.note.id);
        toast.success(t('文章已永久删除', 'Story permanently deleted'));
      } else {
        await archiveFieldNote(confirming.note.id);
        toast.success(t('草稿已移入回收站', 'Draft moved to Trash'));
      }
      setConfirming(null);
      await load();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : t('操作失败，请重试。', 'The action failed. Try again.'));
    } finally {
      setMutationBusy(false);
    }
  };

  const handleRestore = async (note: ManagedFieldNote) => {
    if (restoringId) return;
    setRestoringId(note.id);
    try {
      await restoreFieldNote(note.id);
      toast.success(t('草稿已恢复', 'Draft restored'));
      await load();
    } catch (restoreError) {
      toast.error(restoreError instanceof Error ? restoreError.message : t('无法恢复草稿。', 'Could not restore the draft.'));
    } finally {
      setRestoringId(null);
    }
  };

  const views: Array<{ id: StoryView; zh: string; en: string; count: number }> = [
    { id: 'all', zh: '全部', en: 'All', count: counts.all },
    { id: 'draft', zh: '草稿', en: 'Drafts', count: counts.draft },
    { id: 'review', zh: '审核中', en: 'In review', count: counts.review },
    { id: 'published', zh: '已发布', en: 'Published', count: counts.published },
    { id: 'trash', zh: '回收站', en: 'Trash', count: counts.trash },
  ];

  const emptyCopy = query || categoryId !== 'all'
    ? {
      title: t('没有符合条件的文章', 'No matching stories'),
      description: t('换一个关键词或分类试试。', 'Try another keyword or category.'),
    }
    : view === 'trash'
      ? {
        title: t('回收站是空的', 'Trash is empty'),
        description: t('移除的草稿会暂时保存在这里。', 'Removed drafts will stay here until you delete them forever.'),
      }
      : {
        title: t('你的第一篇文章，从这里开始', 'Your first story starts here'),
        description: t('先保存成草稿也没关系。写下一个你不想忘记的片段。', 'A draft is enough to begin. Write down one moment you do not want to forget.'),
      };

  return (
    <CommunitySurface
      eyebrow="Story desk"
      title={t('我的文章，正在成为共同记忆。', 'Your stories, becoming shared memory.')}
      description={t('从草稿到发布，在这里整理每一次观察、行动与成长。', 'Shape each observation, action, and moment of growth from draft to publication.')}
      width="wide"
      action={(
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/community/stories/square" className={`${communitySecondaryButtonClass} gap-2`}><Newspaper className="size-4" />{t('文章广场', 'Story square')}</Link>
          <Link to="/community/stories/new" className={`${communityPrimaryButtonClass} gap-2`}><Plus className="size-4" />{t('写文章', 'Write')}</Link>
        </div>
      )}
    >
      {loading ? <CommunityLoadingState label={t('正在整理你的文章…', 'Gathering your stories…')} variant="list" /> : null}
      {!loading && error ? <CommunityErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error ? (
        <div className="community-story-library">
          <section className="community-story-stats" aria-label={t('文章概览', 'Story overview')}>
            {[
              { label: t('所有文章', 'All stories'), value: counts.all, icon: BookOpenText },
              { label: t('草稿', 'Drafts'), value: counts.draft, icon: FileText },
              { label: t('审核中', 'In review'), value: counts.review, icon: Clock3 },
              { label: t('已发布', 'Published'), value: counts.published, icon: Newspaper },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="community-story-stat">
                <Icon className="size-4" aria-hidden="true" />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </section>

          <section className="community-story-toolbar" aria-label={t('筛选文章', 'Filter stories')}>
            <div className="community-story-tabs" role="tablist" aria-label={t('文章状态', 'Story status')}>
              {views.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={view === item.id} className={view === item.id ? 'is-active' : ''} onClick={() => setView(item.id)}>
                  {t(item.zh, item.en)}<span>{item.count}</span>
                </button>
              ))}
            </div>

            <div className="community-story-filters">
              <label className="community-story-search">
                <Search className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('搜索文章', 'Search stories')}</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('搜索标题、摘要或标签', 'Search title, summary, or tag')} />
              </label>
              <label className="community-story-select">
                <Filter className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('按分类筛选', 'Filter by category')}</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                  <option value="all">{t('全部分类', 'All categories')}</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{lang === 'zh' ? category.name_zh : (category.name_en || category.name_zh)}{category.is_active ? '' : ` · ${t('停用', 'Inactive')}`}</option>)}
                </select>
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </label>
              <label className="community-story-select">
                <Clock3 className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('文章排序', 'Sort stories')}</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as StorySort)}>
                  <option value="updated_desc">{t('最近更新', 'Recently updated')}</option>
                  <option value="updated_asc">{t('最早更新', 'Oldest updated')}</option>
                  <option value="title">{t('按标题', 'By title')}</option>
                </select>
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </label>
              {canManageCategories ? (
                <button type="button" className="community-button community-button--secondary min-h-11" onClick={() => setCategoryManagerOpen(true)}>
                  <Settings2 className="size-4" />{t('管理分类', 'Categories')}
                </button>
              ) : null}
            </div>
          </section>

          {filteredNotes.length ? (
            <div className="community-story-list">
              {filteredNotes.map((note, index) => {
                const tags = noteTags(note);
                const editable = ['draft', 'changes_requested'].includes(note.status);
                const isTrash = note.status === 'archived';
                return (
                  <article key={note.id} className="community-story-row">
                    <div className="community-story-row__index">{String(index + 1).padStart(2, '0')}</div>
                    <div className="community-story-row__mark"><FileText className="size-5" aria-hidden="true" /></div>
                    <div className="community-story-row__body">
                      <div className="community-story-row__heading">
                        <div className="min-w-0">
                          {isTrash ? (
                            <h2>{note.title}</h2>
                          ) : (
                            <Link to={`/community/stories/${note.id}/edit`}><h2>{note.title}</h2></Link>
                          )}
                          {note.excerpt ? <p>{note.excerpt}</p> : <p className="is-placeholder">{t('还没有摘要', 'No summary yet')}</p>}
                        </div>
                        <span className={`community-story-status community-story-status--${note.status}`}>{status(note.status)}</span>
                      </div>
                      <div className="community-story-row__meta">
                        <span>{note.article_categories ? (lang === 'zh' ? note.article_categories.name_zh : (note.article_categories.name_en || note.article_categories.name_zh)) : t('未分类', 'Uncategorized')}</span>
                        {tags.slice(0, 3).map((tag) => <span key={tag.id} className="is-tag"><Tags className="size-3" />{lang === 'zh' ? tag.name_zh : (tag.name_en || tag.name_zh)}</span>)}
                        {tags.length > 3 ? <span>+{tags.length - 3}</span> : null}
                        <time>{t('更新于', 'Updated')} {formatDateTime(note.updated_at)}</time>
                      </div>
                    </div>
                    <div className="community-story-row__actions">
                      {isTrash ? (
                        <button type="button" className="community-story-row__primary-action" disabled={restoringId === note.id} onClick={() => void handleRestore(note)}>
                          {restoringId === note.id ? <Loader2 className="size-4 animate-spin" /> : <ArchiveRestore className="size-4" />}{t('恢复', 'Restore')}
                        </button>
                      ) : editable ? (
                        <Link to={`/community/stories/${note.id}/edit`} className="community-story-row__primary-action">{t('继续编辑', 'Continue')}<ArrowRight className="size-4" /></Link>
                      ) : note.status === 'published' ? (
                        <Link to={`/field-notes/${note.slug}`} className="community-story-row__primary-action">{t('查看文章', 'View story')}<ArrowRight className="size-4" /></Link>
                      ) : (
                        <Link to={`/community/stories/${note.id}/edit`} className="community-story-row__primary-action">{t('查看', 'View')}<ArrowRight className="size-4" /></Link>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="community-icon-button" aria-label={t('文章操作', 'Story actions')}><CircleEllipsis className="size-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-[hsl(var(--community-forest)/0.12)] bg-[#fffdf7] p-1.5">
                          {!isTrash ? <DropdownMenuItem asChild className="rounded-lg"><Link to={`/community/stories/${note.id}/edit`}>{editable ? t('编辑文章', 'Edit story') : t('查看工作区', 'View workspace')}</Link></DropdownMenuItem> : null}
                          {note.status === 'published' ? <DropdownMenuItem asChild className="rounded-lg"><Link to={`/field-notes/${note.slug}`}>{t('打开公开页面', 'Open public page')}</Link></DropdownMenuItem> : null}
                          {note.status === 'draft' ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive" onSelect={() => setConfirming({ note, permanent: false })}><Trash2 className="mr-2 size-4" />{t('移入回收站', 'Move to Trash')}</DropdownMenuItem>
                            </>
                          ) : null}
                          {isTrash ? (
                            <>
                              <DropdownMenuItem className="rounded-lg" disabled={restoringId === note.id} onSelect={() => void handleRestore(note)}><ArchiveRestore className="mr-2 size-4" />{t('恢复草稿', 'Restore draft')}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="rounded-lg text-destructive focus:text-destructive" onSelect={() => setConfirming({ note, permanent: true })}><Trash2 className="mr-2 size-4" />{t('永久删除', 'Delete forever')}</DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <CommunityEmptyState
              title={emptyCopy.title}
              description={emptyCopy.description}
              action={view !== 'trash' && !query && categoryId === 'all' ? <Link to="/community/stories/new" className={`${communityPrimaryButtonClass} gap-2`}><Plus className="size-4" />{t('开始写作', 'Start writing')}</Link> : undefined}
            />
          )}
        </div>
      ) : null}

      <StoryDeleteDialog
        open={Boolean(confirming)}
        permanent={confirming?.permanent ?? false}
        title={confirming?.note.title || ''}
        busy={mutationBusy}
        t={t}
        onOpenChange={(open) => { if (!open) setConfirming(null); }}
        onConfirm={() => void handleConfirmedDelete()}
      />
      {canManageCategories ? (
        <StoryCategoryManager
          open={categoryManagerOpen}
          categories={categories}
          t={t}
          onOpenChange={setCategoryManagerOpen}
          onChanged={load}
        />
      ) : null}
    </CommunitySurface>
  );
}
