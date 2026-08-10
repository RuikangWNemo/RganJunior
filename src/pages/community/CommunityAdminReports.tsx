import { useCallback, useEffect, useState } from 'react';

import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { listCommunityReports, resolveCommunityReport } from '@/services/messages';

export default function CommunityAdminReports() {
  const { t, status } = useCommunityUi();
  const [reports, setReports] = useState<Awaited<ReturnType<typeof listCommunityReports>>>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    return listCommunityReports().then(setReports).catch((readError) => setError(readError instanceof Error ? readError.message : t('举报队列读取失败。', 'Could not load the report queue.'))).finally(() => setLoading(false));
  }, [t]);
  useEffect(() => { void load(); }, [load]);

  const resolve = async (id: number, nextStatus: 'resolved' | 'dismissed') => {
    const note = notes[id]?.trim();
    if (!note) { setError(t('处理说明不能为空。', 'A review note is required.')); return; }
    setBusyId(id); setError(null);
    try { await resolveCommunityReport(id, nextStatus, note); await load(); }
    catch (resolveError) { setError(resolveError instanceof Error ? resolveError.message : t('处理失败。', 'Could not resolve the report.')); }
    finally { setBusyId(null); }
  };

  return (
    <CommunitySurface eyebrow="Moderation" title={t('处理社区举报。', 'Review community reports.')} description={t('举报人信息与处理说明只对具有消息审核或社区治理权限的角色开放。', 'Reporter details and moderation notes are limited to message moderation and community governance roles.')} width="wide">
      {error ? <div className="mb-5"><CommunityErrorState message={error} onRetry={() => void load()} /></div> : null}
      {loading ? <CommunityLoadingState label={t('正在读取举报队列…', 'Loading reports…')} /> : null}
      {!loading && reports.length ? <div className="space-y-4">{reports.map((report) => (
        <article key={report.id} className="rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.11)] bg-white/55 p-5">
          <div className="flex justify-between gap-3"><div><h2 className="font-semibold">{report.category}</h2><p className="mt-1 text-xs text-[hsl(var(--community-forest)/0.5)]">{t('举报', 'Report')} #{report.id} · {t('消息', 'Message')} #{report.message_id}</p></div><span className="rounded-full bg-[hsl(var(--community-orange)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--community-orange))]">{status(report.status)}</span></div>
          {report.details ? <p className="mt-4 rounded-2xl bg-[hsl(var(--community-paper-deep)/0.6)] p-4 text-sm">{report.details}</p> : null}
          <label className="mt-4 block space-y-2 text-sm font-semibold"><span>{t('处理说明', 'Review note')}</span><input className={communityInputClass} value={notes[report.id] || ''} onChange={(event) => setNotes({ ...notes, [report.id]: event.target.value })} /></label>
          <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={communityPrimaryButtonClass} disabled={busyId !== null} onClick={() => void resolve(report.id, 'resolved')}>{busyId === report.id ? t('正在处理…', 'Working…') : t('完成处理', 'Resolve')}</button><button type="button" className={communitySecondaryButtonClass} disabled={busyId !== null} onClick={() => void resolve(report.id, 'dismissed')}>{t('驳回举报', 'Dismiss')}</button></div>
        </article>
      ))}</div> : null}
      {!loading && !reports.length ? <CommunityEmptyState title={t('当前没有待处理举报', 'No reports need review')} description={t('新的举报会出现在这个队列中。', 'New reports will appear in this queue.')} /> : null}
    </CommunitySurface>
  );
}
