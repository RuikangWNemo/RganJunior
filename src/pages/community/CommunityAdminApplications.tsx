import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { listMembershipApplications, requestMembershipApplicationChanges, reviewMembershipApplication, reviewMinorIdentity } from '@/services/memberships';

export default function CommunityAdminApplications() {
  const { refreshCommunity, user } = useAuth();
  const { t, status } = useCommunityUi();
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof listMembershipApplications>>>([]);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [identityNotes, setIdentityNotes] = useState<Record<number, string>>({});
  const [busyApplicationId, setBusyApplicationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; showDashboard: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setApplications(await listMembershipApplications());
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('申请列表读取失败。', 'Could not load membership applications.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: number, action: 'approve' | 'reject' | 'changes') => {
    if (busyApplicationId !== null) return;
    const message = messages[id]?.trim();
    if (!message) { setError(t('请先填写给申请人的说明。', 'Add a note for the applicant first.')); return; }
    const reviewedApplication = applications.find((application) => application.id === id);
    setBusyApplicationId(id);
    setError(null);
    setNotice(null);
    try {
      if (action === 'changes') await requestMembershipApplicationChanges(id, message);
      else await reviewMembershipApplication(id, action, message);
      const [, communityRefreshResult] = await Promise.allSettled([
        load(),
        action === 'approve' ? refreshCommunity() : Promise.resolve(),
      ]);
      if (action === 'approve') {
        setNotice({
          message: t('申请已通过，成员现在可以进入社群工作台。', 'Application approved. The member can now enter the community.'),
          showDashboard: reviewedApplication?.user_id === user?.id,
        });
        if (communityRefreshResult.status === 'rejected') {
          setError(t('申请已经通过，但当前页面状态刷新失败。请刷新页面后进入工作台。', 'The application was approved, but the page state could not refresh. Refresh before opening the dashboard.'));
        }
      } else if (action === 'reject') {
        setNotice({ message: t('本次申请已拒绝。', 'Application rejected.'), showDashboard: false });
      } else {
        setNotice({ message: t('补充资料请求已发送。', 'Request for more information sent.'), showDashboard: false });
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : t('操作失败。', 'The action could not be completed.'));
    } finally {
      setBusyApplicationId(null);
    }
  };

  const verifyIdentity = async (applicationId: number, userId: string) => {
    if (busyApplicationId !== null) return;
    const note = identityNotes[applicationId]?.trim();
    if (!note) { setError(t('身份核验必须填写工作人员依据。', 'An identity review note is required.')); return; }
    setBusyApplicationId(applicationId);
    setError(null);
    try {
      await reviewMinorIdentity(userId, 'verify', 'other', note);
      await load();
      setNotice({ message: t('身份核验状态已更新。', 'Identity review status updated.'), showDashboard: false });
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : t('身份核验保存失败。', 'Could not save the identity review.'));
    } finally {
      setBusyApplicationId(null);
    }
  };

  return (
    <CommunitySurface eyebrow="Admin" title={t('审核社群申请。', 'Review membership applications.')} description={t('敏感年龄、监护人和身份状态只对具备敏感审核权限的角色显示。', 'Sensitive age, guardian, and identity states are only shown to roles with review permission.')} width="wide">
      {error ? <div className="mb-5"><CommunityErrorState message={error} onRetry={() => void load()} /></div> : null}
      {notice ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 p-4 text-sm text-primary" aria-live="polite">
          <p>{notice.message}</p>
          {notice.showDashboard ? <Link className={communityPrimaryButtonClass} to="/community">{t('进入工作台', 'Open dashboard')}</Link> : null}
        </div>
      ) : null}
      {loading ? <CommunityLoadingState label={t('正在读取待审核申请…', 'Loading applications…')} /> : null}
      {!loading ? <div className="space-y-4">
        {applications.map((application) => {
          const isMinor = application.age_band === 'under_14' || application.age_band === 'age_14_17';
          const isBusy = busyApplicationId === application.id;
          return (
            <article key={application.id} className="rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.11)] bg-white/55 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-2xl">{application.nature_name || application.display_name || application.username}</h2><p className="mt-1 text-xs text-muted-foreground">#{application.id} · {status(application.status)}</p></div><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-secondary px-3 py-1">{application.age_band || 'masked'}</span><span className="rounded-full bg-secondary px-3 py-1">{t('监护', 'guardian')}: {application.guardian_consent_status || 'masked'}</span><span className="rounded-full bg-secondary px-3 py-1">{t('身份', 'identity')}: {application.identity_verification_status || 'masked'}</span></div></div>
              {isMinor && application.guardian_consent_status === 'verified' && application.identity_verification_status !== 'verified' ? <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-primary/[0.06] p-4 sm:flex-row"><input className={communityInputClass} disabled={busyApplicationId !== null} placeholder={t('身份核验依据（不得粘贴证件全文）', 'Identity review basis (do not paste full ID details)')} value={identityNotes[application.id] || ''} onChange={(event) => setIdentityNotes({ ...identityNotes, [application.id]: event.target.value })} /><button type="button" className={communitySecondaryButtonClass} disabled={busyApplicationId !== null} onClick={() => void verifyIdentity(application.id, application.user_id)}>{t('标记身份已核验', 'Mark identity verified')}</button></div> : null}
              <input className={`${communityInputClass} mt-4`} disabled={busyApplicationId !== null} placeholder={t('给申请人的说明（必填）', 'Note to applicant (required)')} value={messages[application.id] || ''} onChange={(event) => setMessages({ ...messages, [application.id]: event.target.value })} />
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={communitySecondaryButtonClass} disabled={busyApplicationId !== null} onClick={() => void act(application.id, 'changes')}>{t('请求补件', 'Request details')}</button><button type="button" className={communityPrimaryButtonClass} disabled={busyApplicationId !== null} onClick={() => void act(application.id, 'approve')}>{isBusy ? t('正在处理…', 'Working…') : t('通过', 'Approve')}</button><button type="button" className="inline-flex min-h-12 items-center rounded-full border border-destructive/30 px-5 text-sm text-destructive disabled:cursor-not-allowed disabled:opacity-50" disabled={busyApplicationId !== null} onClick={() => void act(application.id, 'reject')}>{t('拒绝', 'Reject')}</button></div>
            </article>
          );
        })}
        {!applications.length ? <CommunityEmptyState title={t('当前没有待处理申请。', 'No applications need review.')} description={t('已完成的申请会离开待处理队列，审批结果仍保留在审计记录中。', 'Completed applications leave this queue while review results remain in the audit log.')} /> : null}
      </div> : null}
    </CommunitySurface>
  );
}
