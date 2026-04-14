import { useLanguage } from '@/contexts/LanguageContext';

export default function Voices() {
  const { t } = useLanguage();

  const placeholderVoices = [1, 2, 3, 4];

  return (
    <div className="pt-20">
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            {t('伙伴之声', 'Youth Voices')}
          </h1>
          <div className="w-12 h-px bg-primary mb-8" />
          <p className="text-muted-foreground max-w-2xl mb-16">
            {t(
              '来自田野的第一视角感悟与反思',
              'First-person reflections and insights from the field'
            )}
          </p>

          <div className="space-y-12">
            {placeholderVoices.map((i) => (
              <blockquote
                key={i}
                className="border-l-2 border-primary/30 pl-8 md:pl-12 py-4"
              >
                <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-4 italic">
                  {t('（伙伴感悟内容待补充）', '(Partner reflection TBD)')}
                </p>
                <footer className="text-sm text-muted-foreground">
                  — {t('（姓名待补充）', '(Name TBD)')}, {t('（身份待补充）', '(Role TBD)')}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
