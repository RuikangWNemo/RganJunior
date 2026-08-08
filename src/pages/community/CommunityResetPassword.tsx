import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityErrorState, communityInputClass, communityPrimaryButtonClass, CommunitySurface } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { updatePassword } from '@/services/auth';

export default function CommunityResetPassword() {
  const navigate = useNavigate();
  const { t } = useCommunityUi();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try { await updatePassword(password); navigate('/community/enter', { replace: true }); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : t('密码更新失败。', 'Password update failed.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="community-page-frame">
      <CommunitySurface eyebrow="Account recovery" title={t('设置一个新密码。', 'Set a new password.')} description={t('请使用至少 8 位、仅自己知道的新密码。', 'Use a new password with at least 8 characters that only you know.')} width="narrow">
        <form onSubmit={submit} className="space-y-5">
          <label className="block space-y-2 text-sm font-semibold"><span>{t('新密码', 'New password')}</span><input className={communityInputClass} type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></label>
          {error ? <CommunityErrorState message={error} /> : null}
          <button className={communityPrimaryButtonClass} disabled={busy}>{busy ? t('正在保存…', 'Saving…') : t('保存新密码', 'Save new password')}</button>
        </form>
      </CommunitySurface>
    </div>
  );
}
