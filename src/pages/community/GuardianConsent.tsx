import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import {
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communityInputClass,
  communityPrimaryButtonClass,
  communitySecondaryButtonClass,
} from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { isManualGuardianFlow } from '@/lib/guardianFlow';
import {
  getGuardianConsentRequest,
  requestGuardianConsent,
  sendGuardianOtp,
  verifyGuardianOtp,
} from '@/services/guardian-consent';
import { getMyCommunityApplication } from '@/services/memberships';

type GuardianRequest = Awaited<ReturnType<typeof getGuardianConsentRequest>>;

function GuardianPublicConfirmation({ token }: { token: string }) {
  const { lang, t } = useCommunityUi();
  const [request, setRequest] = useState<GuardianRequest>(null);
  const [phone, setPhone] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [phoneLast4, setPhoneLast4] = useState('');
  const [code, setCode] = useState('');
  const [affirmed, setAffirmed] = useState({ guardian: false, notice: false, joining: false });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGuardianConsentRequest(token)
      .then(setRequest)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('确认链接不可用。', 'This confirmation link is unavailable.')))
      .finally(() => setLoading(false));
  }, [t, token]);

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const result = await sendGuardianOtp(token, phone, lang);
      setChallengeId(result.challengeId);
      setPhoneLast4(result.phoneLast4);
    } catch (sendError) { setError(sendError instanceof Error ? sendError.message : t('验证码发送失败。', 'Could not send the verification code.')); }
    finally { setBusy(false); }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!challengeId) return;
    setBusy(true); setError(null);
    try {
      await verifyGuardianOtp({ token, challengeId, code, affirmedGuardianship: affirmed.guardian, affirmedNoticeRead: affirmed.notice, affirmedJoining: affirmed.joining });
      setVerified(true);
    } catch (verifyError) { setError(verifyError instanceof Error ? verifyError.message : t('验证码确认失败。', 'Could not verify the code.')); }
    finally { setBusy(false); }
  };

  if (verified) {
    return (
      <div className="community-page-frame">
        <CommunitySurface title={t('知情确认已完成', 'Confirmation complete')} description={t('谢谢您的阅读与确认。申请人现在可以继续资料完善或等待社群审核。', 'Thank you for reviewing and confirming. The applicant can now continue profile setup or wait for review.')} width="narrow">
          <div className="flex items-center gap-4 rounded-[1.4rem] bg-[hsl(var(--community-forest)/0.07)] p-6 text-[hsl(var(--community-forest))]"><CheckCircle2 className="size-8 shrink-0 text-[hsl(var(--community-orange))]" /><p>{t('此页面可以安全关闭。', 'You can safely close this page.')}</p></div>
        </CommunitySurface>
      </div>
    );
  }

  return (
    <div className="community-page-frame">
      <CommunitySurface
        eyebrow="Guardian informed consent"
        title={t('阿柑少年社群加入确认', "R-Gan Junior community confirmation")}
        description={request ? t(`${request.minor_display_label}正在申请加入阿柑少年线上社群。`, `${request.minor_display_label} is applying to join the online community.`) : t('正在读取确认内容…', 'Loading confirmation details…')}
        aside={<><ShieldCheck className="mb-4 size-7 text-[hsl(var(--community-orange))]" /><p>{t('手机验证码只核验您对该手机号的控制权，不自动证明法定监护关系或真实身份。平台会另行完成必要审核。', 'The phone code only verifies control of the number. It does not prove legal guardianship or identity; the community team completes the necessary review separately.')}</p></>}
        width="wide"
      >
        {loading ? <CommunityLoadingState label={t('正在读取确认内容…', 'Loading confirmation details…')} /> : null}
        {!loading && request ? (
          <div className="space-y-7">
            <div className="rounded-[1.4rem] bg-[hsl(var(--community-paper-deep)/0.62)] p-5 text-sm leading-7">
              <p className="font-semibold text-[hsl(var(--community-forest))]">{request.document_title}</p>
              <p className="mt-2 text-[hsl(var(--community-forest)/0.64)]">{request.document_summary}</p>
              <div className="mt-5 max-h-80 overflow-y-auto whitespace-pre-wrap border-t border-[hsl(var(--community-forest)/0.1)] pt-5 text-[hsl(var(--community-forest)/0.64)]">{request.document_body_markdown}</div>
            </div>

            {!challengeId ? (
              <form className="space-y-4" onSubmit={requestOtp}>
                <label className="block space-y-2 text-sm font-semibold"><span>{t('用于本次确认的监护人手机号', 'Guardian phone number for this confirmation')}</span><input className={communityInputClass} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" required /></label>
                <button className={communityPrimaryButtonClass} disabled={busy || !request.otp_required}>{busy ? t('正在发送…', 'Sending…') : t('发送手机验证码', 'Send verification code')}</button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={verify}>
                <p className="text-sm text-[hsl(var(--community-forest)/0.62)]">{t(`验证码已发送至尾号 ${phoneLast4}`, `A code was sent to the number ending in ${phoneLast4}`)}</p>
                <label className="block space-y-2 text-sm font-semibold"><span>{t('6 位验证码', '6-digit code')}</span><input className={communityInputClass} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required /></label>
                {([
                  ['guardian', t('我确认我是其父母或其他监护人', 'I confirm that I am a parent or other guardian')],
                  ['notice', t('我已经阅读青少年隐私与社区说明', 'I have read the youth privacy and community notice')],
                  ['joining', t('我同意其加入阿柑少年社群', "I consent to their joining the R-Gan Junior community")],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex min-h-14 items-start gap-3 rounded-2xl bg-[hsl(var(--community-forest)/0.055)] p-4 text-sm"><input className="mt-1 size-4 accent-[hsl(var(--community-orange))]" type="checkbox" checked={affirmed[key]} onChange={(event) => setAffirmed((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>
                ))}
                <div className="flex flex-wrap gap-3">
                  <button className={communityPrimaryButtonClass} disabled={busy || code.length !== 6 || !Object.values(affirmed).every(Boolean)}>{busy ? t('正在确认…', 'Confirming…') : t('确认', 'Confirm')}</button>
                  <button type="button" className={communitySecondaryButtonClass} onClick={() => setChallengeId(null)}>{t('重新发送', 'Send again')}</button>
                </div>
              </form>
            )}
            {error ? <CommunityErrorState message={error} /> : null}
          </div>
        ) : null}
        {!loading && !request && error ? <CommunityErrorState message={error} /> : null}
      </CommunitySurface>
    </div>
  );
}

function MinorGuardianSetup() {
  const { communityState, refreshCommunity } = useAuth();
  const { lang, t } = useCommunityUi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ guardianName: '', relationship: '', contactChannel: 'email' as 'email' | 'phone', contact: '' });
  const [applicationId, setApplicationId] = useState<number | undefined>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getMyCommunityApplication().then((application) => setApplicationId(application?.id)).catch(() => undefined); }, []);
  useEffect(() => {
    if (communityState?.guardian_consent_status === 'verified') refreshCommunity().finally(() => navigate('/community/enter', { replace: true }));
  }, [communityState?.guardian_consent_status, navigate, refreshCommunity]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try { await requestGuardianConsent({ ...form, applicationId, language: lang }); setSent(true); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : isManualGuardianFlow ? t('联系方式登记失败。', 'Could not save the contact details.') : t('邀请发送失败。', 'Could not send the invitation.')); }
    finally { setBusy(false); }
  };

  if (isManualGuardianFlow && communityState?.age_band && communityState.age_band !== 'under_14') {
    return <Navigate to={communityState.destination || '/community/application'} replace />;
  }

  return (
    <div className="community-page-frame">
      <CommunitySurface
        eyebrow="Youth safety"
        title={isManualGuardianFlow
          ? sent ? t('联系方式已登记', 'Contact details saved') : t('登记监护人联系方式', 'Provide guardian contact details')
          : sent ? t('确认邀请已发送', 'Confirmation invitation sent') : t('邀请监护人知情确认', 'Invite a guardian to confirm')}
        description={isManualGuardianFlow
          ? sent ? t('工作人员会与监护人联系、说明社群与隐私事项，并留档确认。', 'Staff will contact the guardian, explain the community and privacy notice, and record confirmation.') : t('联系方式只用于本次监护人沟通与入群审核，不会出现在公开主页。', 'These details are used only for Guardian communication and membership review, and never appear on a public profile.')
          : sent ? t('请监护人打开收到的链接，阅读说明并完成手机验证码。', 'Ask your guardian to open the link, read the notice, and complete phone verification.') : t('这里只收集发送确认所必需的监护人联系信息。', 'We only collect the guardian contact details needed to send this confirmation.')}
        aside={<p>{isManualGuardianFlow
          ? t('未满 14 岁可以正常完成资料和申请；在监护人确认与申请审批完成前，成员功能保持关闭。', 'Under-14 applicants can complete their profile and application normally. Member features stay closed until Guardian confirmation and application approval are complete.')
          : communityState?.age_band === 'under_14' ? t('未满 14 岁：监护人确认前不会继续收集完整个人主页资料。', 'Under 14: full profile details are not collected before guardian confirmation.') : t('14–17 岁：可以先完善资料，但正式社群审核前必须完成监护人确认。', 'Age 14–17: profile setup can happen first, but guardian confirmation is required before membership review.')}</p>}
        width="wide"
      >
        <CommunityProcessSteps current="safety" />
        {sent ? (
          <div className="space-y-5"><div className="flex items-center gap-4 rounded-[1.4rem] bg-[hsl(var(--community-forest)/0.07)] p-6"><CheckCircle2 className="size-8 shrink-0 text-[hsl(var(--community-orange))]" /><p>{isManualGuardianFlow ? t('你可以在申请状态页查看进度；工作人员完成联系后，申请会自动进入审核。', 'Check progress on the application page. After staff completes contact, the application automatically enters review.') : t('你可以稍后回到这里查看状态。', 'You can return here later to check the status.')}</p></div><div className="flex flex-wrap gap-3"><Link className={communityPrimaryButtonClass} to="/community/application">{t('查看申请状态', 'View application status')}</Link><button type="button" className={communitySecondaryButtonClass} onClick={() => setSent(false)}>{isManualGuardianFlow ? t('更新联系方式', 'Update contact') : t('重新发送邀请', 'Send invitation again')}</button></div></div>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <label className="block space-y-2 text-sm font-semibold"><span>{t('监护人姓名 *', 'Guardian name *')}</span><input className={communityInputClass} value={form.guardianName} onChange={(event) => setForm({ ...form, guardianName: event.target.value })} required /></label>
            <label className="block space-y-2 text-sm font-semibold"><span>{t('与我的关系 *', 'Relationship to me *')}</span><input className={communityInputClass} value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} placeholder={t('父亲、母亲或其他监护人', 'Parent or other guardian')} required /></label>
            <label className="block space-y-2 text-sm font-semibold"><span>{isManualGuardianFlow ? t('优先联系方法', 'Preferred contact method') : t('发送方式', 'Send by')}</span><select className={communityInputClass} value={form.contactChannel} onChange={(event) => setForm({ ...form, contactChannel: event.target.value as 'email' | 'phone' })}><option value="email">{t('邮箱', 'Email')}</option><option value="phone">{t('手机号', 'Phone')}</option></select></label>
            <label className="block space-y-2 text-sm font-semibold"><span>{form.contactChannel === 'email' ? t('监护人邮箱 *', 'Guardian email *') : t('监护人手机号 *', 'Guardian phone *')}</span><input className={communityInputClass} type={form.contactChannel === 'email' ? 'email' : 'tel'} value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} required /></label>
            {error ? <CommunityErrorState message={error} /> : null}
            <button className={`${communityPrimaryButtonClass} w-full`} disabled={busy}>{busy ? isManualGuardianFlow ? t('正在登记…', 'Saving…') : t('正在发送…', 'Sending…') : isManualGuardianFlow ? t('提交联系方式', 'Save contact details') : t('发送确认邀请', 'Send confirmation invitation')}</button>
          </form>
        )}
      </CommunitySurface>
    </div>
  );
}

export default function GuardianConsent() {
  const { user, loading } = useAuth();
  const { t } = useCommunityUi();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);
  if (token) return <GuardianPublicConfirmation token={token} />;
  if (loading) return <CommunityLoadingState label={t('正在确认账号…', 'Checking your account…')} />;
  return user ? <MinorGuardianSetup /> : <Navigate to="/community/auth" replace />;
}
