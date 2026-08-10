import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import ManualGuardianReviewPanel from '@/components/community/ManualGuardianReviewPanel';
import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { isManualGuardianFlow } from '@/lib/guardianFlow';
import { listAdminIdentityLabels, listSignupIdentityOptions } from '@/services/community-identities';
import { subscribeToApplicationReviewChanges } from '@/services/community-realtime';
import { listMembershipApplications, requestMembershipApplicationChanges, reviewMembershipApplication, reviewMinorIdentity } from '@/services/memberships';

type ReviewIdentityOption = {
  slug: string;
  name_zh: string;
  name_en: string | null;
  color: string | null;
};

type IdentitySelection = {
  primary: string;
  secondary: string[];
};

export default function CommunityAdminApplications() {
  const { permissions = [], refreshCommunity, user } = useAuth();
  const { lang, t, status } = useCommunityUi();
  const [applications, setApplications] = useState<Awaited<ReturnType<typeof listMembershipApplications>>>([]);
  const [identityOptions, setIdentityOptions] = useState<ReviewIdentityOption[]>([]);
  const [identitySelections, setIdentitySelections] = useState<Record<number, IdentitySelection>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [identityNotes, setIdentityNotes] = useState<Record<number, string>>({});
  const [busyApplicationId, setBusyApplicationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; showDashboard: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const refreshTimerRef = useRef<number | null>(null);
  const canManagePeople = permissions.includes('people.manage');

  const load = useCallback(async (background = false) => {
    const requestId = ++loadRequestIdRef.current;
    if (!background) setLoading(true);
    try {
      const [nextApplications, nextIdentityOptions] = await Promise.all([
        listMembershipApplications([
          'pending_guardian',
          'submitted',
          'under_review',
          'more_info_requested',
        ]),
        canManagePeople
          ? listAdminIdentityLabels().then((labels) => labels.filter((label) => label.is_active))
          : listSignupIdentityOptions(),
      ]);
      if (requestId !== loadRequestIdRef.current) return;
      setApplications(nextApplications);
      setIdentityOptions(nextIdentityOptions);
      setIdentitySelections((current) => {
        const next = { ...current };
        nextApplications.forEach((application) => {
          if (!next[application.id]) {
            next[application.id] = {
              primary: application.declared_primary_identity_slug || '',
              secondary: application.declared_secondary_identity_slugs || [],
            };
          }
        });
        return next;
      });
      setError(null);
    } catch (readError) {
      if (requestId !== loadRequestIdRef.current) return;
      setError(readError instanceof Error ? readError.message : t('申请列表读取失败。', 'Could not load membership applications.'));
    } finally {
      if (requestId === loadRequestIdRef.current) setLoading(false);
    }
  }, [canManagePeople, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void load(true);
    }, 120);
  }, [load]);

  useEffect(() => {
    const subscription = subscribeToApplicationReviewChanges(scheduleRefresh);
    window.addEventListener('focus', scheduleRefresh);
    window.addEventListener('online', scheduleRefresh);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', scheduleRefresh);
      window.removeEventListener('online', scheduleRefresh);
      if (refreshTimerRef.current !== null) window.clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

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
      else {
        const selection = identitySelections[id];
        await reviewMembershipApplication(
          id,
          action,
          message,
          undefined,
          selection?.primary,
          selection?.secondary || [],
        );
      }
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
          const isUnder14 = application.age_band === 'under_14';
          const needsIdentityReview = isMinor
            && application.identity_verification_status !== 'verified'
            && (!isUnder14 || application.guardian_consent_status === 'verified');
          const identitySelection = identitySelections[application.id] || { primary: '', secondary: [] };
          const approvalBlocked = !identitySelection.primary || (isMinor
            && (
              application.identity_verification_status !== 'verified'
              || (isUnder14 && application.guardian_consent_status !== 'verified')
            ));
          const isBusy = busyApplicationId === application.id;
          return (
            <article key={application.id} className="rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.11)] bg-white/55 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-2xl">{application.nature_name || application.display_name || application.username}</h2><p className="mt-1 text-xs text-muted-foreground">#{application.id} · {status(application.status)}</p></div><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-secondary px-3 py-1">{application.age_band || 'masked'}</span><span className="rounded-full bg-secondary px-3 py-1">{t('监护', 'guardian')}: {application.guardian_consent_status || 'masked'}</span><span className="rounded-full bg-secondary px-3 py-1">{t('身份', 'identity')}: {application.identity_verification_status || 'masked'}</span></div></div>
              <section className="mt-4 rounded-2xl border border-[hsl(var(--community-forest)/0.1)] bg-[hsl(var(--community-paper-deep)/0.44)] p-4" aria-label={t('申请内容', 'Application answers')}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--community-orange))]">{t('申请理由', 'Reason for joining')}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--community-forest))]">{application.motivation}</p>
                {application.hopes || application.contribution || application.additional_info ? (
                  <dl className="mt-4 grid gap-4 border-t border-[hsl(var(--community-forest)/0.09)] pt-4 md:grid-cols-2">
                    {application.hopes ? <div><dt className="text-xs font-semibold text-[hsl(var(--community-forest)/0.55)]">{t('希望获得', 'Hopes to find')}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{application.hopes}</dd></div> : null}
                    {application.contribution ? <div><dt className="text-xs font-semibold text-[hsl(var(--community-forest)/0.55)]">{t('参与与分享', 'Participation and contribution')}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{application.contribution}</dd></div> : null}
                    {application.additional_info ? <div className="md:col-span-2"><dt className="text-xs font-semibold text-[hsl(var(--community-forest)/0.55)]">{t('其他说明', 'Additional information')}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{application.additional_info}</dd></div> : null}
                  </dl>
                ) : null}
              </section>
              <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/60">{t('星球身份确认', 'Planet identity confirmation')}</p>
                  <p className="text-xs text-foreground/50">{t('自报身份仅供审核参考', 'Self-reported identities are review context only')}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[hsl(var(--community-orange)/0.12)] px-3 py-1 text-[hsl(var(--community-orange))]">
                    {t('自报主身份', 'Declared primary')}: {application.declared_primary_identity_slug || t('未填写', 'Missing')}
                  </span>
                  {(application.declared_secondary_identity_slugs || []).map((slug) => (
                    <span key={slug} className="rounded-full bg-secondary px-3 py-1">{t('自报副身份', 'Declared secondary')}: {slug}</span>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.2fr)]">
                  <label className="space-y-2 text-sm font-semibold">
                    <span>{t('确认主身份 *', 'Confirmed primary *')}</span>
                    <select
                      className={communityInputClass}
                      value={identitySelection.primary}
                      disabled={busyApplicationId !== null}
                      onChange={(event) => setIdentitySelections((current) => ({
                        ...current,
                        [application.id]: {
                          primary: event.target.value,
                          secondary: identitySelection.secondary.filter((slug) => slug !== event.target.value),
                        },
                      }))}
                    >
                      <option value="">{t('请选择身份', 'Choose identity')}</option>
                      {identityOptions.map((option) => (
                        <option key={option.slug} value={option.slug}>{lang === 'zh' ? option.name_zh : option.name_en || option.name_zh}</option>
                      ))}
                    </select>
                  </label>
                  <fieldset>
                    <legend className="text-sm font-semibold">{t('确认副身份', 'Confirmed secondary')}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {identityOptions.filter((option) => option.slug !== identitySelection.primary).map((option) => {
                        const checked = identitySelection.secondary.includes(option.slug);
                        return (
                          <label key={option.slug} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-primary/15 bg-white/55'}`}>
                            <input
                              type="checkbox"
                              className="size-3.5 accent-[hsl(var(--community-orange))]"
                              checked={checked}
                              disabled={busyApplicationId !== null}
                              onChange={() => setIdentitySelections((current) => ({
                                ...current,
                                [application.id]: {
                                  ...identitySelection,
                                  secondary: checked
                                    ? identitySelection.secondary.filter((slug) => slug !== option.slug)
                                    : [...identitySelection.secondary, option.slug],
                                },
                              }))}
                            />
                            <span className="size-2 rounded-full" style={{ backgroundColor: option.color || undefined }} aria-hidden="true" />
                            {lang === 'zh' ? option.name_zh : option.name_en || option.name_zh}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </div>
              {isManualGuardianFlow && isUnder14 && application.status === 'pending_guardian' ? <ManualGuardianReviewPanel applicationId={application.id} disabled={busyApplicationId !== null && !isBusy} onBusyChange={(nextBusy) => setBusyApplicationId(nextBusy ? application.id : null)} onUpdated={load} /> : null}
              {needsIdentityReview ? <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-primary/[0.06] p-4 sm:flex-row"><input className={communityInputClass} disabled={busyApplicationId !== null} placeholder={t('身份核验依据（不得粘贴证件全文）', 'Identity review basis (do not paste full ID details)')} value={identityNotes[application.id] || ''} onChange={(event) => setIdentityNotes({ ...identityNotes, [application.id]: event.target.value })} /><button type="button" className={communitySecondaryButtonClass} disabled={busyApplicationId !== null} onClick={() => void verifyIdentity(application.id, application.user_id)}>{t('标记身份已核验', 'Mark identity verified')}</button></div> : null}
              {approvalBlocked ? <p className="mt-3 text-xs text-[hsl(var(--community-orange))]">{!identitySelection.primary ? t('需先确认一个主身份，才能通过申请。', 'Confirm one primary identity before approval.') : isUnder14 && application.guardian_consent_status !== 'verified' ? t('需先完成监护人确认与身份核验，才能通过申请。', 'Guardian confirmation and identity review are required before approval.') : t('需先完成身份核验，才能通过申请。', 'Identity review is required before approval.')}</p> : null}
              <input className={`${communityInputClass} mt-4`} disabled={busyApplicationId !== null} placeholder={t('给申请人的说明（必填）', 'Note to applicant (required)')} value={messages[application.id] || ''} onChange={(event) => setMessages({ ...messages, [application.id]: event.target.value })} />
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={communitySecondaryButtonClass} disabled={busyApplicationId !== null} onClick={() => void act(application.id, 'changes')}>{t('请求补件', 'Request details')}</button><button type="button" className={communityPrimaryButtonClass} disabled={busyApplicationId !== null || approvalBlocked} onClick={() => void act(application.id, 'approve')}>{isBusy ? t('正在处理…', 'Working…') : t('通过', 'Approve')}</button><button type="button" className="inline-flex min-h-12 items-center rounded-full border border-destructive/30 px-5 text-sm text-destructive disabled:cursor-not-allowed disabled:opacity-50" disabled={busyApplicationId !== null} onClick={() => void act(application.id, 'reject')}>{t('拒绝', 'Reject')}</button></div>
            </article>
          );
        })}
        {!applications.length ? <CommunityEmptyState title={t('当前没有待处理申请。', 'No applications need review.')} description={t('已完成的申请会离开待处理队列，审批结果仍保留在审计记录中。', 'Completed applications leave this queue while review results remain in the audit log.')} /> : null}
      </div> : null}
    </CommunitySurface>
  );
}
