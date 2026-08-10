import { Check } from 'lucide-react';

import { useCommunityUi } from '@/lib/communityUi';

export type CommunityProcessStep = 'account' | 'profile' | 'application' | 'safety' | 'review';

export default function CommunityProcessSteps({ current, safetyRequired = true }: { current: CommunityProcessStep; safetyRequired?: boolean }) {
  const { t } = useCommunityUi();
  const steps = [
    { id: 'account' as const, label: t('账号', 'Account') },
    { id: 'profile' as const, label: t('资料', 'Profile') },
    { id: 'application' as const, label: t('申请', 'Apply') },
    ...(safetyRequired ? [{ id: 'safety' as const, label: t('安全确认', 'Safety') }] : []),
    { id: 'review' as const, label: t('审核', 'Review') },
  ];
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label={t('加入社群进度', 'Community joining progress')}>
      {steps.map((step, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} className={`flex min-w-max flex-1 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${active ? 'border-[hsl(var(--community-orange)/0.35)] bg-[hsl(var(--community-orange)/0.1)] text-[hsl(var(--community-orange))]' : complete ? 'border-[hsl(var(--community-forest)/0.15)] bg-[hsl(var(--community-forest)/0.07)] text-[hsl(var(--community-forest))]' : 'border-[hsl(var(--community-forest)/0.09)] text-[hsl(var(--community-forest)/0.42)]'}`} aria-current={active ? 'step' : undefined}>
            <span className={`grid size-5 place-items-center rounded-full text-[0.62rem] ${active ? 'bg-[hsl(var(--community-orange))] text-white' : complete ? 'bg-[hsl(var(--community-forest))] text-white' : 'bg-[hsl(var(--community-forest)/0.08)]'}`}>{complete ? <Check className="size-3" /> : index + 1}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
