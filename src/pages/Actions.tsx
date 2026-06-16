import { ClipboardList, Megaphone, Mountain, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, type LocalizedText, pickLocalized } from '@/lib/brand';

type ActionLayer = {
  id: string;
  category: LocalizedText;
  level: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  image: {
    src: string;
    alt: LocalizedText;
    position?: string;
  };
  icon: LucideIcon;
  details: LocalizedText[];
};

const actionLayers: ActionLayer[] = [
  {
    id: 'nature-healing',
    category: { zh: '行动类 1', en: 'Action 1' },
    level: { zh: '基础层', en: 'Foundation Layer' },
    title: { zh: '山野探索', en: 'Mountain & Forest Exploration' },
    subtitle: {
      zh: '暑期大自然探索与身心疗愈营',
      en: 'Nature Healing Program',
    },
    description: {
      zh: '带领陷入内卷与焦虑的同龄人回归山林，重新找回内在的生长动力。',
      en: 'Guiding peers caught in pressure and anxiety back into mountains and forests, so they can recover their inner drive to grow.',
    },
    image: {
      src: '/archive/elements/photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
      alt: {
        zh: '铁牛青年乡建实践营合影',
        en: 'Tieniu youth rural practice camp group photo',
      },
      position: 'center 45%',
    },
    icon: Mountain,
    details: [
      { zh: '老峨山与铁牛村山野路线', en: 'Mount Emei and Tieniu Village nature routes' },
      { zh: '泥土、树木、身体感知与安静书写', en: 'Soil, trees, body awareness, and quiet writing' },
      { zh: '以自然经验回应悬崖上那棵树般的生命处境', en: 'Using nature experience to respond to cliff-tree moments in youth life' },
    ],
  },
  {
    id: 'field-study',
    category: { zh: '行动类 2', en: 'Action 2' },
    level: { zh: '中间层', en: 'Middle Layer' },
    title: { zh: '田野调查', en: 'Field Study' },
    subtitle: {
      zh: '生态消费者的行为经济学调研',
      en: 'Behavioral Economics Field Study',
    },
    description: {
      zh: '我们正在访谈 15 个城乡家庭，研究价格弹性与信任机制如何影响人们对生态农产品的购买决策。',
      en: 'We are interviewing 15 urban and rural families to study how price elasticity and trust mechanisms affect decisions to buy ecological agricultural products.',
    },
    image: {
      src: '/archive/elements/graphics/branding/s25-campus-csa-eco-box-illustration.png',
      alt: {
        zh: '校园 CSA 生态盲盒视觉',
        en: 'Campus CSA eco-box visual',
      },
      position: 'center',
    },
    icon: ClipboardList,
    details: [
      { zh: '15 个城乡家庭深度访谈', en: 'In-depth interviews with 15 urban and rural families' },
      { zh: '价格弹性、信任机制与生态消费意愿', en: 'Price elasticity, trust mechanisms, and ecological purchase intent' },
      { zh: '把问卷、访谈与真实购买场景放在同一张研究地图里', en: 'Mapping questionnaires, interviews, and real purchasing scenes together' },
    ],
  },
  {
    id: 'youth-advocacy',
    category: { zh: '行动类 3', en: 'Action 3' },
    level: { zh: '应用层', en: 'Application Layer' },
    title: { zh: '城乡行动与山野互动', en: 'Urban-Rural Action & Nature Interaction' },
    subtitle: {
      zh: '乡村生态转型与青少年发声',
      en: 'Youth Advocacy',
    },
    description: {
      zh: '以阿柑少年 CSA 社群发展计划为核心，把校园、家庭、乡村和山野经验连接起来，让青少年成为乡村生态转型的研究者、传播者和行动者。',
      en: 'Centered on the R’gan Junior CSA community plan, this layer connects campus, family, village, and nature experiences so young people become researchers, communicators, and actors in rural ecological transition.',
    },
    image: {
      src: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
      alt: {
        zh: 'CTB 论坛团队展位',
        en: 'CTB forum team booth',
      },
      position: 'center 42%',
    },
    icon: Megaphone,
    details: [
      { zh: '阿柑少年 CSA 社群发展计划', en: 'R’gan Junior CSA community development plan' },
      { zh: '城市消费、乡村生产与青少年公共表达', en: 'Urban consumption, rural production, and youth public expression' },
      { zh: '保留 CTB 成果作为学术与社会影响力背书', en: 'Keeping CTB outcomes as academic and social-impact endorsement' },
    ],
  },
];

const impactProof = [
  {
    value: 'Top 3.6%',
    label: {
      zh: 'CTB 全球青年研究创新论坛',
      en: 'CTB Global Youth Research Forum',
    },
  },
  {
    value: 'Harvard',
    label: {
      zh: '全球英文论坛展示',
      en: 'Global English forum presentation',
    },
  },
  {
    value: 'YSA Journal',
    label: {
      zh: '研究成果发表',
      en: 'Research publication',
    },
  },
  {
    value: 'Claremont',
    label: {
      zh: '生态文明国际论坛发声',
      en: 'International eco-civilization forum voice',
    },
  },
];

export default function Actions() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <div className="pt-20">
      <section className="section-breathing">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Action', 'Action')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('行动', 'Action')}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {lang === 'zh'
                ? `${brandName}把田野活动与行动记录合并为一条清晰路径：先回到山野疗愈自己，再进入家庭消费研究，最后把研究转化为城乡行动与青少年发声。`
                : `${brandName} now gathers field activities and action records into one clear path: returning to nature for healing, studying family consumption, and turning research into urban-rural action and youth advocacy.`}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div data-page-motion="actions" className="space-y-12">
            {actionLayers.map((layer, index) => {
              const Icon = layer.icon;

              return (
                <article
                  key={layer.id}
                  className="grid gap-8 border-t border-border pt-10 md:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.64fr)] md:items-start md:gap-12"
                >
                  <div className="min-w-0">
                    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-primary/70">
                        {pickLocalized(layer.category, lang)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pickLocalized(layer.level, lang)}
                      </span>
                    </div>

                    <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
                      {pickLocalized(layer.title, lang)}
                    </h2>
                    <p className="mt-3 text-base font-medium text-primary md:text-lg">
                      {pickLocalized(layer.subtitle, lang)}
                    </p>
                    <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
                      {pickLocalized(layer.description, lang)}
                    </p>

                    <div className="mt-8 border-t border-border">
                      {layer.details.map((detail) => (
                        <p
                          key={detail.zh}
                          className="border-b border-border py-4 text-sm leading-7 text-foreground/88"
                        >
                          {pickLocalized(detail, lang)}
                        </p>
                      ))}
                    </div>
                  </div>

                  <figure className={index === 1 ? 'md:pt-8' : ''}>
                    <div className="overflow-hidden rounded-lg border border-border bg-secondary/35">
                      <div className="aspect-[4/3]">
                        <img
                          src={layer.image.src}
                          alt={pickLocalized(layer.image.alt, lang)}
                          className={`h-full w-full ${layer.id === 'field-study' ? 'object-contain p-6 md:p-8' : 'object-cover'}`}
                          style={{ objectPosition: layer.image.position }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <figcaption className="mt-3 text-xs leading-6 text-muted-foreground">
                      {pickLocalized(layer.image.alt, lang)}
                    </figcaption>
                  </figure>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Impact Proof', 'Impact Proof')}
              </p>
              <h2 className="mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('学术与社会影响力背书', 'Academic and Social Impact')}
              </h2>
              <p className="mt-6 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                {t(
                  '第三层行动不是重新开始，而是在既有 CTB 研究成果、国际论坛表达与校园 CSA 实验基础上继续生长。',
                  'The third layer is not a restart; it grows from existing CTB research outcomes, international forum sharing, and the campus CSA experiment.'
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {impactProof.map((item) => (
                <article key={item.value} className="rounded-lg border border-border bg-background p-5">
                  <p className="font-serif text-2xl text-primary md:text-3xl">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {pickLocalized(item.label, lang)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
