import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import nateFounderPhoto from '@/assets/nate-founder-story-sunset.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized, type LocalizedText } from '@/lib/brand';

type StoryMoment = {
  date: string;
  phase: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
  imageWidth: number;
  imageHeight: number;
  imagePosition?: string;
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

const storyMoments: StoryMoment[] = [
  {
    date: '2020',
    phase: text('来到铁牛村', 'Moving to Tieniu Village'),
    title: text('来到一个陌生的村庄', 'A new village, and a lonely beginning'),
    body: text(
      '11 岁的 Nate 跟着家人从上海搬到铁牛村。村里没有几个同龄朋友，他常常待在房间里上网、玩游戏，也不知道这个村子和自己有什么关系。',
      'At eleven, Nate moved with his family from Shanghai to Tieniu Village. With few people his age nearby, he spent much of his time online and wondered what this village had to do with him.',
    ),
    image: '/stories/it-takes-a-village/images/image-001.webp',
    imageAlt: text('2020 年 Nate 与家人在铁牛村的合照', 'Nate with his family in Tieniu Village in 2020'),
    imageWidth: 1080,
    imageHeight: 720,
  },
  {
    date: '2023',
    phase: text('阿柑少年 1.0', "R-Gan Junior 1.0"),
    title: text('我只是想找朋友来村里玩', 'I only wanted friends to come and play'),
    body: text(
      '最早的想法很简单：联系老朋友，一起认识铁牛村，聊聊自然和可持续生活。它没有课程，也没有完整组织，只是一个少年想和同龄人建立连接。',
      'The first idea was simple: invite old friends to discover Tieniu Village and talk about nature and sustainable living. There was no course or formal organization—only a young person hoping to connect with his peers.',
    ),
    image: '/stories/it-takes-a-village/images/image-008.webp',
    imageAlt: text('阿柑少年早期线上交流', "An early R-Gan Junior online gathering"),
    imageWidth: 1080,
    imageHeight: 721,
  },
  {
    date: '2023 — 2024',
    phase: text('阿柑少年 2.0', "R-Gan Junior 2.0"),
    title: text('从一个想法，变成一次行动', 'An idea becomes a real action'),
    body: text(
      '进入高中后，Nate 邀请同学重新发起项目。他们走进果园做调研，办柑甜采摘节，也把关于青少年与可持续农业的研究带到 CTB 全球论坛。',
      'In high school, Nate invited classmates to restart the project. They researched in the orchards, organized a citrus harvest festival, and brought their work on youth and sustainable agriculture to the CTB Global Forum.',
    ),
    image: '/stories/it-takes-a-village/images/image-012.webp',
    imageAlt: text('阿柑少年项目组与家庭体验生态柑橘采摘', "R-Gan Junior participants and families picking ecological citrus"),
    imageWidth: 1080,
    imageHeight: 720,
  },
  {
    date: '2024—2026',
    phase: text('阿柑少年 3.0', "R-Gan Junior 3.0"),
    title: text('从热闹之后，回到更深的生活', 'After the excitement, a deeper way of living'),
    body: text(
      '一次活动不会自动带来改变。Nate 开始学习做饭、照顾四棵柑橘树，也和同学研究城市家庭如何选择生态产品；在行为经济学社团与 John Locke 论文写作中，他逐渐确认了对公共政策的兴趣。',
      'One event does not create lasting change. Nate learned to cook, cared for four citrus trees, and studied how urban families choose ecological products. Through a behavioral economics group and his John Locke essay, his questions began to lead toward public policy.',
    ),
    image: '/stories/it-takes-a-village/images/image-023.webp',
    imageAlt: text('Nate 与行为经济学学习社团的同学讨论', 'Nate discussing ideas with his behavioral economics study group'),
    imageWidth: 1080,
    imageHeight: 810,
    imagePosition: 'center 44%',
  },
  {
    date: '2026',
    phase: text('生活共创营', 'Life Co-creation Camp'),
    title: text('把自己的经历，变成给同龄人的邀请', 'Turning his own journey into an invitation'),
    body: text(
      'Nate 与伙伴们发起生活共创营，邀请更多青少年进入森林、田野和社区。从一个人的成长项目，到可以一起生活、发现问题并继续行动的青少年产品，阿柑少年走向了新的阶段。',
      "Nate and his partners created the Life Co-creation Camp, inviting more young people into forests, fields, and community life. What began as one person's growth project became a youth experience for living together, finding real questions, and continuing to act.",
    ),
    image: '/stories/it-takes-a-village/images/founder-story-camp-2026.jpg',
    imageAlt: text('阿柑少年生活共创营发起人站在菜园中', "R-Gan Junior Life Co-creation Camp initiators in a garden"),
    imageWidth: 5168,
    imageHeight: 3448,
    imagePosition: 'center bottom',
  },
];

const actionContinuations = [
  {
    title: text('一起生活', 'Live together'),
    body: text(
      '在生活共创营里先慢下来，感受身体、食物和土地，也真正认识同行的伙伴。',
      'The Life Co-creation Camp begins by slowing down—feeling the body, food, and land, and genuinely meeting the people beside you.',
    ),
  },
  {
    title: text('继续同行', 'Keep going together'),
    body: text(
      '营地不是终点。伙伴们按兴趣组成行动小组，把一次相遇延续到日常的观察与实践中。',
      'The camp is not the finish line. Interest-led action groups carry one meeting into everyday observation and practice.',
    ),
  },
  {
    title: text('回应真实问题', 'Respond to real questions'),
    body: text(
      '再把关心带进青少年研究计划，让青少年的兴趣回应土地和社区真正面对的事情。',
      "Research and public-issue projects then turn young people's interests toward questions the land and community actually face.",
    ),
  },
] as const;

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reducedMotion ? 0 : 0.56, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function FounderStory() {
  const { lang, t } = useLanguage();
  const reducedMotion = useReducedMotion();

  return (
    <div className={`founder-story-page founder-story-page--${lang}`}>
      <header className="founder-story-hero">
        <div className="founder-story-shell founder-story-hero__layout">
          <motion.div
            className="founder-story-hero__copy"
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="founder-story-eyebrow">
              {t('发起人故事 / STORY', 'STORY / 发起人故事')}
            </p>
            <h1
              className="founder-story-hero__title"
              aria-label={t('Nate的阿柑少年故事', "Nate's R-Gan Junior Story")}
            >
              {lang === 'zh' ? (
                <>
                  <span className="founder-story-hero__title-line">Nate的</span>
                  <span className="founder-story-hero__title-line">阿柑少年故事</span>
                </>
              ) : (
                "Nate's R-Gan Junior Story"
              )}
            </h1>
            <p className="founder-story-hero__lead">
              {t(
                '从一个想找朋友来村里玩的孩子，到邀请更多青少年走进真实世界。',
                'From a kid who simply wanted friends to visit the village, to someone inviting more young people into the real world.',
              )}
            </p>
            <div className="founder-story-hero__origin">
              {t(
                '2020 年，11 岁的 Nate 随家人从上海搬到铁牛村。阿柑少年，就从他的孤独、好奇和一次次真实行动中慢慢长出来。',
                "In 2020, eleven-year-old Nate moved from Shanghai to Tieniu Village. R-Gan Junior slowly grew from his loneliness, curiosity, and each real step he took.",
              )}
            </div>
          </motion.div>

          <motion.figure
            className="founder-story-hero__portrait"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.72, delay: reducedMotion ? 0 : 0.08 }}
          >
            <div className="founder-story-image-frame">
              <img
                src={nateFounderPhoto}
                alt={t('阿柑少年发起人 Nate 的肖像', "Portrait of Nate, founder of R-Gan Junior")}
                width="6569"
                height="4379"
                loading="eager"
              />
            </div>
            <figcaption>
              <span>Nate Shi</span>
              <span>{t('阿柑少年计划发起人', "Founder of R-Gan Junior")}</span>
            </figcaption>
          </motion.figure>
        </div>
      </header>

      <div className="founder-story-content">
        <section aria-labelledby="founder-story-timeline" className="founder-story-journey">
          <div className="founder-story-shell">
            <Reveal className="founder-story-section-heading">
              <p className="founder-story-eyebrow">{t('一路走来', 'THE JOURNEY')}</p>
              <h2
                id="founder-story-timeline"
                aria-label={t('一个想法，怎样在生活里慢慢长大', 'How an idea slowly grew through life')}
              >
                {lang === 'zh' ? (
                  <>
                    <span className="founder-story-copy-line">一个想法，</span>
                    <span className="founder-story-copy-line">怎样在生活里慢慢长大</span>
                  </>
                ) : (
                  'How an idea slowly grew through life'
                )}
              </h2>
            </Reveal>

            <div className="founder-story-journey__moments">
              {storyMoments.map((moment, index) => (
                <Reveal key={`${moment.date}-${moment.phase.zh}`} delay={index === 0 ? 0.04 : 0}>
                  <article className={`founder-story-moment founder-story-moment--${index + 1}`}>
                    <div className="founder-story-moment__meta">
                      <time>{moment.date}</time>
                      <p>{pickLocalized(moment.phase, lang)}</p>
                    </div>
                    <div className="founder-story-moment__copy">
                      <h3 aria-label={pickLocalized(moment.title, lang)}>
                        {lang === 'zh' && index === 4 ? (
                          <>
                            <span className="founder-story-copy-line">把自己的经历，</span>
                            <span className="founder-story-copy-line">变成给同龄人的邀请</span>
                          </>
                        ) : (
                          pickLocalized(moment.title, lang)
                        )}
                      </h3>
                      <p>{pickLocalized(moment.body, lang)}</p>
                    </div>
                    <figure className="founder-story-moment__visual">
                      <img
                        src={moment.image}
                        alt={pickLocalized(moment.imageAlt, lang)}
                        width={moment.imageWidth}
                        height={moment.imageHeight}
                        loading="lazy"
                        style={{ objectPosition: moment.imagePosition }}
                      />
                    </figure>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="founder-story-community" aria-labelledby="community-support-title">
          <div className="founder-story-shell founder-story-community__layout">
            <Reveal className="founder-story-community__visual">
              <figure>
                <img
                  src="/stories/it-takes-a-village/images/image-005.webp"
                  alt={t('在铁牛村共同生活的阿柑青年合照', 'R-Gan Junior community members living together in Tieniu Village')}
                  width="1080"
                  height="720"
                  loading="lazy"
                />
              </figure>
            </Reveal>
            <Reveal className="founder-story-community__copy" delay={0.08}>
              <p className="founder-story-eyebrow">
                {t('一个少年背后的一整个社区', 'A WHOLE COMMUNITY BEHIND ONE YOUNG PERSON')}
              </p>
              <h2
                id="community-support-title"
                aria-label={t('这不是一个人长出来的故事', 'This story did not grow from one person alone')}
              >
                {lang === 'zh' ? (
                  <>
                    <span className="founder-story-community__title-line">这不是</span>
                    <span className="founder-story-community__title-line">一个人长出来的故事</span>
                  </>
                ) : (
                  'This story did not grow from one person alone'
                )}
              </h2>
              <p>
                {t(
                  'Nate 对土地、食物和社区的理解，来自麦昆塔社区和阿柑青年多年的生活与陪伴。他们在村里种植、做饭，照顾土地，也照顾身边的人；后来，又陪着少年们做调研、办采摘节，把一个小小的想法托举成真实行动。',
                  "Nate's understanding of land, food, and community grew through years of daily life with the Quinta community and R-Gan Junior community members. They farmed, cooked, cared for the land and one another—and later stood beside the teenagers as they learned to research, organize, and act.",
                )}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="founder-story-continuation" aria-labelledby="action-continuation-title">
          <div className="founder-story-shell">
            <Reveal className="founder-story-continuation__heading">
              <div>
                <p className="founder-story-eyebrow">{t('从自己到更多人', 'FROM ONE JOURNEY TO MANY')}</p>
                <h2
                  id="action-continuation-title"
                  aria-label={t('把自己得到的，再传递给更多人', 'Passing forward what he received')}
                >
                  {lang === 'zh' ? (
                    <>
                      <span className="founder-story-copy-line">把自己得到的，</span>
                      <span className="founder-story-copy-line">再传递给更多人</span>
                    </>
                  ) : (
                    'Passing forward what he received'
                  )}
                </h2>
              </div>
              <p>
                {t(
                  '先走进自然和生活，找到自己的感受，也遇见同行的伙伴；再把一次相遇变成长久的行动；最后，从真实问题出发，用研究和实践回应土地与社区。',
                  'First, enter nature and daily life, recover your senses, and meet people to walk beside. Then let one encounter become sustained action. Finally, begin with real questions and respond to the land and community through research and practice.',
                )}
              </p>
            </Reveal>

            <div className="founder-story-continuation__grid">
              {actionContinuations.map((item, index) => (
                <Reveal key={item.title.zh} delay={index * 0.06}>
                  <article>
                    <span>0{index + 1}</span>
                    <h3>{pickLocalized(item.title, lang)}</h3>
                    <p>{pickLocalized(item.body, lang)}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="founder-story-closing">
          <div className="founder-story-shell founder-story-closing__layout">
            <Reveal className="founder-story-closing__copy">
              <p className="founder-story-eyebrow">{t('继续阅读', 'KEEP READING')}</p>
              <h2>{t('故事还在真实世界里继续', 'The story continues in the real world')}</h2>
            </Reveal>
            <Reveal className="founder-story-closing__actions" delay={0.06}>
              <Link to="/voices/it-takes-a-village" className="founder-story-action founder-story-action--primary cursor-target">
                {t('阅读 Nate 的完整自述', "Read Nate's full story")}
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/programs" className="founder-story-action founder-story-action--secondary cursor-target">
                {t('查看四个项目', 'Explore the four programs')}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}
