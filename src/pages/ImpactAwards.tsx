import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ImpactReveal } from '@/components/impact/ImpactReveal';
import { ImpactSectionNav } from '@/components/impact/ImpactSectionNav';
import type { ImpactEvidence } from '@/content/impact';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { localImpactRepository } from '@/services/impact/publicRepository';

function EvidenceCopy({ evidence }: { evidence: ImpactEvidence }) {
  const { lang, t } = useLanguage();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary/70">
        <span>{pickLocalized(evidence.categoryLabel, lang)}</span>
        <time dateTime={evidence.date}>{evidence.date}</time>
      </div>
      <h2 className="mt-4 text-balance font-serif text-3xl leading-tight text-foreground md:text-5xl">
        {pickLocalized(evidence.title, lang)}
      </h2>
      <p className="mt-5 text-sm leading-8 text-muted-foreground md:text-base">
        {pickLocalized(evidence.summary, lang)}
      </p>
      <ul className="mt-7 space-y-3" aria-label={t('成果事实', 'Verified facts')}>
        {evidence.facts.map((fact) => (
          <li key={fact.zh} className="border-l border-primary/35 pl-4 text-sm leading-7 text-foreground/78">
            {pickLocalized(fact, lang)}
          </li>
        ))}
      </ul>
      <p className="mt-7 text-xs leading-5 text-primary/65">
        {t('资料来源：', 'Source: ')}{pickLocalized(evidence.sourceLabel, lang)}
      </p>
    </div>
  );
}

function EvidenceRecord({ evidence }: { evidence: ImpactEvidence }) {
  const { lang } = useLanguage();

  if (evidence.category === 'competition') {
    return (
      <ImpactReveal>
        <article className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-center lg:gap-16">
          <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(8rem,0.65fr)] gap-3">
            <img
              src={evidence.image}
              alt={pickLocalized(evidence.imageAlt, lang)}
              width="835"
              height="557"
              loading="eager"
              className="aspect-[4/3] h-full w-full rounded-2xl object-cover"
            />
            {evidence.secondaryImage && evidence.secondaryImageAlt ? (
              <img
                src={evidence.secondaryImage}
                alt={pickLocalized(evidence.secondaryImageAlt, lang)}
                width="529"
                height="707"
                loading="lazy"
                className="aspect-[3/4] h-full w-full rounded-2xl object-cover"
              />
            ) : null}
          </div>
          <EvidenceCopy evidence={evidence} />
        </article>
      </ImpactReveal>
    );
  }

  if (evidence.category === 'publication') {
    return (
      <ImpactReveal>
        <article className="rounded-2xl bg-primary/[0.045] p-5 sm:p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.68fr)_minmax(0,1.32fr)] lg:items-center lg:gap-16">
            <EvidenceCopy evidence={evidence} />
            <img
              src={evidence.image}
              alt={pickLocalized(evidence.imageAlt, lang)}
              width="1920"
              height="1358"
              loading="lazy"
              className="w-full rounded-xl border border-border bg-white object-contain shadow-[0_16px_50px_hsl(var(--primary)/0.08)]"
            />
          </div>
        </article>
      </ImpactReveal>
    );
  }

  return (
    <ImpactReveal>
      <article>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <img
            src={evidence.image}
            alt={pickLocalized(evidence.imageAlt, lang)}
            width="1920"
            height="1358"
            loading="lazy"
            className="aspect-[16/8.8] h-full w-full object-cover object-top"
          />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.55fr)] lg:justify-between lg:gap-16">
          <EvidenceCopy evidence={evidence} />
          {evidence.secondaryImage && evidence.secondaryImageAlt ? (
            <figure>
              <img
                src={evidence.secondaryImage}
                alt={pickLocalized(evidence.secondaryImageAlt, lang)}
                width="1280"
                height="720"
                loading="lazy"
                className="aspect-video w-full rounded-2xl object-cover"
              />
            </figure>
          ) : null}
        </div>
      </article>
    </ImpactReveal>
  );
}

export default function ImpactAwards() {
  const { t } = useLanguage();
  const impactQuery = useQuery({
    queryKey: ['impact', 'public'],
    queryFn: () => localImpactRepository.getPublicSnapshot(),
  });

  const evidence = impactQuery.data?.evidence ?? [];

  return (
    <div className="impact-awards-page overflow-hidden pt-20">
      <header className="border-b border-border/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/75 py-3">
            <ImpactSectionNav />
            <p className="text-xs leading-5 text-muted-foreground">
              {t('竞赛、发表与论坛资料档案', 'Competition, publication, and forum archive')}
            </p>
          </div>
          <div className="grid gap-10 py-14 sm:py-16 md:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(24rem,1.15fr)] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="text-xs tracking-[0.18em] text-primary/75">{t('RECOGNITION / 获奖情况', 'RECOGNITION / 获奖情况')}</p>
              <h1 className="mt-5 max-w-[9ch] text-balance font-serif text-5xl leading-[1.08] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl">
                {t('每一项成果，都保留来路', 'Every outcome keeps its evidence')}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-foreground/72 md:text-lg md:leading-9">
                {t(
                  '这里记录竞赛结果、论文发表与论坛经历，也保留照片、海报和原始资料。',
                  'This archive records competitions, publications, and forums together with photographs, posters, and source material.',
                )}
              </p>
            </div>
            <figure>
              <img
                src="/archive/elements/photos/academic-forum/s16-ctb-award-medal.jpg"
                alt={t('手中拿着 CTB Most Popular Project 奖牌', 'A CTB Most Popular Project medal held in one hand')}
                width="529"
                height="707"
                loading="eager"
                className="ml-auto aspect-[4/3] w-full max-w-2xl rounded-2xl object-cover object-[center_58%]"
              />
            </figure>
          </div>
        </div>
      </header>

      <main>
        {impactQuery.isPending ? (
          <div className="container mx-auto max-w-7xl animate-pulse px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="aspect-[4/3] rounded-2xl bg-secondary" />
              <div className="space-y-5 pt-5">
                <div className="h-12 w-3/4 rounded bg-secondary" />
                <div className="h-28 rounded bg-secondary" />
              </div>
            </div>
          </div>
        ) : impactQuery.isError ? (
          <div className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-foreground">{t('暂时无法读取成果记录', 'Recognition records are temporarily unavailable')}</h2>
            <button
              type="button"
              onClick={() => void impactQuery.refetch()}
              className="mt-7 min-h-11 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              {t('重新读取', 'Try again')}
            </button>
          </div>
        ) : evidence.length ? (
          <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="space-y-24 md:space-y-32">
              {evidence.map((item) => <EvidenceRecord key={item.id} evidence={item} />)}
            </div>
          </div>
        ) : (
          <div className="container mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-foreground">{t('尚无可公开的成果记录', 'No public recognition records yet')}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {t('记录会在资料核验完成后出现，不使用演示条目填充。', 'Records will appear after verification and will not be filled with sample entries.')}
            </p>
          </div>
        )}

        <section className="border-t border-border/80 bg-card/35 py-16 md:py-20">
          <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
            <div>
              <h2 className="max-w-2xl text-balance font-serif text-3xl leading-tight text-foreground md:text-4xl">
                {t('未来的媒体记录，也会进入同一份档案', 'Future media records will join the same archive')}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                {t('数据库将统一管理竞赛、发表、论坛和媒体类型，并保留每条记录的来源。', 'The database will manage competition, publication, forum, and media records with a source for every entry.')}
              </p>
            </div>
            <Link
              to="/impact"
              className="inline-flex min-h-12 items-center rounded-lg border border-primary/30 px-5 py-3 text-sm font-medium text-primary transition hover:bg-primary/5 active:translate-y-px"
            >
              {t('返回统计', 'Back to overview')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
