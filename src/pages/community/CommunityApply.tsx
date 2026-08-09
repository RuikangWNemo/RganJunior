import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import { CommunityErrorState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { createAndSubmitCommunityApplication } from '@/services/memberships';

export default function CommunityApply() {
  const { communityState, refreshCommunity } = useAuth();
  const { t } = useCommunityUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ motivation: '', hopes: '', contribution: '', additionalInfo: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!communityState?.onboarding_completed) return <Navigate to={communityState?.destination || '/community/onboarding'} replace />;
  if (communityState.membership_status === 'active') return <Navigate to="/community" replace />;
  if (communityState.application_status && !['rejected', 'withdrawn'].includes(communityState.application_status)) return <Navigate to="/community/application" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const result = await createAndSubmitCommunityApplication(form);
      await refreshCommunity();
      navigate(result.status === 'pending_guardian' ? '/community/guardian-consent' : '/community/application', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('申请提交失败。', 'Application failed.'));
    } finally { setBusy(false); }
  };
  const labelClass = 'block space-y-2 text-sm font-semibold';

  return (
    <div className="community-page-frame">
      <CommunitySurface eyebrow="Community application" title={t('告诉我们，你为何来到这里。', 'Tell us what brings you here.')} description={t('账号会一直保留。申请通过后，才会开放创作、伙伴、共练和消息等成员功能。', 'Your account remains yours. Stories, People, Practice, and Messages open after membership is approved.')} aside={<p>{t('我们关注的不是标准答案，而是你真实的期待、愿意投入的方式，以及你希望和谁一起成长。', 'There is no perfect answer. We care about your real hopes, how you want to participate, and who you hope to grow alongside.')}</p>} width="wide">
        <CommunityProcessSteps current="application" safetyRequired={communityState.age_band === 'under_14'} />
        <form className="space-y-5" onSubmit={submit}>
          <label className={labelClass}><span>{t('为什么想加入？ *', 'Why would you like to join? *')}</span><textarea className={communityTextareaClass} value={form.motivation} onChange={(event) => setForm({ ...form, motivation: event.target.value })} required /></label>
          <label className={labelClass}><span>{t('你希望在这里获得什么？', 'What do you hope to find here?')}</span><textarea className={communityTextareaClass} value={form.hopes} onChange={(event) => setForm({ ...form, hopes: event.target.value })} /></label>
          <label className={labelClass}><span>{t('你愿意怎样参与或分享？', 'How would you like to participate or contribute?')}</span><textarea className={communityTextareaClass} value={form.contribution} onChange={(event) => setForm({ ...form, contribution: event.target.value })} /></label>
          <label className={labelClass}><span>{t('其他想告诉我们的内容', 'Anything else you would like us to know')}</span><input className={communityInputClass} value={form.additionalInfo} onChange={(event) => setForm({ ...form, additionalInfo: event.target.value })} /></label>
          {error ? <CommunityErrorState message={error} /> : null}
          <button className={`${communityPrimaryButtonClass} w-full`} disabled={busy}>{busy ? t('正在提交…', 'Submitting…') : t('提交社群申请', 'Submit application')}</button>
        </form>
      </CommunitySurface>
    </div>
  );
}
