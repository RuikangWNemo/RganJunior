import { Check } from 'lucide-react';

import CommunityPasswordInput from '@/components/community/CommunityPasswordInput';
import { useCommunityUi } from '@/lib/communityUi';
import { COMMUNITY_PASSWORD_MIN_LENGTH } from '@/lib/passwordValidation';

export default function CommunityPasswordFields({
  idPrefix,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordLabel,
  disabled = false,
}: {
  idPrefix: string;
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  passwordLabel?: string;
  disabled?: boolean;
}) {
  const { t } = useCommunityUi();
  const hasConfirmation = confirmPassword.length > 0;
  const passwordsMatch = hasConfirmation && password === confirmPassword;
  const helpId = `${idPrefix}-password-help`;
  const matchId = `${idPrefix}-password-match`;
  const labelClass = 'block space-y-2 text-sm font-semibold text-[hsl(var(--community-forest))]';

  return (
    <div className="space-y-4">
      <div className={labelClass}>
        <label className="block" htmlFor={`${idPrefix}-password`}>{passwordLabel || t('新密码', 'New password')}</label>
        <CommunityPasswordInput
          id={`${idPrefix}-password`}
          minLength={COMMUNITY_PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="new-password"
          aria-describedby={helpId}
          disabled={disabled}
          required
        />
      </div>

      <div className={labelClass}>
        <label className="block" htmlFor={`${idPrefix}-password-confirmation`}>{t('确认新密码', 'Confirm new password')}</label>
        <CommunityPasswordInput
          id={`${idPrefix}-password-confirmation`}
          confirmation
          minLength={COMMUNITY_PASSWORD_MIN_LENGTH}
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          autoComplete="new-password"
          aria-describedby={`${helpId} ${matchId}`}
          aria-invalid={hasConfirmation && !passwordsMatch}
          disabled={disabled}
          required
        />
      </div>

      <div className="grid gap-2 text-xs" aria-live="polite">
        <p id={helpId} className={`flex items-center gap-2 ${password.length >= COMMUNITY_PASSWORD_MIN_LENGTH ? 'text-[hsl(var(--community-forest))]' : 'text-[hsl(var(--community-forest)/0.55)]'}`}>
          <span className={`grid size-4 place-items-center rounded-full border ${password.length >= COMMUNITY_PASSWORD_MIN_LENGTH ? 'border-[hsl(var(--community-forest))] bg-[hsl(var(--community-forest))] text-white' : 'border-[hsl(var(--community-forest)/0.25)]'}`} aria-hidden="true">
            {password.length >= COMMUNITY_PASSWORD_MIN_LENGTH ? <Check className="size-2.5" /> : null}
          </span>
          {t('至少 8 个字符', 'At least 8 characters')}
        </p>
        <p id={matchId} className={`flex items-center gap-2 ${passwordsMatch ? 'text-[hsl(var(--community-forest))]' : hasConfirmation ? 'text-destructive' : 'text-[hsl(var(--community-forest)/0.55)]'}`}>
          <span className={`grid size-4 place-items-center rounded-full border ${passwordsMatch ? 'border-[hsl(var(--community-forest))] bg-[hsl(var(--community-forest))] text-white' : hasConfirmation ? 'border-destructive' : 'border-[hsl(var(--community-forest)/0.25)]'}`} aria-hidden="true">
            {passwordsMatch ? <Check className="size-2.5" /> : null}
          </span>
          {hasConfirmation && !passwordsMatch
            ? t('两次输入的密码不一致', 'Passwords do not match')
            : t('两次输入的密码一致', 'Both passwords match')}
        </p>
      </div>
    </div>
  );
}
