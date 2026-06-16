import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND, pickLocalized } from '@/lib/brand';

const sections = [
  {
    id: 'nature',
    titleZh: '自然探索',
    titleEn: 'Natural Discovery',
    descZh: '走进荒野，观察生态系统中的每一个细微变化',
    descEn: 'Venturing into the wild, observing every subtle change in the ecosystem',
  },
  {
    id: 'field',
    titleZh: '田野调查',
    titleEn: 'Field Investigation',
    descZh: '以科学方法记录乡村生态，从土壤到社区',
    descEn: 'Documenting rural ecology with scientific methods — from soil to community',
  },
];

export default function FieldResearch() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <div className="pt-20">
      {/* Intro */}
      <section className="section-breathing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 data-page-motion="title" className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            {lang === 'zh' ? `${brandName}在田野` : `${brandName} in the Field`}
          </h1>
          <div className="w-12 h-px bg-primary mb-8" />
          <p data-page-motion="lead" className="text-muted-foreground max-w-2xl">
            {t(
              '从城市到乡村，再到荒野——在纵深体验中寻找自然与人的对话',
              'From city to countryside to wilderness — finding the dialogue between nature and humanity through immersive experiences'
            )}
          </p>
        </div>
      </section>

      {/* Sections */}
      {sections.map((sec) => (
        <HorizontalSection key={sec.id} section={sec} t={t} />
      ))}
    </div>
  );
}

function HorizontalSection({ section, t }: { section: typeof sections[0]; t: (zh: string, en: string) => string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section data-page-motion="actions" className="pb-24 md:pb-32">
      <div className="container mx-auto px-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground">
            {t(section.titleZh, section.titleEn)}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 border border-border rounded-full transition-organic hover:border-foreground">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-border rounded-full transition-organic hover:border-foreground">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t(section.descZh, section.descEn)}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="min-w-[300px] md:min-w-[400px] h-[280px] md:h-[320px] rounded-lg bg-secondary/50 border border-border flex items-center justify-center snap-start paper-texture transition-organic hover:shadow-md"
          >
            <span className="text-sm text-muted-foreground relative z-10">
              {t('（活动内容待补充）', '(Activity content TBD)')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
