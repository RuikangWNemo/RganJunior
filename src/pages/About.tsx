import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import EditorialSectionNav from '@/components/ui/EditorialSectionNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import {
  ABOUT_CHAPTER_SELECT_EVENT,
  announceAboutChapter,
  isAboutChapterId,
  readAboutChapterHash,
  type AboutChapterId,
} from '@/lib/aboutNavigation';
import nateFounderPhoto from '@/assets/nate-founder.jpg';
import youthWritingPhoto from '@/assets/youth-writing.webp';

type LocalizedText = {
  zh: string;
  en: string;
};

type YouthPartner = {
  key: string;
  name: LocalizedText;
  identity?: LocalizedText;
  city?: LocalizedText;
  interests?: readonly LocalizedText[];
  role?: LocalizedText;
  portrait?: {
    src: string;
    alt: LocalizedText;
    width: number;
    height: number;
  };
  storyPath?: string;
};

const aboutChapters = [
  { id: 'team', zh: '我们的团队', en: 'Our Team' },
  { id: 'belief', zh: '我们相信', en: 'What We Believe' },
  { id: 'method', zh: '我们如何做', en: 'How We Work' },
  { id: 'places', zh: '真实场域', en: 'Living Labs' },
] as const;

const CHAPTER_SELECTION_LOCK_MS = 900;

// Add a profile only after the young person's identity and public information are confirmed.
// The collective introduction remains complete when this list is empty.
const youthPartners: readonly YouthPartner[] = [];

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
      en: "Use writing, film, drawing, and social media to document the stories unfolding within R'gan Junior.",
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
    imageSrc: '/images/home/belief-nature-teacher.webp',
    imageAlt: { zh: '青少年在山野中观察自然', en: 'Young people observing nature in the mountains' },
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
    imageSrc: '/images/home/belief-real-world-classroom.webp',
    imageAlt: { zh: '青少年在真实生活中共同实践', en: 'Young people learning together through real-life practice' },
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
        "At R'gan Junior, young people cook, drink tea, move, work, visit communities, observe orchards, and speak with farmers, families, and peers. Knowledge stops being only a concept in a book and begins to connect with land, consumption, family, community, and public life.",
      ],
    },
  },
  {
    number: '03',
    title: { zh: '青少年是正在发生的力量', en: 'Young People Are a Force Already in Motion' },
    imageSrc: '/images/home/belief-young-people-now.webp',
    imageAlt: { zh: '青少年伙伴在现场讨论与行动', en: 'Young partners discussing and taking action together' },
    body: {
      zh: [
        '青少年已经可以观察，可以提问，可以表达，也可以参与真实行动。在小队、任务和议题共创中，他们学习和别人合作，学习把一个想法说清楚，也学习面对一个真实问题时，自己可以承担什么。',
        '他们不需要一开始就很成熟，也不需要马上做出很大的改变。愿意走进现场，愿意认真感受，愿意提出问题，愿意做一点小事，力量就已经开始发生。',
        '阿柑少年希望陪伴他们，从观察者，慢慢成为表达者、研究者和行动者。',
      ],
      en: [
        'Young people can already observe, question, express themselves, and take part in real action. Through teams, missions, and shared inquiry, they learn to collaborate, articulate an idea, and decide what they can take responsibility for.',
        'They do not need to be fully mature at the beginning or make an enormous change immediately. Entering the scene, paying attention, asking a question, and doing one small thing are already the beginning of agency.',
        "R'gan Junior accompanies them as they grow from observers into communicators, researchers, and actors.",
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
  },
  {
    number: '02',
    title: { zh: '真实社区', en: 'Real Community' },
    examples: { zh: '铁牛村、麦昆塔社区、生态阿柑与社区伙伴', en: 'Tieniu Village, Maquinta, Ecological Rgan, and community partners' },
    body: {
      zh: '孩子走进正在发生的乡村生活，看见食物、土地、产业和人之间的真实连接。',
      en: 'Young people enter village life as it unfolds and see the real connections among food, land, livelihoods, and people.',
    },
  },
  {
    number: '03',
    title: { zh: '真实议题', en: 'Real Issues' },
    examples: { zh: '低碳生活、生态农业、家庭消费、公共责任', en: 'Low-carbon living, ecological agriculture, household consumption, and public responsibility' },
    body: {
      zh: '问题来自真实现场，也回到真实生活中被讨论、观察和回应。',
      en: 'Questions come from real places and return to everyday life to be discussed, observed, and answered.',
    },
  },
  {
    number: '04',
    title: { zh: '青少年主理', en: 'Youth-Led' },
    examples: { zh: '参与者、记录者、共创者', en: 'Participants, documentarians, and co-creators' },
    body: {
      zh: '他们在小队、任务和分享中提出问题、表达想法，也学习把一点点想法变成行动。',
      en: 'In teams, missions, and sharing, they raise questions, express ideas, and learn to turn a small thought into action.',
    },
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
      en: "Pujiang County, Chengdu · Where R'gan Junior first took root",
    },
    body: {
      zh: '这里是丘陵乡村，柑橘是主要农业产业。孩子们走进果园、农场、厨房、书房和社区日常，理解食物、土地、家庭消费、生态农业和真实生活之间的关系。',
      en: 'In this hilly village, citrus is the main agricultural livelihood. Young people enter orchards, farms, kitchens, studies, and community life to understand the relationships among food, land, household consumption, ecological agriculture, and everyday living.',
    },
    keywords: {
      zh: ['社区生活', '生态柑橘', '共同做饭', '田野观察', '公共议题'],
      en: ['Community life', 'Ecological citrus', 'Cooking together', 'Field observation', 'Public issues'],
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

function KeywordList({ words, label }: { words: readonly string[]; label: string }) {
  return (
    <ul className="about-v2-keywords" aria-label={label}>
      {words.map((word) => <li key={word}>{word}</li>)}
    </ul>
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
      <header className="about-v2-hero">
        <div className="about-v2-shell about-v2-hero__grid">
          <div className="about-v2-hero__copy">
            <p>{t('把成长放回真实生活里', 'Put growth back into real life')}</p>
            <h1 aria-label={t('关于阿柑少年', `About ${brandName}`)}>
              {lang === 'zh' ? (
                <>
                  关于
                  <span className="about-v2-hero__title-brand">阿柑少年</span>
                </>
              ) : (
                `About ${brandName}`
              )}
            </h1>
            <div>
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
            <figcaption>{t('铁牛村 · 阿柑少年的社区大本营', "Tieniu Village · R'gan Junior's community home base")}</figcaption>
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
            <ChapterHeader
              index="2.1"
              eyebrow={t('发起人与青年共创伙伴', 'Initiator & Youth Co-Creation Partners')}
              title={t('我们的团队', 'Our Team')}
              intro={t(
                '阿柑少年由 Nate 发起，在麦昆塔社区的支持下，和一群来自不同城市、拥有不同兴趣的青少年伙伴共同生长。我们希望青少年不只是活动的参与者，也能在真实项目中学习设计、组织、记录、表达和行动。',
                "Initiated by Nate and supported by the Maquinta community, R'gan Junior grows together with young partners from different cities and with different interests. Young people are not only participants; through real projects, they learn to design, organize, document, communicate, and act.",
              )}
            />

            <article className="about-v2-founder">
              <figure>
                <img
                  src={nateFounderPhoto}
                  alt={t('阿柑少年发起人 Nate 的肖像', "Portrait of Nate, initiator of R'gan Junior")}
                  width="1198"
                  height="1600"
                  loading="eager"
                />
              </figure>
              <div>
                <p className="about-v2-role">{t('Nate｜发起人', 'Nate | Initiator')}</p>
                <h3>{t('从个人成长，走向一群人的真实行动。', 'From personal growth to shared action in the real world.')}</h3>
                <p>
                  {t(
                    '阿柑少年最初从 Nate 在铁牛村的成长经历中长出来。',
                    "R'gan Junior first grew from Nate's own experience of growing up in Tieniu Village.",
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

            <article className="about-v2-youth-partners">
              <div className="about-v2-youth-partners__copy">
                <p className="about-v2-role">{t('青少年共创伙伴', 'Youth Co-Creation Partners')}</p>
                <h3>{t('一起继续往前走的青少年伙伴。', 'Young partners who keep moving forward together.')}</h3>
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
              <figure>
                <img
                  src={youthWritingPhoto}
                  alt={t('青少年伙伴围绕真实项目记录与共创', 'Young partners documenting and co-creating around a real project')}
                  width="1584"
                  height="1584"
                  loading="lazy"
                />
              </figure>
            </article>

            {youthPartners.length > 0 ? (
              <div className="about-v2-partner-roster" aria-label={t('青少年共创伙伴名录', 'Youth co-creation partner directory')}>
                {youthPartners.map((partner) => (
                  <article key={partner.key}>
                    {partner.portrait ? (
                      <img
                        src={partner.portrait.src}
                        alt={pickLocalized(partner.portrait.alt, lang)}
                        width={partner.portrait.width}
                        height={partner.portrait.height}
                        loading="lazy"
                      />
                    ) : null}
                    <h4>{pickLocalized(partner.name, lang)}</h4>
                    {partner.identity ? <p>{pickLocalized(partner.identity, lang)}</p> : null}
                    {partner.city ? <p>{pickLocalized(partner.city, lang)}</p> : null}
                    {partner.interests ? (
                      <KeywordList
                        words={partner.interests.map((interest) => pickLocalized(interest, lang))}
                        label={t('兴趣方向', 'Areas of interest')}
                      />
                    ) : null}
                    {partner.role ? <p>{pickLocalized(partner.role, lang)}</p> : null}
                    {partner.storyPath ? <Link to={partner.storyPath}>{t('阅读伙伴故事', 'Read partner story')}</Link> : null}
                  </article>
                ))}
              </div>
            ) : null}

            <article className="about-v2-adult-support">
              <p className="about-v2-role">{t('成人支持团队｜麦昆塔教育', 'Adult Support Team | Maquinta Education')}</p>
              <div>
                <h3>{t('让青少年站到前面，成人把真实世界托稳。', 'Young people step forward while adults hold the real-world foundation steady.')}</h3>
                <p>
                  {t(
                    '麦昆塔社区教育板块是阿柑少年的孵化与支持平台。成人团队提供真实场景、生活支持、安全保障、课程设计、家长沟通和运营托底，让青少年可以站到前面，在真实世界中学习合作、表达与承担。',
                    "Maquinta's community education practice incubates and supports R'gan Junior. The adult team provides real settings, daily-life support, safeguarding, program design, parent communication, and operational foundations so young people can step forward and learn collaboration, expression, and responsibility in the real world.",
                  )}
                </p>
              </div>
            </article>

            <section className="about-v2-directions" aria-labelledby="co-creation-directions-title">
              <header>
                <p>{t('从兴趣进入真实项目', 'Enter real projects through genuine interests')}</p>
                <h3 id="co-creation-directions-title">{t('青少年共创方向', 'Youth Co-Creation Directions')}</h3>
              </header>
              <div>
                {coCreationDirections.map((direction, index) => (
                  <article key={direction.title.zh}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h4>{pickLocalized(direction.title, lang)}</h4>
                    <p>{pickLocalized(direction.body, lang)}</p>
                  </article>
                ))}
              </div>
            </section>
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

            <div className="about-v2-beliefs">
              {beliefs.map((belief) => (
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
              ))}
            </div>
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
                "R'gan Junior puts growth back into real life. Young people feel through daily living, observe within communities, think through real issues, and learn responsibility through action.",
              )}
            />

            <div className="about-v2-methods">
              {methods.map((method) => (
                <article key={method.number}>
                  <div>
                    <span>{method.number}</span>
                    <h3>{pickLocalized(method.title, lang)}</h3>
                  </div>
                  <div>
                    <p className="about-v2-method__examples">{pickLocalized(method.examples, lang)}</p>
                    <p>{pickLocalized(method.body, lang)}</p>
                  </div>
                </article>
              ))}
            </div>
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
                "R'gan Junior is rooted in real places shaped by Maquinta's long-term community life and livelihood practices. These places are not activity backdrops; they are entry points into nature, food, work, local industry, and everyday life.",
              )}
            />

            <div className="about-v2-labs">
              <article className="about-v2-lab-feature">
                <figure>
                  <img
                    src="/images/s06-linpan-aerial-overview.jpg"
                    alt={t('铁牛村林盘、水系、果园与社区空间', 'Linpan landscape, waterways, orchards, and community spaces in Tieniu Village')}
                    width="2890"
                    height="2218"
                    loading="lazy"
                  />
                </figure>
                <div>
                  <p className="about-v2-lab__index">{places[0].number} / {pickLocalized(places[0].role, lang)}</p>
                  <h3>{pickLocalized(places[0].name, lang)}</h3>
                  <h4>{pickLocalized(places[0].subtitle, lang)}</h4>
                  <p className="about-v2-lab__location">{pickLocalized(places[0].location, lang)}</p>
                  <p>{pickLocalized(places[0].body, lang)}</p>
                  <KeywordList words={places[0].keywords[lang]} label={t('关键词', 'Keywords')} />
                  <Link className="about-v2-lab__story-link" to="/about/tieniu">
                    <span>{t('阅读铁牛村的故事', 'Read the Story of Tieniu Village')}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>

              <div className="about-v2-lab-grid">
                {places.slice(1).map((place) => (
                  <article key={place.key}>
                    <p className="about-v2-lab__index">{place.number} / {pickLocalized(place.role, lang)}</p>
                    <h3>{pickLocalized(place.name, lang)}</h3>
                    <h4>{pickLocalized(place.subtitle, lang)}</h4>
                    <p className="about-v2-lab__location">{pickLocalized(place.location, lang)}</p>
                    <p>{pickLocalized(place.body, lang)}</p>
                    <KeywordList words={place.keywords[lang]} label={t('关键词', 'Keywords')} />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
