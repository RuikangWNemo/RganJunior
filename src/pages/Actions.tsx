import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized, type LocalizedText } from '@/lib/brand';

type ActivityMedia = {
  src: string;
  alt: LocalizedText;
  caption: LocalizedText;
  fit?: 'cover' | 'contain';
  rotateClockwise?: boolean;
  position?: string;
};

type ActivityRecord = {
  id: string;
  date: string;
  dateTime: string;
  title: LocalizedText;
  description: LocalizedText;
  media: ActivityMedia[];
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

const activityRecords: ActivityRecord[] = [
  {
    id: 'campus-csa',
    date: '2025.12',
    dateTime: '2025-12',
    title: text('天立国高 × 阿柑少年校园 CSA', "Tianli × R'gan Junior Campus CSA"),
    description: text(
      '在天立国高启动校园 CSA，把生态农产品销售作为行为经济学实地实验。',
      'Launched a campus CSA at Tianli, using ecological produce sales as a behavioral economics field experiment.',
    ),
    media: [
      {
        src: '/archive/elements/graphics/branding/s25-campus-csa-eco-box-illustration.png',
        alt: text('校园 CSA 生态盒项目资料', 'Campus CSA eco-box project material'),
        caption: text('校园 CSA 项目资料', 'Campus CSA project material'),
        fit: 'contain',
      },
    ],
  },
  {
    id: 'art-education-visit',
    date: '2025.09',
    dateTime: '2025-09',
    title: text('中山旗迹艺术中心参访', 'Zhongshan Qiji Art Center Visit'),
    description: text(
      '接待中山旗迹艺术中心参访团，围绕乡村美育开展交流。',
      'Hosted a delegation from Zhongshan Qiji Art Center for an exchange on rural arts education.',
    ),
    media: [
      {
        src: '/archive/elements/photos/program-activities/s23-art-education-delegation-visit.jpg',
        alt: text('美育教育参访团交流现场', 'Art education delegation exchange'),
        caption: text('参访交流', 'Delegation exchange'),
      },
    ],
  },
  {
    id: 'tieniu-rural-camp',
    date: '2025.07',
    dateTime: '2025-07',
    title: text('铁牛青年乡建实践营', 'Tieniu Youth Rural Practice Camp'),
    description: text(
      '参加实践营，参与青年乡村建设。',
      'Joined the practice camp and took part in youth-led rural development.',
    ),
    media: [
      {
        src: '/archive/elements/photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
        alt: text('铁牛青年乡建实践营合影', 'Tieniu youth rural practice camp group photo'),
        caption: text('实践营合影', 'Practice camp group photo'),
      },
    ],
  },
  {
    id: 'yale-visit',
    date: '2025.04',
    dateTime: '2025-04',
    title: text('耶鲁大学教授来访', 'Yale Faculty Visit'),
    description: text(
      '接待耶鲁大学教授，开展现场参访与交流。',
      'Hosted a visiting Yale professor for an on-site visit and exchange.',
    ),
    media: [
      {
        src: '/archive/elements/photos/program-activities/s22-yale-professor-visit-casual.jpg',
        alt: text('耶鲁大学教授来访交流现场', 'Yale faculty visit exchange'),
        caption: text('来访交流', 'Visit and exchange'),
        rotateClockwise: true,
      },
      {
        src: '/archive/elements/photos/program-activities/s22-yale-professor-visit-portrait.jpg',
        alt: text('耶鲁大学教授来访合影', 'Yale faculty visit group photo'),
        caption: text('来访合影', 'Visit group photo'),
        rotateClockwise: true,
      },
    ],
  },
  {
    id: 'regenerative-design-camp',
    date: '2024.05',
    dateTime: '2024-05',
    title: text('再生设计国际生态营', 'Regenerative Design Eco Camp'),
    description: text(
      '学习再生设计理念与实践方法。',
      'Studied regenerative design methods through hands-on practice.',
    ),
    media: [
      {
        src: '/archive/elements/photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
        alt: text('再生设计国际生态营合影', 'Regenerative design eco camp group photo'),
        caption: text('生态营合影', 'Eco camp group photo'),
      },
    ],
  },
  {
    id: 'claremont-forum',
    date: '2024.05',
    dateTime: '2024-05',
    title: text('克莱蒙生态文明国际论坛', 'Claremont Eco-Civilization Forum'),
    description: text(
      '与中、美、加三地同学线上分享生态文明建设经验。',
      'Shared ecological practice online with students from China, the United States, and Canada.',
    ),
    media: [
      {
        src: '/archive/elements/graphics/publications/s18-claremont-online-forum-screenshot.png',
        alt: text('克莱蒙生态文明国际论坛线上交流截图', 'Claremont forum online session'),
        caption: text('线上论坛', 'Online forum'),
        fit: 'contain',
      },
      {
        src: '/archive/elements/graphics/publications/s18-claremont-forum-poster.png',
        alt: text('克莱蒙生态文明国际论坛海报', 'Claremont forum poster'),
        caption: text('论坛资料', 'Forum material'),
        fit: 'contain',
      },
    ],
  },
  {
    id: 'ctb-research-forum',
    date: '2023.09—2024.02',
    dateTime: '2024-02',
    title: text('可持续农业研究与 CTB 论坛', 'Sustainable Agriculture Research and CTB Forum'),
    description: text(
      '根据问卷结果设计农业活动，28 名学生及家长参与；研究成果随后在哈佛 CTB 全球英文论坛展示。',
      'Designed an agriculture activity from survey findings for 28 students and parents, then presented the research at the CTB Global Forum at Harvard.',
    ),
    media: [
      {
        src: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
        alt: text('CTB 论坛团队展位', 'CTB forum team booth'),
        caption: text('团队展位', 'Team booth'),
      },
      {
        src: '/archive/elements/photos/academic-forum/s16-ctb-poster-presentation.jpg',
        alt: text('CTB 论坛海报展示', 'CTB forum poster presentation'),
        caption: text('海报展示', 'Poster presentation'),
      },
      {
        src: '/archive/elements/photos/academic-forum/s16-ctb-forum-conversation.jpg',
        alt: text('CTB 论坛交流现场', 'CTB forum conversation'),
        caption: text('现场交流', 'Forum exchange'),
      },
      {
        src: '/archive/elements/photos/academic-forum/s16-ctb-award-medal.jpg',
        alt: text('CTB 论坛奖牌记录', 'CTB forum medal record'),
        caption: text('奖牌记录', 'Medal record'),
        position: 'center 44%',
      },
    ],
  },
  {
    id: 'rgan-junior-one',
    date: '2023.02—06',
    dateTime: '2023-02',
    title: text('阿柑少年 1.0 系列活动', "R'gan Junior 1.0 Activities"),
    description: text(
      '开展舞台展示、果园田野实践、手作工作坊和社区清洁服务。',
      'Held a stage presentation, orchard field practice, a hands-on workshop, and a community cleanup.',
    ),
    media: [
      {
        src: '/archive/elements/photos/program-activities/s11-stage-performance.jpg',
        alt: text('阿柑少年舞台展示', "R'gan Junior stage presentation"),
        caption: text('舞台展示', 'Stage presentation'),
      },
      {
        src: '/archive/elements/photos/program-activities/s11-orchard-field-practice.jpg',
        alt: text('阿柑少年果园田野实践', "R'gan Junior orchard field practice"),
        caption: text('果园田野实践', 'Orchard field practice'),
      },
      {
        src: '/archive/elements/photos/program-activities/s11-hands-on-making-workshop.jpg',
        alt: text('阿柑少年手作工作坊', "R'gan Junior hands-on workshop"),
        caption: text('手作工作坊', 'Hands-on workshop'),
      },
      {
        src: '/archive/elements/photos/program-activities/s11-community-service-cleanup.jpg',
        alt: text('阿柑少年社区清洁服务', "R'gan Junior community cleanup"),
        caption: text('社区清洁服务', 'Community cleanup'),
      },
    ],
  },
];

function ActivityGallery({ activity, index }: { activity: ActivityRecord; index: number }) {
  const { lang } = useLanguage();
  const hasMultipleImages = activity.media.length > 1;

  return (
    <div className={`grid min-w-0 gap-3 ${hasMultipleImages ? 'sm:grid-cols-2' : ''}`}>
      {activity.media.map((media, mediaIndex) => (
        <figure key={media.src} className="min-w-0">
          <div
            className={`relative overflow-hidden border border-border bg-secondary/35 ${
              media.rotateClockwise ? 'aspect-[3/4]' : 'aspect-[4/3]'
            }`}
          >
            <img
              src={media.src}
              alt={pickLocalized(media.alt, lang)}
              className={
                media.rotateClockwise
                  ? 'absolute left-1/2 top-1/2 h-auto w-[133.34%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90'
                  : `h-full w-full ${media.fit === 'contain' ? 'object-contain p-4 sm:p-6' : 'object-cover'}`
              }
              style={{ objectPosition: media.position }}
              loading={index === 0 && mediaIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
          <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">
            {pickLocalized(media.caption, lang)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ActivityRecordRow({ activity, index }: { activity: ActivityRecord; index: number }) {
  const { lang } = useLanguage();

  return (
    <article
      id={activity.id}
      className="grid min-w-0 gap-7 border-t border-border py-10 md:py-14 lg:grid-cols-[8.5rem_minmax(0,19rem)_minmax(0,1fr)] lg:gap-10"
    >
      <time
        dateTime={activity.dateTime}
        className="font-serif text-lg tabular-nums text-primary md:text-xl"
      >
        {activity.date}
      </time>

      <div className="min-w-0 lg:pr-4">
        <h2 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">
          {pickLocalized(activity.title, lang)}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {pickLocalized(activity.description, lang)}
        </p>
      </div>

      <ActivityGallery activity={activity} index={index} />
    </article>
  );
}

export default function Actions() {
  const { t } = useLanguage();

  return (
    <main className="actions-page overflow-x-hidden pt-20">
      <header className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <p className="text-xs tracking-[0.16em] text-primary/70">
          {t('行动 / ACTIONS', 'ACTIONS / 行动')}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            {t('我们做过的事', 'What We Have Done')}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">
            {t('真实活动记录，按时间倒序。', 'Real activity records, newest first.')}
          </p>
        </div>
      </header>

      <section
        aria-label={t('活动档案', 'Activity archive')}
        className="container mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28 lg:px-8"
      >
        {activityRecords.map((activity, index) => (
          <ActivityRecordRow key={activity.id} activity={activity} index={index} />
        ))}
      </section>
    </main>
  );
}
