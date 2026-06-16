import { useLanguage } from '@/contexts/LanguageContext';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

type PhotoMoment = {
  src: string;
  zhTitle: string;
  enTitle: string;
  zhMeta: string;
  enMeta: string;
  position?: string;
};

const featuredPhoto: PhotoMoment = {
  src: '/archive/elements/photos/site-ecology/s02-orchard-spraying-scene.jpg',
  zhTitle: '果园晨雾中的田野观察',
  enTitle: 'Field observation in the orchard mist',
  zhMeta: '蒲江铁牛村 · 生态农业现场',
  enMeta: 'Tieniu Village · Regenerative agriculture site',
  position: 'center 48%',
};

const fieldPhotos: PhotoMoment[] = [
  {
    src: '/archive/elements/photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
    zhTitle: '山谷里的再生设计营地',
    enTitle: 'Regenerative design camp in the valley',
    zhMeta: '青年共同生活与学习',
    enMeta: 'Youth living and learning together',
    position: 'center 52%',
  },
  {
    src: '/archive/elements/photos/site-ecology/s09-regenerative-farming-practice.jpg',
    zhTitle: '把手伸进土壤',
    enTitle: 'Hands back in the soil',
    zhMeta: '从观察走向行动',
    enMeta: 'From observation to action',
    position: 'center 55%',
  },
  {
    src: '/archive/elements/photos/program-activities/s11-orchard-field-practice.jpg',
    zhTitle: '果园里的行走课堂',
    enTitle: 'A walking classroom in the orchard',
    zhMeta: '真实世界学习',
    enMeta: 'Real-world learning',
    position: 'center 42%',
  },
  {
    src: '/archive/elements/photos/site-ecology/s06-linpan-aerial-overview.jpg',
    zhTitle: '林盘与村落肌理',
    enTitle: 'Linpan settlement and village texture',
    zhMeta: '土地、社区与尺度',
    enMeta: 'Land, community, and scale',
    position: 'center 48%',
  },
];

const fieldSignals = [
  { zh: '自然', en: 'Nature' },
  { zh: '社区', en: 'Community' },
  { zh: '行动', en: 'Action' },
];

function PhotoFigure({
  photo,
  index,
  featured = false,
}: {
  photo: PhotoMoment;
  index: number;
  featured?: boolean;
}) {
  const { t } = useLanguage();
  const title = t(photo.zhTitle, photo.enTitle);
  const meta = t(photo.zhMeta, photo.enMeta);

  return (
    <figure className={featured ? 'group' : 'group min-w-0'}>
      <div
        className={`overflow-hidden rounded-sm bg-secondary/40 ${
          featured ? 'aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[4/3]'
        }`}
      >
        <img
          src={photo.src}
          alt={title}
          className="h-full w-full object-cover saturate-[0.9] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:saturate-100"
          style={{ objectPosition: photo.position }}
          loading={featured || index < 2 ? 'eager' : 'lazy'}
        />
      </div>
      <figcaption className="mt-3 border-t border-foreground/10 pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[0.65rem] font-semibold tracking-[0.24em] text-primary/80">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-right text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {meta}
          </span>
        </div>
        <p className="mt-2 font-serif text-base leading-snug text-foreground md:text-lg">
          {title}
        </p>
      </figcaption>
    </figure>
  );
}

export default function HomePhotoScroll() {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-[hsl(42_28%_96%)] py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.45fr)] lg:gap-16 xl:gap-20">
          <div className="w-full min-w-0 lg:sticky lg:top-28 lg:self-start">
            <ScrollProgressReveal direction="up" distance={36} scale={false} blur={false} className="w-full max-w-full">
              <span className="mb-5 block text-xs uppercase tracking-[0.32em] text-primary/70">
                {t('现场影像', 'Field Notes')}
              </span>
              <h2 className="max-w-full text-balance font-serif text-3xl leading-[1.08] text-foreground sm:text-4xl md:text-5xl lg:text-[4.35rem]">
                {lang === 'zh' ? (
                  '现场不是背景'
                ) : (
                  <>
                    The field is
                    <br className="sm:hidden" /> not a backdrop
                  </>
                )}
              </h2>
              <p className="mt-7 max-w-md break-words text-base leading-8 text-muted-foreground md:text-lg">
                {t(
                  '照片不只是记录活动，而是呈现阿柑少年如何把身体、知识与土地重新放回同一个现场。',
                  "These images are not activity snapshots; they show how R'gan Junior brings body, knowledge, and land back into one living field."
                )}
              </p>
            </ScrollProgressReveal>

            <ScrollProgressReveal direction="up" distance={28} scale={false} blur={false} className="mt-10">
              <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
                {fieldSignals.map((signal) => (
                  <div key={signal.en} className="px-3 py-5 first:pl-0 last:pr-0 sm:px-4">
                    <p className="font-serif text-sm text-foreground sm:text-xl">
                      {t(signal.zh, signal.en)}
                    </p>
                    <p className="mt-2 text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
                      Field
                    </p>
                  </div>
                ))}
              </div>
            </ScrollProgressReveal>
          </div>

          <div className="w-full min-w-0 space-y-8 lg:pt-2">
            <ScrollProgressReveal direction="up" distance={44} scale={false} blur={false}>
              <PhotoFigure photo={featuredPhoto} index={0} featured />
            </ScrollProgressReveal>

            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
              {fieldPhotos.map((photo, index) => (
                <ScrollProgressReveal
                  key={photo.src}
                  direction="up"
                  distance={36}
                  scale={false}
                  blur={false}
                  delay={0.04 * index}
                >
                  <PhotoFigure photo={photo} index={index + 1} />
                </ScrollProgressReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
