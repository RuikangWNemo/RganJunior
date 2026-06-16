import { useLanguage } from '@/contexts/LanguageContext';
import { type ArchiveItem } from '@/content/archiveContent';
import { cn } from '@/lib/utils';
import { pickLocalized } from '@/lib/brand';

interface ArchiveFigureProps {
  item: ArchiveItem;
  className?: string;
  compact?: boolean;
  imageOnly?: boolean;
}

export default function ArchiveFigure({
  item,
  className,
  compact = false,
  imageOnly = false,
}: ArchiveFigureProps) {
  const { lang } = useLanguage();
  const title = pickLocalized(item.title, lang);
  const meta = item.meta ? pickLocalized(item.meta, lang) : undefined;
  const caption = item.caption ? pickLocalized(item.caption, lang) : undefined;
  const fit = item.fit ?? (item.kind === 'photo' ? 'cover' : 'contain');
  const isDocumentLike = item.kind !== 'photo';

  return (
    <figure className={cn('group', className)}>
      <div
        className={cn(
          'overflow-hidden rounded-[1.75rem] border border-border/80 shadow-sm transition-organic group-hover:shadow-md',
          isDocumentLike ? 'bg-secondary/35' : 'bg-card/70 paper-texture',
        )}
      >
        <div className={cn('relative', item.aspectClassName ?? 'aspect-[4/3]')}>
          <img
            src={item.src}
            alt={title}
            loading="lazy"
            className={cn(
              'h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.01]',
              fit === 'cover' ? 'object-cover' : 'object-contain p-4 md:p-5',
            )}
            style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}
          />
        </div>
      </div>

      {!imageOnly && (
        <figcaption className={cn('relative z-10 px-1', compact ? 'mt-3 space-y-1' : 'mt-4 space-y-1.5')}>
          {meta && (
            <p className="text-[11px] uppercase tracking-[0.24em] text-primary/70">
              {meta}
            </p>
          )}
          <p className={cn('font-serif text-foreground', compact ? 'text-base' : 'text-lg')}>
            {title}
          </p>
          {caption && (
            <p className={cn('leading-relaxed text-muted-foreground', compact ? 'text-sm' : 'text-sm md:text-[15px]')}>
              {caption}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
