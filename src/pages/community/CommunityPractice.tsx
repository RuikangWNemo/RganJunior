import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Clock3, Link2, Plus, Users } from 'lucide-react';

import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { cancelPracticeParticipation, createPracticeSession, getPracticeSessionAccess, joinPracticeSession, listPracticeSessions, publishPracticeSession } from '@/services/practice';

export default function CommunityPractice() {
  const { permissions } = useAuth();
  const { t, status, formatDate, formatTime } = useCommunityUi();
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listPracticeSessions>>>([]);
  const [access, setAccess] = useState<Record<number, Awaited<ReturnType<typeof getPracticeSessionAccess>>>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startsAt: '', endsAt: '', capacity: 20, meetingUrl: '', accessNotes: '' });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listPracticeSessions()
      .then(setSessions)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('共练读取失败。', 'Could not load practice sessions.')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const toggleJoin = async (sessionId: number, participationStatus: string | null) => {
    setBusyId(sessionId);
    setError(null);
    setNotice(null);
    try {
      if (participationStatus === 'joined' || participationStatus === 'waitlisted') {
        await cancelPracticeParticipation(sessionId);
        setNotice(t('已取消参加。', 'Your place has been released.'));
      } else {
        const next = await joinPracticeSession(sessionId);
        setNotice(next === 'waitlisted' ? t('场次已满，你已进入候补。', 'The session is full. You are now on the waitlist.') : t('已经加入共练。', 'You joined the practice.'));
      }
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : t('操作失败。', 'The action could not be completed.'));
    } finally {
      setBusyId(null);
    }
  };

  const revealAccess = async (sessionId: number) => {
    setBusyId(sessionId);
    setError(null);
    try {
      const sessionAccess = await getPracticeSessionAccess(sessionId);
      setAccess((current) => ({ ...current, [sessionId]: sessionAccess }));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('会议信息读取失败。', 'Could not load session access.'));
    } finally {
      setBusyId(null);
    }
  };

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const id = await createPracticeSession({ ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai' });
      await publishPracticeSession(id);
      setShowCreate(false);
      setForm({ title: '', description: '', startsAt: '', endsAt: '', capacity: 20, meetingUrl: '', accessNotes: '' });
      setNotice(t('共练已创建并发布。', 'The practice was created and published.'));
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t('共练创建失败。', 'Could not create the practice.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <CommunitySurface
      eyebrow="Practice"
      title={t('在同一个时刻，共同练习。', 'Practice together, at the same time.')}
      description={t('查看即将发生的共练、加入或候补；会议信息只在临近开始时向已加入成员开放。', 'Browse upcoming sessions, join or waitlist, and unlock access shortly before a joined session begins.')}
      action={permissions.includes('practice.create') ? <button type="button" className={`${communitySecondaryButtonClass} gap-2`} onClick={() => setShowCreate((value) => !value)}><Plus className="size-4" aria-hidden="true" />{showCreate ? t('收起创建表单', 'Close form') : t('创建共练', 'Create practice')}</button> : undefined}
    >
      {showCreate ? (
        <form className="mb-8 grid gap-4 rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.1)] bg-[hsl(var(--community-paper-deep)/0.58)] p-5 sm:grid-cols-2" onSubmit={create}>
          <label className="space-y-2 text-sm font-semibold"><span>{t('共练名称', 'Practice title')}</span><input className={communityInputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label className="space-y-2 text-sm font-semibold"><span>{t('人数上限', 'Capacity')}</span><input className={communityInputClass} type="number" min={2} max={500} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} /></label>
          <label className="space-y-2 text-sm font-semibold"><span>{t('开始时间', 'Starts')}</span><input className={communityInputClass} type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required /></label>
          <label className="space-y-2 text-sm font-semibold"><span>{t('结束时间', 'Ends')}</span><input className={communityInputClass} type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} required /></label>
          <label className="space-y-2 text-sm font-semibold sm:col-span-2"><span>{t('说明', 'Description')}</span><textarea className={communityTextareaClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="space-y-2 text-sm font-semibold"><span>{t('会议链接', 'Meeting link')}</span><input className={communityInputClass} type="url" placeholder="https://" value={form.meetingUrl} onChange={(event) => setForm({ ...form, meetingUrl: event.target.value })} /></label>
          <label className="space-y-2 text-sm font-semibold"><span>{t('进入说明', 'Access notes')}</span><input className={communityInputClass} value={form.accessNotes} onChange={(event) => setForm({ ...form, accessNotes: event.target.value })} /></label>
          <button className={`${communityPrimaryButtonClass} sm:col-span-2`} disabled={creating}>{creating ? t('正在发布…', 'Publishing…') : t('创建并发布', 'Create and publish')}</button>
        </form>
      ) : null}

      {notice ? <p className="mb-5 rounded-2xl bg-[hsl(var(--community-forest)/0.07)] p-4 text-sm font-medium text-[hsl(var(--community-forest))]" role="status">{notice}</p> : null}
      {error ? <div className="mb-5"><CommunityErrorState message={error} onRetry={load} /></div> : null}
      {loading ? <CommunityLoadingState label={t('正在读取共练安排…', 'Loading practice sessions…')} variant="list" items={3} /> : null}
      {!loading && sessions.length ? (
        <div className="space-y-4">
          {sessions.map((session) => {
            const joined = session.my_participation_status === 'joined' || session.my_participation_status === 'waitlisted';
            const sessionAccess = access[session.id];
            const capacityRatio = Math.min(100, Math.round((session.participant_count / Math.max(session.capacity, 1)) * 100));
            return (
              <article key={session.id} className="rounded-[1.45rem] border border-[hsl(var(--community-forest)/0.11)] bg-white/58 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><h2 className="font-serif text-2xl text-[hsl(var(--community-forest))] sm:text-3xl">{session.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--community-forest)/0.62)]">{session.description}</p></div>
                  <span className="rounded-full bg-[hsl(var(--community-orange)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--community-orange))]">{session.my_participation_status ? status(session.my_participation_status) : t('未加入', 'Not joined')}</span>
                </div>
                <div className="mt-6 grid gap-3 text-xs text-[hsl(var(--community-forest)/0.58)] sm:grid-cols-3">
                  <span className="flex items-center gap-2"><CalendarDays className="size-4 text-[hsl(var(--community-orange))]" />{formatDate(session.starts_at)}</span>
                  <span className="flex items-center gap-2"><Clock3 className="size-4 text-[hsl(var(--community-orange))]" />{formatTime(session.starts_at)} – {formatTime(session.ends_at)}</span>
                  <span className="flex items-center gap-2"><Users className="size-4 text-[hsl(var(--community-orange))]" />{session.participant_count}/{session.capacity} · {t('候补', 'Waitlist')} {session.waitlist_count}</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--community-forest)/0.08)]" aria-label={t('席位使用进度', 'Capacity progress')}><span className="block h-full rounded-full bg-[hsl(var(--community-orange))]" style={{ width: `${capacityRatio}%` }} /></div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" className={joined ? communitySecondaryButtonClass : communityPrimaryButtonClass} disabled={busyId !== null} onClick={() => void toggleJoin(session.id, session.my_participation_status)}>{busyId === session.id ? t('正在处理…', 'Working…') : joined ? t('取消参加', 'Leave session') : t('加入共练', 'Join practice')}</button>
                  {session.my_participation_status === 'joined' ? <button type="button" className={`${communitySecondaryButtonClass} gap-2`} disabled={busyId !== null} onClick={() => void revealAccess(session.id)}><Link2 className="size-4" aria-hidden="true" />{t('查看会议信息', 'View access')}</button> : null}
                </div>
                {sessionAccess ? <div className="mt-4 rounded-2xl bg-[hsl(var(--community-forest)/0.06)] p-4 text-sm">{sessionAccess.available_now ? <><a className="font-semibold text-[hsl(var(--community-orange))] underline underline-offset-4" href={sessionAccess.meeting_url || '#'} target="_blank" rel="noreferrer">{t('进入共练', 'Enter practice')}</a>{sessionAccess.access_notes ? <p className="mt-2 text-[hsl(var(--community-forest)/0.62)]">{sessionAccess.access_notes}</p> : null}</> : <p className="text-[hsl(var(--community-forest)/0.62)]">{t('会议信息会在开始前 60 分钟开放。', 'Access opens 60 minutes before the session starts.')}</p>}</div> : null}
              </article>
            );
          })}
        </div>
      ) : null}
      {!loading && !sessions.length ? <CommunityEmptyState title={t('还没有已发布的共练', 'No practices are scheduled yet')} description={t('新的共练发布后会出现在这里。', 'New practice sessions will appear here when they are published.')} /> : null}
    </CommunitySurface>
  );
}
