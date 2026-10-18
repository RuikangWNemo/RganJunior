import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { useCommunityUi } from '@/lib/communityUi';
import { cn } from '@/lib/utils';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  confirmation?: boolean;
};

export default function CommunityPasswordInput({ className, disabled, confirmation = false, ...props }: Props) {
  const { t } = useCommunityUi();
  const [visible, setVisible] = useState(false);
  const showLabel = confirmation ? t('显示确认密码', 'Show password confirmation') : t('显示密码', 'Show password');
  const hideLabel = confirmation ? t('隐藏确认密码', 'Hide password confirmation') : t('隐藏密码', 'Hide password');

  return (
    <span className="relative block">
      <input
        {...props}
        className={cn('community-field community-password-input h-12 w-full px-4 text-base', className, 'pr-14')}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="none"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[hsl(var(--community-forest)/0.58)] hover:text-[hsl(var(--community-forest))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--community-orange))] disabled:opacity-50"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        aria-controls={props.id}
        disabled={disabled}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </span>
  );
}
