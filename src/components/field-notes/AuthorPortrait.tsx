import OptimizedImage from '@/components/OptimizedImage';
import type { FieldNotePerson } from '@/types/field-notes';
import { cn } from '@/lib/utils';

export function AuthorPortrait({ person, className }: { person: FieldNotePerson; className?: string }) {
  const portraits = person.portraitGroup?.slice(0, 2);
  return (
    <span aria-hidden="true" className={cn('relative inline-flex size-[3.25rem] shrink-0 items-center', className)}>
      {portraits?.length ? portraits.map((src, index) => (
        <OptimizedImage key={src} src={src} alt="" loading="lazy" decoding="async"
          className={cn('absolute size-9 rounded-full border-2 border-background bg-secondary object-cover', index === 0 ? 'left-0 top-0' : 'bottom-0 right-0')} />
      )) : <OptimizedImage src={person.avatar} alt="" loading="lazy" decoding="async" className="size-full rounded-full bg-secondary object-cover" />}
    </span>
  );
}
