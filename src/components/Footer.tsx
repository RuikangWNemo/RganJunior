import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { BRAND, CONTACT_EMAIL, OFFICIAL_LOGO_PATH, pickLocalized } from '@/lib/brand';

export default function Footer() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const brandName = pickLocalized(BRAND.name, lang);
  const brandTagline = pickLocalized(BRAND.tagline, lang);
  const officialLogoAlt = pickLocalized(BRAND.logoAlt, lang);
  const isJoinRoute = location.pathname === '/join' || location.pathname.startsWith('/join/');

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-4">
            <img
              src={OFFICIAL_LOGO_PATH}
              alt={officialLogoAlt}
              className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
            />
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                {brandName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {brandTagline}
              </p>
            </div>
          </div>
          <div className={`text-sm text-muted-foreground ${isJoinRoute ? '' : 'hidden md:block'}`}>
            <p>{t('联系我们', 'Contact Us')}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="cursor-target mt-1 block text-foreground transition-colors hover:text-primary"
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
