import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  HeartPulse,
  Leaf,
  Mountain,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react';
import HeroCopy from '@/components/home/HeroCopy';
import HeroMascotStage from '@/components/home/HeroMascotStage';
import HomePhotoScroll from '@/components/home/HomePhotoScroll';
import NetworkAnimation from '@/components/home/NetworkAnimation';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized, type LocalizedText } from '@/lib/brand';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ImageReveal from '@/components/ui/ImageReveal';
import TitleReveal from '@/components/ui/TitleReveal';
import WordReveal from '@/components/ui/WordReveal';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

type BeliefItemProps = {
  belief: {
    zh: string;
    en: string;
    descZh: string;
    descEn: string;
  };
  index: number;
  t: (zh: string, en: string) => string;
};

function BeliefItem({ belief, index, t }: BeliefItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const updateProgress = () => {
            if (!itemRef.current) return;
            const rect = itemRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            const maxDistance = windowHeight / 2;
            const newProgress = Math.max(0, Math.min(1, 1 - distance / maxDistance));
            setProgress(newProgress);
          };
          
          const throttledUpdate = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(updateProgress);
          };
          
          updateProgress();
          window.addEventListener('scroll', throttledUpdate, { passive: true });
          return () => {
            window.removeEventListener('scroll', throttledUpdate);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
          };
        }
      },
      {
        threshold: Array.from({ length: 100 }, (_, i) => i / 100),
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const maxProgress = 0.7;
  const adjustedProgress = Math.min(1, progress / maxProgress);
  const delay = index * 0.08;

  return (
    <div
      ref={itemRef}
      className="group flex items-start gap-4"
      style={{ transitionDelay: `${delay}s` }}
    >
      <div 
        className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
        style={{ 
          transform: `scale(${1 + adjustedProgress * 0.8})`,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      <div className="flex-1">
        <p 
          className="font-serif text-lg leading-relaxed md:text-xl"
          style={{ 
            color: `hsl(var(--foreground) / ${0.5 + adjustedProgress * 0.5})`,
            transition: 'color 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {t(belief.zh, belief.en)}
        </p>
        <div
          className="overflow-hidden"
          style={{
            maxHeight: `${adjustedProgress * 120}px`,
            opacity: adjustedProgress,
            marginTop: `${adjustedProgress * 16}px`,
            transform: `translateY(${(1 - adjustedProgress) * 8}px)`,
            transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <p className="text-sm leading-relaxed text-muted-foreground pl-4 border-l-2 border-primary/20">
            {t(belief.descZh, belief.descEn)}
          </p>
        </div>
      </div>
    </div>
  );
}

type GrowthDimension = {
  icon: LucideIcon;
  title: LocalizedText;
  description: LocalizedText;
};

type CurrentProject = {
  icon: LucideIcon;
  title: LocalizedText;
  description: LocalizedText;
  image: {
    src: string;
    alt: LocalizedText;
    position?: string;
    contain?: boolean;
  };
};

const growthDimensions: GrowthDimension[] = [
  {
    icon: Leaf,
    title: { zh: '探索', en: 'Explore' },
    description: {
      zh: '走进乡村、城市与山野，在真实场景中重新感知世界。',
      en: 'Entering villages, cities, and wild places to sense the real world again.',
    },
  },
  {
    icon: HeartPulse,
    title: { zh: '疗愈', en: 'Heal' },
    description: {
      zh: '把焦虑、疲惫与迷茫带回身体和自然，恢复内在秩序。',
      en: 'Returning anxiety, fatigue, and uncertainty to the body and nature, so inner order can recover.',
    },
  },
  {
    icon: BookOpen,
    title: { zh: '学习', en: 'Learn' },
    description: {
      zh: '用政治学、社会学、经济学与生态学理解真实问题。',
      en: 'Using politics, sociology, economics, and ecology to understand real problems.',
    },
  },
  {
    icon: Sprout,
    title: { zh: '行动', en: 'Act' },
    description: {
      zh: '把研究转化为社区服务、公共表达与生态共建。',
      en: 'Turning research into community service, public voice, and ecological collaboration.',
    },
  },
];

const currentProjects: CurrentProject[] = [
  {
    icon: Mountain,
    title: { zh: '山野疗愈与生命探索', en: 'Nature Healing & Life Exploration' },
    description: {
      zh: '带领青少年回到山林、果园与村庄，在自然经验中恢复感受力与行动力。',
      en: 'Guiding young people back to forests, orchards, and villages to recover sensitivity and agency through nature.',
    },
    image: {
      src: '/archive/elements/photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
      alt: {
        zh: '铁牛青年乡村实践营合影',
        en: 'Tieniu youth rural practice camp group photo',
      },
      position: 'center 45%',
    },
  },
  {
    icon: ClipboardList,
    title: { zh: '行为经济学田野研究', en: 'Behavioral Economics Field Study' },
    description: {
      zh: '围绕生态农产品消费，研究价格弹性、信任机制与家庭购买决策。',
      en: 'Studying price elasticity, trust, and household purchasing decisions around ecological food.',
    },
    image: {
      src: '/archive/elements/graphics/branding/s25-campus-csa-eco-box-illustration.png',
      alt: {
        zh: '校园 CSA 生态盲盒视觉',
        en: 'Campus CSA eco-box visual',
      },
      contain: true,
    },
  },
  {
    icon: Users,
    title: { zh: '生态社区共建与青年发声', en: 'Ecological Community Building' },
    description: {
      zh: '连接校园、家庭与乡村社区，让青少年成为生态转型的研究者、传播者和行动者。',
      en: 'Connecting campuses, families, and rural communities so youth become researchers, communicators, and builders of ecological transition.',
    },
    image: {
      src: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
      alt: {
        zh: 'CTB 论坛团队展位',
        en: 'CTB forum team booth',
      },
      position: 'center 42%',
    },
  },
];

function GrowthDimensionCard({
  dimension,
  lang,
}: {
  dimension: GrowthDimension;
  lang: 'zh' | 'en';
}) {
  const Icon = dimension.icon;

  return (
    <article className="rounded-lg border border-border bg-background/70 p-5 transition-organic hover:-translate-y-1 hover:border-primary/25">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-serif text-xl text-foreground">{pickLocalized(dimension.title, lang)}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {pickLocalized(dimension.description, lang)}
      </p>
    </article>
  );
}

function CurrentProjectCard({
  project,
  lang,
}: {
  project: CurrentProject;
  lang: 'zh' | 'en';
}) {
  const Icon = project.icon;

  return (
    <Link
      to="/actions"
      className="group grid overflow-hidden rounded-lg border border-border bg-background transition-all duration-400 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-secondary/35">
        <img
          src={project.image.src}
          alt={pickLocalized(project.image.alt, lang)}
          className={`h-full w-full transition duration-700 group-hover:scale-[1.03] ${
            project.image.contain ? 'object-contain p-6 md:p-8' : 'object-cover'
          }`}
          style={{ objectPosition: project.image.position }}
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-organic group-hover:translate-x-1 group-hover:opacity-100" />
        </div>
        <h3 className="font-serif text-xl leading-snug text-foreground transition-organic group-hover:text-primary">
          {pickLocalized(project.title, lang)}
        </h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {pickLocalized(project.description, lang)}
        </p>
      </div>
    </Link>
  );
}

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[hsl(42_28%_96%)]"
          aria-hidden="true"
        />
        <div className="container relative z-10 mx-auto grid min-h-[min(760px,84svh)] items-center gap-10 px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(200px,0.42fr)_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-28 xl:min-h-[min(820px,84svh)]">
          <HeroMascotStage sectionRef={heroRef} />
          <HeroCopy onJoin={() => window.location.href = '/join'} />
        </div>
      </section>

      <HomePhotoScroll />

      <section className="section-breathing relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <ScrollProgressReveal direction="up" distance={80} className="mb-10">
              <TitleReveal delay={0.1}>
                {t('整全生命成长', 'Whole-Person Growth')}
              </TitleReveal>
            </ScrollProgressReveal>
            
            <div className="space-y-6 text-base leading-loose text-muted-foreground md:text-lg">
              <ScrollProgressReveal direction="up" distance={60} className="mb-4">
                <WordReveal delay={0.2} as="p">
                  {t(
                    `${brandName}不是单次课外活动，而是一项扎根真实社区的长期生命成长计划。`,
                    `${brandName} is not a one-off extracurricular activity; it is a long-term growth program rooted in real communities.`
                  )}
                </WordReveal>
              </ScrollProgressReveal>
              
              <ScrollProgressReveal direction="up" distance={50}>
                <WordReveal delay={0.3} as="p">
                  {t(
                    '青少年在乡村与城市之间探索、疗愈、学习并行动，把自我成长与土地、社区和更大的生态系统重新连接起来。',
                    'Young people explore, heal, learn, and act across rural and urban settings, reconnecting personal growth with land, community, and the wider ecosystem.'
                  )}
                </WordReveal>
              </ScrollProgressReveal>
            </div>
          </div>

          <ScrollProgressReveal direction="up" distance={60} className="mt-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {growthDimensions.map((dimension) => (
                <GrowthDimensionCard key={dimension.title.zh} dimension={dimension} lang={lang} />
              ))}
            </div>
          </ScrollProgressReveal>
        </div>
      </section>

      <section className="section-breathing relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* 左侧：标题与文字 */}
            <div className="lg:col-span-7 lg:col-start-1">
              <ScrollProgressReveal direction="up" distance={60} className="mb-12 lg:mb-16">
                <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                  {t('起源', 'Origins')}
                </span>
                <TitleReveal delay={0.2} as="h2" className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
                  {t('我们从哪里来', 'Where We Come From')}
                </TitleReveal>
                <ScrollReveal delay={0.5}>
                  <div className="w-16 h-px bg-gradient-to-r from-primary to-transparent" />
                </ScrollReveal>
              </ScrollProgressReveal>
              
              <div className="space-y-8 text-base md:text-lg text-muted-foreground leading-relaxed">
                <ScrollProgressReveal direction="up" distance={50} className="mb-4">
                  <WordReveal delay={0.3} as="p" className="first-letter:text-5xl first-letter:font-serif first-letter:text-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                    {t(
                      `${brandName}诞生于中国四川蒲江铁牛村——一个正在进行生态农业与乡村转型实践的真实社区。`,
                      `${brandName} was born in Tie Niu Village, a real community undergoing regenerative agricultural transformation in China.`
                    )}
                  </WordReveal>
                </ScrollProgressReveal>
                
                <ScrollProgressReveal direction="up" distance={40} className="mb-4">
                  <WordReveal delay={0.4} as="p">
                    {t(
                      '在这里，青少年不是"参观者"，而是研究者、记录者、行动者。',
                      'Here, young people are not visitors, but researchers, observers, and participants.'
                    )}
                  </WordReveal>
                </ScrollProgressReveal>
                
                <ScrollProgressReveal direction="up" distance={30}>
                  <WordReveal delay={0.5} as="p">
                    {t(
                      '他们走进果园、田地与村庄，理解经济、生态与社会如何真实地运作。',
                      'They step into orchards, fields, and villages to understand how economy, ecology, and society truly function.'
                    )}
                  </WordReveal>
                </ScrollProgressReveal>
              </div>
            </div>
            
            {/* 右侧：图片 */}
            <div className="lg:col-span-5 lg:col-start-8 lg:mt-24">
              <ScrollProgressReveal direction="right" distance={80} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-sm -z-10" />
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <ImageReveal
                    src="/s06-linpan-aerial-overview.JPG"
                    alt={t('铁牛村林盘鸟瞰', 'Aerial view of Tieniu Village linpan')}
                    className="w-full h-full"
                    containerClassName="w-full h-full"
                    grayscaleToColor={true}
                    revealDirection="bottom"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-transparent">
                  <p className="text-xs tracking-wider text-muted-foreground">
                    {t('四川蒲江铁牛村 · 林盘聚落', 'Tie Niu Village, Pujiang, Sichuan · Linpan Settlement')}
                  </p>
                </div>
              </ScrollProgressReveal>
            </div>
          </div>
          
          {/* 底部：总结性文字 */}
          <ScrollProgressReveal direction="up" distance={60} className="mt-16 lg:mt-24 max-w-2xl">
            <div className="border-l-2 border-primary/30 pl-6">
              <WordReveal delay={0.6} as="p" className="text-foreground font-medium text-lg md:text-xl leading-relaxed">
                {t(
                  '现在，越来越多的志同道合的青少年，正从全国各地汇聚起来，一起迈向这段共同的探索旅程。',
                  'Now, more like-minded teenagers from all over the country are gathering in Tieniu Village to join this journey of collective exploration.'
                )}
              </WordReveal>
            </div>
          </ScrollProgressReveal>
        </div>
      </section>

      <section className="section-breathing border-y border-border bg-secondary/30">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] lg:px-8">
          <div>
            <ScrollProgressReveal direction="up" distance={60} className="mb-10">
              <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-primary/70">
                {t('跨学科田野实验室', 'Interdisciplinary Field Lab')}
              </span>
              <TitleReveal delay={0.1} as="h2" className="font-serif text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">
                {t('在真实生活中重新连接知识', 'Reconnecting Knowledge Through Real Life')}
              </TitleReveal>
            </ScrollProgressReveal>

            <div className="space-y-6 text-base leading-loose text-muted-foreground md:text-lg">
              <ScrollProgressReveal direction="up" distance={50}>
                <WordReveal delay={0.2} as="p">
                  {t(
                    '工业文明把知识切分成彼此隔离的学科，也让人与土地、自然和社区逐渐分离。',
                    'Industrial civilization split knowledge into isolated disciplines, and separated people from land, nature, and community.'
                  )}
                </WordReveal>
              </ScrollProgressReveal>

              <ScrollProgressReveal direction="up" distance={40}>
                <WordReveal delay={0.3} as="p">
                  {t(
                    `${brandName}把政治学、社会学、经济学与生态学重新放回真实生活，让青少年在复杂问题中形成整全生命观。`,
                    `${brandName} brings politics, sociology, economics, and ecology back into lived reality, helping young people build a whole view of life through complex problems.`
                  )}
                </WordReveal>
              </ScrollProgressReveal>
            </div>

            <ScrollProgressReveal direction="up" distance={40} className="mt-10">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { zh: '政治学', en: 'Politics' },
                  { zh: '社会学', en: 'Sociology' },
                  { zh: '经济学', en: 'Economics' },
                  { zh: '生态学', en: 'Ecology' },
                ].map((field) => (
                  <div key={field.en} className="border-t border-border pt-4 text-sm font-medium text-foreground">
                    {t(field.zh, field.en)}
                  </div>
                ))}
              </div>
            </ScrollProgressReveal>
          </div>

          <ScrollProgressReveal direction="right" distance={70} className="space-y-6">
            <div className="border-l-2 border-primary/25 pl-6">
              <h3 className="font-serif text-2xl text-foreground">
                {t('社群的力量', 'The Power of Community')}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                {t(
                  '青少年不是独自完成成长，而是在共同学习、共同研究、共同服务中彼此照亮。',
                  'Young people do not grow alone; they learn, research, and serve together, giving one another steadiness and courage.'
                )}
              </p>
            </div>
            <NetworkAnimation className="h-64 w-full md:h-72" />
          </ScrollProgressReveal>
        </div>
      </section>

      <section id="current-projects" className="section-breathing">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <ScrollProgressReveal direction="up" distance={60}>
                <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-primary/70">
                  Current Projects
                </span>
                <TitleReveal delay={0.1} as="h2" className="font-serif text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">
                  {t('当前行动', 'Current Projects')}
                </TitleReveal>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  {t(
                    '从身心疗愈到田野研究，再到生态社区共建，当前行动把青少年的成长直接放进真实世界。',
                    'From healing to field research to ecological community building, these projects place youth growth directly inside the real world.'
                  )}
                </p>
              </ScrollProgressReveal>
            </div>

            <ScrollProgressReveal direction="up" distance={40}>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/actions"
                  className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-organic hover:-translate-y-0.5 hover:shadow-md"
                >
                  {t('查看行动', 'View Action')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/join"
                  className="inline-flex items-center rounded-full border border-primary/20 bg-background px-6 py-3 text-sm font-medium text-foreground transition-organic hover:-translate-y-0.5 hover:border-primary/35"
                >
                  {t('加入社群', 'Join the Community')}
                </Link>
              </div>
            </ScrollProgressReveal>
          </div>

          <ScrollProgressReveal direction="up" distance={60}>
            <div className="grid gap-6 md:grid-cols-3">
              {currentProjects.map((project) => (
                <CurrentProjectCard key={project.title.en} project={project} lang={lang} />
              ))}
            </div>
          </ScrollProgressReveal>
        </div>
      </section>

      <section className="section-breathing bg-secondary/30 paper-texture">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              {t('我们相信什么', 'What We Believe')}
            </h2>
            <div className="w-12 h-px bg-primary mx-auto" />
          </div>
          <div className="space-y-8">
            {[
              { 
                zh: '自然是最好的老师', 
                en: 'Nature is the best teacher',
                descZh: '在自然中，我们学会观察、感受、敬畏，找回内心的平静与力量。',
                descEn: 'In nature, we learn to observe, feel, and revere — finding inner peace and strength.'
              },
              { 
                zh: '真实世界是最深刻的课堂', 
                en: 'The real world is the deepest classroom',
                descZh: '书本知识需要在真实场景中验证、反思、升华，才能真正内化。',
                descEn: 'Book knowledge must be verified, reflected upon, and elevated in real contexts to be truly internalized.'
              },
              { 
                zh: '青少年不是"未来"，而是正在发生的力量', 
                en: 'Young people are not only the future — they are a present force',
                descZh: '青少年不是"未来"，而是当下改变世界的参与者和推动者。',
                descEn: 'Young people are not just "the future" — they are participants and catalysts changing the world right now.'
              },
              { 
                zh: '修复人心，才能真正修复土地与社会', 
                en: 'Healing people is essential to regenerating land and society',
                descZh: '只有疗愈内心的创伤，才能真正去修复土地与社会。',
                descEn: 'Only by healing inner wounds can we truly regenerate land and society.'
              },
            ].map((belief, i) => (
              <BeliefItem key={i} belief={belief} index={i} t={t} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
