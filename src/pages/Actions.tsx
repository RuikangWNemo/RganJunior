import { useLanguage } from '@/contexts/LanguageContext';

export default function Actions() {
  const { t } = useLanguage();

  return (
    <div className="pt-20">
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            {t('行动与记录', 'Action & Records')}
          </h1>
          <div className="w-12 h-px bg-primary mb-8" />
          <p className="text-muted-foreground max-w-2xl mb-16">
            {t(
              '实地活动、跨代际共创的影像和照片记录，沉淀项目成果',
              'Visual documentation of field activities and intergenerational co-creation, preserving project outcomes'
            )}
          </p>

          {/* Gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className={`rounded-lg bg-secondary/50 border border-border paper-texture transition-organic hover:shadow-md flex items-center justify-center ${
                  i % 3 === 0 ? 'aspect-[4/3]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[3/4]'
                }`}
              >
                <span className="text-xs text-muted-foreground relative z-10">
                  {t('（影像待补充）', '(Media TBD)')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
