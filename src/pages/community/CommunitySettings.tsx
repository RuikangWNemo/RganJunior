import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Save, UserRound } from 'lucide-react';

import { CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { getMyCommunityProfile, updateMyCommunityProfile } from '@/services/community-profile';
import { updateEmail, updatePassword } from '@/services/auth';

type ProfileVisibility = 'private' | 'members' | 'public';

export default function CommunitySettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useCommunityUi();
  const [form, setForm] = useState({ displayName: '', fullNamePrivate: '', nameZh: '', nameEn: '', natureName: '', bio: '', city: '', region: '', country: '', profileVisibility: 'private' as ProfileVisibility, showRealName: false, allowMessages: true });
  const [account, setAccount] = useState({ email: user?.email || '', password: '' });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getMyCommunityProfile().then((profile) => {
      if (!profile?.person_id) return;
      setForm({
        displayName: profile.person_display_name || '', fullNamePrivate: profile.full_name_private || '',
        nameZh: profile.name_zh || '', nameEn: profile.name_en || '', natureName: profile.nature_name || '',
        bio: profile.bio || '', city: profile.city || '', region: profile.region || '', country: profile.country || '',
        profileVisibility: profile.profile_visibility as ProfileVisibility,
        showRealName: profile.show_real_name || false, allowMessages: profile.allow_messages,
      });
    }).catch((readError) => setError(readError instanceof Error ? readError.message : t('资料读取失败。', 'Could not load your profile.'))).finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null); setNotice(null);
    try { await updateMyCommunityProfile(form); setNotice(t('主页设置已保存。', 'Profile settings saved.')); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : t('保存失败。', 'Could not save your profile.')); }
    finally { setBusy(false); }
  };

  const saveAccount = async () => {
    setBusy(true); setError(null); setNotice(null);
    try {
      if (account.email && account.email !== user?.email) await updateEmail(account.email);
      if (account.password) await updatePassword(account.password);
      setAccount((current) => ({ ...current, password: '' }));
      setNotice(t('账号修改已提交；邮箱变更可能需要再次确认。', 'Account changes submitted. An email change may need confirmation.'));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t('账号修改失败。', 'Could not update your account.')); }
    finally { setBusy(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/community/auth', { replace: true });
  };

  const fieldLabelClass = 'block space-y-2 text-sm font-semibold text-[hsl(var(--community-forest))]';

  return (
    <CommunitySurface eyebrow="Settings" title={t('决定如何被看见。', 'Choose how you are seen.')} description={t('管理个人主页、隐私边界和登录账号。你的监护与审核资料不会在这里公开。', 'Manage your profile, privacy boundaries, and sign-in account. Guardian and review information is never public here.')} width="wide">
      {loading ? <CommunityLoadingState label={t('正在读取设置…', 'Loading settings…')} variant="form" /> : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <form className="space-y-6" onSubmit={saveProfile}>
            <div className="flex items-center gap-3 border-b border-[hsl(var(--community-forest)/0.1)] pb-4"><span className="grid size-10 place-items-center rounded-xl bg-[hsl(var(--community-forest))] text-white"><UserRound className="size-4" /></span><div><h2 className="font-serif text-2xl">{t('个人主页', 'Profile')}</h2><p className="text-xs text-[hsl(var(--community-forest)/0.52)]">{t('成员在伙伴目录中看到的信息', 'What members see in the people directory')}</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={fieldLabelClass}><span>{t('显示名', 'Display name')}</span><input className={communityInputClass} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} required /></label>
              <label className={fieldLabelClass}><span>{t('私密全名', 'Private full name')}</span><input className={communityInputClass} value={form.fullNamePrivate} onChange={(event) => setForm({ ...form, fullNamePrivate: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('中文名', 'Chinese name')}</span><input className={communityInputClass} value={form.nameZh} onChange={(event) => setForm({ ...form, nameZh: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('英文名', 'English name')}</span><input className={communityInputClass} value={form.nameEn} onChange={(event) => setForm({ ...form, nameEn: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('自然名', 'Nature name')}</span><input className={communityInputClass} value={form.natureName} onChange={(event) => setForm({ ...form, natureName: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('主页可见范围', 'Profile visibility')}</span><select className={communityInputClass} value={form.profileVisibility} onChange={(event) => setForm({ ...form, profileVisibility: event.target.value as ProfileVisibility })}><option value="private">{t('仅自己', 'Only me')}</option><option value="members">{t('正式成员', 'Members')}</option><option value="public">{t('公开', 'Public')}</option></select></label>
              <label className={`${fieldLabelClass} sm:col-span-2`}><span>{t('简介', 'Bio')}</span><textarea className={communityTextareaClass} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('城市', 'City')}</span><input className={communityInputClass} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('地区', 'Region')}</span><input className={communityInputClass} value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('国家 / 地区', 'Country / area')}</span><input className={communityInputClass} value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label>
            </div>
            <div className="grid gap-3 rounded-2xl bg-[hsl(var(--community-forest)/0.055)] p-4 text-sm">
              <label className="flex min-h-11 items-center gap-3"><input className="size-4 accent-[hsl(var(--community-orange))]" type="checkbox" checked={form.showRealName} onChange={(event) => setForm({ ...form, showRealName: event.target.checked })} />{t('展示中文名 / 英文名', 'Show Chinese / English name')}</label>
              <label className="flex min-h-11 items-center gap-3"><input className="size-4 accent-[hsl(var(--community-orange))]" type="checkbox" checked={form.allowMessages} onChange={(event) => setForm({ ...form, allowMessages: event.target.checked })} />{t('允许正式成员私聊我', 'Allow members to message me')}</label>
            </div>
            <button className={`${communityPrimaryButtonClass} gap-2`} disabled={busy}><Save className="size-4" />{busy ? t('正在保存…', 'Saving…') : t('保存主页设置', 'Save profile')}</button>
          </form>

          <aside className="self-start rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.1)] bg-[hsl(var(--community-paper-deep)/0.6)] p-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))]"><LockKeyhole className="size-4" /></span><h2 className="font-serif text-xl">{t('登录账号', 'Sign-in account')}</h2></div>
            <div className="mt-5 space-y-4">
              <label className={fieldLabelClass}><span>{t('邮箱', 'Email')}</span><input className={communityInputClass} type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} /></label>
              <label className={fieldLabelClass}><span>{t('新密码', 'New password')}</span><input className={communityInputClass} type="password" minLength={8} placeholder={t('留空则不修改', 'Leave blank to keep current')} value={account.password} onChange={(event) => setAccount({ ...account, password: event.target.value })} /></label>
              <button type="button" className={`${communitySecondaryButtonClass} w-full`} onClick={() => void saveAccount()} disabled={busy}>{t('保存账号修改', 'Save account')}</button>
              <button type="button" className="min-h-11 w-full text-sm font-semibold text-destructive underline underline-offset-4" onClick={() => void handleSignOut()}>{t('退出登录', 'Sign out')}</button>
            </div>
          </aside>
        </div>
      )}
      {notice ? <p className="mt-6 rounded-2xl bg-[hsl(var(--community-forest)/0.07)] p-4 text-sm font-medium" role="status">{notice}</p> : null}
      {error ? <div className="mt-6"><CommunityErrorState message={error} onRetry={loading ? undefined : load} /></div> : null}
    </CommunitySurface>
  );
}
