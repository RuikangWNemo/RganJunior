import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActionProgramOption } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

export default function ProgramOverviewEntry({
  program,
  index,
}: {
  program: ActionProgramOption;
  index: number;
}) {
  const { lang, t } = useLanguage();

  return (
    <section
      id={program.id}
      data-program-section={program.id}
      aria-labelledby={`${program.id}-title`}
      className={cn(
        'program-overview-entry scroll-mt-32 md:scroll-mt-36',
        `program-overview-entry--${index + 1}`,
      )}
    >
      <div className="programs-editorial-shell program-overview-entry__shell">
        <div className="program-overview-entry__copy">
          <p className="program-overview-entry__meta">{pickLocalized(program.meta, lang)}</p>
          <h2
            id={`${program.id}-title`}
            className="text-balance"
          >
            {pickLocalized(program.title, lang)}
          </h2>
          <p className="program-overview-entry__subtitle text-balance">
            {pickLocalized(program.subtitle, lang)}
          </p>
          <p className="program-overview-entry__summary text-pretty">
            {pickLocalized(program.summary, lang)}
          </p>
          <Link
            to={program.detailPath}
            aria-label={`${t('查看项目详情', 'View program details')}：${pickLocalized(program.title, lang)}`}
            className="program-overview-entry__link cursor-target"
          >
            {t('查看项目详情', 'View program details')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <figure className="program-overview-entry__image">
          <img
            src={program.image.src}
            alt={pickLocalized(program.image.alt, lang)}
            width={program.image.width}
            height={program.image.height}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
