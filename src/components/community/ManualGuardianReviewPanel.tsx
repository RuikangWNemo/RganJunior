import { useState } from 'react';
import { CheckCircle2, Eye, ShieldCheck } from 'lucide-react';

import {
  CommunityErrorState,
  communityInputClass,
  communityPrimaryButtonClass,
  communitySecondaryButtonClass,
  communityTextareaClass,
} from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import {
  confirmManualGuardianReview,
  declineManualGuardianReview,
  getManualGuardianReview,
  type ManualGuardianReview,
} from '@/services/guardian-consent';

function localDateTimeValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export default function ManualGuardianReviewPanel({
  applicationId,
  disabled,
  onBusyChange,
  onUpdated,
}: {
  applicationId: number;
  disabled: boolean;
  onBusyChange(busy: boolean): void;
  onUpdated(): Promise<void>;
}) {
  const { t } = useCommunityUi();
  const [review, setReview] = useState<ManualGuardianReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState(localDateTimeValue);
  const [verificationMethod, setVerificationMethod] = useState('manual_phone');
  const [verificationBasis, setVerificationBasis] = useState('');
  const [reviewerNote, setReviewerNote] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [affirmed, setAffirmed] = useState({
    guardianship: false,
    notice: false,
    joining: false,
  });

  const run = async (action: () => Promise<void>) => {
    if (busy || disabled) return;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (actionError) {
      setError(actionError instanceof Error
        ? actionError.message
        : t('监护人审核操作失败。', 'Guardian review action failed.'));
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  const load = () => run(async () => {
    const next = await getManualGuardianReview(applicationId);
    setReview(next);
    setVerificationMethod(next.contactChannel === 'email' ? 'manual_email' : 'manual_phone');
  });

  const confirm = () => run(async () => {
    await confirmManualGuardianReview({
      applicationId,
      verificationMethod,
      confirmedAt: new Date(confirmedAt).toISOString(),
      affirmedGuardianship: affirmed.guardianship,
      affirmedNoticeRead: affirmed.notice,
      affirmedJoining: affirmed.joining,
      verificationBasis,
      reviewerNote: reviewerNote || undefined,
    });
    setNotice(t('监护人确认已留档，申请已进入普通审核。', 'Guardian confirmation was recorded and the application entered ordinary review.'));
    const [, nextReview] = await Promise.all([
      onUpdated(),
      getManualGuardianReview(applicationId),
    ]);
    setReview(nextReview);
  });

  const decline = () => run(async () => {
    await declineManualGuardianReview(applicationId, declineReason);
    setNotice(t('已记录本次未完成监护人确认。', 'The incomplete Guardian confirmation was recorded.'));
    const [, nextReview] = await Promise.all([
      onUpdated(),
      getManualGuardianReview(applicationId),
    ]);
    setReview(nextReview);
  });

  if (!review) {
    return (
      <div className="mt-4 rounded-2xl border border-[hsl(var(--community-orange)/0.2)] bg-[hsl(var(--community-orange)/0.055)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[hsl(var(--community-forest))]">{t('人工监护人确认', 'Manual Guardian confirmation')}</p>
            <p className="mt-1 text-xs text-[hsl(var(--community-forest)/0.58)]">{t('敏感联系方式默认隐藏；仅在实际联系时读取。', 'Sensitive contact details stay hidden until needed for follow-up.')}</p>
          </div>
          <button type="button" className={communitySecondaryButtonClass} disabled={busy || disabled} onClick={load}>
            <Eye className="size-4" />{busy ? t('正在读取…', 'Loading…') : t('读取联系资料', 'Open contact record')}
          </button>
        </div>
        {error ? <div className="mt-3"><CommunityErrorState message={error} /></div> : null}
      </div>
    );
  }

  const completed = review.requestStatus === 'verified';
  const declined = review.requestStatus === 'declined';
  const allAffirmed = Object.values(affirmed).every(Boolean);
  const canConfirm = !busy
    && !disabled
    && review.legalDocument.status === 'active'
    && review.requestStatus === 'pending'
    && allAffirmed
    && verificationBasis.trim().length >= 5
    && Boolean(confirmedAt);

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-[hsl(var(--community-orange)/0.2)] bg-[hsl(var(--community-orange)/0.055)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[hsl(var(--community-forest))]">{t('人工监护人确认', 'Manual Guardian confirmation')}</p>
          <p className="mt-1 text-xs text-[hsl(var(--community-forest)/0.58)]">{t(`请求状态：${review.requestStatus}`, `Request status: ${review.requestStatus}`)}</p>
        </div>
        {completed ? <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><CheckCircle2 className="size-4" />{t('已确认', 'Confirmed')}</span> : null}
      </div>

      <div className="grid gap-3 rounded-2xl bg-white/70 p-4 text-sm sm:grid-cols-2">
        <p><span className="text-muted-foreground">{t('监护人', 'Guardian')}：</span>{review.guardianName}</p>
        <p><span className="text-muted-foreground">{t('关系', 'Relationship')}：</span>{review.guardianRelationship}</p>
        <p className="sm:col-span-2"><span className="text-muted-foreground">{review.contactChannel === 'email' ? t('邮箱', 'Email') : t('电话', 'Phone')}：</span><span className="break-all font-medium">{review.contact}</span></p>
        <p className="sm:col-span-2"><span className="text-muted-foreground">{t('知情文件', 'Notice')}：</span>{review.legalDocument.title} · v{review.legalDocument.version} · {review.legalDocument.locale}</p>
      </div>

      {completed ? (
        <div className="rounded-2xl bg-primary/[0.07] p-4 text-sm leading-6 text-primary">
          <p>{t('确认时间', 'Confirmed at')}：{review.consentedAt ? new Date(review.consentedAt).toLocaleString() : '—'}</p>
          <p>{t('核验方式', 'Verification method')}：{review.verificationMethod}</p>
          <p>{t('核验依据', 'Verification basis')}：{review.verificationBasis}</p>
        </div>
      ) : declined ? (
        <p className="rounded-2xl bg-destructive/8 p-4 text-sm text-destructive">{t('本次联系已记录为未完成确认。申请人可更新监护人联系方式后重新处理。', 'This contact attempt did not complete confirmation. The applicant can update Guardian details for another review.')}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl bg-white/70 p-4 text-xs leading-5 text-[hsl(var(--community-forest)/0.68)]">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[hsl(var(--community-orange))]" />
            <p>{t('请确认监护关系、说明知情文件并取得明确同意。核验依据只写必要摘要，严禁粘贴证件全文或完整证件号码。', 'Confirm the Guardian relationship, present the notice, and obtain explicit consent. Record only a concise basis—never paste full identity documents or complete document numbers.')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold"><span>{t('联系与核验方式', 'Contact and verification method')}</span><select className={communityInputClass} value={verificationMethod} onChange={(event) => setVerificationMethod(event.target.value)}><option value="manual_phone">{t('工作人员电话联系', 'Staff phone call')}</option><option value="manual_email">{t('工作人员邮件联系', 'Staff email')}</option><option value="manual_video">{t('视频沟通', 'Video call')}</option><option value="manual_in_person">{t('当面沟通', 'In person')}</option><option value="trusted_offline_relationship">{t('可信线下关系', 'Trusted offline relationship')}</option><option value="other">{t('其他', 'Other')}</option></select></label>
            <label className="space-y-2 text-sm font-semibold"><span>{t('确认时间', 'Confirmation time')}</span><input className={communityInputClass} type="datetime-local" value={confirmedAt} onChange={(event) => setConfirmedAt(event.target.value)} /></label>
          </div>
          {([
            ['guardianship', t('已确认对方为父母或其他监护人', 'Confirmed the person is a parent or other guardian')],
            ['notice', t('已向对方说明并提供当前知情文件', 'Presented the current notice to the Guardian')],
            ['joining', t('对方明确同意申请人加入社群', 'The Guardian explicitly consented to joining')],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex min-h-14 items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm"><input className="mt-1 size-4 accent-[hsl(var(--community-orange))]" type="checkbox" checked={affirmed[key]} onChange={(event) => setAffirmed((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>
          ))}
          <label className="block space-y-2 text-sm font-semibold"><span>{t('核验依据摘要 *', 'Verification basis *')}</span><textarea className={communityTextareaClass} value={verificationBasis} maxLength={500} onChange={(event) => setVerificationBasis(event.target.value)} placeholder={t('例如：使用申请人登记电话联系其母亲，核对关系并逐项说明知情文件。不得填写完整证件信息。', 'Example: Called the applicant-provided number, confirmed the person was their mother, and reviewed each notice item. Do not enter complete ID details.')} /></label>
          <label className="block space-y-2 text-sm font-semibold"><span>{t('内部备注（可选）', 'Internal note (optional)')}</span><textarea className={communityTextareaClass} value={reviewerNote} maxLength={1000} onChange={(event) => setReviewerNote(event.target.value)} /></label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={communityPrimaryButtonClass} disabled={!canConfirm} onClick={confirm}>{busy ? t('正在保存…', 'Saving…') : t('确认并进入普通审核', 'Confirm and move to review')}</button>
          </div>
          <div className="grid gap-3 border-t border-[hsl(var(--community-forest)/0.1)] pt-4 sm:grid-cols-[1fr_auto]">
            <input className={communityInputClass} value={declineReason} maxLength={500} onChange={(event) => setDeclineReason(event.target.value)} placeholder={t('未完成确认的原因（必填）', 'Reason confirmation was not completed (required)')} />
            <button type="button" className="inline-flex min-h-12 items-center justify-center rounded-full border border-destructive/30 px-5 text-sm text-destructive disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || disabled || !declineReason.trim()} onClick={decline}>{t('记录为未确认', 'Record as not confirmed')}</button>
          </div>
        </div>
      )}

      {notice ? <p className="rounded-2xl bg-primary/10 p-4 text-sm text-primary" aria-live="polite">{notice}</p> : null}
      {error ? <CommunityErrorState message={error} /> : null}
    </div>
  );
}
