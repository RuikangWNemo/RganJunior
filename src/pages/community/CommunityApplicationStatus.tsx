import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, CircleCheck, CircleX, FilePenLine, ShieldAlert } from 'lucide-react';

import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import { CommunityErrorState, CommunityLoadingState, CommunitySurface, communityPrimaryButtonClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { isManualGuardianFlow } from '@/lib/guardianFlow';
import { getMyCommunityApplication } from '@/services/memberships';

export default function CommunityApplicationStatus() {
  const { communityState, refreshCommunity } = useAuth();
  const { t, status: statusLabel } = useCommunityUi();
  const [application, setApplication] = useState<Awaited<ReturnType<typeof getMyCommunityApplication>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const nextApplication = await getMyCommunityApplication();
      setApplication(nextApplication);
      if (nextApplication?.status === 'approved') {
        try { await refreshCommunity(); }
        catch { setError(t('申请已经通过，请刷新页面后进入社群。', 'Your application is approved. Refresh before entering the community.')); }
      }
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('申请状态读取失败。', 'Unable to load your application.'));
    } finally { setLoading(false); }
  }, [refreshCommunity, t]);

  useEffect(() => { void load(); }, [load]);

  const applicationStatus = application?.status || communityState?.application_status || 'submitted';
  const stateCopy = {
    pending_guardian: { title: t('等待监护人确认', 'Waiting for guardian confirmation'), body: isManualGuardianFlow
      ? t('请先登记监护人联系方式。工作人员会与监护人沟通并留档确认，完成后申请才进入审核队列。', 'Provide a guardian contact first. Staff will contact them and record confirmation before the application enters review.')
      : t('监护人完成知情说明与手机验证后，申请才会进入审核队列。', 'Your application enters review after guardian confirmation and phone verification.'), icon: ShieldAlert },
    submitted: { title: t('申请已提交', 'Application submitted'), body: t('工作人员会认真阅读你的申请。账号和公开内容浏览不受影响。', 'Our team will read your application. Your account and public browsing remain available.'), icon: Clock3 },
    under_review: { title: t('正在审核', 'Under review'), body: t('申请已经由工作人员接手。', 'A team member is reviewing your application.'), icon: Clock3 },
    more_info_requested: { title: t('需要补充资料', 'More information needed'), body: t('请根据审核说明补充申请内容。', 'Please add the information requested in the review note.'), icon: FilePenLine },
    approved: { title: t('申请已通过', 'Application approved'), body: t('欢迎进入阿柑少年社群。', "Welcome to the R-Gan Junior community."), icon: CircleCheck },
    rejected: { title: t('本次申请暂未通过', 'Application not approved'), body: t('基础账号会继续保留，你仍然可以浏览公开内容，以后也可以再次申请。', 'Your account remains active. You can browse public content and apply again later.'), icon: CircleX },
  } as const;
  const copy = stateCopy[applicationStatus as keyof typeof stateCopy] || stateCopy.submitted;
  const Icon = copy.icon;

  return (
    <div className="community-page-frame">
      <CommunitySurface eyebrow="Application status" title={copy.title} description={copy.body} width="wide">
        <CommunityProcessSteps current={applicationStatus === 'pending_guardian' ? 'safety' : 'review'} safetyRequired={communityState?.age_band === 'under_14'} />
        {loading ? <CommunityLoadingState label={t('正在读取申请状态…', 'Loading application status…')} /> : (
          <div className="flex flex-col items-start gap-6 rounded-[1.45rem] bg-[hsl(var(--community-paper-deep)/0.55)] p-5 sm:flex-row sm:p-7">
            <div className="grid size-16 shrink-0 place-items-center rounded-[1.35rem] rounded-bl-md bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))]"><Icon className="size-7" /></div>
            <div className="space-y-4 text-sm leading-6 text-[hsl(var(--community-forest)/0.64)]">
              <p>{t('当前状态', 'Current status')}：<span className="font-semibold text-[hsl(var(--community-forest))]">{statusLabel(applicationStatus)}</span></p>
              {application?.decision_reason ? <p className="rounded-2xl border border-[hsl(var(--community-forest)/0.09)] bg-white/70 p-4 text-[hsl(var(--community-forest))]">{application.decision_reason}</p> : null}
              {error ? <CommunityErrorState message={error} onRetry={() => void load()} /> : null}
              <div className="flex flex-wrap gap-3">
                {applicationStatus === 'pending_guardian' ? <Link className={communityPrimaryButtonClass} to="/community/guardian-consent">{isManualGuardianFlow ? t('登记监护人联系方式', 'Provide guardian contact') : t('继续监护人确认', 'Continue guardian confirmation')}</Link> : null}
                {applicationStatus === 'approved' || communityState?.membership_status === 'active' ? <Link className={communityPrimaryButtonClass} to="/community">{t('进入社群', 'Enter community')}</Link> : null}
                {applicationStatus === 'rejected' ? <Link className={communityPrimaryButtonClass} to="/community/apply">{t('再次申请', 'Apply again')}</Link> : null}
              </div>
            </div>
          </div>
        )}
      </CommunitySurface>
    </div>
  );
}
