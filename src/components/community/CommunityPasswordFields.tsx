import { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';

import { communityInputClass } from '@/components/community/CommunitySurface';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const hasConfirmation = confirmPassword.length > 0;
  const passwordsMatch = hasConfirmation && password === confirmPassword;
  const helpId = `${idPrefix}-password-help`;
  const matchId = `${idPrefix}-password-match`;
  const labelClass = 'block space-y-2 text-sm font-semibold text-[hsl(var(--community-forest))]';

  return (
    <div className="space-y-4">
      <div className={labelClass}>
        <label className="block" htmlFor={`${idPrefix}-password`}>{passwordLabel || t('新密码', 'New password')}</label>
        <span className="relative block">
          <input
            id={`${idPrefix}-password`}
            className={`${communityInputClass} pr-16`}
            type={showPassword ? 'text' : 'password'}
            minLength={COMMUNITY_PASSWORD_MIN_LENGTH}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete="new-password"
            aria-describedby={helpId}
            disabled={disabled}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[hsl(var(--community-forest)/0.58)] transition hover:text-[hsl(var(--community-forest))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--community-orange))]"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? t('隐藏密码', 'Hide password') : t('显示密码', 'Show password')}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </span>
      </div>

      <div className={labelClass}>
        <label className="block" htmlFor={`${idPrefix}-password-confirmation`}>{t('确认新密码', 'Confirm new password')}</label>
        <span className="relative block">
          <input
            id={`${idPrefix}-password-confirmation`}
            className={`${communityInputClass} pr-16`}
            type={showConfirmation ? 'text' : 'password'}
            minLength={COMMUNITY_PASSWORD_MIN_LENGTH}
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            autoComplete="new-password"
            aria-describedby={`${helpId} ${matchId}`}
            aria-invalid={hasConfirmation && !passwordsMatch}
            disabled={disabled}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[hsl(var(--community-forest)/0.58)] transition hover:text-[hsl(var(--community-forest))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--community-orange))]"
            onClick={() => setShowConfirmation((current) => !current)}
            aria-label={showConfirmation ? t('隐藏确认密码', 'Hide password confirmation') : t('显示确认密码', 'Show password confirmation')}
            aria-pressed={showConfirmation}
          >
            {showConfirmation ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </span>
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
