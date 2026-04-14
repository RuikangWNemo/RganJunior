import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';

const phases = [
  {
    num: '1.0',
    zh: '探索与连接',
    en: 'Exploration & Connection',
    descZh: '走出教室，重新连接自然与社会',
    descEn: 'Leaving the classroom, reconnecting with nature and society',
    color: 'earth',
  },
  {
    num: '2.0',
    zh: '研究 × 行动',
    en: 'Research into Action',
    descZh: '以青少年为研究主体，用数据与实践理解世界。参加CTB国际竞赛，并入围哈佛大学决赛阶段',
    descEn: 'Youth-led research using data and practice. Participated in CTB competition, advancing to the Harvard finals',
    color: 'primary',
  },
  {
    num: '2.5 / 3.0',
    zh: '向内修复 × 向外服务',
    en: 'Inner Healing, Outer Service',
    descZh: '先疗愈自己，再把经验转化为服务更多人的方法',
    descEn: 'Healing ourselves first, then transforming experience into service for others',
    color: 'forest',
  },
];

export default function Journey() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableHeight = containerRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setProgress(pct * 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pt-20">
      {/* Intro */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            {t('项目历程', 'Our Journey')}
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(
              '阿柑少年不是一次活动，而是一条持续演化的成长路径',
              "R'gan Junior is not a one-time program — it is an evolving learning journey"
            )}
          </p>
        </div>
      </section>

      {/* Horizontal scroll section */}
      <div ref={containerRef} style={{ height: '400vh' }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            className="flex h-full transition-transform duration-100"
            style={{
              width: `${phases.length * 100}vw`,
              transform: `translateX(-${progress * (phases.length - 1) / 100 * 100}vw)`,
            }}
          >
            {phases.map((phase, i) => (
              <div
                key={phase.num}
                className="w-screen h-full flex items-center justify-center px-6"
              >
                <div className="max-w-2xl text-center">
                  {i === 0 && (
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-dashed border-accent/50" />
                  )}
                  {i === 1 && (
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full border border-primary/40" />
                      <div className="w-8 h-px bg-primary/30" />
                      <div className="w-12 h-12 rounded-full border border-primary/40" />
                      <div className="w-8 h-px bg-primary/30" />
                      <div className="w-12 h-12 rounded-full border border-primary/40" />
                    </div>
                  )}
                  {i === 2 && (
                    <div className="mx-auto mb-6 w-24 h-24 border border-foreground/20 flex items-center justify-center">
                      <div className="w-16 h-16 border border-foreground/10 flex items-center justify-center">
                        <div className="w-8 h-8 border border-foreground/10" />
                      </div>
                    </div>
                  )}

                  <span className="text-6xl md:text-8xl font-serif font-bold text-primary/20 block mb-4">
                    {phase.num}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                    {t(phase.zh, phase.en)}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {t(phase.descZh, phase.descEn)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48">
            <Progress value={progress} className="h-0.5 bg-border" />
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-6 text-xs text-muted-foreground">
            {phases.map((p, i) => (
              <span
                key={p.num}
                className={`transition-organic ${
                  progress >= (i / (phases.length - 1)) * 100 - 10
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {p.num}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Research section */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 text-center">
            {t('研究板块', 'Research')}
          </h2>
          <div className="w-12 h-px bg-primary mx-auto mb-6" />
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            {t(
              '主题 → 方法 → 洞察 → 讨论',
              'Theme → Method → Insight → Discussion'
            )}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-lg p-8 bg-background paper-texture group transition-organic hover:shadow-md hover:border-primary/30">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                      {t('研究课题', 'Research Topic')}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3">
                    {t('（课题标题待补充）', '(Topic title TBD)')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('（课题描述待补充）', '(Topic description TBD)')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Keyword 1', 'Keyword 2', 'Keyword 3'].map((kw) => (
                      <span key={kw} className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <button className="text-sm text-primary transition-organic hover:underline underline-offset-4">
                    {t('预览 / 下载 PDF', 'Preview / Download PDF')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
