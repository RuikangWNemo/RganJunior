import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { actionLayers, type ActionLayerContent, type ActionLayerId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

const actionVerbs: Record<ActionLayerId, { zh: string; en: string }> = {
  mountain: { zh: '感知', en: 'Sense' },
  field: { zh: '研究', en: 'Study' },
  'urban-rural': { zh: '行动', en: 'Act' },
};

function LineItem({ layer }: { layer: ActionLayerContent }) {
  const { lang } = useLanguage();

  return (
    <Link
      to={`/actions#${layer.id}`}
      aria-label={`${layer.order} ${pickLocalized(layer.title, lang)}`}
      className="group grid min-w-0 gap-5 border-t border-border py-6 outline-none transition-[background-color,border-color,transform] duration-500 hover:border-primary/30 hover:bg-secondary/35 focus-visible:bg-secondary/35 focus-visible:ring-2 focus-visible:ring-primary/25 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start sm:px-4 md:py-7"
    >
      <div className="flex min-w-0 items-baseline gap-4 sm:block">
        <p className="font-serif text-xl text-primary">
          {layer.order}
        </p>
        <p className="mt-0 text-xs uppercase tracking-[0.22em] text-muted-foreground sm:mt-3">
          {pickLocalized(layer.shortTitle, lang)}
        </p>
      </div>

      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,0.86fr)_12rem] md:items-center">
        <div className="min-w-0">
          <h3 className="max-w-full break-words font-serif text-3xl leading-none text-foreground md:text-4xl">
            {pickLocalized(actionVerbs[layer.id], lang)}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {pickLocalized(layer.homeLine, lang)}
          </p>
          <ArrowRight className="mt-5 h-4 w-4 text-primary opacity-70 transition duration-500 group-hover:translate-x-2 group-hover:opacity-100 group-focus-visible:translate-x-2 group-focus-visible:opacity-100" aria-hidden="true" />
        </div>

        <figure className="hidden min-w-0 overflow-hidden rounded-md border border-border bg-[radial-gradient(circle_at_36%_20%,rgba(255,255,255,0.92),rgba(244,238,218,0.44)_34%,rgba(220,231,204,0.52)_100%)] md:block">
          <img
            src={layer.image.src}
            alt={pickLocalized(layer.image.alt, lang)}
            className="aspect-[4/3] h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.055] group-focus-visible:scale-[1.055]"
            style={{ objectPosition: layer.image.position }}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </Link>
  );
}

export default function ActionLayerStory() {
  const { t } = useLanguage();

  return (
    <section id="action-layers" className="section-breathing border-y border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(220px,0.52fr)_minmax(0,1fr)] lg:gap-20">
          <ScrollProgressReveal direction="up" distance={50} className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
              {t('三条行动线', 'Three Lines')}
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
              {t('从山野，到田野，再到城乡。', 'From mountain, to field, to community.')}
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '从山野恢复感知，到田野理解问题，再到城乡形成行动。',
                'Restore the senses in the mountain, understand real problems in the field, and form action across communities.'
              )}
            </p>
            <Link
              to="/actions"
              className="cursor-target mt-8 inline-flex items-center text-sm font-medium text-primary transition-organic hover:text-foreground"
            >
              {t('查看行动现场', 'View the action field')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </ScrollProgressReveal>

          <div className="border-b border-border">
            {actionLayers.map((layer) => (
              <ScrollProgressReveal key={layer.id} direction="up" distance={44} scale={false} blur={false}>
                <LineItem layer={layer} />
              </ScrollProgressReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
