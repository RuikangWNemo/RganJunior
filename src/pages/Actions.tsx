import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Megaphone, Mountain, type LucideIcon } from 'lucide-react';
import {
  actionLayers,
  impactProof,
  type ActionLayerContent,
  type ActionLayerId,
} from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

type LocalizedLine = {
  zh: string;
  en: string;
};

type ActionLineMeta = {
  verb: LocalizedLine;
  axis: LocalizedLine;
  statement: LocalizedLine;
  scene: LocalizedLine;
  activities: LocalizedLine[];
};

type SceneImage = {
  src: string;
  alt: LocalizedLine;
  position: string;
};

const layerIcons: Record<ActionLayerId, LucideIcon> = {
  mountain: Mountain,
  field: ClipboardList,
  'urban-rural': Megaphone,
};

const sceneImages: Record<ActionLayerId, SceneImage> = {
  mountain: {
    src: '/archive/elements/photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
    alt: {
      zh: '再生设计生态营在山野现场的合影',
      en: 'Group photo from the regenerative design eco camp in a mountain setting',
    },
    position: 'center 54%',
  },
  field: {
    src: '/archive/elements/photos/program-activities/s11-orchard-field-practice.jpg',
    alt: {
      zh: '少年在果园中进行田野实践',
      en: 'A young person doing field practice in an orchard',
    },
    position: 'center 50%',
  },
  'urban-rural': {
    src: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
    alt: {
      zh: '阿柑少年团队在青年研究论坛展示行动成果',
      en: "R'gan Junior team presenting action outcomes at a youth research forum",
    },
    position: 'center 46%',
  },
};

const lineMeta: Record<ActionLayerId, ActionLineMeta> = {
  mountain: {
    verb: { zh: '感知', en: 'Sense' },
    axis: { zh: '身体 / 自然', en: 'Body / Nature' },
    statement: {
      zh: '森林、山路和泥土重新打开感受力。',
      en: 'Forests, paths, and soil reopen perception.',
    },
    scene: {
      zh: '让身体先回到山野。活动从行走、停留和观察开始，让少年重新听见自然，也听见自己。',
      en: 'The body returns to the mountain first. Walking, pausing, and observing help young people hear nature and themselves again.',
    },
    activities: [
      { zh: '山野路线', en: 'Mountain routes' },
      { zh: '感知练习', en: 'Sensory practice' },
      { zh: '再生设计营地', en: 'Regenerative camp' },
    ],
  },
  field: {
    verb: { zh: '研究', en: 'Study' },
    axis: { zh: '问题 / 社区', en: 'Questions / Community' },
    statement: {
      zh: '进入真实社区，把感受变成问题。',
      en: 'Enter real communities and turn feeling into questions.',
    },
    scene: {
      zh: '在果园、家庭访谈和 CSA 场景里，少年不再只是参观者，而是记录者、提问者和研究者。',
      en: 'In orchards, household interviews, and CSA settings, young people become documenters, question-askers, and researchers.',
    },
    activities: [
      { zh: '果园实践', en: 'Orchard fieldwork' },
      { zh: '家庭访谈', en: 'Household interviews' },
      { zh: 'CSA 调研', en: 'CSA research' },
    ],
  },
  'urban-rural': {
    verb: { zh: '行动', en: 'Act' },
    axis: { zh: '社群 / 公共', en: 'Community / Public' },
    statement: {
      zh: '把理解带回校园、社区和公共表达。',
      en: 'Carry understanding into campuses, communities, and public voice.',
    },
    scene: {
      zh: '研究最终回到行动：校园 CSA、论坛表达、社区服务和生态倡导，把成长放进真实关系。',
      en: 'Research returns as action: campus CSA, forum voice, service, and ecological advocacy place growth inside real relationships.',
    },
    activities: [
      { zh: '校园 CSA', en: 'Campus CSA' },
      { zh: '论坛表达', en: 'Forum voice' },
      { zh: '社区行动', en: 'Community action' },
    ],
  },
};

function HeroLine({ layer }: { layer: ActionLayerContent }) {
  const { lang } = useLanguage();
  const meta = lineMeta[layer.id];

  return (
    <div className="min-w-0 border-t border-border/70 py-4">
      <div className="flex min-w-0 items-baseline justify-between gap-4">
        <p className="font-serif text-lg text-primary">
          {layer.order}
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {pickLocalized(meta.verb, lang)}
        </p>
      </div>
      <p className="mt-3 min-w-0 break-words text-sm text-foreground/88">
        {pickLocalized(layer.shortTitle, lang)}
      </p>
    </div>
  );
}

function ActionHero() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const heroLayer = actionLayers[0];
  const heroImage = sceneImages[heroLayer.id];

  return (
    <section className="relative isolate min-h-[min(820px,calc(100svh-5rem))] overflow-hidden border-b border-border bg-background">
      <img
        src={heroImage.src}
        alt={pickLocalized(heroImage.alt, lang)}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.45] saturate-[0.86]"
        style={{ objectPosition: heroImage.position }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/82 to-background/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-background to-transparent" />

      <div className="container mx-auto grid min-h-[min(820px,calc(100svh-5rem))] max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,0.86fr)_minmax(260px,0.34fr)] lg:items-end lg:px-8">
        <div className="w-full min-w-0 max-w-[22rem] self-center sm:max-w-4xl">
          <p data-page-motion="title" className="text-xs uppercase tracking-[0.26em] text-primary/75">
            {t('行动现场', 'Action Field')}
          </p>
          <h1
            data-page-motion="title"
            className="mt-6 max-w-[21rem] break-words font-serif text-3xl leading-tight text-foreground sm:max-w-full sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t('三条行动线，进入真实世界。', 'Three lines into the real world.')}
          </h1>
          <p data-page-motion="lead" className="mt-8 max-w-[21rem] text-base leading-8 text-muted-foreground sm:max-w-2xl md:text-lg">
            {lang === 'zh'
              ? `${brandName}把成长放进山野、田野与城乡之间：先恢复感知，再理解问题，最后形成行动。`
              : `${brandName} places growth between mountain, field, and community: restore perception, understand problems, then form action.`}
          </p>
        </div>

        <aside data-page-motion="lead" className="min-w-0 bg-background/65 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-0">
          {actionLayers.map((layer) => (
            <HeroLine key={layer.id} layer={layer} />
          ))}
        </aside>
      </div>
    </section>
  );
}

function LineOverview() {
  const { lang, t } = useLanguage();

  return (
    <section id="action-lines" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          <div className="w-full min-w-0 max-w-[22rem] sm:max-w-none">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/70">
              {t('三条行动线', 'Three Lines')}
            </p>
            <h2 className="mt-5 max-w-[21rem] break-words font-serif text-2xl leading-tight text-foreground sm:max-w-xl sm:text-3xl md:text-5xl">
              {t('不是项目清单，是行动的路径。', 'Not a project list, but a path of action.')}
            </h2>
          </div>

          <div data-page-motion="actions" className="grid min-w-0 gap-3 md:grid-cols-3">
            {actionLayers.map((layer) => {
              const Icon = layerIcons[layer.id];
              const meta = lineMeta[layer.id];
              const imageShiftClass = layer.id === 'urban-rural'
                ? 'left-[58%] h-[66%] opacity-85 sm:h-[92%] sm:opacity-100 md:left-[59%] md:h-[101%]'
                : 'left-1/2 h-[66%] opacity-85 sm:h-[86%] sm:opacity-100 md:h-[94%]';
              const imageClass = layer.image.contain
                ? `absolute bottom-0 w-auto max-w-none -translate-x-1/2 object-contain transition duration-700 ease-out group-hover/card:-translate-y-3 group-hover/card:scale-[1.08] group-focus-visible/card:-translate-y-3 group-focus-visible/card:scale-[1.08] ${imageShiftClass}`
                : 'h-full w-full object-cover transition duration-700 ease-out group-hover/card:scale-[1.04] group-focus-visible/card:scale-[1.04]';

              return (
                <a
                  key={layer.id}
                  href={`#${layer.id}`}
                  aria-label={`${layer.order} ${pickLocalized(layer.title, lang)}`}
                  className="group/card relative flex min-h-[23.5rem] w-full min-w-0 overflow-hidden rounded-md border border-border bg-secondary/35 p-4 outline-none transition-[transform,border-color,box-shadow,background-color] duration-500 ease-out hover:-translate-y-1 hover:border-primary/35 hover:bg-secondary/45 hover:shadow-[0_24px_70px_rgba(36,52,32,0.16)] focus-visible:-translate-y-1 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 sm:min-h-[27rem] sm:p-5 md:min-h-[31rem]"
                >
                  <div className="absolute inset-0">
                    <img
                      src={layer.image.src}
                      alt={pickLocalized(layer.image.alt, lang)}
                      className={imageClass}
                      style={{ objectPosition: layer.image.position }}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/10 to-background/94 transition duration-500 group-hover/card:via-background/0 group-hover/card:to-background/88 group-focus-visible/card:via-background/0 group-focus-visible/card:to-background/88" />
                  </div>

                  <div className="relative z-10 flex w-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-xl text-primary">
                          {layer.order}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {pickLocalized(layer.shortTitle, lang)}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center border border-background/70 bg-background/78 text-primary backdrop-blur-sm transition duration-500 group-hover/card:-translate-y-1 group-hover/card:bg-background/92 group-focus-visible/card:-translate-y-1 group-focus-visible/card:bg-background/92">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-auto min-w-0 rounded-sm border border-background/60 bg-background/80 p-3.5 shadow-sm backdrop-blur-[3px] transition duration-500 group-hover/card:bg-background/84 group-focus-visible/card:bg-background/84 sm:p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/75">
                        {pickLocalized(meta.axis, lang)}
                      </p>
                      <h3 className="mt-3 font-serif text-4xl leading-none text-foreground sm:mt-4 sm:text-5xl md:text-6xl">
                        {pickLocalized(meta.verb, lang)}
                      </h3>
                      <p className="mt-4 max-w-sm break-words text-sm leading-7 text-foreground/72 sm:mt-5 md:text-base md:leading-8">
                        {pickLocalized(layer.homeLine, lang)}
                      </p>
                      <div className="mt-5 grid min-w-0 grid-cols-1 gap-2 transition-all duration-500 sm:mt-6 sm:flex sm:flex-wrap md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover/card:max-h-28 md:group-hover/card:opacity-100 md:group-focus-visible/card:max-h-28 md:group-focus-visible/card:opacity-100">
                        {meta.activities.map((activity) => (
                          <span
                            key={activity.en}
                            className="w-full max-w-full whitespace-normal break-words border border-border/80 bg-background/70 px-2.5 py-1 text-center text-xs text-muted-foreground backdrop-blur-sm sm:w-auto sm:px-3 sm:text-left"
                          >
                            {pickLocalized(activity, lang)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-7 h-px w-full bg-border/80">
                        <div className="h-px w-12 bg-primary transition-all duration-500 group-hover/card:w-24 group-focus-visible/card:w-24" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionScene({ layer, index }: { layer: ActionLayerContent; index: number }) {
  const { lang, t } = useLanguage();
  const Icon = layerIcons[layer.id];
  const meta = lineMeta[layer.id];
  const sceneImage = sceneImages[layer.id];
  const isReversed = index % 2 === 1;

  return (
    <section id={layer.id} className="scroll-mt-24 border-t border-border py-16 md:py-24">
      <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-8">
        <figure className={`min-w-0 lg:col-span-7 ${isReversed ? 'lg:order-2' : ''}`}>
          <div className="group/scene relative aspect-[16/11] overflow-hidden rounded-md border border-border bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.9),rgba(244,238,218,0.42)_34%,rgba(220,231,204,0.52)_100%)]">
            <img
              src={sceneImage.src}
              alt={pickLocalized(sceneImage.alt, lang)}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover/scene:scale-[1.045]"
              style={{ objectPosition: sceneImage.position }}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/28 via-transparent to-background/10 opacity-80 transition duration-500 group-hover/scene:opacity-55" />
            <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center border border-background/70 bg-background/80 text-primary backdrop-blur-sm transition duration-500 group-hover/scene:-translate-y-1 group-hover/scene:bg-background/92">
              <Icon className="h-5 w-5" />
            </div>
            <div className="absolute bottom-5 right-5 border border-background/70 bg-background/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary backdrop-blur-sm transition duration-500 group-hover/scene:translate-x-1 group-hover/scene:bg-background/92">
              {layer.order} / {pickLocalized(meta.verb, lang)}
            </div>
          </div>
          <figcaption className="mt-4 text-xs leading-6 text-muted-foreground">
            {pickLocalized(layer.homeLine, lang)}
          </figcaption>
        </figure>

        <div className="min-w-0 lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
            {layer.order} / {pickLocalized(layer.shortTitle, lang)}
          </p>
          <h2 className="mt-5 max-w-full break-words font-serif text-3xl leading-tight text-foreground md:text-5xl">
            {pickLocalized(layer.title, lang)}
          </h2>
          <p className="mt-5 text-base font-medium leading-8 text-primary md:text-lg">
            {pickLocalized(layer.subtitle, lang)}
          </p>
          <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {pickLocalized(meta.scene, lang)}
          </p>

          <div className="mt-10 border-y border-border">
            <p className="py-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {t('活动', 'Activities')}
            </p>
            <div className="grid border-t border-border sm:grid-cols-3">
              {meta.activities.map((activity, activityIndex) => (
                <div
                  key={activity.en}
                  className={`min-w-0 py-4 sm:px-4 ${activityIndex > 0 ? 'border-t border-border sm:border-l sm:border-t-0' : ''}`}
                >
                  <p className="break-words font-serif text-lg text-foreground">
                    {pickLocalized(activity, lang)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionScenes() {
  return (
    <>
      {actionLayers.map((layer, index) => (
        <ActionScene key={layer.id} layer={layer} index={index} />
      ))}
    </>
  );
}

function EvidenceField() {
  const { lang, t } = useLanguage();

  return (
    <section className="border-t border-border py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/70">
              {t('行动痕迹', 'Traces')}
            </p>
            <h2 className="mt-5 max-w-md font-serif text-3xl leading-tight text-foreground md:text-5xl">
              {t('行动留下的痕迹。', 'Traces left by action.')}
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {t(
                '不把成果说满，只把真实发生过的节点留下。',
                'We do not over-explain outcomes; we leave the real markers visible.'
              )}
            </p>
          </div>

          <div className="grid min-w-0 border-y border-border sm:grid-cols-2">
            {impactProof.map((item, index) => (
              <article
                key={item.value}
                className={`min-w-0 py-7 sm:px-7 ${
                  index > 1 ? 'border-t border-border' : ''
                } ${index % 2 === 1 ? 'sm:border-l sm:border-border' : ''}`}
              >
                <p className="font-serif text-2xl text-primary md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                  {pickLocalized(item.label, lang)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center">
          <Link
            to="/join"
            className="cursor-target inline-flex items-center text-sm font-medium text-primary transition-organic hover:text-foreground"
          >
            {t('进入行动网络', 'Enter the action network')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Actions() {
  return (
    <div className="overflow-x-hidden pt-20">
      <ActionHero />
      <LineOverview />
      <ActionScenes />
      <EvidenceField />
    </div>
  );
}
