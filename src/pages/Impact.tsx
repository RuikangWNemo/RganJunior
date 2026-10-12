import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImpactReveal } from '@/components/impact/ImpactReveal';
import { RelationshipMap } from '@/components/impact/RelationshipMap';
import { ImpactSectionNav } from '@/components/impact/ImpactSectionNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { localImpactRepository } from '@/services/impact/publicRepository';

function ImpactLoading() {
  return (
    <div className="animate-pulse pt-20" aria-label="Impact loading">
      <div className="container mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div className="h-4 w-32 rounded bg-secondary" />
          <div className="h-24 w-4/5 rounded bg-secondary" />
          <div className="h-24 w-full rounded bg-secondary" />
        </div>
        <div className="aspect-[4/3] rounded-2xl bg-secondary" />
      </div>
    </div>
  );
}

function RecordChapterHeading({
  number,
  label,
  title,
  description,
  id,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <ImpactReveal>
      <div className="border-t border-primary/25 pt-5">
        <div className="flex items-baseline gap-4 text-sm font-medium text-primary/70">
          <span className="tabular-nums" aria-hidden="true">{number}</span>
          <p>{label}</p>
        </div>
        <h2 id={id} className="mt-6 text-balance font-serif text-4xl leading-[1.12] text-[#ea6a2a] md:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
          {description}
        </p>
      </div>
    </ImpactReveal>
  );
}

export default function Impact() {
  const { lang, t } = useLanguage();
  const impactQuery = useQuery({
    queryKey: ['impact', 'public'],
    queryFn: () => localImpactRepository.getPublicSnapshot(),
  });

  if (impactQuery.isPending) return <ImpactLoading />;

  if (impactQuery.isError || !impactQuery.data) {
    return (
      <div className="container mx-auto flex min-h-[70dvh] max-w-3xl items-center px-4 pt-20 sm:px-6 lg:px-8">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h1 className="font-serif text-4xl text-foreground">
            {t('暂时无法读取影响记录', 'Impact records are temporarily unavailable')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-muted-foreground">
            {t('请稍后重试。页面不会用示例数字替代缺失数据。', 'Please try again later. Missing data will not be replaced with sample numbers.')}
          </p>
          <button
            type="button"
            onClick={() => void impactQuery.refetch()}
            className="mt-7 min-h-11 rounded-lg bg-primary px-5 py-3 text-lg font-medium text-primary-foreground transition hover:bg-primary/90 active:translate-y-px"
          >
            {t('重新读取', 'Try again')}
          </button>
        </div>
      </div>
    );
  }

  const snapshot = impactQuery.data;
  const youthTrack = snapshot.growthTracks.find((track) => track.id === 'youth');
  const parentTrack = snapshot.growthTracks.find((track) => track.id === 'parents');
  const continuingActionTypes = [
    t('低碳生活实验', 'Low-carbon living experiments'),
    t('家庭早餐', 'Family breakfasts'),
    t('自然观察', 'Nature observation'),
    t('线上茶会', 'Online tea gatherings'),
    t('社群打卡', 'Community check-ins'),
    t('三个月行动计划', 'Three-month action plans'),
  ];
  const externalRecordTypes = [
    t('CTB 经历', 'CTB experience'),
    t('论坛与公开分享', 'Forums and public sharing'),
    t('媒体与合作伙伴反馈', 'Media and partner feedback'),
    t('研究写作、Policy Brief 与公共议题表达', 'Research writing, policy briefs, and public-issue communication'),
    t('少年自己的生活记录与个人专栏', 'Youth-authored life records and personal columns'),
  ];

  return (
    <div className="impact-page overflow-hidden pt-20">
      <header className="border-b border-border/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/75 py-3">
            <ImpactSectionNav />
            <p className="text-sm leading-5 text-muted-foreground">
              {t(`资料核验日期：${snapshot.verifiedAt}`, `Records verified: ${snapshot.verifiedAt}`)}
            </p>
          </div>

          <div className="grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,1.1fr)] lg:items-center lg:gap-16 lg:py-24">
            <ImpactReveal>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary/70">
                {t('Impact & Records / 影响与记录', 'Impact & Records / 影响与记录')}
              </p>
              <h1
                aria-label={t('看见真实成长如何发生', 'See how real growth happens')}
                className="mt-6 text-balance font-serif text-5xl leading-[1.08] tracking-[-0.035em] text-[#ea6a2a] sm:text-6xl lg:text-7xl"
              >
                {lang === 'zh' ? (
                  <span aria-hidden="true">
                    <span className="block whitespace-nowrap">看见真实成长</span>
                    <span className="block whitespace-nowrap">如何发生</span>
                  </span>
                ) : 'See how real growth happens'}
              </h1>
              <p className="mt-7 max-w-[34rem] text-base leading-8 text-foreground/75 md:text-lg md:leading-9">
                {t(
                  '阿柑少年的影响，不只在活动照片里，也在孩子和家庭之后愿意继续做什么里。',
                  'R-Gan Junior’s impact lives not only in activity photos, but in what young people and families choose to keep doing afterward.',
                )}
              </p>
              <p className="mt-4 max-w-[36rem] text-base leading-8 text-muted-foreground">
                {t(
                  '我们用数据、故事、家长观察和持续行动，记录青少年如何走进自然、生活、社区和真实问题。',
                  'Through data, stories, family observation, and continued action, we record how young people enter nature, daily life, community, and real questions.',
                )}
              </p>
            </ImpactReveal>

            <ImpactReveal delay={0.08}>
              <figure>
                <div className="overflow-hidden rounded-2xl bg-secondary/45">
                  <img
                    src="/archive/elements/photos/program-activities/s20-regenerative-design-eco-camp-group.jpg"
                    alt={t('再生设计国际生态营参与者在山林场域合影', 'Participants in the regenerative design eco camp gathering in a mountain setting')}
                    width="1920"
                    height="1280"
                    loading="eager"
                    className="aspect-[16/11] h-full w-full object-cover object-center"
                  />
                </div>
                <figcaption className="mt-3 text-sm leading-5 text-muted-foreground">
                  {t('再生设计国际生态营，2024 年 5 月', 'Regenerative Design Eco Camp, May 2024')}
                </figcaption>
              </figure>
            </ImpactReveal>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-primary/[0.035] py-20 md:py-28" aria-labelledby="impact-values-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1.58fr)] lg:gap-16">
              <ImpactReveal>
                <p className="border-t border-primary/25 pt-5 text-sm font-medium text-primary/70">
                  {t('价值 / 概念', 'Value / idea')}
                </p>
              </ImpactReveal>
              <ImpactReveal delay={0.05}>
                <blockquote>
                  <h2
                    id="impact-values-title"
                    aria-label={t('一个孩子的成长，需要一个村庄的托举', 'A child needs a village to help them grow')}
                    className="max-w-4xl text-balance font-serif text-4xl leading-[1.16] text-[#ea6a2a] md:text-[3.375rem]"
                  >
                    {lang === 'zh' ? (
                      <span aria-hidden="true">
                        <span className="block">“一个孩子的成长，</span>
                        <span className="block">需要一个村庄的托举。”</span>
                      </span>
                    ) : '“A child needs a village to help them grow.”'}
                  </h2>
                  <p className="mt-7 max-w-3xl text-lg leading-9 text-muted-foreground">
                    {t(
                      '我们把影响理解为关系的变化：少年与家庭、伙伴、土地和公共生活开始形成新的连接。',
                      'We understand impact as a change in relationships: young people begin forming new connections with family, peers, land, and public life.',
                    )}
                  </p>
                </blockquote>
              </ImpactReveal>
            </div>

            <div className="mt-16 md:mt-20">
              <RelationshipMap relationships={snapshot.relationships} />
            </div>
          </div>
        </section>

        <section className="border-y border-border/80 py-20 md:py-28" aria-labelledby="impact-records-title">
          <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1.58fr)] lg:gap-16 lg:px-8">
            <ImpactReveal>
              <p className="border-t border-primary/25 pt-5 text-sm font-medium text-primary/70">
                {t('Records / 记录', 'Records / 记录')}
              </p>
            </ImpactReveal>
            <ImpactReveal delay={0.05}>
              <h2 id="impact-records-title" className="text-balance font-serif text-4xl leading-[1.12] text-[#ea6a2a] md:text-5xl">
                {t('我们记录什么', 'What we record')}
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-9 text-muted-foreground">
                {t(
                  '我们既记录真实发生过什么，也记录一次活动结束后，关系、选择和行动如何继续。',
                  'We record what truly happened, and how relationships, choices, and actions continue after an activity ends.',
                )}
              </p>
            </ImpactReveal>
          </div>
        </section>

        <section className="border-b border-border/80 py-20 md:py-28" aria-labelledby="project-data-title">
          <div className="container mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(17rem,0.64fr)_minmax(0,1.36fr)] lg:gap-20 lg:px-8">
            <RecordChapterHeading
              number="01"
              label={t('我们记录什么', 'What we record')}
              title={t('项目数据', 'Program data')}
              description={t(
                '记录阿柑少年真实发生过什么。当前只呈现已有项目资料能够支持、来源清楚的数据。',
                'A record of what has actually happened at R-Gan Junior. We currently show only figures supported by clear project sources.',
              )}
              id="project-data-title"
            />

            <div>
              <ImpactReveal>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                  {t(
                    '活动总数、独立参与青少年、独立家庭数、覆盖城市和持续参与伙伴，将在形成统一统计口径后接入；缺失数据不会用示例数字替代。',
                    'Activity totals, unique youth and families, cities reached, and continuing partners will be added once consistent definitions exist; missing figures are never replaced with sample numbers.',
                  )}
                </p>
              </ImpactReveal>
              <div className="mt-10 grid border-t border-border/80 sm:grid-cols-2">
                {snapshot.metrics.map((metric, index) => (
                  <ImpactReveal
                    key={metric.id}
                    delay={(index % 2) * 0.04}
                    className={`border-b border-border/80 py-8 sm:px-7 ${index % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'}`}
                  >
                    <article>
                      <p className="text-5xl tracking-[-0.04em] text-primary tabular-nums md:text-[3.375rem]">
                        {metric.value}
                      </p>
                      <h3 className="mt-4 text-lg font-medium leading-6 text-foreground">
                        {pickLocalized(metric.label, lang)}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        {pickLocalized(metric.detail, lang)}
                      </p>
                      <p className="mt-5 text-xs leading-5 text-primary/70">
                        {metric.observedAt} · {pickLocalized(metric.sourceLabel, lang)}
                      </p>
                    </article>
                  </ImpactReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/80 py-20 md:py-28" aria-labelledby="growth-stories-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.64fr)_minmax(0,1.36fr)] lg:gap-20">
              <RecordChapterHeading
                number="02"
                label={t('个体成长记录', 'Individual growth records')}
                title={t('成长故事', 'Growth stories')}
                description={pickLocalized(youthTrack?.intro ?? { zh: '', en: '' }, lang)}
                id="growth-stories-title"
              />

              <ImpactReveal delay={0.05}>
                <figure>
                  <div className="overflow-hidden rounded-2xl bg-secondary/45">
                    <img
                      src="/archive/elements/photos/program-activities/s11-hands-on-making-workshop.jpg"
                      alt={t('少年与伙伴在活动现场共同完成动手任务', 'Young people completing a hands-on task together during a program')}
                      width="1280"
                      height="853"
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm leading-5 text-muted-foreground">
                    {t('共同任务中的观察与协作记录', 'A record of observation and collaboration during a shared task')}
                  </figcaption>
                </figure>
              </ImpactReveal>
            </div>

            {youthTrack ? (
              <ol className="mt-12 grid border-y border-border/80 sm:grid-cols-2 lg:ml-[calc(36%+2rem)] lg:mt-16 lg:grid-cols-5">
                {youthTrack.observationFields.map((field, index) => (
                  <li
                    key={field.zh}
                    className="border-b border-border/80 px-0 py-6 last:border-b-0 sm:px-5 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                  >
                    <span className="text-xs text-primary/60 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                    <p className="mt-3 text-base leading-7 text-foreground/80">
                      {pickLocalized(field, lang)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </section>

        <section className="border-b border-border/80 bg-primary/[0.035] py-20 md:py-28" aria-labelledby="family-observation-title">
          <div className="container mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(17rem,0.64fr)_minmax(0,1.36fr)] lg:gap-20 lg:px-8">
            <RecordChapterHeading
              number="03"
              label={t('家庭视角', 'Family perspective')}
              title={t('家庭观察', 'Family observation')}
              description={pickLocalized(parentTrack?.intro ?? { zh: '', en: '' }, lang)}
              id="family-observation-title"
            />

            {parentTrack ? (
              <ImpactReveal delay={0.05}>
                <ol className="border-t border-primary/20">
                  {parentTrack.observationFields.map((field, index) => (
                    <li key={field.zh} className="grid gap-3 border-b border-primary/20 py-7 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start">
                      <span className="text-sm text-primary/60 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      <p className="max-w-3xl text-xl leading-9 text-foreground/85 md:text-2xl md:leading-10">
                        {pickLocalized(field, lang)}
                      </p>
                    </li>
                  ))}
                </ol>
              </ImpactReveal>
            ) : null}
          </div>
        </section>

        <section className="border-b border-border/80 py-20 md:py-28" aria-labelledby="continuing-actions-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.64fr)_minmax(0,1.36fr)] lg:gap-20">
              <RecordChapterHeading
                number="04"
                label={t('营地之后', 'After the program')}
                title={t('持续行动', 'Continued action')}
                description={t(
                  '记录营地之后继续发生的小行动：从日常生活实验，到伙伴之间持续三个月的实践与复盘。',
                  'We record the small actions that continue afterward, from daily-life experiments to three months of peer practice and reflection.',
                )}
                id="continuing-actions-title"
              />

              <ImpactReveal delay={0.05}>
                <ul className="grid border-t border-border/80 sm:grid-cols-2">
                  {continuingActionTypes.map((item, index) => (
                    <li
                      key={item}
                      className={`flex min-h-20 items-center gap-4 border-b border-border/80 py-5 sm:px-6 ${index % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'}`}
                    >
                      <span className="text-xs text-primary/55 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-lg text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </ImpactReveal>
            </div>

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
              {snapshot.actions.map((action, index) => (
                <ImpactReveal key={action.id} delay={(index % 4) * 0.04}>
                  <figure>
                    <div className="overflow-hidden rounded-2xl bg-secondary/45">
                      <img
                        src={action.image}
                        alt={pickLocalized(action.imageAlt, lang)}
                        width="1280"
                        height="853"
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.02] motion-reduce:transition-none"
                      />
                    </div>
                    <figcaption className="mt-4">
                      <h3 className="text-xl leading-7 text-foreground">{pickLocalized(action.title, lang)}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{pickLocalized(action.description, lang)}</p>
                      <p className="mt-3 text-xs leading-5 text-primary/65">{pickLocalized(action.dateLabel, lang)}</p>
                    </figcaption>
                  </figure>
                </ImpactReveal>
              ))}
            </div>

            <ImpactReveal className="mt-16 md:mt-20">
              <div className="grid gap-8 border-t border-border/80 pt-8 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] lg:gap-16">
                <div>
                  <p className="text-sm font-medium text-primary/65">{t('三个月行动节奏', 'Three-month action rhythm')}</p>
                  <h3 className="mt-4 text-balance font-serif text-3xl leading-tight text-[#ea6a2a] md:text-4xl">
                    {t('让一次相遇继续发生', 'Let one encounter continue')}
                  </h3>
                </div>
                <ol className="border-t border-border/80 lg:border-t-0">
                  {snapshot.rhythm.map((item, index) => (
                    <li key={item.id} className="grid gap-3 border-b border-border/80 py-6 sm:grid-cols-[3rem_minmax(9rem,0.55fr)_minmax(0,1.45fr)] sm:gap-6">
                      <span className="text-xs text-primary/55 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      <h4 className="text-lg leading-7 text-foreground">{pickLocalized(item.title, lang)}</h4>
                      <p className="text-sm leading-7 text-muted-foreground">{pickLocalized(item.description, lang)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </ImpactReveal>
          </div>
        </section>

        <section className="border-b border-border/80 py-20 md:py-28" aria-labelledby="public-records-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.64fr)_minmax(0,1.36fr)] lg:gap-20">
              <RecordChapterHeading
                number="05"
                label={t('走向公共表达', 'Moving into public expression')}
                title={t('外部记录', 'Public records')}
                description={t(
                  '记录阿柑少年如何把现场观察整理成研究、表达和可以被公共讨论的成果。',
                  'We record how R-Gan Junior turns field observation into research, communication, and work that can enter public discussion.',
                )}
                id="public-records-title"
              />

              <ImpactReveal delay={0.05}>
                <ul className="border-t border-border/80">
                  {externalRecordTypes.map((item, index) => (
                    <li key={item} className="grid gap-3 border-b border-border/80 py-5 sm:grid-cols-[3rem_minmax(0,1fr)]">
                      <span className="text-xs text-primary/55 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-base leading-7 text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </ImpactReveal>
            </div>

            <div className="mt-14 border-t border-border/80 lg:ml-[calc(36%+2rem)] lg:mt-20">
              {snapshot.evidence.map((evidence, index) => (
                <ImpactReveal key={evidence.id} delay={(index % 3) * 0.04}>
                  <article className="grid gap-4 border-b border-border/80 py-7 sm:grid-cols-[7rem_minmax(12rem,0.65fr)_minmax(0,1.35fr)] sm:items-start sm:gap-6">
                    <p className="text-sm text-primary/65 tabular-nums">{evidence.date}</p>
                    <div>
                      <p className="text-xs font-medium text-primary/55">{pickLocalized(evidence.categoryLabel, lang)}</p>
                      <h3 className="mt-2 text-xl leading-7 text-foreground">{pickLocalized(evidence.title, lang)}</h3>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{pickLocalized(evidence.summary, lang)}</p>
                  </article>
                </ImpactReveal>
              ))}
            </div>

            <ImpactReveal className="mt-10 flex justify-start lg:ml-[calc(36%+2rem)]">
              <Link
                to="/impact/awards"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 active:translate-y-px"
              >
                {t('查看外部记录与获奖情况', 'View public records and recognition')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </ImpactReveal>
          </div>
        </section>

        <section className="bg-primary py-20 text-primary-foreground md:py-24" aria-labelledby="recording-principles-title">
          <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(10rem,0.42fr)_minmax(0,1.58fr)] lg:gap-16 lg:px-8">
            <ImpactReveal>
              <p className="border-t border-primary-foreground/30 pt-5 text-sm font-medium text-primary-foreground/70">
                {t('记录原则', 'Recording principles')}
              </p>
            </ImpactReveal>
            <ImpactReveal delay={0.05}>
              <h2 id="recording-principles-title" className="text-balance font-serif text-4xl leading-[1.12] md:text-5xl">
                {t('我们如何记录', 'How we record')}
              </h2>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-primary-foreground/90 md:text-2xl md:leading-10">
                {t(
                  '真实的影响，在一次次生活、连接、行动和记录中慢慢长出来。',
                  'Real impact grows slowly through repeated moments of life, connection, action, and documentation.',
                )}
              </p>
              <p className="mt-10 max-w-3xl border-t border-primary-foreground/25 pt-6 text-sm leading-7 text-primary-foreground/70">
                {t(
                  '所有照片、原话和成长故事，都会在获得本人和家庭许可后使用。',
                  'All photographs, first-person words, and growth stories are used only with permission from the individual and their family.',
                )}
              </p>
            </ImpactReveal>
          </div>
        </section>
      </main>
    </div>
  );
}
