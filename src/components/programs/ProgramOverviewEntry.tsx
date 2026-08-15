import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActionProgramOption } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

const chineseProgramTitleLines: Record<ActionProgramOption['id'], readonly [string, string]> = {
  'life-experience-camp': ['阿柑少年', '生活体验营'],
  'life-co-creation-camp': ['阿柑少年', '生活共创营'],
  'action-group': ['阿柑少年', '行动小组'],
  'public-projects': ['青少年', '研究计划'],
};

export default function ProgramOverviewEntry({
  program,
  index,
}: {
  program: ActionProgramOption;
  index: number;
}) {
  const { lang, t } = useLanguage();
  const localizedTitle = pickLocalized(program.title, lang);

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
            aria-label={localizedTitle}
          >
            {lang === 'zh' ? (
              <span aria-hidden="true">
                {chineseProgramTitleLines[program.id].map((line) => (
                  <span key={line} className="programs-editorial-title-line">{line}</span>
                ))}
              </span>
            ) : localizedTitle}
          </h2>
          <p className="program-overview-entry__subtitle text-balance">
            {pickLocalized(program.subtitle, lang)}
          </p>
          <p className="program-overview-entry__summary text-pretty">
            {pickLocalized(program.summary, lang)}
          </p>
          <Link
            to={program.detailPath}
            aria-label={`${t('查看项目详情', 'View program details')}：${localizedTitle}`}
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
