import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, MailCheck, RefreshCw, Save, ShieldCheck, UserRound } from 'lucide-react';

import CommunityPasswordFields from '@/components/community/CommunityPasswordFields';
import { CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { isValidNewPassword } from '@/lib/passwordValidation';
import { getMyCommunityProfile, updateMyCommunityProfile } from '@/services/community-profile';
import { EMAIL_OTP_LENGTH, reauthenticate, updateEmail, updatePassword } from '@/services/auth';

type ProfileVisibility = 'private' | 'members' | 'public';
type BusyAction = 'profile' | 'email' | 'passwordCode' | 'password' | null;

export default function CommunitySettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useCommunityUi();
  const [form, setForm] = useState({ displayName: '', fullNamePrivate: '', nameZh: '', nameEn: '', natureName: '', bio: '', city: '', region: '', country: '', profileVisibility: 'private' as ProfileVisibility, showRealName: false, allowMessages: true });
  const [accountEmail, setAccountEmail] = useState(user?.email || '');
  const [passwordVerificationSent, setPasswordVerificationSent] = useState(false);
  const [passwordCode, setPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

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

  useEffect(() => {
    if (user?.email) setAccountEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusyAction('profile'); setError(null); setNotice(null);
    try { await updateMyCommunityProfile(form); setNotice(t('主页设置已保存。', 'Profile settings saved.')); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : t('保存失败。', 'Could not save your profile.')); }
    finally { setBusyAction(null); }
  };

  const saveEmail = async () => {
    setBusyAction('email'); setError(null); setNotice(null);
    try {
      await updateEmail(accountEmail);
      setNotice(t('邮箱修改已提交，请按邮件提示完成确认。', 'Email change submitted. Follow the confirmation email to finish.'));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t('邮箱修改失败。', 'Could not update your email.')); }
    finally { setBusyAction(null); }
  };

  const passwordErrorMessage = (passwordError: unknown) => {
    const code = passwordError && typeof passwordError === 'object' && 'code' in passwordError
      ? String(passwordError.code)
      : '';
    if (code === 'reauthentication_not_valid' || code === 'reauthentication_needed' || code === 'reauth_nonce_missing') {
      return t('验证码无效或已过期，请重新发送。', 'The code is invalid or expired. Send a new one.');
    }
    if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
      return t('发送得有些频繁，请稍后再试。', 'Too many requests. Please try again shortly.');
    }
    return passwordError instanceof Error
      ? passwordError.message
      : t('密码修改失败，请重试。', 'Could not update your password.');
  };

  const sendPasswordCode = async () => {
    setBusyAction('passwordCode'); setError(null); setNotice(null);
    try {
      await reauthenticate();
      setPasswordVerificationSent(true);
      setPasswordCode('');
      setResendSeconds(30);
      setNotice(t(`验证码已发送至 ${user?.email || '当前邮箱'}。`, `A verification code was sent to ${user?.email || 'your current email'}.`));
    } catch (sendError) { setError(passwordErrorMessage(sendError)); }
    finally { setBusyAction(null); }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null); setNotice(null);
    if (passwordCode.length !== EMAIL_OTP_LENGTH) {
      setError(t(`请输入邮件中的 ${EMAIL_OTP_LENGTH} 位验证码。`, `Enter the ${EMAIL_OTP_LENGTH}-digit code from your email.`));
      return;
    }
    if (!isValidNewPassword(newPassword, confirmPassword)) {
      setError(newPassword.length < 8
        ? t('密码至少需要 8 个字符。', 'Password must be at least 8 characters.')
        : t('两次输入的密码不一致。', 'Passwords do not match.'));
      return;
    }
    setBusyAction('password');
    try {
      await updatePassword(newPassword, passwordCode);
      setPasswordVerificationSent(false);
      setPasswordCode('');
      setNewPassword('');
      setConfirmPassword('');
      setResendSeconds(0);
      setNotice(t('密码已安全更新。', 'Your password was updated securely.'));
    } catch (saveError) { setError(passwordErrorMessage(saveError)); }
    finally { setBusyAction(null); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/community/auth', { replace: true });
  };

  const fieldLabelClass = 'block space-y-2 text-sm font-semibold text-[hsl(var(--community-forest))]';

  return (
    <CommunitySurface eyebrow="Settings" title={t('决定如何被看见。', 'Choose how you are seen.')} description={t('管理个人主页、隐私边界和登录账号。你的监护与审核资料不会在这里公开。', 'Manage your profile, privacy boundaries, and sign-in account. Guardian and review information is never public here.')} width="wide">
      {loading ? <CommunityLoadingState label={t('正在读取设置…', 'Loading settings…')} variant="form" /> : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
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
            <button className={`${communityPrimaryButtonClass} gap-2`} disabled={busyAction !== null}><Save className="size-4" aria-hidden="true" />{busyAction === 'profile' ? t('正在保存…', 'Saving…') : t('保存主页设置', 'Save profile')}</button>
          </form>

          <aside className="self-start rounded-[1.4rem] border border-[hsl(var(--community-forest)/0.1)] bg-[hsl(var(--community-paper-deep)/0.6)] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))]"><LockKeyhole className="size-4" aria-hidden="true" /></span>
              <div><h2 className="font-serif text-xl">{t('登录账号', 'Sign-in account')}</h2><p className="mt-0.5 text-xs text-[hsl(var(--community-forest)/0.52)]">{t('邮箱与密码分别管理', 'Manage email and password separately')}</p></div>
            </div>

            <section className="mt-6 space-y-3" aria-labelledby="community-email-settings-title">
              <div className="flex items-center gap-2 text-[hsl(var(--community-forest))]"><MailCheck className="size-4" aria-hidden="true" /><h3 id="community-email-settings-title" className="text-sm font-semibold">{t('登录邮箱', 'Sign-in email')}</h3></div>
              <label className={fieldLabelClass} htmlFor="community-account-email"><span className="sr-only">{t('邮箱', 'Email')}</span><input id="community-account-email" className={communityInputClass} type="email" autoComplete="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} /></label>
              <p className="text-xs leading-5 text-[hsl(var(--community-forest)/0.58)]">{t('修改后需要通过邮件确认，新邮箱才会生效。', 'The new email takes effect after email confirmation.')}</p>
              <button
                type="button"
                className={`${communitySecondaryButtonClass} w-full`}
                onClick={() => void saveEmail()}
                disabled={busyAction !== null || !accountEmail.trim() || accountEmail.trim().toLowerCase() === (user?.email || '').toLowerCase()}
              >
                {busyAction === 'email' ? t('正在提交…', 'Submitting…') : t('修改登录邮箱', 'Update sign-in email')}
              </button>
            </section>

            <section className="mt-7 border-t border-[hsl(var(--community-forest)/0.1)] pt-6" aria-labelledby="community-password-settings-title">
              <div className="flex items-center gap-2 text-[hsl(var(--community-forest))]"><ShieldCheck className="size-4" aria-hidden="true" /><h3 id="community-password-settings-title" className="text-sm font-semibold">{t('修改密码', 'Change password')}</h3></div>
              <p className="mt-2 text-xs leading-5 text-[hsl(var(--community-forest)/0.58)]">{t('为保护账号，我们会先向当前登录邮箱发送一次性验证码。', 'To protect your account, we first send a one-time code to your current email.')}</p>

              {!passwordVerificationSent ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white/55 px-4 py-3 text-sm text-[hsl(var(--community-forest))]">
                    <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--community-forest)/0.48)]">{t('验证码接收邮箱', 'Verification email')}</span>
                    <span className="mt-1 block truncate font-medium">{user?.email || t('当前账号未绑定邮箱', 'No email is connected')}</span>
                  </div>
                  <button type="button" className={`${communityPrimaryButtonClass} w-full`} onClick={() => void sendPasswordCode()} disabled={busyAction !== null || !user?.email}>
                    {busyAction === 'passwordCode' ? t('正在发送…', 'Sending…') : t('发送邮箱验证码', 'Send email code')}
                  </button>
                </div>
              ) : (
                <form className="mt-5 space-y-5" onSubmit={savePassword}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label id="community-password-code-label" className="text-sm font-semibold text-[hsl(var(--community-forest))]">{t(`${EMAIL_OTP_LENGTH} 位邮箱验证码`, `${EMAIL_OTP_LENGTH}-digit email code`)}</label>
                      <span className="max-w-[12rem] truncate text-xs text-[hsl(var(--community-forest)/0.5)]">{user?.email}</span>
                    </div>
                    <InputOTP
                      aria-labelledby="community-password-code-label"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={EMAIL_OTP_LENGTH}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={passwordCode}
                      onChange={setPasswordCode}
                      containerClassName="justify-center"
                      disabled={busyAction !== null}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: EMAIL_OTP_LENGTH }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-10 text-base" />)}
                      </InputOTPGroup>
                    </InputOTP>
                    <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--community-forest))] underline-offset-4 enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-45" onClick={() => void sendPasswordCode()} disabled={busyAction !== null || resendSeconds > 0}>
                      <RefreshCw className="size-3.5" aria-hidden="true" />
                      {resendSeconds > 0 ? t(`${resendSeconds} 秒后可重新发送`, `Resend in ${resendSeconds}s`) : t('重新发送验证码', 'Resend code')}
                    </button>
                  </div>

                  <CommunityPasswordFields
                    idPrefix="community-settings"
                    password={newPassword}
                    confirmPassword={confirmPassword}
                    onPasswordChange={setNewPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    disabled={busyAction !== null}
                  />

                  <button className={`${communityPrimaryButtonClass} w-full`} disabled={busyAction !== null || passwordCode.length !== EMAIL_OTP_LENGTH || !isValidNewPassword(newPassword, confirmPassword)}>
                    {busyAction === 'password' ? t('正在安全更新…', 'Updating securely…') : t('验证并修改密码', 'Verify and change password')}
                  </button>
                  <button type="button" className="min-h-10 w-full text-xs font-semibold text-[hsl(var(--community-forest)/0.65)] underline underline-offset-4" onClick={() => { setPasswordVerificationSent(false); setPasswordCode(''); setNewPassword(''); setConfirmPassword(''); setResendSeconds(0); }} disabled={busyAction !== null}>{t('取消修改密码', 'Cancel password change')}</button>
                </form>
              )}
            </section>

            <button type="button" className="mt-6 min-h-11 w-full border-t border-[hsl(var(--community-forest)/0.1)] pt-5 text-sm font-semibold text-destructive underline underline-offset-4" onClick={() => void handleSignOut()}>{t('退出登录', 'Sign out')}</button>
          </aside>
        </div>
      )}
      {notice ? <p className="mt-6 rounded-2xl bg-[hsl(var(--community-forest)/0.07)] p-4 text-sm font-medium" role="status">{notice}</p> : null}
      {error ? <div className="mt-6"><CommunityErrorState message={error} onRetry={loading ? undefined : load} /></div> : null}
    </CommunitySurface>
  );
}
