import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-3">
            <img src={mascotWide} alt="阿柑" className="h-8 opacity-60" />
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {t('阿柑少年', "R'gan Junior")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('在真实世界中，长成自己', 'Growing into Ourselves in the Real World')}
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>{t('联系我们', 'Contact Us')}</p>
            <p className="mt-1 text-foreground">{t('（邮箱待补充）', '(Email TBD)')}</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {t('阿柑少年', "R'gan Junior")} · {t('在真实世界中，长成自己', 'Growing into Ourselves in the Real World')}
        </div>
      </div>
    </footer>
  );
}
