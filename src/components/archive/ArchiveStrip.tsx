import { type ArchiveSection } from '@/content/archiveContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import ArchiveFigure from './ArchiveFigure';

interface ArchiveStripProps {
  section: ArchiveSection;
}

export default function ArchiveStrip({ section }: ArchiveStripProps) {
  const { lang } = useLanguage();
  const title = pickLocalized(section.title, lang);
  const description = section.description ? pickLocalized(section.description, lang) : undefined;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-serif text-2xl text-foreground md:text-3xl">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
          )}
        </div>
      </div>

      <div
        className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none]"
        style={{ scrollbarWidth: 'none' }}
      >
        {section.items.map((archiveItem) => (
          <ArchiveFigure
            key={archiveItem.id}
            item={archiveItem}
            compact
            className="min-w-[280px] max-w-[320px] flex-none sm:min-w-[320px]"
          />
        ))}
      </div>
    </section>
  );
}
