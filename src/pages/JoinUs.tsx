import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, Heart, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JoinUs() {
  const { t } = useLanguage();

  return (
    <div className="pt-20">
      <section className="section-breathing">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
            {t('你可以如何加入', 'How You Can Join')}
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-16" />

          <div className="grid md:grid-cols-2 gap-10 md:gap-12 text-left mb-16">
            {/* Youth */}
            <div className="border border-border rounded-lg p-8 md:p-10 paper-texture group transition-organic hover:shadow-md hover:border-primary/30">
              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-full border border-border flex items-center justify-center transition-organic group-hover:border-primary group-hover:bg-primary/5">
                  <GraduationCap size={22} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-4">
                  {t('面向青少年', 'For Youth')}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
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
            <div className="border border-border rounded-lg p-8 md:p-10 paper-texture group transition-organic hover:shadow-md hover:border-primary/30">
              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-full border border-border flex items-center justify-center transition-organic group-hover:border-primary group-hover:bg-primary/5">
                  <Heart size={22} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-4">
                  {t('面向家长', 'For Parents')}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
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

          {/* Partners */}
          <div className="border border-border rounded-lg p-8 md:p-10 paper-texture group transition-organic hover:shadow-md hover:border-primary/30 text-left max-w-lg mx-auto mb-16">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 mb-6 rounded-full border border-border flex items-center justify-center transition-organic group-hover:border-primary group-hover:bg-primary/5">
                <Handshake size={22} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                {t('合作伙伴', 'Partners')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t(
                  '与我们共同推动乡村生态可持续发展',
                  'Work with us to advance rural ecological sustainability'
                )}
              </p>
              <Button variant="outline" className="rounded-full transition-organic">
                {t('了解更多', 'Learn More')}
              </Button>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-secondary/30 rounded-lg paper-texture">
            <p className="text-muted-foreground relative z-10">
              {t('（联络表单与更多信息待补充）', '(Contact form and details TBD)')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
