import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActionProgramOption } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import ProgramActions from './ProgramActions';
import ProgramFaq from './ProgramFaq';
import ProgramFaqSchema from './ProgramFaqSchema';

interface ProgramDetailLayoutProps {
  program: ActionProgramOption;
  children: ReactNode;
}

export default function ProgramDetailLayout({ program, children }: ProgramDetailLayoutProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="programs-editorial program-detail-page pt-20">
      <ProgramFaqSchema program={program} />

      <header className="program-detail-hero">
        <div className="programs-editorial-shell">
          <Link
            to={program.path}
            className="program-detail-back cursor-target"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('返回项目总览', 'Back to programs')}
          </Link>

          <div className="program-detail-hero__grid">
            <div className="program-detail-hero__copy">
              <p>{pickLocalized(program.meta, lang)}</p>
              <h1 className="text-balance">
                {pickLocalized(program.title, lang)}
              </h1>
              <p className="text-balance">
                {pickLocalized(program.subtitle, lang)}
              </p>
              <p className="text-pretty">
                {pickLocalized(program.summary, lang)}
              </p>
            </div>

            <figure className="program-detail-hero__image">
              <img
                src={program.image.src}
                alt={pickLocalized(program.image.alt, lang)}
                width={program.image.width}
                height={program.image.height}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </header>

      <main className="programs-editorial-shell program-detail-main">
        {children}
        <ProgramFaq program={program} />

        <section aria-labelledby="program-contact-title" className="program-detail-cta">
          <div>
            <p>{t('下一步', 'Next step')}</p>
            <h2 id="program-contact-title" className="text-balance">
              {t('进一步了解这个项目', 'Learn more about this program')}
            </h2>
            <p className="text-pretty">
              {t(
                '可以直接询问档期、内容和参与方式，也可以先留下参与意向，方便团队继续沟通。',
                'Ask directly about timing, content, and participation, or register your interest so the team can continue the conversation.',
              )}
            </p>
            <ProgramActions program={program} />
          </div>
        </section>
      </main>
    </div>
  );
}
