import { ClipboardList, Megaphone, Mountain, type LucideIcon } from 'lucide-react';
import { actionLayers, type ActionLayerContent, type ActionLayerId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

const layerIcons: Record<ActionLayerId, LucideIcon> = {
  mountain: Mountain,
  field: ClipboardList,
  'urban-rural': Megaphone,
};

function LayerArticle({ layer }: { layer: ActionLayerContent }) {
  const { lang } = useLanguage();
  const Icon = layerIcons[layer.id];

  return (
    <article className="grid gap-6 border-t border-border py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.72fr)] md:gap-10 md:py-14">
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs uppercase tracking-[0.22em] text-primary/70">
            {layer.order}
          </span>
          <span className="text-xs text-muted-foreground">
            {pickLocalized(layer.level, lang)}
          </span>
        </div>

        <h3 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {pickLocalized(layer.title, lang)}
        </h3>
        <p className="mt-4 max-w-xl text-base font-medium leading-8 text-primary md:text-lg">
          {pickLocalized(layer.subtitle, lang)}
        </p>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          {pickLocalized(layer.description, lang)}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {layer.signals.map((signal) => (
            <div key={signal.en} className="border-t border-border pt-3">
              <p className="font-serif text-lg text-foreground">
                {pickLocalized(signal, lang)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <figure className="min-w-0">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-secondary/40">
          <img
            src={layer.image.src}
            alt={pickLocalized(layer.image.alt, lang)}
            className={`h-full w-full ${layer.image.contain ? 'object-contain p-6' : 'object-cover'}`}
            style={{ objectPosition: layer.image.position }}
            loading="lazy"
          />
        </div>
        <figcaption className="mt-3 text-xs leading-6 text-muted-foreground">
          {pickLocalized(layer.homeLine, lang)}
        </figcaption>
      </figure>
    </article>
  );
}

export default function ActionLayerStory() {
  const { t } = useLanguage();

  return (
    <section id="action-layers" className="section-breathing border-y border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(220px,0.56fr)_minmax(0,1fr)] lg:gap-16">
          <ScrollProgressReveal direction="up" distance={50} className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
              {t('三层行动逻辑', 'Three-Layer Action Logic')}
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
              {t('从山野、田野，到城乡行动', 'From mountains and fields to community action')}
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground">
              {t(
                '我们把一次次活动整理成三个入口：先回到山野，再进入田野，最后把理解带回城乡之间的真实行动。',
                'We organize the work through three entry points: returning to the wild, entering the field, and bringing understanding back into real community action.'
              )}
            </p>
          </ScrollProgressReveal>

          <div>
            {actionLayers.map((layer) => (
              <ScrollProgressReveal key={layer.id} direction="up" distance={44} scale={false} blur={false}>
                <LayerArticle layer={layer} />
              </ScrollProgressReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
