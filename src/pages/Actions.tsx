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

const layerIcons: Record<ActionLayerId, LucideIcon> = {
  mountain: Mountain,
  field: ClipboardList,
  'urban-rural': Megaphone,
};

const actionVerbs: Record<ActionLayerId, { zh: string; en: string }> = {
  mountain: { zh: '感知', en: 'Sense' },
  field: { zh: '研究', en: 'Study' },
  'urban-rural': { zh: '转化', en: 'Act' },
};

const actionAxes: Record<ActionLayerId, { zh: string; en: string }> = {
  mountain: { zh: '身体 / 自然', en: 'Body / Nature' },
  field: { zh: '问题 / 社区', en: 'Questions / Community' },
  'urban-rural': { zh: '社群 / 公共', en: 'Community / Public' },
};

function ActionTrack({ layer, index }: { layer: ActionLayerContent; index: number }) {
  const { lang } = useLanguage();
  const Icon = layerIcons[layer.id];

  return (
    <article
      className={`group relative flex min-h-full min-w-0 flex-col border-border/80 py-10 sm:py-12 lg:px-7 lg:py-0 xl:px-8 ${
        index > 0 ? 'border-t lg:border-l lg:border-t-0' : ''
      }`}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5 lg:min-h-[132px] lg:pt-8">
        <div className="min-w-0">
            <p className="max-w-full break-words text-xs uppercase tracking-[0.24em] text-primary/70">
            {layer.order} / {pickLocalized(actionAxes[layer.id], lang)}
          </p>
          <div className="mt-5 flex items-center gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center border border-primary/25 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <p className="max-w-full break-words font-serif text-4xl leading-none text-foreground md:text-5xl">
              {pickLocalized(actionVerbs[layer.id], lang)}
            </p>
          </div>
        </div>
        <p className="max-w-[7rem] text-xs leading-5 text-muted-foreground sm:text-right">
          {pickLocalized(layer.level, lang)}
        </p>
      </div>

      <figure className="mt-9 lg:mt-0">
        <div className="relative aspect-[5/4] overflow-hidden border-y border-border/80 bg-secondary/35 lg:aspect-[4/5]">
          <img
            src={layer.image.src}
            alt={pickLocalized(layer.image.alt, lang)}
            className={`h-full w-full transition duration-700 ease-out group-hover:scale-[1.025] group-hover:grayscale-0 group-hover:saturate-100 ${
              layer.image.contain
                ? 'object-contain p-6 md:p-8'
                : 'object-cover grayscale-[18%] saturate-[0.82] contrast-[0.96]'
            }`}
            style={{ objectPosition: layer.image.position }}
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute left-5 top-5 h-14 w-px bg-primary/45" />
        </div>
        <figcaption className="mt-3 text-xs leading-6 text-muted-foreground">
          {pickLocalized(layer.homeLine, lang)}
        </figcaption>
      </figure>

      <div className="mt-9 flex flex-1 flex-col">
        <div className="h-px w-10 bg-primary/55" />
        <h2 className="mt-6 max-w-full break-words font-serif text-2xl leading-tight text-foreground sm:text-3xl md:text-4xl">
          {pickLocalized(layer.title, lang)}
        </h2>
        <p className="mt-4 text-base font-medium leading-8 text-primary">
          {pickLocalized(layer.subtitle, lang)}
        </p>
        <p className="mt-6 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {pickLocalized(layer.description, lang)}
        </p>

        <div className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-xs uppercase tracking-[0.18em] text-foreground/65">
          {layer.signals.map((signal, signalIndex) => (
            <span key={signal.en} className="inline-flex items-center gap-3">
              {signalIndex > 0 && <span className="h-px w-5 bg-border" />}
              {pickLocalized(signal, lang)}
            </span>
          ))}
        </div>

        <div className="mt-9 border-t border-border/80">
          {layer.details.map((detail, detailIndex) => (
            <div
              key={detail.en}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 border-b border-border/80 py-4"
            >
              <span className="font-serif text-sm text-primary/70">
                {String(detailIndex + 1).padStart(2, '0')}
              </span>
              <p className="min-w-0 break-words text-sm leading-7 text-foreground/84">
                {pickLocalized(detail, lang)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ActionHero() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <section className="section-breathing">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.46fr)] lg:items-end">
          <div className="min-w-0 max-w-4xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.24em] text-primary/70">
              {t('Action System', 'Action System')}
            </p>
            <h1
              data-page-motion="title"
              className="mt-6 max-w-full break-words font-serif text-3xl leading-tight text-foreground sm:max-w-4xl sm:text-4xl md:text-6xl lg:text-7xl"
            >
              {t('三条行动线，通向真实世界的成长。', 'Three lines of action, one path into the real world.')}
            </h1>
            <p data-page-motion="lead" className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {lang === 'zh'
                ? `${brandName}把山野、田野与城乡行动放在同一个系统里：感知、研究、转化同时发生，青少年因此在真实关系中长出判断力。`
                : `${brandName} holds mountain, field, and urban-rural action inside one system: sensing, research, and transformation happen together, helping young people grow judgment in real relationships.`}
            </p>
          </div>

          <aside data-page-motion="lead" className="min-w-0 border-y border-border/80">
            {actionLayers.map((layer) => (
              <div
                key={layer.id}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border/80 py-4 last:border-b-0"
              >
                <span className="font-serif text-lg text-primary">
                  {layer.order}
                </span>
                <span className="min-w-0 text-sm text-foreground">
                  {pickLocalized(layer.shortTitle, lang)}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {pickLocalized(actionVerbs[layer.id], lang)}
                </span>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}

function ParallelField() {
  const { lang, t } = useLanguage();

  return (
    <section className="pb-20 md:pb-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid min-w-0 gap-6 border-t border-border/80 pt-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
              {t('Parallel Field', 'Parallel Field')}
            </p>
            <h2 className="mt-4 max-w-full break-words font-serif text-2xl leading-tight text-foreground sm:text-3xl md:text-4xl">
              {t('不是三段陈列，而是三条同时推进的能力。', 'Not three exhibits, but three capacities moving in parallel.')}
            </h2>
          </div>
          <p className="min-w-0 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8 lg:justify-self-end">
            {t(
              '山野打开身体，田野训练理解，城乡让理解进入公共关系。三条线互相支撑，形成阿柑少年行动的完整场域。',
              'Mountain work opens the body, field work trains understanding, and urban-rural action carries that understanding into public relationships. The three lines support one another as a complete field of action.'
            )}
          </p>
        </div>

        <div data-page-motion="actions" className="min-w-0 border-y border-border/80 lg:border-x lg:border-border/80">
          <div className="hidden border-b border-border/80 lg:grid lg:grid-cols-3">
            {actionLayers.map((layer) => (
              <div
                key={layer.id}
                className="px-7 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground xl:px-8"
              >
                {layer.order} / {pickLocalized(layer.shortTitle, lang)}
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3">
            {actionLayers.map((layer, index) => (
              <ActionTrack key={layer.id} layer={layer} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Convergence() {
  const { t } = useLanguage();

  return (
    <section className="pb-20 md:pb-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hidden grid-cols-3 lg:grid">
          {actionLayers.map((layer) => (
            <div key={layer.id} className="relative h-16">
              <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
            </div>
          ))}
        </div>

        <div className="border-y border-border/80 py-12 text-center md:py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
            {t('Convergence', 'Convergence')}
          </p>
          <h2 className="mx-auto mt-5 max-w-full break-words font-serif text-2xl leading-tight text-foreground sm:max-w-4xl sm:text-3xl md:text-5xl">
            {t(
              '在山野恢复感知，在田野理解问题，在城乡形成行动。',
              'Restore the senses in the mountains, understand problems in the field, and form action across urban and rural life.'
            )}
          </h2>
          <div className="mx-auto mt-8 h-px w-16 bg-primary/60" />
          <Link
            to="/join"
            className="cursor-target mt-8 inline-flex items-center text-sm font-medium text-primary transition-organic hover:text-foreground"
          >
            {t('进入行动网络', 'Enter the action network')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function EvidenceLedger() {
  const { lang, t } = useLanguage();

  return (
    <section className="border-t border-border py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] md:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
              {t('Impact Proof', 'Impact Proof')}
            </p>
            <h2 className="mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {t('真实行动的证据', 'Proof of Real Action')}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
              {t(
                '三层行动不是概念包装，而是在既有研究、论坛表达、校园 CSA 与真实社区实践基础上继续生长。',
                'The three-layer action logic is not packaging; it grows from existing research, forum presentations, campus CSA, and real community practice.'
              )}
            </p>
          </div>

          <div className="border-y border-border/80">
            {impactProof.map((item, index) => (
              <article
                key={item.value}
                className="grid gap-4 border-b border-border/80 py-5 last:border-b-0 sm:grid-cols-[minmax(8rem,0.34fr)_minmax(0,1fr)] sm:items-baseline"
              >
                <p className="min-w-0 break-words font-serif text-2xl text-primary md:text-3xl">
                  {item.value}
                </p>
                <div className="grid gap-2 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="min-w-0 break-words text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                    {pickLocalized(item.label, lang)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Actions() {
  return (
    <div className="pt-20">
      <ActionHero />
      <ParallelField />
      <Convergence />
      <EvidenceLedger />
    </div>
  );
}
