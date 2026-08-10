import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  FileCheck2,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Star,
} from 'lucide-react';

import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
} from '@/components/community/CommunitySurface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import {
  listEditorialFieldNotes,
  publishFieldNote,
  resolveEditorialPreviewHtml,
  setFieldNoteFeatured,
  transitionFieldNote,
  type EditorialFieldNote,
  type FieldNoteStatus,
} from '@/services/field-notes';

type EditorialFilter = 'active' | 'submitted' | 'in_review' | 'approved' | 'published';

function authorName(note: EditorialFieldNote) {
  const author = [...note.field_note_authors]
    .sort((left, right) => left.author_order - right.author_order)
    .find((relation) => relation.people)?.people;
  return author?.nature_name || author?.display_name || null;
}

export default function CommunityAdminFieldNotes() {
  const { permissions } = useAuth();
  const { t, status, formatDateTime } = useCommunityUi();
  const [notes, setNotes] = useState<EditorialFieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EditorialFilter>('active');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [preview, setPreview] = useState<EditorialFieldNote | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | undefined>();
  const [previewLoading, setPreviewLoading] = useState(false);

  const canReview = permissions.includes('field_notes.review');
  const canApprove = permissions.includes('field_notes.approve');
  const canPublish = permissions.includes('field_notes.publish');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotes(await listEditorialFieldNotes());
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('文章审核台暂时无法打开。', 'The editorial desk is temporarily unavailable.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void load(); }, [load]);

  const visibleNotes = useMemo(() => notes.filter((note) => {
    if (filter === 'active') return note.status !== 'published';
    return note.status === filter;
  }), [filter, notes]);

  const counts = useMemo(() => ({
    active: notes.filter((note) => note.status !== 'published').length,
    submitted: notes.filter((note) => note.status === 'submitted').length,
    in_review: notes.filter((note) => note.status === 'in_review').length,
    approved: notes.filter((note) => note.status === 'approved').length,
    published: notes.filter((note) => note.status === 'published').length,
  }), [notes]);

  const mutate = async (note: EditorialFieldNote, action: () => Promise<unknown>, success: string) => {
    if (busyId) return;
    setBusyId(note.id);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : t('操作失败，请重试。', 'The action failed. Try again.'));
    } finally {
      setBusyId(null);
    }
  };

  const transition = (note: EditorialFieldNote, next: FieldNoteStatus, success: string) => (
    mutate(note, () => transitionFieldNote(note.id, next), success)
  );

  const openPreview = async (note: EditorialFieldNote) => {
    setPreview(note);
    setPreviewHtml(undefined);
    setPreviewLoading(true);
    try {
      setPreviewHtml(await resolveEditorialPreviewHtml(note));
    } catch {
      setPreviewHtml(note.content_html || undefined);
    } finally {
      setPreviewLoading(false);
    }
  };

  const filters: Array<{ id: EditorialFilter; label: string; count: number }> = [
    { id: 'active', label: t('待处理', 'Active'), count: counts.active },
    { id: 'submitted', label: t('待接审', 'Submitted'), count: counts.submitted },
    { id: 'in_review', label: t('审核中', 'In review'), count: counts.in_review },
    { id: 'approved', label: t('待发布', 'Approved'), count: counts.approved },
    { id: 'published', label: t('已发布', 'Published'), count: counts.published },
  ];

  return (
    <CommunitySurface
      eyebrow="Editorial desk"
      title={t('真实文章，从审核走向公开。', 'Real stories, reviewed before they go public.')}
      description={t('预览作者提交的原文，完成审核、批准、发布与精选。', 'Preview author submissions, then review, approve, publish, and feature them.')}
      width="wide"
    >
      {loading ? <CommunityLoadingState label={t('正在整理投稿…', 'Gathering submissions…')} variant="list" /> : null}
      {!loading && error ? <CommunityErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error ? (
        <div className="space-y-6">
          <div className="community-story-tabs" role="tablist" aria-label={t('审核状态', 'Editorial status')}>
            {filters.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} className={filter === item.id ? 'is-active' : ''} onClick={() => setFilter(item.id)}>
                {item.label}<span>{item.count}</span>
              </button>
            ))}
          </div>

          {visibleNotes.length ? (
            <div className="divide-y divide-[hsl(var(--community-forest)/0.1)] border-y border-[hsl(var(--community-forest)/0.1)]">
              {visibleNotes.map((note) => {
                const busy = busyId === note.id;
                return (
                  <article key={note.id} className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--community-forest)/0.56)]">
                        <span className="rounded-full bg-[hsl(var(--community-orange)/0.1)] px-2.5 py-1 font-semibold text-[hsl(var(--community-orange))]">{status(note.status)}</span>
                        <span>{note.visibility === 'public' ? t('公开', 'Public') : t('尚未公开', 'Not public')}</span>
                        {note.featured ? <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--community-orange))]"><Star className="size-3.5 fill-current" />{t('精选', 'Featured')}</span> : null}
                      </div>
                      <h2 className="mt-3 font-serif text-2xl leading-8 text-[hsl(var(--community-forest))]">{note.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[hsl(var(--community-forest)/0.62)]">{note.excerpt || t('作者尚未填写摘要。', 'The author has not added a summary.')}</p>
                      <p className="mt-3 text-xs text-[hsl(var(--community-forest)/0.48)]">{authorName(note) || t('社群作者', 'Community author')} · {formatDateTime(note.updated_at)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:max-w-[28rem] lg:justify-end">
                      <button type="button" className="community-button community-button--secondary min-h-10" onClick={() => void openPreview(note)}><Eye className="size-4" />{t('预览原文', 'Preview')}</button>
                      {note.status === 'submitted' && canReview ? (
                        <button type="button" disabled={busy} className="community-button community-button--primary min-h-10" onClick={() => void transition(note, 'in_review', t('已开始审核', 'Review started'))}>{busy ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}{t('开始审核', 'Start review')}</button>
                      ) : null}
                      {note.status === 'in_review' && canReview ? (
                        <button type="button" disabled={busy} className="community-button community-button--secondary min-h-10" onClick={() => void transition(note, 'changes_requested', t('已退回作者修改', 'Changes requested'))}><RotateCcw className="size-4" />{t('退回修改', 'Request changes')}</button>
                      ) : null}
                      {note.status === 'in_review' && canApprove ? (
                        <button type="button" disabled={busy} className="community-button community-button--primary min-h-10" onClick={() => void transition(note, 'approved', t('文章已批准', 'Story approved'))}><CheckCircle2 className="size-4" />{t('批准', 'Approve')}</button>
                      ) : null}
                      {note.status === 'approved' && canPublish ? (
                        <button type="button" disabled={busy} className="community-button community-button--primary min-h-10" onClick={() => void mutate(note, () => publishFieldNote(note.id), t('文章已公开发布', 'Story published publicly'))}><Send className="size-4" />{t('公开发布', 'Publish')}</button>
                      ) : null}
                      {note.status === 'published' && canPublish ? (
                        <button type="button" disabled={busy} className="community-button community-button--secondary min-h-10" aria-pressed={note.featured} onClick={() => void mutate(note, () => setFieldNoteFeatured(note.id, !note.featured), note.featured ? t('已取消精选', 'Removed from featured') : t('已加入精选', 'Added to featured'))}><Star className={`size-4 ${note.featured ? 'fill-current' : ''}`} />{note.featured ? t('取消精选', 'Unfeature') : t('设为精选', 'Feature')}</button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <CommunityEmptyState title={t('这个队列已经处理完了', 'This queue is clear')} description={t('新的真实投稿进入当前状态后会显示在这里。', 'New real submissions will appear here when they reach this stage.')} />
          )}
        </div>
      ) : null}

      <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[1.5rem] border-[hsl(var(--community-forest)/0.14)] bg-[hsl(var(--community-paper))] p-6 sm:p-9" overlayClassName="bg-[hsl(var(--community-forest)/0.55)]">
          <DialogHeader className="pr-8 text-left">
            <p className="community-eyebrow"><Sparkles className="size-4" />{t('真实投稿预览', 'Real submission preview')}</p>
            <DialogTitle className="font-serif text-3xl leading-tight text-[hsl(var(--community-forest))]">{preview?.title}</DialogTitle>
            <DialogDescription className="leading-6 text-[hsl(var(--community-forest)/0.6)]">{preview?.excerpt || t('暂无摘要', 'No summary')}</DialogDescription>
          </DialogHeader>
          {previewLoading ? <CommunityLoadingState label={t('正在加载正文图片…', 'Loading story images…')} /> : (
            previewHtml ? (
              <div className="field-note-prose field-note-rich-content mt-5 text-[1rem] leading-8 text-[hsl(var(--community-forest)/0.82)]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <div className="mt-5 whitespace-pre-wrap text-[1rem] leading-8 text-[hsl(var(--community-forest)/0.82)]">{preview?.content || t('正文还是空的。', 'The story body is empty.')}</div>
            )
          )}
        </DialogContent>
      </Dialog>
    </CommunitySurface>
  );
}
