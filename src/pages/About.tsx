import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import AboutManualCarousel from '@/components/about/AboutManualCarousel';
import AboutMethodPhotoReel from '@/components/about/AboutMethodPhotoReel';
import LivingLabCard from '@/components/about/LivingLabCard';
import ParentGuardianReel from '@/components/about/ParentGuardianReel';
import BrandWordmark from '@/components/BrandWordmark';
import EditorialSectionNav from '@/components/ui/EditorialSectionNav';
import { aboutMethodPhotoGroups } from '@/content/aboutMethodPhotos';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import {
  ABOUT_CHAPTER_SELECT_EVENT,
  announceAboutChapter,
  isAboutChapterId,
  readAboutChapterHash,
  type AboutChapterId,
} from '@/lib/aboutNavigation';
import aboutTeamPhoto from '@/assets/about-team-photo.jpg';
import nateFounderPhoto from '@/assets/about-team/nate-shi.webp';
import rossiePortrait from '@/assets/about-team/rossie-chen.webp';
import rubyPortrait from '@/assets/about-team/ruby-huang.webp';
import tianshiPortrait from '@/assets/about-team/zhang-tianshi.webp';

type LocalizedText = {
  zh: string;
  en: string;
};

type YouthPartner = {
  key: string;
  name: LocalizedText;
  identity: LocalizedText;
  headline: LocalizedText;
  bio: LocalizedText;
  portrait: {
    src: string;
    alt: LocalizedText;
    width: number;
    height: number;
  };
  storyPath: string;
};

const aboutChapters = [
  { id: 'team', zh: '我们的团队', en: 'Our Team' },
  { id: 'belief', zh: '我们相信', en: 'What We Believe' },
  { id: 'method', zh: '我们如何做', en: 'How We Work' },
  { id: 'places', zh: '真实场域', en: 'Living Labs' },
] as const;

const CHAPTER_SELECTION_LOCK_MS = 900;

const placeholderText = { zh: '？？？', en: '？？？' } as const;

const youthPartners: readonly YouthPartner[] = [
  {
    key: 'tianshi',
    name: { zh: '张天时', en: 'ZHANG Tianshi' },
    identity: placeholderText,
    headline: placeholderText,
    bio: placeholderText,
    portrait: {
      src: tianshiPortrait,
      alt: { zh: '张天时在室内茶席旁安静坐着', en: 'ZHANG Tianshi sitting quietly beside an indoor tea table' },
      width: 1350,
      height: 1800,
    },
    storyPath: '/voices/technology-ecology-stars',
  },
  {
    key: 'ruorong',
    name: { zh: '陈若容', en: 'Rossie Chen' },
    identity: placeholderText,
    headline: placeholderText,
    bio: placeholderText,
    portrait: {
      src: rossiePortrait,
      alt: { zh: '陈若容在雨中捧着茶杯', en: 'Rossie Chen holding a teacup in the rain' },
      width: 947,
      height: 1262,
    },
    storyPath: '/voices/tea-connects-an-american-girl',
  },
  {
    key: 'ruoyin',
    name: { zh: '黄若音', en: 'Ruby Huang' },
    identity: placeholderText,
    headline: placeholderText,
    bio: placeholderText,
    portrait: {
      src: rubyPortrait,
      alt: { zh: '黄若音在书房里拿着绣球花', en: 'Ruby Huang holding a hydrangea in a library' },
      width: 1157,
      height: 1543,
    },
    storyPath: '/voices/tea-kitchen-and-summer',
  },
];

const adultTeamPhotos = [
  '/images/about/adult-support/adult-support-01.webp',
  '/images/about/adult-support/adult-support-02.webp',
  '/images/about/adult-support/adult-support-05.webp',
  '/images/about/adult-support/adult-support-06.webp',
  '/images/about/adult-support/adult-support-07.webp',
  '/images/about/adult-support/adult-support-08.webp',
] as const;

const parentGuardianPhotos = [
  '/images/about/adult-support/adult-support-03.webp',
  '/images/about/adult-support/adult-support-04.webp',
  '/images/about/parent-guardian/parent-guardian-03.webp',
  '/images/about/parent-guardian/parent-guardian-04.webp',
  '/images/about/parent-guardian/parent-guardian-05.webp',
  '/images/about/parent-guardian/parent-guardian-06.webp',
  '/images/about/parent-guardian/parent-guardian-07.webp',
  '/images/about/parent-guardian/parent-guardian-08.webp',
  '/images/about/parent-guardian/parent-guardian-09.webp',
] as const;

const coCreationDirections = [
  {
    title: { zh: '项目与活动共创', en: 'Projects and Activities' },
    body: {
      zh: '参与生活体验营、生活共创营和小队任务的设计与现场支持。',
      en: 'Co-design life experience camps, co-creation camps, and team missions, and support them on site.',
    },
  },
  {
    title: { zh: '社群连接', en: 'Community Connection' },
    body: {
      zh: '维系营后伙伴关系，发起分享、打卡和同伴支持。',
      en: 'Sustain relationships after each camp through sharing, check-ins, and peer support.',
    },
  },
  {
    title: { zh: '记录与传播', en: 'Documentation and Communication' },
    body: {
      zh: '用文字、影像、绘画和社交媒体，记录阿柑少年真实发生的故事。',
      en: "Use writing, film, drawing, and social media to document the stories unfolding within R-Gan Junior.",
    },
  },
  {
    title: { zh: '田野研究', en: 'Field Research' },
    body: {
      zh: '围绕生态农业、家庭消费、可持续生活和公共议题开展观察、访谈与写作。',
      en: 'Observe, interview, and write about ecological agriculture, household consumption, sustainable living, and public issues.',
    },
  },
  {
    title: { zh: '生活体验设计', en: 'Life Experience Design' },
    body: {
      zh: '参与食物、茶、运动、空间、低碳生活和游戏化任务设计，让真实生活更有秩序、更有美感，也更容易参与。',
      en: 'Design experiences around food, tea, movement, space, low-carbon living, and playful missions so everyday life becomes more ordered, beautiful, and inviting.',
    },
  },
] as const;

const beliefs = [
  {
    number: '01',
    title: { zh: '自然是最好的老师', en: 'Nature Is the Best Teacher' },
    imageSrc: '/images/about/belief-nature-forest.webp',
    imageAlt: { zh: '青少年与伙伴在森林中观察树木', en: 'Young people and their companions observing trees in a forest' },
    body: {
      zh: [
        '森林、茶山和田野，会用自己的方式教孩子。一片叶子的纹理，一棵树的生长，一杯茶从采摘到入口的过程，一段山路上身体的呼吸和疲惫，都会让孩子重新打开观察、感受和敬畏。',
        '在自然中慢下来，身体会先知道答案。很多被城市节奏遮住的安静力量，也会慢慢回来。',
      ],
      en: [
        'Forests, tea mountains, and fields teach in their own way. The texture of a leaf, the growth of a tree, tea moving from harvest to cup, and the breath and fatigue of a mountain path reopen attention, feeling, and awe.',
        'When we slow down in nature, the body often knows first. Quiet strengths hidden by the pace of the city can gradually return.',
      ],
    },
  },
  {
    number: '02',
    title: { zh: '真实世界是最深刻的课堂', en: 'The Real World Is the Deepest Classroom' },
    imageSrc: '/images/about/belief-real-world-tea-harvest.webp',
    imageAlt: { zh: '青少年完成采茶实践后在茶厂合影', en: 'Young people gathering at a tea factory after harvesting tea' },
    prompt: {
      zh: '食物从哪里来？土地如何被照顾？一个社区如何一起生活？生态农业为什么重要，却又很难坚持？',
      en: 'Where does food come from? How is land cared for? How does a community live together? Why does ecological agriculture matter, yet remain so difficult to sustain?',
    },
    body: {
      zh: [
        '这些问题，需要在真实现场中被看见。',
        '在阿柑少年，孩子会做饭、喝茶、运动、劳作、走访社区、观察果园，也会和农人、家庭、伙伴交流。知识因此不再只是书本里的概念，而会和土地、消费、家庭、社区和公共议题发生关系。',
      ],
      en: [
        'These questions need to be encountered in real places.',
        "At R-Gan Junior, young people cook, drink tea, move, work, visit communities, observe orchards, and speak with farmers, families, and peers. Knowledge stops being only a concept in a book and begins to connect with land, consumption, family, community, and public life.",
      ],
    },
  },
  {
    number: '03',
    title: { zh: '青少年是正在发生的力量', en: 'Young People Are a Force Already in Motion' },
    imageSrc: '/images/about/belief-youth-tea-circle.webp',
    imageAlt: { zh: '青少年伙伴围坐进行茶会与交流', en: 'Young partners sitting in a circle for tea and conversation' },
    body: {
      zh: [
        '青少年已经可以观察，可以提问，可以表达，也可以参与真实行动。在小队、任务和议题共创中，他们学习和别人合作，学习把一个想法说清楚，也学习面对一个真实问题时，自己可以承担什么。',
        '他们不需要一开始就很成熟，也不需要马上做出很大的改变。愿意走进现场，愿意认真感受，愿意提出问题，愿意做一点小事，力量就已经开始发生。',
        '阿柑少年希望陪伴他们，从观察者，慢慢成为表达者、研究者和行动者。',
      ],
      en: [
        'Young people can already observe, question, express themselves, and take part in real action. Through teams, missions, and shared inquiry, they learn to collaborate, articulate an idea, and decide what they can take responsibility for.',
        'They do not need to be fully mature at the beginning or make an enormous change immediately. Entering the scene, paying attention, asking a question, and doing one small thing are already the beginning of agency.',
        "R-Gan Junior accompanies them as they grow from observers into communicators, researchers, and actors.",
      ],
    },
  },
] as const;

const methods = [
  {
    number: '01',
    title: { zh: '真实生活', en: 'Real Life' },
    examples: { zh: '做饭、喝茶、运动、自然观察、共同生活', en: 'Cooking, tea, movement, nature observation, and living together' },
    body: {
      zh: '从日常小事开始，重新感受身体、节奏、关系和照顾自己的能力。',
      en: 'Start with ordinary moments and rediscover the body, rhythm, relationships, and the ability to care for oneself.',
    },
    photos: aboutMethodPhotoGroups[0],
  },
  {
    number: '02',
    title: { zh: '真实社区', en: 'Real Community' },
    examples: { zh: '铁牛村、麦昆塔社区、生态阿柑与社区伙伴', en: 'Tieniu Village, Maquinta, Ecological Rgan, and community partners' },
    body: {
      zh: '孩子走进正在发生的乡村生活，看见食物、土地、产业和人之间的真实连接。',
      en: 'Young people enter village life as it unfolds and see the real connections among food, land, livelihoods, and people.',
    },
    photos: aboutMethodPhotoGroups[1],
  },
  {
    number: '03',
    title: { zh: '真实议题', en: 'Real Issues' },
    examples: { zh: '低碳生活、生态农业、家庭消费、公共责任', en: 'Low-carbon living, ecological agriculture, household consumption, and public responsibility' },
    body: {
      zh: '问题来自真实现场，也回到真实生活中被讨论、观察和回应。',
      en: 'Questions come from real places and return to everyday life to be discussed, observed, and answered.',
    },
    photos: aboutMethodPhotoGroups[2],
  },
  {
    number: '04',
    title: { zh: '青少年主理', en: 'Youth-Led' },
    examples: { zh: '参与者、记录者、共创者', en: 'Participants, documentarians, and co-creators' },
    body: {
      zh: '他们在小队、任务和分享中提出问题、表达想法，也学习把一点点想法变成行动。',
      en: 'In teams, missions, and sharing, they raise questions, express ideas, and learn to turn a small thought into action.',
    },
    photos: aboutMethodPhotoGroups[3],
  },
] as const;

const places = [
  {
    number: '01',
    key: 'tieniu',
    name: { zh: '铁牛村', en: 'Tieniu Village' },
    role: { zh: '社区大本营', en: 'Community Home Base' },
    subtitle: { zh: '从一颗柑橘，读懂真实生活的系统', en: 'Read the system of everyday life through one citrus fruit' },
    location: {
      zh: '成都蒲江县 · 阿柑少年最初长出来的地方',
      en: "Pujiang County, Chengdu · Where R-Gan Junior first took root",
    },
    body: {
      zh: '这里是丘陵乡村，柑橘是主要农业产业。孩子们走进果园、农场、厨房、书房和社区日常，理解食物、土地、家庭消费、生态农业和真实生活之间的关系。',
      en: 'In this hilly village, citrus is the main agricultural livelihood. Young people enter orchards, farms, kitchens, studies, and community life to understand the relationships among food, land, household consumption, ecological agriculture, and everyday living.',
    },
    keywords: {
      zh: ['社区生活', '生态柑橘', '共同做饭', '田野观察', '公共议题'],
      en: ['Community life', 'Ecological citrus', 'Cooking together', 'Field observation', 'Public issues'],
    },
    image: {
      src: '/images/s06-linpan-aerial-overview.jpg',
      alt: {
        zh: '铁牛村林盘、水系、果园与社区空间',
        en: 'Linpan landscape, waterways, orchards, and community spaces in Tieniu Village',
      },
      width: 2890,
      height: 2218,
    },
  },
  {
    number: '02',
    key: 'nanbaoshan',
    name: { zh: '南宝山', en: 'Nanbaoshan' },
    role: { zh: '森林与有机茶基地', en: 'Forest and Organic Tea Base' },
    subtitle: { zh: '在森林和茶山中，重新打开身体与感受', en: 'Reopen the body and senses among forests and tea mountains' },
    location: {
      zh: '龙门山脉 · 距离铁牛村约 1.5 小时车程',
      en: 'Longmen Mountains · About 1.5 hours from Tieniu Village',
    },
    body: {
      zh: '这是离社区最近的森林生态场域，也是麦昆塔社区的有机茶种植与生产基地之一。孩子们在这里徒步、采茶、制茶、夜茶，在山野中慢下来，重新感受空气、植物、身体和土地。',
      en: "This is the community's nearest forest ecology site and one of Maquinta's organic tea-growing and production bases. Young people hike, harvest and make tea, and gather for tea at night, slowing down to rediscover air, plants, body, and land.",
    },
    keywords: {
      zh: ['森林徒步', '有机茶', '采茶制茶', '自然观察', '身体打开'],
      en: ['Forest hiking', 'Organic tea', 'Tea making', 'Nature observation', 'Embodied awareness'],
    },
    image: {
      src: '/images/about/nanbaoshan-cloud-forest.webp',
      alt: {
        zh: '云雾在南宝山层叠的森林山脊间流动',
        en: 'Clouds drifting through the layered forest ridges of Nanbaoshan',
      },
      width: 1800,
      height: 1200,
    },
  },
  {
    number: '03',
    key: 'jinyuxi',
    name: { zh: '金鱼溪', en: 'Jinyuxi' },
    role: { zh: '茶森活社区', en: 'Tea–Forest–Life Community' },
    subtitle: { zh: '看见茶、森林与山地社区的连接', en: 'See how tea, forest, and mountain communities connect' },
    location: {
      zh: '泸州古蔺县 · 距离铁牛村约 5 小时车程',
      en: 'Gulin County, Luzhou · About 5 hours from Tieniu Village',
    },
    body: {
      zh: '周边连接黄荆老林自然保护区，也是麦昆塔社区的有机茶生产基地之一。这里提供更深入的山地生态与茶生活体验，让孩子看见一片茶园如何与森林、村落、自然保护和日常生活发生关系。',
      en: "Connected to the Huangjing Laolin Nature Reserve, this is also one of Maquinta's organic tea bases. It offers a deeper encounter with mountain ecology and tea life, showing how a tea garden relates to forest, village, conservation, and daily living.",
    },
    keywords: {
      zh: ['茶森活', '有机茶', '山地社区', '自然保护', '生活连接'],
      en: ['Tea–forest life', 'Organic tea', 'Mountain community', 'Conservation', 'Living connections'],
    },
    image: {
      src: '/images/about/jinyuxi-forest-valley.webp',
      alt: {
        zh: '阳光照进金鱼溪葱郁的峡谷森林',
        en: 'Sunlight entering the lush forest valley of Jinyuxi',
      },
      width: 1448,
      height: 1086,
    },
  },
  {
    number: '04',
    key: 'libo',
    name: { zh: '黎波黑茶部落', en: 'Libo Dark Tea Community' },
    role: { zh: '贡嘎雪山下的高原生态农业基地', en: 'Highland Ecological Agriculture Beneath Mount Gongga' },
    subtitle: { zh: '在更辽阔的山地世界里，理解长期实践', en: 'Understand long-term practice in a wider mountain world' },
    location: {
      zh: '甘孜州泸定县德威镇 · 海拔约 2100 米',
      en: 'Dewei, Luding County, Garzê · About 2,100 metres above sea level',
    },
    body: {
      zh: '这里靠近贡嘎雪山，正在进行高原有机农业种植示范。孩子们可以在雪山、村落、黑茶和高原农业之间，理解土地修复、地方产业和长期实践的不易。',
      en: 'Near Mount Gongga, this site is developing a highland organic agriculture demonstration. Among snow mountains, villages, dark tea, and plateau farming, young people encounter the difficulty and value of land repair, local livelihoods, and long-term practice.',
    },
    keywords: {
      zh: ['贡嘎雪山', '藏地文化', '高原农业', '土地修复', '长期实践'],
      en: ['Mount Gongga', 'Tibetan culture', 'Highland agriculture', 'Land repair', 'Long-term practice'],
    },
    image: {
      src: '/images/about/libo-highland.webp',
      alt: {
        zh: '贡嘎雪山晨光下的黎波村落与高原农田',
        en: 'Libo village and highland fields beneath the sunrise-lit Mount Gongga range',
      },
      width: 1448,
      height: 1086,
    },
  },
] as const;

function ChapterHeader({
  index,
  eyebrow,
  title,
  intro,
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="about-v2-section__header">
      <div className="about-v2-section__meta">
        <span>{index}</span>
        <p>{eyebrow}</p>
      </div>
      <h2>{title}</h2>
      <p>{intro}</p>
    </header>
  );
}

export default function About() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const brandName = pickLocalized(BRAND.name, lang);
  const chapterSelectionLockRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState<AboutChapterId>(
    () => readAboutChapterHash(location.hash) ?? 'team',
  );
  const [activeMethodIndex, setActiveMethodIndex] = useState(0);

  const handleMethodCycleComplete = useCallback((completedMethodIndex: number) => {
    setActiveMethodIndex((currentIndex) => (
      currentIndex === completedMethodIndex
        ? (currentIndex + 1) % methods.length
        : currentIndex
    ));
  }, []);

  const scrollToChapter = useCallback((chapterId: AboutChapterId) => {
    chapterSelectionLockRef.current = Date.now() + CHAPTER_SELECTION_LOCK_MS;
    setActiveChapter(chapterId);
    document.getElementById(chapterId)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [reducedMotion]);

  useEffect(() => {
    const requestedId = readAboutChapterHash(location.hash);
    if (requestedId) scrollToChapter(requestedId);
  }, [location.hash, scrollToChapter]);

  useEffect(() => {
    const handleChapterRequest = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isAboutChapterId(event.detail)) return;
      scrollToChapter(event.detail);
    };

    window.addEventListener(ABOUT_CHAPTER_SELECT_EVENT, handleChapterRequest);
    return () => window.removeEventListener(ABOUT_CHAPTER_SELECT_EVENT, handleChapterRequest);
  }, [scrollToChapter]);

  useEffect(() => {
    announceAboutChapter(activeChapter);
  }, [activeChapter]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-about-chapter-section]'),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < chapterSelectionLockRef.current) return;
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const chapterId = visibleEntry?.target.getAttribute('data-about-chapter-section');
        if (chapterId && isAboutChapterId(chapterId)) setActiveChapter(chapterId);
      },
      { rootMargin: '-22% 0px -68% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleChapterSelect = useCallback((chapterId: AboutChapterId) => {
    chapterSelectionLockRef.current = Date.now() + CHAPTER_SELECTION_LOCK_MS;
    setActiveChapter(chapterId);
  }, []);

  return (
    <div className="about-v2-page pt-20">
      <header className="about-v2-hero about-v2-hero--full-bleed">
        <div className="about-v2-shell about-v2-hero__grid">
          <div className="about-v2-hero__copy">
            <p>{t('把成长放回真实生活里', 'Put growth back into real life')}</p>
            <h1 aria-label={t('关于阿柑少年', `About ${brandName}`)}>
              <span className="about-v2-hero__title-about">{t('关于', 'About')}</span>
              <span className="about-v2-hero__title-brand">
                <BrandWordmark
                  language={lang}
                  aria-hidden="true"
                  className="about-v2-hero__title-wordmark"
                />
              </span>
            </h1>
            <div className="about-v2-hero__lead">
              {t(
                '真正的成长发生在很多地方。在森林、茶山、饭桌、厨房、果园和运动场上，也在人与人的真实相处中。',
                'Real growth happens in many places: forests, tea mountains, dining tables, kitchens, orchards, sports fields, and honest relationships.',
              )}
            </div>
          </div>

          <figure className="about-v2-hero__figure">
            <img
              src="/images/s06-linpan-aerial-overview.jpg"
              alt={t('铁牛村林盘、果园、鱼塘与院落的航拍图', 'Aerial view of Tieniu Village, orchards, ponds, and homes')}
              width="2890"
              height="2218"
              loading="eager"
            />
            <figcaption>{t('铁牛村 · 阿柑少年的社区大本营', "Tieniu Village · R-Gan Junior's community home base")}</figcaption>
          </figure>
        </div>
      </header>

      <EditorialSectionNav
        activeId={activeChapter}
        ariaLabel={t('关于页面章节', 'About page chapters')}
        indicatorLayoutId="about-section-active"
        items={aboutChapters.map((chapter) => ({
          id: chapter.id,
          href: `/about#${chapter.id}`,
          label: lang === 'zh' ? chapter.zh : chapter.en,
        }))}
        onSelect={handleChapterSelect}
      />

      <main>
        <section id="team" className="about-v2-section about-v2-team" data-about-chapter-section="team">
          <div className="about-v2-shell">
            <div className="about-v2-team__intro">
              <ChapterHeader
                index="2.1"
                eyebrow={t('发起人与青年共创伙伴', 'Initiator & Youth Co-Creation Partners')}
                title={t('我们的团队', 'Our Team')}
                intro={t(
                  '阿柑少年由 Nate 发起，在麦昆塔社区的支持下，和一群来自不同城市、拥有不同兴趣的青少年伙伴共同生长。我们希望青少年不只是活动的参与者，也能在真实项目中学习设计、组织、记录、表达和行动。',
                  "Initiated by Nate and supported by the Maquinta community, R-Gan Junior grows together with young partners from different cities and with different interests. Young people are not only participants; through real projects, they learn to design, organize, document, communicate, and act.",
                )}
              />

              <figure className="about-v2-team__intro-figure">
                <img
                  src={aboutTeamPhoto}
                  alt={t('阿柑少年青少年共创伙伴围坐桌边', 'R-Gan Junior youth co-creation partners gathered around a table')}
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>

            <div className="about-v2-team-groups">
              <section className="about-v2-team-group" aria-labelledby="team-initiator-title">
                <header className="about-v2-team-group__header">
                  <span aria-hidden="true">01</span>
                  <h3 id="team-initiator-title">{t('发起人', 'Initiator')}</h3>
                </header>

                <article className="about-v2-founder">
                  <figure>
                    <img
                      src={nateFounderPhoto}
                      alt={t('阿柑少年发起人 Nate 在书房里静坐', "R-Gan Junior initiator Nate Shi sitting quietly in a library")}
                      width="1350"
                      height="1800"
                      loading="eager"
                    />
                  </figure>
                  <div>
                    <p className="about-v2-role">{t('Nate｜发起人', 'Nate Shi | Initiator')}</p>
                    <h4>{t('从个人成长，走向一群人的真实行动。', 'From personal growth to shared action in the real world.')}</h4>
                    <p>
                      {t(
                        '阿柑少年最初从 Nate 在铁牛村的成长经历中长出来。',
                        "R-Gan Junior first grew from Nate's own experience of growing up in Tieniu Village.",
                      )}
                    </p>
                    <p className="about-v2-founder__story">
                      {t(
                        '从邀请朋友来村里玩，到组织同学调研生态农业、参与公共议题，再到发起生活共创营，他逐渐把自己的个人成长，发展成一个连接青少年、家庭、土地和真实世界的行动计划。',
                        'From inviting friends to the village, to organizing ecological-agriculture research and engaging with public issues, and then initiating life co-creation camps, he gradually developed his personal growth into an action plan connecting young people, families, land, and the real world.',
                      )}
                    </p>
                    <Link to="/story">
                      <span>{t('阅读 Nate 的发起人故事', "Read Nate's story")}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </section>

              <section className="about-v2-team-group" aria-labelledby="team-youth-title">
                <header className="about-v2-team-group__header">
                  <span aria-hidden="true">02</span>
                  <h3 id="team-youth-title">{t('青少年共创伙伴', 'Youth Co-Creation Partners')}</h3>
                </header>

                <article className="about-v2-youth-partners">
                  <div className="about-v2-youth-partners__copy">
                    <h4>{t('一起继续往前走的青少年伙伴。', 'Young partners who keep moving forward together.')}</h4>
                    <p>
                      {t(
                        '他们来自不同城市，有人关注科技，有人喜欢艺术、运动、人文、传播或社会议题。他们在各自感兴趣的方向上参与项目设计、活动支持、内容记录、社群连接和后续行动。',
                        'They come from different cities. Some care about technology; others are drawn to art, sport, the humanities, communication, or social issues. They contribute to project design, activity support, documentation, community connection, and follow-through in the directions that matter to them.',
                      )}
                    </p>
                    <p className="about-v2-youth-partners__note">
                      {t(
                        '伙伴档案将在身份与公开信息确认后持续补充。',
                        'Partner profiles will grow as identities and public information are confirmed.',
                      )}
                    </p>
                  </div>
                </article>

                <div className="about-v2-partner-roster" aria-label={t('青少年共创伙伴名录', 'Youth co-creation partner directory')}>
                  {youthPartners.map((partner) => (
                    <article key={partner.key} aria-labelledby={`about-partner-${partner.key}`}>
                      <figure>
                        <img
                          src={partner.portrait.src}
                          alt={pickLocalized(partner.portrait.alt, lang)}
                          width={partner.portrait.width}
                          height={partner.portrait.height}
                          loading="lazy"
                        />
                      </figure>
                      <div className="about-v2-partner-roster__copy">
                        <p className="about-v2-partner-roster__identity">{pickLocalized(partner.identity, lang)}</p>
                        <h4 id={`about-partner-${partner.key}`}>{pickLocalized(partner.name, lang)}</h4>
                        <h5>{pickLocalized(partner.headline, lang)}</h5>
                        <p className="about-v2-partner-roster__bio">{pickLocalized(partner.bio, lang)}</p>
                        <Link to={partner.storyPath}>
                          <span>{t('阅读伙伴故事', 'Read partner story')}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="about-v2-directions" aria-labelledby="co-creation-directions-title">
                <header>
                  <p>{t('从兴趣进入真实项目', 'Enter real projects through genuine interests')}</p>
                  <h3 id="co-creation-directions-title">{t('青少年共创方向', 'Youth Co-Creation Directions')}</h3>
                </header>
                <AboutManualCarousel
                  items={coCreationDirections}
                  className="about-v2-directions__carousel"
                  ariaLabel={t('青少年共创方向轮播', 'Youth co-creation directions carousel')}
                  navigationLabel={t('选择共创方向', 'Choose a co-creation direction')}
                  previousLabel={t('上一个共创方向', 'Previous co-creation direction')}
                  nextLabel={t('下一个共创方向', 'Next co-creation direction')}
                  getItemLabel={(direction) => pickLocalized(direction.title, lang)}
                  getSelectLabel={(direction) => t(
                    `查看${direction.title.zh}`,
                    `View ${direction.title.en}`,
                  )}
                  renderSlide={(direction, index) => (
                    <article key={direction.title.zh}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h4>{pickLocalized(direction.title, lang)}</h4>
                      <p>{pickLocalized(direction.body, lang)}</p>
                    </article>
                  )}
                />
              </section>

              <section className="about-v2-team-group" aria-labelledby="team-adult-title">
                <header className="about-v2-team-group__header">
                  <span aria-hidden="true">03</span>
                  <h3 id="team-adult-title">{t('成人支持团队｜麦昆塔教育', 'Adult Support Team | Maquinta Education')}</h3>
                </header>

                <article className="about-v2-adult-support">
                  <div>
                    <h4>{t('让青少年站到前面，成人把真实世界托稳。', 'Young people step forward while adults hold the real-world foundation steady.')}</h4>
                    <p>
                      {t(
                        '麦昆塔社区教育板块是阿柑少年的孵化与支持平台。成人团队提供真实场景、生活支持、安全保障、课程设计、家长沟通和运营托底，让青少年可以站到前面，在真实世界中学习合作、表达与承担。',
                        "Maquinta's community education practice incubates and supports R-Gan Junior. The adult team provides real settings, daily-life support, safeguarding, program design, parent communication, and operational foundations so young people can step forward and learn collaboration, expression, and responsibility in the real world.",
                      )}
                    </p>
                  </div>
                </article>

                <div className="about-v2-adult-roster" aria-label={t('成人支持团队成员名录', 'Adult support team member directory')}>
                  {adultTeamPhotos.map((photo, index) => (
                    <article
                      key={photo}
                      aria-label={t(
                        `成人支持团队成员 ${index + 1} 档案`,
                        `Adult support team member ${index + 1} profile`,
                      )}
                    >
                      <figure>
                        <img
                          src={photo}
                          alt={t(
                            `成人支持团队成员 ${index + 1}`,
                            `Adult support team member ${index + 1}`,
                          )}
                          width="1067"
                          height="1600"
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>
                      <div>
                        <h4>？？？</h4>
                        <p>？？？</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="about-v2-team-group" aria-labelledby="team-parent-guardian-title">
                <header className="about-v2-team-group__header">
                  <span aria-hidden="true">04</span>
                  <h3 id="team-parent-guardian-title">{t('家长守护团', 'Parent Guardian Circle')}</h3>
                </header>

                <article className="about-v2-adult-support about-v2-parent-guardian-support">
                  <div>
                    <h4>{t('参与共创，也支持每一次活动真实发生。', 'Co-create with us and help every activity take shape.')}</h4>
                    <p>
                      {t(
                        '家长守护团欢迎认同阿柑少年理念的家长加入。家长可以参与项目与内容共创，也可以在活动筹备、现场支持、家庭连接和安全陪伴中贡献经验与力量，和青少年、成人团队一起把真实行动托稳。',
                        'The Parent Guardian Circle welcomes families who share the values of R-Gan Junior. Parents can co-create projects and content, contribute to activity preparation and on-site support, strengthen family connections, and help provide safe companionship alongside young people and the adult team.',
                      )}
                    </p>
                  </div>
                </article>

                <ParentGuardianReel photos={parentGuardianPhotos} />
              </section>
            </div>
          </div>
        </section>

        <section id="belief" className="about-v2-section about-v2-belief" data-about-chapter-section="belief">
          <div className="about-v2-shell">
            <ChapterHeader
              index="2.2"
              eyebrow={t('真正的成长发生在很多地方', 'Growth Happens in Many Places')}
              title={t('我们相信这些简单的事', 'What We Believe')}
              intro={t(
                '我们希望青少年走进自然、生活和社区，重新感受自己的身体，认识食物与土地，也在真实问题中练习观察、表达、合作和行动。',
                'We invite young people into nature, everyday life, and community—to feel their bodies again, understand food and land, and practise observation, expression, collaboration, and action through real questions.',
              )}
            />

            <AboutManualCarousel
              items={beliefs}
              className="about-v2-beliefs"
              ariaLabel={t('我们相信的事轮播', 'What we believe carousel')}
              navigationLabel={t('选择一条信念', 'Choose a belief')}
              previousLabel={t('上一条信念', 'Previous belief')}
              nextLabel={t('下一条信念', 'Next belief')}
              getItemLabel={(belief) => pickLocalized(belief.title, lang)}
              getSelectLabel={(belief) => t(`查看${belief.title.zh}`, `View ${belief.title.en}`)}
              renderSlide={(belief) => (
                <article key={belief.number}>
                  <figure>
                    <img
                      src={belief.imageSrc}
                      alt={pickLocalized(belief.imageAlt, lang)}
                      width="560"
                      height="420"
                      loading="lazy"
                    />
                  </figure>
                  <div>
                    <span>{belief.number}</span>
                    <h3>{pickLocalized(belief.title, lang)}</h3>
                    {'prompt' in belief ? <p className="about-v2-belief__prompt">{pickLocalized(belief.prompt, lang)}</p> : null}
                    {belief.body[lang].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </article>
              )}
            />
          </div>
        </section>

        <section id="method" className="about-v2-section about-v2-method" data-about-chapter-section="method">
          <div className="about-v2-shell">
            <ChapterHeader
              index="2.3"
              eyebrow={t('四个真实', 'Four Realities')}
              title={t('我们如何做', 'How We Work')}
              intro={t(
                '阿柑少年把成长放回真实生活中。孩子们在生活里感受，在社区里观察，在议题中思考，也在行动中学习承担。',
                "R-Gan Junior puts growth back into real life. Young people feel through daily living, observe within communities, think through real issues, and learn responsibility through action.",
              )}
            />

            <AboutManualCarousel
              items={methods}
              className="about-v2-methods"
              activeIndex={activeMethodIndex}
              onActiveIndexChange={setActiveMethodIndex}
              ariaLabel={t('我们如何做轮播', 'How we work carousel')}
              navigationLabel={t('选择一种实践方式', 'Choose a way of working')}
              previousLabel={t('上一个实践方式', 'Previous way of working')}
              nextLabel={t('下一个实践方式', 'Next way of working')}
              getItemLabel={(method) => pickLocalized(method.title, lang)}
              getSelectLabel={(method) => t(`查看${method.title.zh}`, `View ${method.title.en}`)}
              renderSlide={(method, methodIndex, active) => (
                <article key={method.number}>
                  <AboutMethodPhotoReel
                    photos={method.photos}
                    title={method.title}
                    methodIndex={methodIndex}
                    active={active}
                    onCycleComplete={handleMethodCycleComplete}
                  />
                  <div className="about-v2-method__copy">
                    <div>
                      <span>{method.number}</span>
                      <h3>{pickLocalized(method.title, lang)}</h3>
                    </div>
                    <div>
                      <p className="about-v2-method__examples">{pickLocalized(method.examples, lang)}</p>
                      <p>{pickLocalized(method.body, lang)}</p>
                    </div>
                  </div>
                </article>
              )}
            />
          </div>
        </section>

        <section id="places" className="about-v2-section about-v2-places" data-about-chapter-section="places">
          <div className="about-v2-shell">
            <ChapterHeader
              index="2.4"
              eyebrow={t('一座社区大本营，三片生态试验田', 'One Community Home Base, Three Ecological Field Sites')}
              title={t('我们的真实场域', 'Our Living Labs')}
              intro={t(
                '阿柑少年的成长，扎根于麦昆塔社区长期生活与产业实践形成的真实场域。这些地方不是活动背景，而是孩子走进自然、食物、劳动、产业和真实生活的入口。',
                "R-Gan Junior is rooted in real places shaped by Maquinta's long-term community life and livelihood practices. These places are not activity backdrops; they are entry points into nature, food, work, local industry, and everyday life.",
              )}
            />

            <div className="about-v2-labs">
              <LivingLabCard
                number={places[0].number}
                role={pickLocalized(places[0].role, lang)}
                name={pickLocalized(places[0].name, lang)}
                subtitle={pickLocalized(places[0].subtitle, lang)}
                location={pickLocalized(places[0].location, lang)}
                body={pickLocalized(places[0].body, lang)}
                keywords={places[0].keywords[lang]}
                keywordsLabel={t('关键词', 'Keywords')}
                image={{
                  ...places[0].image,
                  alt: pickLocalized(places[0].image.alt, lang),
                }}
                variant="featured"
                storyLink={{
                  to: '/about/tieniu',
                  label: t('阅读铁牛村的故事', 'Read the Story of Tieniu Village'),
                }}
              />

              <AboutManualCarousel
                items={places.slice(1)}
                className="about-v2-lab-grid"
                ariaLabel={t('三个生态基地轮播', 'Three ecological field sites carousel')}
                navigationLabel={t('选择一个生态基地', 'Choose an ecological field site')}
                previousLabel={t('上一个生态基地', 'Previous ecological field site')}
                nextLabel={t('下一个生态基地', 'Next ecological field site')}
                getItemLabel={(place) => pickLocalized(place.name, lang)}
                getSelectLabel={(place) => t(`查看${place.name.zh}`, `View ${place.name.en}`)}
                renderSlide={(place) => (
                  <LivingLabCard
                    key={place.key}
                    number={place.number}
                    role={pickLocalized(place.role, lang)}
                    name={pickLocalized(place.name, lang)}
                    subtitle={pickLocalized(place.subtitle, lang)}
                    location={pickLocalized(place.location, lang)}
                    body={pickLocalized(place.body, lang)}
                    keywords={place.keywords[lang]}
                    keywordsLabel={t('关键词', 'Keywords')}
                    image={{
                      ...place.image,
                      alt: pickLocalized(place.image.alt, lang),
                    }}
                  />
                )}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
