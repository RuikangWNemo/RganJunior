import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Plus } from 'lucide-react';

import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface, communityPrimaryButtonClass } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { listMyFieldNotes } from '@/services/field-notes';

export default function CommunityStories() {
  const { t, status, formatDateTime } = useCommunityUi();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listMyFieldNotes>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listMyFieldNotes()
      .then(setNotes)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('文章读取失败。', 'Could not load your stories.')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  return (
    <CommunitySurface
      eyebrow="Stories"
      title={t('把经历写成路标。', 'Turn experience into a marker.')}
      description={t('保存草稿、继续编辑并提交审核。发布后的文章会成为社群共同记忆的一部分。', 'Save drafts, keep editing, and submit for review. Published stories become part of the community memory.')}
      action={<Link to="/community/stories/new" className={`${communityPrimaryButtonClass} gap-2`}><Plus className="size-4" aria-hidden="true" />{t('写一篇文章', 'Write a story')}</Link>}
    >
      {loading ? <CommunityLoadingState label={t('正在整理你的文章…', 'Gathering your stories…')} variant="list" /> : null}
      {!loading && error ? <CommunityErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && notes.length ? (
        <div className="space-y-3">
          {notes.map((note, index) => (
            <Link key={note.id} to={`/community/stories/${note.id}/edit`} className="group grid gap-4 rounded-2xl border border-[hsl(var(--community-forest)/0.1)] bg-white/55 p-4 transition hover:border-[hsl(var(--community-orange)/0.36)] hover:bg-white sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <span className="grid size-11 place-items-center rounded-xl rounded-bl-sm bg-[hsl(var(--community-forest)/0.08)] text-[hsl(var(--community-forest))]"><FileText className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[hsl(var(--community-forest))]">{note.title}</span>
                <span className="mt-1 block text-xs text-[hsl(var(--community-forest)/0.5)]">{String(index + 1).padStart(2, '0')} · {t('更新于', 'Updated')} {formatDateTime(note.updated_at)}</span>
              </span>
              <span className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="rounded-full bg-[hsl(var(--community-orange)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--community-orange))]">{status(note.status)}</span>
                <ArrowRight className="size-4 text-[hsl(var(--community-forest)/0.4)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      ) : null}
      {!loading && !error && !notes.length ? <CommunityEmptyState title={t('你的第一篇文章，从这里开始', 'Your first story starts here')} description={t('先保存成草稿也没关系。写下一个你不想忘记的片段。', 'A draft is enough to begin. Write down one moment you do not want to forget.')} action={<Link to="/community/stories/new" className={`${communityPrimaryButtonClass} gap-2`}><Plus className="size-4" />{t('开始写作', 'Start writing')}</Link>} /> : null}
    </CommunitySurface>
  );
}
