import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
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
import TieniuStoryMap from '@/components/about/TieniuStoryMap';
import TieniuRegenerationStory from '@/components/about/TieniuRegenerationStory';

const aboutChapters = [
  { id: 'mission', zh: '理念', en: 'Philosophy' },
  { id: 'story', zh: '故事', en: 'Story' },
  { id: 'team', zh: '团队', en: 'Team' },
] as const;

const CHAPTER_SELECTION_LOCK_MS = 1000;

const philosophyPillars = [
  {
    key: 'mission',
    label: { zh: '使命', en: 'Mission' },
    title: {
      zh: '让青少年回到自然，走进真实社区。',
      en: 'Bring young people back to nature and into real communities.',
    },
    body: {
      zh: '在土地、家庭、食物、劳动和关系中重新认识自己，也学习理解一个真实而复杂的世界。',
      en: 'Through land, family, food, work, and relationships, young people rediscover themselves and learn to understand a real, complex world.',
    },
  },
  {
    key: 'vision',
    label: { zh: '愿景', en: 'Vision' },
    title: {
      zh: '让真实社区成为一代人的整全生命课堂。',
      en: 'Let real communities become classrooms for whole-person growth.',
    },
    body: {
      zh: '青少年不只是未来。他们可以从观察者成长为研究者、表达者和行动者，在当下参与社会与生态的修复。',
      en: 'Young people are not only the future. They can become researchers, storytellers, and actors who take part in social and ecological repair now.',
    },
  },
  {
    key: 'impact',
    label: { zh: '影响', en: 'Impact' },
    title: {
      zh: '让成长进入真实的社会关系。',
      en: 'Move growth into real social relationships.',
    },
    body: {
      zh: '把田野调研转化为校园 CSA、乡村共建、土壤改良与公共表达，让个人探索也能回应社区的真实需要。',
      en: 'Turn field research into campus CSA, rural co-creation, soil improvement, and public voice, so personal exploration can answer real community needs.',
    },
  },
];

const teamMembers = [
  {
    key: 'nate',
    role: {
      zh: '阿柑少年计划发起人',
      en: "Founder of R'gan Junior",
    },
    name: { zh: 'Nate', en: 'Nate' },
    focus: {
      zh: ['乡村在地的行为经济学', '青年探索者、国际对话者'],
      en: ['Rural-grounded behavioral economics', 'Young explorer and international dialogue builder'],
    },
    body: {
      zh: '生长于四川成都铁牛村，Nate 拥有从土地中自然生长出的生命视角。作为阿柑少年计划发起人，他致力于构建青年力量与乡村可持续转型的深度链接。',
      en: "Raised in Tieniu Village, Chengdu, Nate carries a perspective shaped by the land. As the founder of R'gan Junior, he connects youth action with sustainable rural transformation.",
    },
    storyPath: '/voices/it-takes-a-village',
    storyLabel: { zh: '阅读 Nate 的故事', en: "Read Nate's story" },
    imageSrc: nateFounderPhoto,
    imageAlt: { zh: 'Nate 的肖像照片', en: 'Portrait of Nate' },
    imageWidth: 1198,
    imageHeight: 1600,
    loading: 'eager' as const,
  },
  {
    key: 'tianshi',
    role: {
      zh: '青年发起成员｜科技与社群方向',
      en: 'Youth Initiating Member | Technology and Community',
    },
    name: { zh: '张天时', en: 'Tianshi Zhang' },
    focus: {
      zh: ['科技与生态的连接', '青年开发者、社群共建者'],
      en: ['Connecting technology and ecology', 'Young developer and community builder'],
    },
    body: {
      zh: '长期生活在城市，也持续参与铁牛村共建。张天时从编程、开发者社群和数字工具出发，希望把科技带回真实生活，把 AI 带到土地现场。',
      en: 'Tianshi has grown up in the city while staying involved in Tieniu Village. Through programming, developer communities, and digital tools, he works to bring technology back into real life and onto the land.',
    },
    storyPath: '/voices/technology-ecology-stars',
    storyLabel: { zh: '阅读天时的故事', en: "Read Tianshi's story" },
    imageSrc: '/stories/technology-ecology-stars/images/image-001.webp',
    imageAlt: { zh: '张天时的肖像照片', en: 'Portrait of Tianshi Zhang' },
    imageWidth: 1080,
    imageHeight: 1620,
    loading: 'lazy' as const,
  },
];

const developmentMilestones = [
  {
    phase: '1.0',
    date: '2023.02',
    title: { zh: '探索与连接', en: 'Exploration & Connection' },
    body: {
      zh: '以 Learn、Give、Connect、Travel、Play 为起点，带领同龄人走出教室，在真实乡村与自然场景中重新连接自己、他人和土地。',
      en: 'Beginning with Learn, Give, Connect, Travel, and Play, the project invited peers out of the classroom to reconnect with self, others, and land.',
    },
  },
  {
    phase: '2.0',
    date: '2023.09-2024.05',
    title: { zh: '研究 × 行动', en: 'Research into Action' },
    body: {
      zh: '围绕青少年参与可持续农业展开研究，从 2000 多个项目中进入 CTB 全球前 72 名，并延伸到论文发表与国际论坛表达。',
      en: 'Research on youth participation in sustainable agriculture led to CTB global top-72 recognition from more than 2,000 projects, publication, and international forum sharing.',
    },
  },
  {
    phase: '2.5',
    date: '2024.05-2025.09',
    title: { zh: '田野浸润', en: 'Field Immersion' },
    body: {
      zh: '从学术研究走向真实田野，在再生设计生态营、铁牛青年乡建实践营与国际交流中深化对乡村生态转型的理解。',
      en: 'The project moved from academic research into field immersion through regenerative design, youth rural practice, and international exchange.',
    },
  },
  {
    phase: '3.0',
    date: '2025.12',
    title: { zh: '校园 CSA 与社群行动', en: 'Campus CSA & Community Action' },
    body: {
      zh: '以校园 CSA 为实验场，把生态农产品、真实现金流、家庭消费决策和青少年公共表达连接起来。',
      en: 'Campus CSA became a living lab connecting ecological products, real cash flow, household decisions, and youth public voice.',
    },
  },
];

function AboutChapterNav({
  activeId,
  onSelect,
}: {
  activeId: AboutChapterId;
  onSelect: (chapterId: AboutChapterId) => void;
}) {
  const { lang, t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <nav className="about-rgan-chapter-nav" aria-label={t('关于页面章节', 'About page chapters')}>
      <div>
        {aboutChapters.map((chapter) => {
          const isActive = activeId === chapter.id;
          return (
            <Link
              key={chapter.id}
              to={`/about#${chapter.id}`}
              aria-current={isActive ? 'location' : undefined}
              data-active={isActive}
              onClick={() => onSelect(chapter.id)}
            >
              <span>{lang === 'zh' ? chapter.zh : chapter.en}</span>
              {isActive && (
                <motion.span
                  layoutId="about-chapter-active-indicator"
                  className="about-rgan-chapter-nav__indicator"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                  }
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function About() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const brandName = pickLocalized(BRAND.name, lang);
  const chapterSelectionLockRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState<AboutChapterId>(
    () => readAboutChapterHash(location.hash) ?? 'mission',
  );

  useEffect(() => {
    const requestedId = readAboutChapterHash(location.hash);
    if (requestedId) {
      chapterSelectionLockRef.current = Date.now() + CHAPTER_SELECTION_LOCK_MS;
      setActiveChapter(requestedId);
    }
  }, [location.hash]);

  const scrollToChapter = useCallback((chapterId: AboutChapterId) => {
    chapterSelectionLockRef.current = Date.now() + CHAPTER_SELECTION_LOCK_MS;
    setActiveChapter(chapterId);
    document.getElementById(chapterId)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [reducedMotion]);

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
    const markers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-about-chapter-marker]'),
    );
    let animationFrameId = 0;

    const syncActiveChapter = () => {
      animationFrameId = 0;
      if (Date.now() < chapterSelectionLockRef.current) return;

      const activationLine = window.innerHeight * 0.25;
      let nextChapter: AboutChapterId = 'mission';

      markers.forEach((marker) => {
        const chapterId = marker.dataset.aboutChapterMarker;
        if (
          chapterId &&
          isAboutChapterId(chapterId) &&
          marker.getBoundingClientRect().top <= activationLine
        ) {
          nextChapter = chapterId;
        }
      });

      setActiveChapter((currentChapter) => (
        currentChapter === nextChapter ? currentChapter : nextChapter
      ));
    };

    const scheduleChapterSync = () => {
      if (animationFrameId) return;
      animationFrameId = window.requestAnimationFrame(syncActiveChapter);
    };

    scheduleChapterSync();
    window.addEventListener('scroll', scheduleChapterSync, { passive: true });
    window.addEventListener('resize', scheduleChapterSync);

    return () => {
      window.removeEventListener('scroll', scheduleChapterSync);
      window.removeEventListener('resize', scheduleChapterSync);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleChapterSelect = useCallback((chapterId: AboutChapterId) => {
    chapterSelectionLockRef.current = Date.now() + CHAPTER_SELECTION_LOCK_MS;
    setActiveChapter(chapterId);
  }, []);

  return (
    <div className="about-page about-rgan-page pt-20">
      <header className="about-rgan-hero">
        <div className="about-rgan-shell about-rgan-hero__grid">
          <div className="about-rgan-hero__copy">
            <h1>{lang === 'zh' ? `关于${brandName}` : `About ${brandName}`}</h1>
            <p>
              {t(
                '从铁牛村出发，让青少年回到自然、走进社区，在真实关系中重新认识自己、土地与社会。',
                'Starting from Tieniu Village, young people return to nature and enter community to rediscover self, land, and society.',
              )}
            </p>
          </div>
          <figure className="about-rgan-hero__figure">
            <img
              src="/images/s06-linpan-aerial-overview.jpg"
              alt={t('铁牛村林盘、果园、鱼塘与院落的航拍图', 'Aerial view of Tieniu Village Linpan, orchards, ponds, and homes')}
              width="2890"
              height="2218"
              loading="eager"
            />
          </figure>
        </div>
      </header>

      <AboutChapterNav activeId={activeChapter} onSelect={handleChapterSelect} />

      <main>
        <section id="mission" className="about-rgan-section about-rgan-philosophy">
          <span className="about-rgan-scroll-marker" data-about-chapter-marker="mission" aria-hidden="true" />
          <div className="about-rgan-shell">
            <header className="about-rgan-section__header">
              <h2>{t('我们为什么出发', 'Why we began')}</h2>
              <p>
                {t(
                  '自然是老师，真实世界是课堂，青少年是正在发生的力量。',
                  'Nature is a teacher, the real world is a classroom, and young people are a force already in motion.',
                )}
              </p>
            </header>

            <div className="about-rgan-philosophy__grid">
              {philosophyPillars.map((pillar) => (
                <article key={pillar.key} data-pillar={pillar.key}>
                  <p>{pickLocalized(pillar.label, lang)}</p>
                  <h3>{pickLocalized(pillar.title, lang)}</h3>
                  <div>{pickLocalized(pillar.body, lang)}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="about-rgan-section about-rgan-story">
          <span className="about-rgan-scroll-marker" data-about-chapter-marker="story" aria-hidden="true" />
          <div className="about-rgan-shell">
            <header className="about-rgan-section__header about-rgan-story__intro">
              <h2>{t('故事从铁牛村开始', 'The story begins in Tieniu Village')}</h2>
              <p>
                {t(
                  '铁牛村不是活动背景，而是阿柑少年理解土地、食物、劳动、社区与生态转型的真实现场。',
                  'Tieniu Village is not an activity backdrop. It is where R\'gan Junior encounters land, food, labor, community, and ecological transition.',
                )}
              </p>
            </header>

            <TieniuStoryMap />
            <TieniuRegenerationStory />

            <section className="about-rgan-development" aria-labelledby="development-title">
              <header>
                <h3 id="development-title">{t('从土地出发的项目路径', 'A project path rooted in the land')}</h3>
                <p>
                  {t(
                    '从自然探索到田野研究，再到校园 CSA 与青少年公共表达，行动一步步进入真实社会关系。',
                    'From nature exploration to field research, campus CSA, and youth advocacy, the work moves steadily into real social relationships.',
                  )}
                </p>
              </header>

              <div className="about-rgan-development__grid">
                {developmentMilestones.map((milestone) => (
                  <article key={milestone.phase}>
                    <div>
                      <span>{milestone.phase}</span>
                      <time>{milestone.date}</time>
                    </div>
                    <h4>{pickLocalized(milestone.title, lang)}</h4>
                    <p>{pickLocalized(milestone.body, lang)}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section id="team" className="about-rgan-section about-rgan-team">
          <span className="about-rgan-scroll-marker" data-about-chapter-marker="team" aria-hidden="true" />
          <div className="about-rgan-shell">
            <header className="about-rgan-section__header">
              <h2>{t('共同发起，也长期行动', 'Initiating together and staying for the work')}</h2>
              <p>
                {t(
                  '一条路径从土地与乡村生长，另一条从科技与青年社群出发。两位发起成员在真实行动中汇合。',
                  'One path grew from land and village life. Another began with technology and youth communities. They meet in real-world action.',
                )}
              </p>
            </header>

            <div className="about-rgan-team__list">
              {teamMembers.map((member) => (
                <article key={member.key} className="about-rgan-team__member">
                  <figure>
                    <img
                      src={member.imageSrc}
                      alt={pickLocalized(member.imageAlt, lang)}
                      width={member.imageWidth}
                      height={member.imageHeight}
                      loading={member.loading}
                    />
                  </figure>
                  <div className="about-rgan-team__copy">
                    <p>{pickLocalized(member.role, lang)}</p>
                    <h3>{pickLocalized(member.name, lang)}</h3>
                    <div className="about-rgan-team__focus">
                      {member.focus[lang].map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                    <p>{pickLocalized(member.body, lang)}</p>
                    <Link to={member.storyPath}>
                      <span>{pickLocalized(member.storyLabel, lang)}</span>
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
