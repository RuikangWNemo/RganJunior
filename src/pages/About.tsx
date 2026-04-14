import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            {t('关于阿柑少年', 'About Rgan Junior')}
          </h1>
          <div className="w-12 h-px bg-primary mb-12" />

          {/* Nate intro */}
          <div className="mb-20">
            <h2 className="font-serif text-2xl text-foreground mb-4">
              {t('发起人：Nate', 'Founder: Nate')}
            </h2>
            <div className="bg-secondary/30 rounded-lg p-8 md:p-12 paper-texture">
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {t('（Nate的个人故事与初心介绍待补充）', '(Nate\'s personal story and founding vision TBD)')}
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="font-serif text-2xl text-foreground mb-8">
              {t('团队成员', 'Team Members')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary border border-border" />
                  <p className="text-sm text-muted-foreground">
                    {t('（待补充）', '(TBD)')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tieniu Village */}
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-4">
              {t('铁牛村的故事', 'The Story of Tieniu Village')}
            </h2>
            <div className="bg-secondary/30 rounded-lg p-8 md:p-12 paper-texture">
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {t(
                  '（铁牛村的生态转型背景——从单一橘林、土壤板结到生态多样性恢复的故事待补充）',
                  '(The ecological transformation of Tieniu Village — from monoculture citrus groves to biodiversity restoration — TBD)'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
