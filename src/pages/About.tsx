import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import nateFounderPhoto from '@/assets/nate-founder.jpg';
import TieniuStoryMap from '@/components/about/TieniuStoryMap';
import TieniuRegenerationStory from '@/components/about/TieniuRegenerationStory';

const founderEvidenceRows = [
  {
    scope: {
      zh: '研究',
      en: 'Research',
    },
    title: {
      zh: '学术研究与乡村实地实验',
      en: 'Academic Research & Rural Field Experiments',
    },
    markers: {
      zh: ['Top 3.6%', '哈佛交流', 'YSA Journal', '校园 CSA'],
      en: ['Top 3.6%', 'Harvard exchange', 'YSA Journal', 'Campus CSA'],
    },
    body: {
      zh: '主导“青少年参与可持续农业”研究，从全球 2000+ 项目中入选前 72 名，并发起“天立国高 × 阿柑少年”校园 CSA 实验室。',
      en: 'Led research on youth participation in sustainable agriculture, selected among the top 72 from 2,000+ global projects, and initiated the Tianli × R’gan Junior Campus CSA Lab.',
    },
  },
  {
    scope: {
      zh: '对话',
      en: 'Dialogue',
    },
    title: {
      zh: '跨文化与系统变革',
      en: 'Cross-cultural Exchange & Systemic Change',
    },
    markers: {
      zh: ['Claremont Eco-Forum', '耶鲁教授到访', '再生设计', '乡村美育'],
      en: ['Claremont Eco-Forum', 'Yale faculty visit', 'Regenerative design', 'Rural aesthetics'],
    },
    body: {
      zh: '在第 17 届克莱蒙生态文明国际论坛发表英文演讲，并在铁牛村参与组织国际学者与国内美育团队的在地交流。',
      en: 'Delivered an English speech at the 17th Claremont Eco-Forum and helped organize local exchanges in Tieniu Village with international scholars and domestic aesthetic education teams.',
    },
  },
];

const teamBackgroundRows = [
  {
    title: {
      zh: '由在地经验出发',
      en: 'Grounded in local experience',
    },
    body: {
      zh: '团队从 Nate 在铁牛村的成长经验出发，把乡村真实问题转化为青少年可以理解、研究和参与的行动入口。',
      en: 'The team begins with Nate’s lived experience in Tieniu Village, translating real rural issues into entry points that young people can understand, study, and act on.',
    },
  },
  {
    title: {
      zh: '连接研究、教育与社区',
      en: 'Connecting research, education, and community',
    },
    body: {
      zh: '成员围绕行为经济学、生态农业、乡村美育与青年社群组织协作，让学习不止停留在课堂或赛事里。',
      en: 'Members collaborate around behavioral economics, ecological agriculture, rural aesthetics, and youth community organizing, so learning does not stop at classrooms or competitions.',
    },
  },
  {
    title: {
      zh: '用同龄人的方式发声',
      en: 'Speaking in a youth voice',
    },
    body: {
      zh: '阿柑少年希望让青少年从观察者成为讲述者，把土地、家庭消费与自我成长之间的关系说给更多同龄人听。',
      en: 'R’gan Junior hopes young people can move from observers to storytellers, sharing how land, family consumption, and self-growth are connected.',
    },
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
      en: 'The Tianli × R’gan Junior Campus CSA became a living lab connecting ecological products, real cash flow, family purchasing decisions, and youth public voice.',
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
    <div className="pt-20">
      {/* Hero */}
      <section className="section-breathing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 data-page-motion="title" className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {lang === 'zh' ? `关于${brandName}` : `About ${brandName}`}
          </h1>
          <div className="w-12 h-px bg-primary mb-12" />

          <section data-page-motion="lead" className="founder-profile mb-20 border-y border-border py-12 md:py-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:items-start">
              <figure className="max-w-[320px] space-y-3 lg:max-w-none">
                <div className="founder-photo-frame overflow-hidden rounded-lg bg-secondary/30">
                  <img
                    src={nateFounderPhoto}
                    alt={t('Nate 的肖像照片', 'Portrait of Nate')}
                    className="founder-photo-img aspect-[4/5] h-full w-full object-cover"
                    style={{ objectPosition: 'center 32%' }}
                  />
                </div>
              </figure>

              <div className="min-w-0 lg:pt-1">
                <div className="max-w-2xl">
                  <h2 className="founder-motion founder-motion-title mb-5 font-serif text-3xl leading-tight text-foreground md:text-5xl">
                    {t('Nate ｜阿柑少年计划发起人', 'Nate | Founder of R’gan Junior')}
                  </h2>
                  <p className="founder-motion founder-motion-tagline text-sm font-medium leading-relaxed text-primary md:text-base">
                    {lang === 'zh' ? (
                      <>
                        <span className="block">乡村在地的行为经济学</span>
                        <span className="block">青年探索者、国际对话者</span>
                      </>
                    ) : (
                      <>
                        <span className="block">Rural-grounded behavioral economics</span>
                        <span className="block">Young explorer, international dialogue builder</span>
                      </>
                    )}
                  </p>
                  <p className="founder-motion founder-motion-body mt-8 max-w-xl text-base leading-loose text-muted-foreground md:text-lg">
                    {t(
                      '生长于四川成都铁牛村，Nate 拥有从土地中自然生长出的生命视角。作为“阿柑少年计划”发起人，他致力于构建青年力量与乡村可持续转型的深度链接。',
                      'Raised in Tieniu Village, Chengdu, Sichuan, Nate carries a life perspective that grew naturally from the land. As the founder of R’gan Junior, he is committed to building deep links between youth power and sustainable rural transformation.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="founder-evidence mt-12 border-t border-border">
              {founderEvidenceRows.map((row) => (
                <article
                  key={row.title.zh}
                  className="founder-evidence-row grid gap-5 border-b border-border py-7 md:grid-cols-[96px_220px_minmax(0,1fr)] md:gap-8"
                >
                  <p className="founder-evidence-scope text-sm text-primary">
                    {pickLocalized(row.scope, lang)}
                  </p>
                  <h3 className="font-serif text-xl leading-snug text-foreground">
                    {pickLocalized(row.title, lang)}
                  </h3>
                  <div>
                    <div className="mb-3 flex flex-wrap gap-x-3 gap-y-2">
                      {row.markers[lang].map((marker, index) => (
                        <span key={marker} className="founder-evidence-marker text-sm text-foreground/85">
                          {marker}
                          {index < row.markers[lang].length - 1 && (
                            <span className="ml-3 text-muted-foreground/35">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {pickLocalized(row.body, lang)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section data-page-motion="actions" className="mb-20 border-b border-border pb-16">
            <h2 className="font-serif text-2xl text-foreground mb-8">
              {t('Nate 团队背景', 'Nate Team Background')}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {teamBackgroundRows.map((row) => (
                <article key={row.title.zh} className="border-t border-border pt-5">
                  <h3 className="font-serif text-xl leading-snug text-foreground">
                    {pickLocalized(row.title, lang)}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {pickLocalized(row.body, lang)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <TieniuStoryMap />
          <TieniuRegenerationStory />

          <section data-page-motion="collection" className="mt-20 border-t border-border pt-16 md:mt-24 md:pt-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Development', 'Development')}
              </p>
              <h2 className="mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('项目发展历程', 'Project Development Timeline')}
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {t(
                  '从自然探索到行为经济学实地研究，再到校园 CSA 与青少年公共表达，阿柑少年逐步把“疗愈自己”与“服务乡村生态转型”连在一起。',
                  'From nature exploration to behavioral-economics field research, then to campus CSA and youth advocacy, R’gan Junior gradually connects inner healing with service for rural ecological transition.'
                )}
              </p>
            </div>

            <div className="border-t border-border">
              {developmentMilestones.map((milestone) => (
                <article
                  key={milestone.phase}
                  className="grid gap-5 border-b border-border py-7 md:grid-cols-[88px_150px_minmax(0,1fr)] md:gap-8"
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
                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
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
