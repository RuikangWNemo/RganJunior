import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const items = [
  { path: '/impact', zh: '统计', en: 'Overview' },
  { path: '/impact/awards', zh: '获奖情况', en: 'Recognition' },
];

export function ImpactSectionNav() {
  const { lang, t } = useLanguage();
  const location = useLocation();

  return (
    <nav
      aria-label={t('Impact 栏目', 'Impact sections')}
      className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm"
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center border-b transition-colors ${
              isActive
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {lang === 'zh' ? item.zh : item.en}
          </Link>
        );
      })}
    </nav>
  );
}
