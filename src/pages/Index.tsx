import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import mascotFull from '@/assets/mascot-full.png';

type DecorativePanelProps = {
  badge: string;
  title: string;
  caption: string;
  chips: string[];
};

function DecorativePanel({ badge, title, caption, chips }: DecorativePanelProps) {
  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-xs aspect-[4/5] overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-br from-background via-secondary/75 to-accent/10 shadow-md paper-texture"
    >
      <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute bottom-10 -left-8 h-28 w-28 rounded-full border border-primary/15" />
      <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-7">
        <div>
          <span className="inline-flex rounded-full border border-primary/15 bg-background/75 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80 backdrop-blur-sm">
            {badge}
          </span>
        </div>

        <div className="space-y-3">
          {chips.map((chip) => (
            <div
              key={chip}
              className="w-fit rounded-full border border-border/80 bg-background/80 px-4 py-2 text-sm text-foreground/80 shadow-sm backdrop-blur-sm"
            >
              {chip}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-serif text-2xl text-foreground/90">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{caption}</p>
        </div>
      </div>
    </div>
  );
}

function AudienceBadge({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-gradient-to-br from-secondary via-background to-accent/15 shadow-sm"
    >
      <div className="absolute inset-2 rounded-full border border-primary/10" />
      <span className="relative font-serif text-xl text-primary">{label}</span>
    </div>
  );
}

export default function Index() {
  const { t } = useLanguage();
  const [ctaOpen, setCtaOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroMascotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SCROLL_RANGE = 300;
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const progress = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
        setScrollProgress(progress);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Interpolation: hero center → navbar logo position
  const docked = scrollProgress >= 1;
  const startScale = 1;
  const endScale = 0.25;
  const currentScale = startScale + (endScale - startScale) * scrollProgress;

  // Start position: centered horizontally, ~35% from top
  // End position: top-left (approx 24px from left, 10px from top on md)
  const startX = 0;
  const startY = 0;
  // Calculate end offsets (from center to top-left corner)
  // On desktop: navbar logo is about at left:80px, top:40px from viewport center
  const endX = typeof window !== 'undefined' ? -(window.innerWidth / 2 - 80) : -500;
  const endY = typeof window !== 'undefined' ? -(window.innerHeight * 0.35 - 38) : -200;

  const currentX = startX + (endX - startX) * scrollProgress;
  const currentY = startY + (endY - startY) * scrollProgress;

  return (
    <>
      {/* Fixed mascot that animates from hero center to navbar */}
      <div
        className="fixed z-[55] pointer-events-none"
        style={{
          top: '35vh',
          left: '50%',
          transform: `translate(calc(-50% + ${currentX}px), calc(${currentY}px)) scale(${currentScale})`,
          transition: 'none',
          opacity: docked ? 0 : 1,
        }}
      >
        <img
          src={mascotFull}
          alt="阿柑"
          className={`w-32 md:w-48 drop-shadow-xl ${scrollProgress === 0 ? 'animate-float-breath' : ''}`}
          draggable={false}
        />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center paper-texture overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full border border-primary/10 opacity-40" />
        <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border border-accent/20 opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-primary/20" />

        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Invisible spacer for the mascot */}
          <div ref={heroMascotRef} className="w-32 md:w-48 h-32 md:h-48 mx-auto mb-6" />

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-4 animate-fade-in-up">
            {t('阿柑少年', "R'gan Junior")}
          </h1>
          <p className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground/80 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('当代青少年的生命觉醒之路', 'A Path of Awakening for a New Generation')}
          </p>
          <p className="text-base md:text-lg text-primary font-medium tracking-wider mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {t('对内疗愈人心 · 对外修复土壤', 'Healing People Within · Regenerating Land Without')}
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            {t(
              '在一个高度焦虑、不确定的时代，\n我们选择让青少年回到自然、走进社区、\n在真实世界中重新认识自己与社会。',
              'In an age of anxiety and uncertainty,\nwe invite young people to return to nature,\nenter real communities,\nand rediscover themselves through real-world action.'
            ).split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={() => setCtaOpen(true)}
              className="rounded-full px-8 py-6 text-base transition-organic hover:shadow-lg hover:scale-105"
            >
              {t('加入我们', 'Join Us')}
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Link to="/journey">
              <Button variant="outline" className="rounded-full px-8 py-6 text-base transition-organic hover:scale-105">
                {t('了解我们的行动', 'Explore Our Journey')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
          <span className="text-xs tracking-widest">{t('向下滚动', 'Scroll')}</span>
          <div className="w-px h-8 bg-border animate-pulse" />
        </div>
      </section>

      {/* Section 1: Why we exist */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-3">
              <div className="mb-10">
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                  {t('我们为什么存在', "Why R'gan Junior Exists")}
                </h2>
                <div className="w-12 h-px bg-primary" />
              </div>
              <div className="text-base md:text-lg text-muted-foreground leading-loose space-y-6">
                <p>{t(
                  '当代青少年面临着前所未有的压力：学业竞争、未来不确定性、与自然和真实生活的疏离。',
                  'Young people today face unprecedented pressure: academic competition, uncertainty about the future, and disconnection from nature and real life.'
                )}</p>
                <p>{t(
                  '我们发现，仅靠课堂教育，很难回答他们内心最真实的问题：',
                  'Classrooms alone cannot answer their deepest questions:'
                )}</p>
                <div className="py-4 space-y-2">
                  {[
                    { zh: '我是谁？', en: 'Who am I?' },
                    { zh: '我能为这个世界做什么？', en: 'What can I contribute to the world?' },
                    { zh: '什么样的人生才是有意义的？', en: 'What kind of life is truly meaningful?' },
                  ].map((q, i) => (
                    <p key={i} className="font-serif text-xl md:text-2xl text-foreground italic">{t(q.zh, q.en)}</p>
                  ))}
                </div>
                <p className="text-foreground font-medium pt-2">
                  {t('阿柑少年由此诞生。', "This is why R'gan Junior was created.")}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center">
              <DecorativePanel
                badge={t('存在', 'Purpose')}
                title={t('从真实问题出发', 'Rooted in real questions')}
                caption={t(
                  '保留这一块的视觉重量，但改成更克制的抽象版式，让文字继续成为主角。',
                  'This keeps the visual balance while letting the copy remain the main focus.'
                )}
                chips={[
                  t('我是谁？', 'Who am I?'),
                  t('我能做什么？', 'What can I do?'),
                  t('什么是有意义？', 'What matters?'),
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Where we come from */}
      <section className="section-breathing bg-secondary/30 paper-texture">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2 flex justify-center order-2 md:order-1">
              <DecorativePanel
                badge={t('来源', 'Origins')}
                title={t('社区、土地与行动现场', 'Community, land, and lived context')}
                caption={t(
                  '用纸感与层次保留乡村段落的气质，不再依赖临时插图来撑起画面。',
                  'The section keeps its grounded atmosphere without relying on ad hoc illustration.'
                )}
                chips={[
                  t('果园', 'Orchards'),
                  t('田地', 'Fields'),
                  t('村庄', 'Village'),
                ]}
              />
            </div>
            <div className="md:col-span-3 order-1 md:order-2">
              <div className="mb-10">
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                  {t('我们从哪里来', 'Where We Come From')}
                </h2>
                <div className="w-12 h-px bg-primary" />
              </div>
              <div className="text-base md:text-lg text-muted-foreground leading-loose space-y-6">
                <p>{t(
                  '阿柑少年诞生于中国四川蒲江铁牛村——一个正在进行生态农业与乡村转型实践的真实社区。',
                  "R'gan Junior was born in Tie Niu Village, a real community undergoing regenerative agricultural transformation in China."
                )}</p>
                <p>{t(
                  '在这里，青少年不是"参观者"，而是研究者、记录者、行动者。',
                  'Here, young people are not visitors, but researchers, observers, and participants.'
                )}</p>
                <p>{t(
                  '他们走进果园、田地与村庄，理解经济、生态与社会如何真实地运作。',
                  'They step into orchards, fields, and villages to understand how economy, ecology, and society truly function.'
                )}</p>
                <p className="text-foreground font-medium">{t(
                  '现在，越来越多的志同道合的青少年，正从全国各地汇聚起来，一起迈向这段共同的探索旅程。',
                  'Now, more like-minded teenagers from all over the country are gathering in Tieniu Village to join this journey of collective exploration.'
                )}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How we act */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              {t('我们如何行动', 'How We Learn & Act')}
            </h2>
            <div className="w-12 h-px bg-primary mx-auto" />
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-loose text-center mb-12 max-w-2xl mx-auto">
            {t(
              '阿柑少年不是一次活动，而是一条持续演化的成长路径。我们经历了三个阶段：',
              "R'gan Junior is not a one-time program. It is an evolving learning journey. Our path includes three phases:"
            )}
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                num: '1.0',
                zh: '探索与连接',
                en: 'Exploration & Connection',
                descZh: '走出教室，重新连接自然与社会',
                descEn: 'Leaving the classroom, reconnecting with nature and society',
              },
              {
                num: '2.0',
                zh: '研究 × 行动',
                en: 'Research into Action',
                descZh: '以青少年为研究主体，用数据与实践理解世界。参加CTB国际竞赛，并入围哈佛大学决赛阶段',
                descEn: 'Youth-led research using data and practice to understand the world. Participated in CTB competition, advancing to the Harvard finals',
              },
              {
                num: '2.5 / 3.0',
                zh: '向内修复 × 向外服务',
                en: 'Inner Healing, Outer Service',
                descZh: '先疗愈自己，再把经验转化为服务更多人的方法',
                descEn: 'Healing ourselves first, then transforming experience into service for others',
              },
            ].map((phase) => (
              <Link
                to="/journey"
                key={phase.num}
                className="group p-6 md:p-8 rounded-lg border border-border bg-background/50 transition-all duration-400 ease-out hover:shadow-md hover:border-primary/30 hover:-translate-y-1 text-left"
              >
                <span className="text-3xl md:text-4xl font-serif text-primary/30 font-bold block mb-3">
                  {phase.num}
                </span>
                <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-organic">
                  {t(phase.zh, phase.en)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(phase.descZh, phase.descEn)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: What we believe */}
      <section className="section-breathing bg-secondary/30 paper-texture">
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              {t('我们相信什么', 'What We Believe')}
            </h2>
            <div className="w-12 h-px bg-primary mx-auto" />
          </div>
          <div className="space-y-8">
            {[
              { zh: '自然是最好的老师', en: 'Nature is the best teacher' },
              { zh: '真实世界是最深刻的课堂', en: 'The real world is the deepest classroom' },
              { zh: '青少年不是"未来"，而是正在发生的力量', en: 'Young people are not only the future — they are a present force' },
              { zh: '修复人心，才能真正修复土地与社会', en: 'Healing people is essential to regenerating land and society' },
            ].map((belief, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-3 shrink-0 transition-transform duration-300 group-hover:scale-150" />
                <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed transition-organic group-hover:text-primary/80">
                  {t(belief.zh, belief.en)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Join */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              {t('你可以如何加入', 'How You Can Join')}
            </h2>
            <div className="w-12 h-px bg-primary mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Youth */}
            <div className="border border-border rounded-lg p-8 md:p-10 paper-texture transition-all duration-400 ease-out hover:shadow-md hover:border-primary/30 hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <AudienceBadge label={t('青', 'Y')} />
                  <h3 className="font-serif text-xl text-foreground">
                    {t('面向青少年', 'For Youth')}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t(
                    '如果你感到：焦虑、迷茫、疲惫；对世界有疑问，却找不到方向；渴望自然、真实与意义——',
                    'If you feel anxious, uncertain, or disconnected, and long for meaning, nature, and real engagement —'
                  )}
                </p>
                <p className="text-foreground font-medium">
                  {t('阿柑少年欢迎你。', "R'gan Junior welcomes you.")}
                </p>
              </div>
            </div>
            {/* Parents */}
            <div className="border border-border rounded-lg p-8 md:p-10 paper-texture transition-all duration-400 ease-out hover:shadow-md hover:border-primary/30 hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <AudienceBadge label={t('家', 'P')} />
                  <h3 className="font-serif text-xl text-foreground">
                    {t('面向家长', 'For Parents')}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t(
                    '如果你希望孩子：身心更健康；不只是"成绩优秀"，而是"人生稳健"；在真实世界中成长，而不被焦虑吞没——',
                    'If you hope your child grows not only academically, but with resilience, purpose, and well-being —'
                  )}
                </p>
                <p className="text-foreground font-medium">
                  {t('欢迎了解并支持阿柑少年。', "We invite you to learn more about R'gan Junior.")}
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button
              onClick={() => setCtaOpen(true)}
              className="rounded-full px-8 py-6 text-base transition-organic hover:shadow-lg hover:scale-105"
            >
              {t('加入我们', 'Join Us')}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Dialog */}
      <Dialog open={ctaOpen} onOpenChange={setCtaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {t('加入阿柑少年', "Join R'gan Junior")}
            </DialogTitle>
            <DialogDescription>
              {t('报名通道即将开放，敬请期待', 'Registration opening soon — stay tuned')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground text-sm">
            {t('（报名表单内容待补充）', '(Registration form content TBD)')}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
