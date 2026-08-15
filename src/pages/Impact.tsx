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
          <div className="h-4 w-24 rounded bg-secondary" />
          <div className="h-20 w-4/5 rounded bg-secondary" />
          <div className="h-24 w-full rounded bg-secondary" />
        </div>
        <div className="aspect-[4/3] rounded-2xl bg-secondary" />
      </div>
    </div>
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
          <h1 className="font-serif text-4xl text-foreground">{t('暂时无法读取影响记录', 'Impact records are temporarily unavailable')}</h1>
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

          <div className="grid gap-10 py-14 sm:py-16 md:py-20 lg:grid-cols-[minmax(0,0.82fr)_minmax(26rem,1.18fr)] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="text-lg tracking-[0.18em] text-primary/75">{t('IMPACT / 影响', 'IMPACT / 影响')}</p>
              <h1
                aria-label={t('影响，发生在关系里', 'Impact grows through relationships')}
                className="mt-5 max-w-[9ch] text-balance font-serif text-[3.375rem] leading-[1.08] tracking-[-0.035em] text-[#ea6a2a]"
              >
                {lang === 'zh' ? (
                  <span aria-hidden="true">
                    <span className="block">影响，</span>
                    <span className="block whitespace-nowrap">发生在关系里</span>
                  </span>
                ) : 'Impact grows through relationships'}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-foreground/72 md:text-lg md:leading-9">
                {t(
                  '记录少年如何从一次相遇走向持续行动，也记录家庭、伙伴与真实世界怎样彼此回应。',
                  'We record how one encounter becomes continued action, and how families, peers, and the real world respond to one another.',
                )}
              </p>
            </div>

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
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border/80 py-16 md:py-24" aria-labelledby="impact-evidence-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImpactReveal className="max-w-3xl">
              <h2 id="impact-evidence-title" className="text-balance font-serif text-4xl leading-tight text-[#ea6a2a]">
                {t('先呈现可以核验的数字', 'Begin with numbers that can be verified')}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {t(
                  '当前只展示已有项目记录支持的数据。活动总数、独立家庭数、年龄分布和城市来源将在数据库形成统一口径后接入。',
                  'Only source-backed project data is shown now. Activity totals, unique families, age distribution, and cities will be connected after the database establishes consistent definitions.',
                )}
              </p>
            </ImpactReveal>

            <div className="mt-12 grid border-y border-border/80 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {snapshot.metrics.map((metric, index) => (
                <ImpactReveal key={metric.id} delay={index * 0.04} className="h-full">
                  <article className="h-full border-border px-0 py-8 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-r lg:px-7 lg:[&:last-child]:border-r-0">
                    <p className="font-serif text-5xl tracking-[-0.04em] text-primary md:text-[3.375rem]">{metric.value}</p>
                    <h3 className="mt-4 text-lg font-medium leading-6 text-foreground">
                      {pickLocalized(metric.label, lang)}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {pickLocalized(metric.detail, lang)}
                    </p>
                    <p className="mt-5 text-xs leading-5 text-primary/70">
                      {metric.observedAt} {pickLocalized(metric.sourceLabel, lang)}
                    </p>
                  </article>
                </ImpactReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary/[0.035] py-20 md:py-28" aria-labelledby="impact-relationships-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImpactReveal className="mx-auto max-w-3xl text-center">
              <h2
                id="impact-relationships-title"
                aria-label={t('一个孩子的成长，需要一整个村庄的托举', 'A child needs a whole village to grow')}
                className="text-balance font-serif text-4xl leading-tight text-[#ea6a2a] md:text-[3.375rem]"
              >
                {lang === 'zh' ? (
                  <span aria-hidden="true">
                    <span className="block">一个孩子的成长，</span>
                    <span className="block">需要一整个村庄的托举</span>
                  </span>
                ) : 'A child needs a whole village to grow'}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {t(
                  '我们把影响理解为关系的变化：少年与家庭、伙伴、土地和公共生活开始形成新的连接。',
                  'We understand impact as change in relationships, connecting young people with family, peers, land, and public life.',
                )}
              </p>
            </ImpactReveal>
            <div className="mt-14 md:mt-20">
              <RelationshipMap relationships={snapshot.relationships} />
            </div>
          </div>
        </section>

        <section className="border-y border-border/80 py-20 md:py-28" aria-labelledby="growth-records-title">
          <div className="container mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1.35fr)] lg:gap-20 lg:px-8">
            <ImpactReveal>
              <div className="lg:sticky lg:top-28">
                <h2
                  id="growth-records-title"
                  aria-label={t('把变化放回时间里', 'Put change back into time')}
                  className="text-balance font-serif text-4xl leading-tight text-[#ea6a2a] md:text-5xl"
                >
                  {lang === 'zh' ? (
                    <span aria-hidden="true">
                      <span className="block">把变化</span>
                      <span className="block">放回时间里</span>
                    </span>
                  ) : 'Put change back into time'}
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  {t(
                    '未来的成长记录将围绕真实参与时间展开。加入前后的照片、本人表达和家长反馈，只在明确授权后公开。',
                    'Future growth records will follow real participation over time. Before-and-after photos, first-person reflection, and parent feedback will appear only with clear consent.',
                  )}
                </p>
                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/[0.045] p-5 text-sm leading-6 text-primary/80">
                  {t(
                    '当前状态：页面结构已就绪，等待社群身份、成长记录与公开授权数据接入。',
                    'Current status: the page structure is ready for community identity, growth records, and public-consent data.',
                  )}
                </div>
              </div>
            </ImpactReveal>

            <div className="space-y-5">
              {snapshot.growthTracks.map((track, index) => (
                <ImpactReveal key={track.id} delay={index * 0.06}>
                  <article className="rounded-2xl border border-border bg-card/70 p-6 md:p-8">
                    <div className="grid gap-7 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:items-start">
                      <div>
                        <p className="text-lg text-primary/70">
                          {track.id === 'youth' ? t('青少年记录', 'Youth growth record') : t('家庭观察记录', 'Family observation record')}
                        </p>
                        <h3 className="mt-3 font-serif text-4xl text-[#ea6a2a]">
                          {pickLocalized(track.title, lang)}
                        </h3>
                      </div>
                      <div>
                        <p className="text-lg leading-8 text-muted-foreground">
                          {pickLocalized(track.intro, lang)}
                        </p>
                        <ul className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={pickLocalized(track.title, lang)}>
                          {track.observationFields.map((field) => (
                            <li key={field.zh} className="rounded-xl bg-secondary/55 px-4 py-4 text-sm leading-6 text-foreground/78">
                              {pickLocalized(field, lang)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </ImpactReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28" aria-labelledby="impact-actions-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImpactReveal className="max-w-none">
              <h2 id="impact-actions-title" className="text-balance font-serif text-4xl leading-tight text-[#ea6a2a] md:text-5xl">
                {t('孩子带走的，是可以继续的小行动', 'Young people take home actions they can continue')}
              </h2>
              <p className="mt-5 max-w-none text-lg leading-8 text-muted-foreground md:whitespace-nowrap">
                {t(
                  '以下行动均来自已有现场资料。它们不是完整统计，而是数据库接入前可以核验的行动类型。',
                  'Each action below comes from existing field material. They are verified action types, not a complete statistical total.',
                )}
              </p>
            </ImpactReveal>

            <div className="mt-12 grid gap-x-6 gap-y-10 md:mt-16 md:grid-cols-12">
              {snapshot.actions.map((action, index) => {
                const layoutClass = index === 0
                  ? 'md:col-span-7'
                  : index === 1
                    ? 'md:col-span-5 md:pt-16'
                    : index === 2
                      ? 'md:col-span-5'
                      : 'md:col-span-7 md:pt-10';
                return (
                  <ImpactReveal key={action.id} delay={(index % 2) * 0.05} className={layoutClass}>
                    <figure>
                      <div className="overflow-hidden rounded-2xl bg-secondary/45">
                        <img
                          src={action.image}
                          alt={pickLocalized(action.imageAlt, lang)}
                          width="1280"
                          height="853"
                          loading="lazy"
                          className={`w-full object-cover transition duration-700 hover:scale-[1.02] motion-reduce:transition-none ${index % 2 === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
                        />
                      </div>
                      <figcaption className="mt-5">
                        <h3 className="font-serif text-2xl text-foreground md:text-4xl">{pickLocalized(action.title, lang)}</h3>
                        <p className="mt-3 max-w-xl text-lg leading-7 text-muted-foreground">{pickLocalized(action.description, lang)}</p>
                        <p className="mt-3 text-sm text-primary/65">{pickLocalized(action.dateLabel, lang)}</p>
                      </figcaption>
                    </figure>
                  </ImpactReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border/80 bg-card/35 py-20 md:py-28" aria-labelledby="three-month-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ImpactReveal className="max-w-3xl">
              <h2 id="three-month-title" className="text-balance font-serif text-4xl leading-tight text-[#ea6a2a] md:text-5xl">
                {t('三个月，让一次相遇继续发生', 'Three months let one encounter continue')}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {t(
                  '这是行动小组已经确定的持续机制。具体日期和参与数据将在每个周期确认后接入。',
                  'This is the established rhythm of the Action Group. Dates and participation data will be connected after each cycle is confirmed.',
                )}
              </p>
            </ImpactReveal>

            <div className="relative mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-10">
              <div className="absolute left-0 right-0 top-3 hidden h-px bg-primary/25 md:block" aria-hidden="true" />
              {snapshot.rhythm.map((item, index) => (
                <ImpactReveal key={item.id} delay={index * 0.06} className={index === 1 ? 'md:pt-10' : index === 2 ? 'md:pt-20' : ''}>
                  <article className="relative rounded-2xl border border-border bg-background p-6 md:min-h-60 md:p-7">
                    <span className="absolute left-6 top-0 size-2.5 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
                    <h3 className="font-serif text-2xl text-[#ea6a2a] md:text-4xl">{pickLocalized(item.title, lang)}</h3>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">{pickLocalized(item.description, lang)}</p>
                  </article>
                </ImpactReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
            <div>
              <h2 className="max-w-2xl text-balance font-serif text-4xl leading-tight text-[#ea6a2a]">
                {t('成果需要被看见，也需要保留来路', 'Outcomes should be visible, together with their evidence')}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
                {t('查看竞赛、论文发表与论坛记录，以及它们对应的现场资料。', 'See competition, publication, and forum records together with their source material.')}
              </p>
            </div>
            <Link
              to="/impact/awards"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-lg font-medium text-primary-foreground transition hover:bg-primary/90 active:translate-y-px"
            >
              {t('查看获奖情况', 'View recognition')}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
