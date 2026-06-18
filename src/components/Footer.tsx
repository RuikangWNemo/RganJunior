import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';
import { BRAND, CONTACT_EMAIL, pickLocalized } from '@/lib/brand';

export default function Footer() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const brandTagline = pickLocalized(BRAND.tagline, lang);
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-3">
            <img src={mascotWide} alt={mascotAlt} className="h-8 opacity-60" />
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {brandName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {brandTagline}
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>{t('联系我们', 'Contact Us')}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-1 block text-foreground transition-colors hover:text-primary"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {brandName} · {brandTagline}
        </div>
      </div>
    </footer>
  );
}
