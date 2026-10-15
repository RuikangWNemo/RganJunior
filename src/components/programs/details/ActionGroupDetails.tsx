import CoCreationDirections from '@/components/programs/CoCreationDirections';
import { actionGroupRhythm } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function ActionGroupDetails() {
  const { lang, t } = useLanguage();

  return (
    <div>
      <CoCreationDirections />
      <section aria-labelledby="action-rhythm-title" className="py-16 md:py-24">
        <div className="max-w-3xl">
          <h2 id="action-rhythm-title" className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {t('三个月，把相遇带回日常', 'Three months of bringing connection into daily life')}
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {t(
              '行动小组不是营地的附加活动，而是一段独立的持续实践。伙伴在稳定的相遇中提出问题、尝试行动，也学习回应彼此。',
              "The Action Group is an independent, ongoing practice, rather than an extra camp activity. Through regular meetings, participants raise questions, try out ideas, and learn to respond to one another.",
            )}
          </p>
        </div>

        <ol className="mt-12 border-t border-border">
          {actionGroupRhythm.map((phase) => (
            <li
              key={phase.period.zh}
              className="grid gap-3 border-b border-border py-8 sm:grid-cols-[9rem_minmax(0,0.65fr)_minmax(0,1.35fr)] sm:gap-8"
            >
              <p className="text-sm font-medium text-primary">{pickLocalized(phase.period, lang)}</p>
              <h3 className="font-serif text-2xl text-foreground">{pickLocalized(phase.title, lang)}</h3>
              <p className="text-sm leading-8 text-muted-foreground">{pickLocalized(phase.body, lang)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="action-practice-title" className="border-t border-border py-16 md:py-24">
        <h2 id="action-practice-title" className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          {t('行动如何发生', 'How the work happens')}
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          <article>
            <h3 className="font-serif text-2xl text-foreground">{t('持续共学', 'Sustained shared learning')}</h3>
            <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
              {t(
                '线上茶会、读书会、共学和主题分享提供稳定的交流空间。讨论从伙伴真实经历出发，不追求统一答案。',
                "Online tea gatherings, reading circles, shared learning, and themed discussions provide regular opportunities to talk. Discussions start with participants’ real experiences, without seeking one answer for everyone.",
              )}
            </p>
          </article>
          <article>
            <h3 className="font-serif text-2xl text-foreground">{t('生活实践', 'Practice in daily life')}</h3>
            <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
              {t(
                '七日挑战、低碳生活行动和家庭实践把讨论带回日常。阶段分享帮助伙伴整理经验，并找到下一次线下共创的问题。',
                "Seven-day challenges, low-carbon activities, and activities with family put discussions into practice in everyday life. At each stage, participants share and reflect on their experiences, identifying questions for the next in-person co-creation activity.",
              )}
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
