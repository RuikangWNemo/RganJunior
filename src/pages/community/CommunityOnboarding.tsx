import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import { CommunityErrorState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { completeCommunityOnboarding } from '@/services/community-profile';

export default function CommunityOnboarding() {
  const { communityState, refreshCommunity } = useAuth();
  const { lang, t } = useCommunityUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', displayName: '', nameZh: '', nameEn: '', natureName: '', bio: '',
    city: '', region: '', country: lang === 'zh' ? '中国' : 'China', profileVisibility: 'private' as 'private' | 'members' | 'public',
    showRealName: false, allowMessages: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (communityState?.age_band === 'under_14' && communityState.guardian_consent_status !== 'verified') return <Navigate to="/community/guardian-consent" replace />;
  if (communityState?.onboarding_completed) return <Navigate to="/community/enter" replace />;

  const change = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await completeCommunityOnboarding({ ...form, language: lang, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai' });
      await refreshCommunity();
      navigate('/community/enter', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('资料保存失败。', 'Profile setup failed.'));
    } finally { setBusy(false); }
  };
  const labelClass = 'space-y-2 text-sm font-semibold text-[hsl(var(--community-forest))]';

  return (
    <div className="community-page-frame">
      <CommunitySurface
        eyebrow="Profile"
        title={t('先让伙伴认识你。', 'Introduce yourself.')}
        description={t('自然名、简介与地区会组成你的社群主页。公开范围以后仍可以修改。', 'Your nature name, bio, and region form your community profile. You can change visibility later.')}
        aside={<><p className="font-semibold text-[hsl(var(--community-forest))]">{t('资料边界', 'Profile boundaries')}</p><p className="mt-3">{t('用户名用于登录；中文名和英文名只有在你选择展示真实姓名时才会出现在伙伴目录。私密全名不会公开。', 'Your username is used to sign in. Chinese and English names only appear when you choose to show them. Your private full name is never public.')}</p></>}
        width="wide"
      >
        <CommunityProcessSteps current="profile" safetyRequired={communityState?.age_band !== 'adult_18_plus'} />
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
          <label className={labelClass}><span>{t('用户名 *', 'Username *')}</span><input className={communityInputClass} value={form.username} onChange={(event) => change('username', event.target.value)} pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}" autoComplete="username" required /></label>
          <label className={labelClass}><span>{t('主页显示名 *', 'Display name *')}</span><input className={communityInputClass} value={form.displayName} onChange={(event) => change('displayName', event.target.value)} required /></label>
          <label className={labelClass}><span>{t('中文名', 'Chinese name')}</span><input className={communityInputClass} value={form.nameZh} onChange={(event) => change('nameZh', event.target.value)} /></label>
          <label className={labelClass}><span>{t('英文名', 'English name')}</span><input className={communityInputClass} value={form.nameEn} onChange={(event) => change('nameEn', event.target.value)} /></label>
          <label className={`${labelClass} sm:col-span-2`}><span>{t('自然名', 'Nature name')}</span><input className={communityInputClass} value={form.natureName} onChange={(event) => change('natureName', event.target.value)} placeholder={t('例如：青苔、山风、小树', 'For example: Moss, Mountain Wind, Little Tree')} /></label>
          <label className={`${labelClass} sm:col-span-2`}><span>{t('简介', 'Bio')}</span><textarea className={communityTextareaClass} value={form.bio} onChange={(event) => change('bio', event.target.value)} /></label>
          <label className={labelClass}><span>{t('城市', 'City')}</span><input className={communityInputClass} value={form.city} onChange={(event) => change('city', event.target.value)} /></label>
          <label className={labelClass}><span>{t('地区 / 省份', 'Region / province')}</span><input className={communityInputClass} value={form.region} onChange={(event) => change('region', event.target.value)} /></label>
          <label className={labelClass}><span>{t('国家 / 地区', 'Country / area')}</span><input className={communityInputClass} value={form.country} onChange={(event) => change('country', event.target.value)} /></label>
          <label className={labelClass}><span>{t('主页可见范围', 'Profile visibility')}</span><select className={communityInputClass} value={form.profileVisibility} onChange={(event) => change('profileVisibility', event.target.value)}><option value="private">{t('仅自己', 'Only me')}</option><option value="members">{t('仅正式成员', 'Members only')}</option><option value="public">{t('公开', 'Public')}</option></select></label>
          <label className="flex min-h-16 items-start gap-3 rounded-2xl bg-[hsl(var(--community-forest)/0.055)] p-4 text-sm"><input type="checkbox" checked={form.showRealName} onChange={(event) => change('showRealName', event.target.checked)} className="mt-1 size-4 accent-[hsl(var(--community-orange))]" /><span>{t('在允许的可见范围内展示中文名 / 英文名', 'Show my Chinese / English name within the selected visibility')}</span></label>
          <label className="flex min-h-16 items-start gap-3 rounded-2xl bg-[hsl(var(--community-forest)/0.055)] p-4 text-sm"><input type="checkbox" checked={form.allowMessages} onChange={(event) => change('allowMessages', event.target.checked)} className="mt-1 size-4 accent-[hsl(var(--community-orange))]" /><span>{t('成为成员后允许其他正式成员私聊我', 'Allow active members to message me after I join')}</span></label>
          {error ? <div className="sm:col-span-2"><CommunityErrorState message={error} /></div> : null}
          <button className={`${communityPrimaryButtonClass} sm:col-span-2`} disabled={busy}>{busy ? t('正在保存…', 'Saving…') : t('保存并继续', 'Save and continue')}</button>
        </form>
      </CommunitySurface>
    </div>
  );
}
