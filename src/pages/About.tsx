import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import nateFounderPhoto from '@/assets/nate-founder.jpg';
import TieniuStoryMap from '@/components/about/TieniuStoryMap';
import TieniuRegenerationStory from '@/components/about/TieniuRegenerationStory';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    key: 'nate',
    role: {
      zh: '阿柑少年计划发起人',
      en: "Founder of R'gan Junior",
    },
    name: {
      zh: 'Nate',
      en: 'Nate',
    },
    focus: {
      zh: ['乡村在地的行为经济学', '青年探索者、国际对话者'],
      en: ['Rural-grounded behavioral economics', 'Young explorer, international dialogue builder'],
    },
    body: {
      zh: '生长于四川成都铁牛村，Nate 拥有从土地中自然生长出的生命视角。作为阿柑少年计划发起人，他致力于构建青年力量与乡村可持续转型的深度链接。',
      en: "Raised in Tieniu Village, Chengdu, Nate carries a perspective shaped by the land. As the founder of R'gan Junior, he connects youth action with sustainable rural transformation.",
    },
    storyPath: '/voices/it-takes-a-village',
    storyLabel: {
      zh: '阅读 Nate 的故事',
      en: "Read Nate's story",
    },
    imageSrc: nateFounderPhoto,
    imageAlt: {
      zh: 'Nate 的肖像照片',
      en: 'Portrait of Nate',
    },
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
    name: {
      zh: '张天时',
      en: 'Tianshi Zhang',
    },
    focus: {
      zh: ['科技与生态的连接', '青年开发者、社群共建者'],
      en: ['Connecting technology and ecology', 'Young developer, community builder'],
    },
    body: {
      zh: '长期生活在城市，也持续参与铁牛村共建。张天时从编程、开发者社群和数字工具出发，希望把科技带回真实生活，把 AI 带到土地现场。',
      en: 'Tianshi has grown up in the city while staying involved in Tieniu Village. Through programming, developer communities, and digital tools, he works to bring technology back into real life and onto the land.',
    },
    storyPath: '/voices/technology-ecology-stars',
    storyLabel: {
      zh: '阅读天时的故事',
      en: "Read Tianshi's story",
    },
    imageSrc: '/stories/technology-ecology-stars/images/image-001.webp',
    imageAlt: {
      zh: '张天时的肖像照片',
      en: 'Portrait of Tianshi Zhang',
    },
    imageWidth: 1080,
    imageHeight: 1620,
    loading: 'lazy' as const,
  },
];

const developmentMilestones = [
  {
    phase: '1.0',
    date: '2023.02',
    title: {
      zh: '探索与连接',
      en: 'Exploration & Connection',
    },
    body: {
      zh: '以 Learn · Give · Connect · Travel · Play 为起点，带领同龄人走出教室，在真实乡村与自然场景中重新连接自己、他人和土地。',
      en: 'Beginning with Learn, Give, Connect, Travel, and Play, the project invited peers out of the classroom to reconnect with self, others, and land in real rural and natural settings.',
    },
    markers: {
      zh: ['自然体验', '社区服务', '同伴共学'],
      en: ['Nature experience', 'Community service', 'Peer learning'],
    },
  },
  {
    phase: '2.0',
    date: '2023.09-2024.05',
    title: {
      zh: '研究 × 行动',
      en: 'Research into Action',
    },
    body: {
      zh: '围绕青少年参与可持续农业展开研究，完成问卷与活动设计，从 2000+ 项目中进入 CTB 全球前 72 名，并延伸到论文发表与国际论坛表达。',
      en: 'Research on youth participation in sustainable agriculture led to surveys, activity design, CTB global top-72 recognition from 2,000+ projects, journal publication, and international forum sharing.',
    },
    markers: {
      zh: ['CTB Top 3.6%', '哈佛展示', 'YSA Journal', '克莱蒙论坛'],
      en: ['CTB Top 3.6%', 'Harvard presentation', 'YSA Journal', 'Claremont Forum'],
    },
  },
  {
    phase: '2.5',
    date: '2024.05-2025.09',
    title: {
      zh: '田野浸润',
      en: 'Field Immersion',
    },
    body: {
      zh: '从学术研究走向真实田野，在再生设计生态营、铁牛青年乡建实践营、国际学者来访与美育参访中深化乡村生态转型理解。',
      en: 'The project moved from academic research into field immersion through regenerative design camps, youth rural practice, international scholar visits, and rural aesthetics exchanges.',
    },
    markers: {
      zh: ['再生设计', '乡建实践', '国际交流', '乡村美育'],
      en: ['Regenerative design', 'Rural practice', 'International exchange', 'Rural aesthetics'],
    },
  },
  {
    phase: '3.0',
    date: '2025.12',
    title: {
      zh: '校园 CSA 与社群行动',
      en: 'Campus CSA & Community Action',
    },
    body: {
      zh: '以“天立国高 × 阿柑少年”校园 CSA 为实验场，把生态农产品、真实现金流、家庭消费决策和青少年公共表达连接起来。',
      en: 'The Tianli × R\'gan\u00a0Junior Campus CSA became a living lab connecting ecological products, real cash flow, family purchasing decisions, and youth public voice.',
    },
    markers: {
      zh: ['校园 CSA', '行为经济学', '家庭访谈', '青少年发声'],
      en: ['Campus CSA', 'Behavioral economics', 'Family interviews', 'Youth advocacy'],
    },
  },
];

export default function About() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <div className="about-page pt-20">
      {/* Hero */}
      <section className="about-hero section-breathing">
        <div className="about-hero-shell container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 data-page-motion="title" className="mobile-page-title font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {lang === 'zh' ? `关于${brandName}` : `About ${brandName}`}
          </h1>
          <div className="mobile-page-rule w-12 h-px bg-primary mb-12" />

          <section id="team" data-page-motion="lead" className="about-team-section mb-20">
            <div className="mb-12 max-w-2xl md:mb-16">
              <p className="about-mobile-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Team', 'Team')}
              </p>
              <h2 className="about-section-title mt-5 font-serif text-3xl leading-tight text-foreground md:text-4xl">
                {t('共同发起，也长期行动', 'Initiating together, staying for the work')}
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {t(
                  '一条路径从土地与乡村生长，另一条路径从科技与青年社群出发。两位发起成员在真实生活中汇合。',
                  'One path grew from land and village life. The other began with technology and youth communities. They meet in real-world action.'
                )}
              </p>
            </div>

            <div className="border-y border-border">
              {teamMembers.map((member) => (
                <article
                  key={member.key}
                  className="about-team-member grid gap-10 border-b border-border py-12 last:border-b-0 md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] md:items-center md:gap-12 md:py-16"
                >
                  <figure className="about-founder-figure max-w-[300px]">
                    <div className="founder-photo-frame overflow-hidden rounded-lg bg-secondary/30">
                      <img
                        src={member.imageSrc}
                        alt={member.imageAlt[lang]}
                        width={member.imageWidth}
                        height={member.imageHeight}
                        loading={member.loading}
                        className="founder-photo-img aspect-[4/5] h-full w-full object-cover object-[center_32%]"
                      />
                    </div>
                  </figure>

                  <div className="about-founder-copy min-w-0">
                    <p className="text-sm font-medium leading-relaxed text-primary md:text-base">
                      {member.role[lang]}
                    </p>
                    <h3 className="mt-4 text-balance font-serif text-3xl leading-tight text-foreground md:text-5xl">
                      {member.name[lang]}
                    </h3>
                    <p className="mt-5 text-sm font-medium leading-relaxed text-primary md:text-base">
                      {member.focus[lang].map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                    <p className="mt-8 max-w-xl text-pretty text-base leading-loose text-muted-foreground md:text-lg">
                      {member.body[lang]}
                    </p>
                    <Link
                      to={member.storyPath}
                      className="cursor-target mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary/90 active:translate-y-px"
                    >
                      <span>{member.storyLabel[lang]}</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <TieniuStoryMap />
          <TieniuRegenerationStory />

          <section data-page-motion="collection" className="about-development-section mt-20 border-t border-border pt-16 md:mt-24 md:pt-20">
            <div className="about-development-header mb-12 max-w-2xl">
              <p className="about-mobile-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Development', 'Development')}
              </p>
              <h2 className="mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('项目发展历程', 'Project Development Timeline')}
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {t(
                  '从自然探索到行为经济学实地研究，再到校园 CSA 与青少年公共表达，阿柑少年逐步把“疗愈自己”与“服务乡村生态转型”连在一起。',
                  'From nature exploration to behavioral-economics field research, then to campus CSA and youth advocacy, R\'gan\u00a0Junior gradually connects inner healing with service for rural ecological transition.'
                )}
              </p>
            </div>

            <div className="about-development-timeline border-t border-border">
              {developmentMilestones.map((milestone) => (
                <article
                  key={milestone.phase}
                  className="about-development-row grid gap-5 border-b border-border py-7 md:grid-cols-[88px_150px_minmax(0,1fr)] md:gap-8"
                >
                  <p className="font-serif text-2xl text-primary/75">
                    {milestone.phase}
                  </p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {milestone.date}
                    </p>
                    <h3 className="mt-2 font-serif text-xl leading-snug text-foreground">
                      {pickLocalized(milestone.title, lang)}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {pickLocalized(milestone.body, lang)}
                    </p>
                    <div className="about-development-markers mt-4 flex flex-wrap gap-x-3 gap-y-2">
                      {milestone.markers[lang].map((marker, index) => (
                        <span key={marker} className="text-sm text-foreground/85">
                          {marker}
                          {index < milestone.markers[lang].length - 1 && (
                            <span className="ml-3 text-muted-foreground/35">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
