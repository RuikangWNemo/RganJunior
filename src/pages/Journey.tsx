import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { BRAND, pickLocalized } from '@/lib/brand';

const phases = [
  {
    num: '1.0',
    year: '2023.02',
    zh: {
      title: '探索与连接',
      subtitle: '一场属于00-10后的共同学习计划',
      tagline: 'Learn · Give · Connect · Travel · Play',
      description: '走出教室，重新连接自然与社会。我们相信，真正的学习发生在真实世界中。',
      pillars: [
        { num: '01', label: '学习', en: 'Learn', desc: '走出教室，在真实世界中学习' },
        { num: '02', label: '奉献', en: 'Give', desc: '回馈社区，服务他人' },
        { num: '03', label: '连接', en: 'Connect', desc: '与朋友和自然建立连接' },
        { num: '04', label: '旅行', en: 'Travel', desc: '在旅途中寻找自己的声音' },
        { num: '05', label: '玩耍', en: 'Play', desc: '带着有意义的目标去玩耍' },
      ],
      connections: [
        '城市与乡村',
        '科技与自然',
        '个体与整体',
        '东方与西方',
        '物质与精神',
      ],
    },
    en: {
      title: 'Exploration & Connection',
      subtitle: 'A Co-learning Journey for Gen-Z',
      tagline: 'Learn · Give · Connect · Travel · Play',
      description: 'Leaving the classroom, reconnecting with nature and society. We believe true learning happens in the real world.',
      pillars: [
        { num: '01', label: 'Learn', en: 'Learn', desc: 'Learn in the real world outside the classroom' },
        { num: '02', label: 'Give', en: 'Give', desc: 'Give back to community, serve others' },
        { num: '03', label: 'Connect', en: 'Connect', desc: 'Build connections with friends and nature' },
        { num: '04', label: 'Travel', en: 'Travel', desc: 'Find our voices through travel' },
        { num: '05', label: 'Play', en: 'Play', desc: 'Play with meaningful goals' },
      ],
      connections: [
        'City & Village',
        'Technology & Nature',
        'Individual & Wholeness',
        'East & West',
        'Physical & Spiritual',
      ],
    },
    color: 'earth',
  },
  {
    num: '2.0',
    year: '2023.09',
    zh: {
      title: '研究 × 行动',
      subtitle: '从一颗生态柑橘到可持续发展的未来',
      tagline: 'Research into Action',
      description: '以青少年为研究主体，用数据与实践理解世界。从2000+项目中脱颖而出，走向哈佛。',
      milestones: [
        { date: '2023.09', text: '进行调查问卷，了解中学生参与可持续发展农业活动的情况' },
        { date: '2023.10', text: '根据调查结果，为同龄人量身定制有趣而有意义的农业活动，28名同学及家长参与' },
        { date: '2023.11', text: '将成果总结成论文，从2000+小队中脱颖而出，进入CTB全国论坛' },
        { date: '2024.02', text: '最终进入前72名，前往美国哈佛参加CTB全球英文论坛' },
        { date: '2024.05', text: '参与克莱蒙生态文明国际论坛，与中美加三地同学分享生态文明建设经验' },
      ],
      achievements: [
        'CTB全球前3.6%',
        '哈佛决赛圈',
        'YSA Journal论文发表',
        '克莱蒙生态论坛',
      ],
    },
    en: {
      title: 'Research into Action',
      subtitle: 'From an Eco-Citrus to a Sustainable Future',
      tagline: 'Research into Action',
      description: 'Youth-led research using data and practice to understand the world. Standing out from 2,000+ projects, heading to Harvard.',
      milestones: [
        { date: '2023.09', text: 'Conducted surveys on middle school students participating in sustainable agriculture activities' },
        { date: '2023.10', text: 'Designed tailored agricultural activities for peers, with 28 students and parents participating' },
        { date: '2023.11', text: 'Summarized findings into a paper, selected from 2,000+ teams for CTB National Forum' },
        { date: '2024.02', text: 'Advanced to top 72, traveled to Harvard for CTB Global English Forum' },
        { date: '2024.05', text: 'Participated in Claremont Eco-Forum, sharing ecological civilization experiences with peers from China, US, and Canada' },
      ],
      achievements: [
        'CTB Global Top 3.6%',
        'Harvard Finals',
        'YSA Journal Publication',
        'Claremont Eco-Forum',
      ],
    },
    color: 'primary',
  },
  {
    num: '2.5',
    year: '2024.05',
    zh: {
      title: '田野浸润',
      subtitle: '麦昆塔未来乡村研究院校外实习',
      tagline: 'Immersive Field Experience',
      description: '从学术研究走向田野实践，在真实的乡村场景中深化理解、积累经验。',
      practices: [
        { date: '2024.05', title: '再生设计国际生态营', desc: '学习再生设计理念与实践方法' },
        { date: '2025.04', title: '接待耶鲁大学教授', desc: '促进国际学术交流与对话' },
        { date: '2025.07', title: '铁牛青年乡建实践营', desc: '参与青年乡村建设实践' },
        { date: '2025.09', title: '美育教育参访团', desc: '接待中山旗迹艺术中心，探索乡村美育' },
      ],
    },
    en: {
      title: 'Field Immersion',
      subtitle: 'McQuinta Future Rural Institute Practicum',
      tagline: 'Immersive Field Experience',
      description: 'Moving from academic research to field practice, deepening understanding and accumulating experience in real rural settings.',
      practices: [
        { date: '2024.05', title: 'Regenerative Design Eco-Camp', desc: 'Learning regenerative design concepts and practices' },
        { date: '2025.04', title: 'Yale Faculty Visit', desc: 'Facilitating international academic exchange' },
        { date: '2025.07', title: 'Youth Rural Building Camp', desc: 'Participating in youth rural construction practice' },
        { date: '2025.09', title: 'Aesthetic Education Delegation', desc: 'Hosting Zhongshan Qiji Art Center, exploring rural aesthetics' },
      ],
    },
    color: 'forest',
  },
  {
    num: '3.0',
    year: '2025.12',
    zh: {
      title: '校园实验',
      subtitle: '天立国高 × 阿柑少年校园CSA',
      tagline: 'Campus CSA & Behavioral Economics Lab',
      description: '表面是卖盲盒，内核是"行为经济学实地实验"。真实的市场、真实的现金流、真实的社会改变。',
      research: {
        question: '青少年的生态参与，能否重塑父母的消费偏好与环境折现率？',
        targets: [
          '家庭消费习惯',
          '对生态产品的支付意愿',
          '长期生态消费习惯',
        ],
      },
      timeline: [
        { month: '3月', task: '通过无压力的当堂游戏引入经济学概念，完成首批实验家庭招募' },
        { month: '4月', task: '让项目自然收集数据，社团活动转为轻松的角色扮演与观察' },
        { month: '5月', task: '利用积累的真实数据，寻找显著的经济学规律' },
        { month: '6月', task: '总结实验成果，固化社团传承制度，为暑期活动做好知识准备' },
      ],
    },
    en: {
      title: 'Campus Experiment',
      subtitle: 'Tianli × R\'gan Junior Campus CSA',
      tagline: 'Campus CSA & Behavioral Economics Lab',
      description: 'Selling eco-boxes on the surface, a "behavioral economics field lab" at the core. Real market, real cash flow, real social change.',
      research: {
        question: 'Can youth participation in ecology reshape their parents\' consumption preferences and environmental discount rates?',
        targets: [
          'Family purchasing decisions',
          'Willingness to pay for ecological products',
          'Long-term ecological consumption habits',
        ],
      },
      timeline: [
        { month: 'Mar', task: 'Introduce economics concepts through stress-free classroom games, recruit first batch of experimental families' },
        { month: 'Apr', task: 'Let the project naturally collect data, shift to relaxed role-playing and observation' },
        { month: 'May', task: 'Use accumulated real data to find significant economic patterns' },
        { month: 'Jun', task: 'Summarize experimental results, institutionalize club succession, prepare for summer activities' },
      ],
    },
    color: 'primary',
  },
];

// 丝滑浮动的五根柱子组件
function PillarCard({ pillar, index }: { pillar: { num: string; label: string; desc: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const updateProgress = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const maxProgress = 0.7;
  const adjustedProgress = Math.min(1, progress / maxProgress);
  const delay = index * 0.12;

  return (
    <motion.div
      ref={ref}
      className="relative flex-1 group cursor-pointer"
      style={{
        y: useTransform(
          useSpring(adjustedProgress, { stiffness: 100, damping: 20 }),
          [0, 1],
          [30 + index * 5, 0]
        ),
        opacity: useTransform(
          useSpring(adjustedProgress, { stiffness: 100, damping: 20 }),
          [0, 0.3, 1],
          [0, 0.6, 1]
        ),
        scale: useTransform(
          useSpring(adjustedProgress, { stiffness: 100, damping: 20 }),
          [0, 1],
          [0.92, 1]
        ),
        filter: `blur(${(1 - adjustedProgress) * 8}px)`,
        transitionDelay: `${delay}s`,
      }}
    >
      {/* Card */}
      <div 
        className="relative text-center p-5 md:p-6 rounded-xl bg-background/60 border border-border/20 backdrop-blur-sm"
        style={{
          transform: `translateY(${(1 - adjustedProgress) * -8}px)`,
          borderColor: `hsl(var(--border) / ${0.2 + adjustedProgress * 0.2})`,
          boxShadow: adjustedProgress > 0.5 
            ? `0 8px 32px hsl(var(--primary) / ${0.05 * adjustedProgress})` 
            : 'none',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Accent dot */}
        <motion.div 
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-background border-2"
          style={{
            borderColor: `hsl(var(--primary) / ${0.3 + adjustedProgress * 0.7})`,
            scale: 1 + adjustedProgress * 0.2,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
        
        {/* Number */}
        <div 
          className="text-[10px] tracking-[0.2em] mb-4 font-mono"
          style={{ 
            color: `hsl(var(--muted-foreground) / ${0.3 + adjustedProgress * 0.4})`,
            transition: 'color 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {pillar.num}
        </div>
        
        {/* Divider */}
        <div 
          className="h-px mx-auto mb-4 bg-gradient-to-r from-transparent to-transparent"
          style={{ 
            width: `${24 + adjustedProgress * 24}px`,
            background: `linear-gradient(to right, transparent, hsl(var(--primary) / ${0.3 + adjustedProgress * 0.4}), transparent)`,
            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        
        {/* Label */}
        <div 
          className="font-serif text-lg md:text-xl mb-2"
          style={{ 
            color: adjustedProgress > 0.5 ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
            transition: 'color 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {pillar.label}
        </div>
        
        {/* Description */}
        <div 
          className="text-xs leading-relaxed"
          style={{ 
            color: `hsl(var(--muted-foreground) / ${0.5 + adjustedProgress * 0.4})`,
            transition: 'color 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {pillar.desc}
        </div>

        {/* Hover glow */}
        <div 
          className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"
          style={{
            opacity: adjustedProgress * 0.8,
            transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </motion.div>
  );
}

function ConnectionTag({ conn, index }: { conn: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.6 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="px-4 py-2 text-xs tracking-wide rounded-full border border-border/30 text-muted-foreground/70 bg-background/40 backdrop-blur-sm cursor-default"
      whileHover={{
        borderColor: 'hsl(var(--primary) / 0.4)',
        color: 'hsl(var(--foreground))',
        backgroundColor: 'hsl(var(--background) / 0.6)',
        boxShadow: '0 2px 8px hsl(var(--primary) / 0.1)',
        y: -2,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {conn}
    </motion.span>
  );
}

function PillarsSection({ content }: { content: { pillars?: Array<{ num: string; label: string; desc: string }>; connections?: string[] } }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <div ref={sectionRef} className="space-y-10">
      {/* Five Pillars - Horizontal flowing layout */}
      <div className="relative">
        {/* Connecting line */}
        <motion.div 
          className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden md:block"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3 relative">
          {content.pillars.map((pillar, i) => (
            <PillarCard key={i} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
      
      {/* Connections - Flowing tags */}
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {content.connections.map((conn, i) => (
          <ConnectionTag key={i} conn={conn} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Journey() {
  const { lang, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const brandName = pickLocalized(BRAND.name, lang);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableHeight = containerRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setProgress(pct * 100);
      
      // Calculate active phase
      const phaseIndex = Math.min(
        phases.length - 1,
        Math.floor(pct * phases.length)
      );
      setActivePhase(phaseIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderPhaseContent = (phase: typeof phases[0], index: number) => {
    const content = phase[lang];
    
    return (
      <div className="w-screen h-full flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl w-full">
          {/* Phase Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl md:text-7xl font-serif font-bold text-primary/15">
                {phase.num}
              </span>
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-xs tracking-widest text-muted-foreground/60 uppercase">
                {phase.year}
              </span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-3 tracking-tight">
              {content.title}
            </h2>
            
            <p className="text-lg md:text-xl text-primary/80 font-medium mb-4">
              {content.subtitle}
            </p>
            
            <p className="text-sm text-muted-foreground/70 tracking-wide">
              {content.tagline}
            </p>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            {content.description}
          </p>

          {/* Phase-specific content */}
          {index === 0 && (
            <PillarsSection content={content} />
          )}

          {index === 1 && (
            <div className="space-y-8">
              {/* Achievements */}
              <div className="flex flex-wrap gap-3 mb-6">
                {content.achievements.map((achievement, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
              
              {/* Timeline */}
              <div className="space-y-4">
                {content.milestones.map((milestone, i) => (
                  <div 
                    key={i}
                    className="flex gap-4 items-start group"
                  >
                    <div className="flex-shrink-0 w-20 text-xs text-muted-foreground/60 pt-1">
                      {milestone.date}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary/40 mt-1.5 flex-shrink-0 group-hover:bg-primary transition-colors" />
                    <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                      {milestone.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {index === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              {content.practices.map((practice, i) => (
                <div 
                  key={i}
                  className="p-4 md:p-5 rounded-lg border border-border/30 bg-background/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-primary/70 tracking-wider">
                      {practice.date}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {practice.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {practice.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {index === 3 && (
            <div className="space-y-8">
              {/* Research Question */}
              <div className="p-5 md:p-6 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary/70 tracking-wider mb-2 uppercase">
                  {lang === 'zh' ? '核心研究课题' : 'Core Research Question'}
                </p>
                <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
                  {content.research.question}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.research.targets.map((target, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 text-xs rounded-full bg-background border border-border text-muted-foreground"
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Semester Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {content.timeline.map((item, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-lg border border-border/30 bg-background/40 text-center"
                  >
                    <div className="text-lg font-serif font-bold text-primary/60 mb-2">
                      {item.month}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.task}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-20">
      {/* Intro */}
      <section className="section-breathing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h1 data-page-motion="title" className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {t('项目历程', 'Our Journey')}
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p data-page-motion="lead" className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {lang === 'zh'
              ? `${brandName}不是一次活动，而是一条持续演化的成长路径。从成都乡村的一颗生态柑橘出发，我们正在书写一个关于青少年、土地与未来的故事。`
              : `${brandName} is not a one-time program — it is an evolving learning journey. Starting from an eco-citrus in Chengdu's countryside, we are writing a story about youth, land, and the future.`}
          </p>
        </div>
      </section>

      {/* Horizontal scroll section */}
      <div ref={containerRef} style={{ height: '500vh' }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
          </div>

          <div
            className="flex h-full transition-transform duration-100 relative z-10"
            style={{
              width: `${phases.length * 100}vw`,
              transform: `translateX(-${progress * (phases.length - 1) / 100 * 100}vw)`,
            }}
          >
            {phases.map((phase, i) => (
              <div
                key={phase.num}
                className="w-screen h-full flex items-center justify-center"
              >
                {renderPhaseContent(phase, i)}
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64">
            <Progress value={progress} className="h-0.5 bg-border/30" />
          </div>

          {/* Phase navigation */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-8 text-xs">
            {phases.map((p, i) => (
              <button
                key={p.num}
                onClick={() => {
                  const targetProgress = (i / (phases.length - 1)) * 100;
                  const container = containerRef.current;
                  if (container) {
                    const scrollableHeight = container.scrollHeight - window.innerHeight;
                    const targetScroll = container.getBoundingClientRect().top + window.scrollY + (targetProgress / 100 * scrollableHeight);
                    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                  }
                }}
                className={`transition-all duration-300 flex flex-col items-center gap-1 group ${
                  activePhase === i
                    ? 'text-foreground'
                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activePhase === i
                    ? 'bg-primary scale-125'
                    : 'bg-border group-hover:bg-muted-foreground/30'
                }`} />
                <span className="font-medium">{p.num}</span>
                <span className="text-[10px] opacity-70">{p.year}</span>
              </button>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/40 tracking-wider">
            {t('向下滚动探索', 'Scroll to explore')}
          </div>
        </div>
      </div>

      {/* Research section */}
      <section className="section-breathing">
        <div data-page-motion="actions" className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 text-center">
            {t('研究成果', 'Research Outcomes')}
          </h2>
          <div className="w-12 h-px bg-primary mx-auto mb-6" />
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            {t(
              '从田野到学术，我们的研究连接着真实世界与知识生产',
              'From field to academia, our research connects the real world with knowledge production'
            )}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CTB Research */}
            <div className="border border-border rounded-lg p-8 bg-background paper-texture group transition-organic hover:shadow-md hover:border-primary/30">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {t('CTB 全球青年研究创新论坛', 'CTB Global Youth Research Forum')}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">
                  {t('青少年参与可持续农业的路径研究', 'Pathways for Youth Participation in Sustainable Agriculture')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    '从全球2000+项目中入选前72名，在哈佛大学展示研究成果，探索青少年如何通过参与可持续农业活动建立环境意识。',
                    'Selected among top 72 from 2,000+ global projects, presented research at Harvard University on how youth can build environmental awareness through sustainable agriculture participation.'
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['可持续农业', '青少年发展', '行为经济学', '田野研究'].map((kw) => (
                    <span key={kw} className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
                <button className="text-sm text-primary transition-organic hover:underline underline-offset-4">
                  {t('查看论文 / View Paper', 'View Paper')}
                </button>
              </div>
            </div>

            {/* Campus CSA Research */}
            <div className="border border-border rounded-lg p-8 bg-background paper-texture group transition-organic hover:shadow-md hover:border-primary/30">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-forest/10 text-forest">
                    {t('校园 CSA 实验室', 'Campus CSA Lab')}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">
                  {t('青少年生态参与对家庭消费偏好的影响', 'Impact of Youth Ecological Participation on Family Consumption Preferences')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    '在天立国高建立行为经济学实地实验室，通过真实的CSA运营，研究青少年生态参与能否重塑父母的消费偏好与环境折现率。',
                    'Established a behavioral economics field lab at Tianli International High School, studying whether youth ecological participation can reshape parental consumption preferences through real CSA operations.'
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['行为经济学', 'CSA', '消费偏好', '环境折现率'].map((kw) => (
                    <span key={kw} className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
                <button className="text-sm text-primary transition-organic hover:underline underline-offset-4">
                  {t('了解详情 / Learn More', 'Learn More')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline summary */}
      <section className="section-breathing bg-secondary/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-12 text-center">
            {t('时间轴', 'Timeline')}
          </h2>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border/40" />
            
            {/* Timeline items */}
            <div className="space-y-12">
              {[
                { date: '2023.02', event: t('阿柑少年计划1.0启动', 'R\'gan Junior 1.0 Launch') },
                { date: '2023.09', event: t('2.0研究阶段开始', 'Phase 2.0 Research Begins') },
                { date: '2024.02', event: t('哈佛CTB全球论坛', 'Harvard CTB Global Forum') },
                { date: '2024.05', event: t('克莱蒙生态文明论坛', 'Claremont Eco-Forum') },
                { date: '2025.04', event: t('接待耶鲁大学教授', 'Yale Faculty Visit') },
                { date: '2025.12', event: t('3.0校园CSA启动', 'Phase 3.0 Campus CSA Launch') },
              ].map((item, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-6 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="text-xs text-primary/70 tracking-wider">{item.date}</span>
                    <p className="text-foreground font-medium mt-1">{item.event}</p>
                  </div>
                  
                  <div className="w-3 h-3 rounded-full bg-primary/60 border-2 border-background z-10 flex-shrink-0" />
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}