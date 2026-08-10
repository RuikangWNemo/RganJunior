import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import CommunityPasswordFields from '@/components/community/CommunityPasswordFields';
import { CommunityErrorState, communityPrimaryButtonClass, CommunitySurface } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { isValidNewPassword } from '@/lib/passwordValidation';
import { updatePassword } from '@/services/auth';

export default function CommunityResetPassword() {
  const navigate = useNavigate();
  const { t } = useCommunityUi();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!isValidNewPassword(password, confirmPassword)) {
      setError(password.length < 8
        ? t('密码至少需要 8 个字符。', 'Password must be at least 8 characters.')
        : t('两次输入的密码不一致。', 'Passwords do not match.'));
      return;
    }
    setBusy(true);
    try { await updatePassword(password); navigate('/community/enter', { replace: true }); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : t('密码更新失败。', 'Password update failed.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="community-page-frame">
      <CommunitySurface eyebrow="Account recovery" title={t('设置一个新密码。', 'Set a new password.')} description={t('请使用至少 8 位、仅自己知道的新密码。', 'Use a new password with at least 8 characters that only you know.')} width="narrow">
        <form onSubmit={submit} className="space-y-5">
          <CommunityPasswordFields
            idPrefix="community-reset"
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            disabled={busy}
          />
          {error ? <CommunityErrorState message={error} /> : null}
          <button className={communityPrimaryButtonClass} disabled={busy || !isValidNewPassword(password, confirmPassword)}>{busy ? t('正在保存…', 'Saving…') : t('保存新密码', 'Save new password')}</button>
        </form>
      </CommunitySurface>
    </div>
  );
}
