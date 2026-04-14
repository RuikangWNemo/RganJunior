import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';

const navItems = [
  { path: '/', zh: '首页', en: 'Home' },
  { path: '/about', zh: '关于', en: 'About' },
  { path: '/journey', zh: '历程', en: 'Journey' },
  { path: '/field-research', zh: '田野活动', en: 'Field Research' },
  { path: '/actions', zh: '行动记录', en: 'Actions' },
  { path: '/voices', zh: '伙伴之声', en: 'Voices' },
  { path: '/join', zh: '加入我们', en: 'Join Us' },
];

interface NavbarProps {
  hideLogo?: boolean;
}

export default function Navbar({ hideLogo = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const showLogo = !hideLogo || scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-organic ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-6">
          {/* Logo with mascot */}
          <Link
            to="/"
            className={`flex items-center gap-2 group transition-all duration-500 ease-out ${
              showLogo ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            <img
              src={mascotWide}
              alt="阿柑"
              className="h-8 md:h-10 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
            />
            <span className="font-serif text-lg md:text-xl font-semibold text-foreground transition-organic group-hover:text-primary">
              {t('阿柑少年', "R'gan Junior")}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 text-sm transition-organic hover:text-primary group"
                >
                  <span className={`transition-organic ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {lang === 'zh' ? item.zh : item.en}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-400 ease-out ${
                      isActive ? 'w-4/5 opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
                    }`}
                  />
                </Link>
              );
            })}
            
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="relative ml-4 text-xs border border-border rounded-full px-4 py-1.5 text-muted-foreground transition-organic hover:text-foreground hover:border-foreground overflow-hidden"
            >
              <span className="inline-block transition-all duration-400 ease-out">
                {lang === 'zh' ? 'EN' : '中文'}
              </span>
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-xs border border-border rounded-full px-2.5 py-0.5 text-muted-foreground transition-organic"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-foreground p-1"
              aria-label="Toggle menu"
            >
              <span className={`block transition-all duration-300 ${menuOpen ? 'rotate-90 scale-110' : ''}`}>
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/98 backdrop-blur-sm flex flex-col items-center justify-center gap-6 transition-all duration-500 ease-out ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-serif text-2xl transition-all duration-500 ease-out hover:text-primary ${
                isActive ? 'text-primary' : 'text-foreground'
              }`}
              style={{
                transitionDelay: menuOpen ? `${i * 60}ms` : '0ms',
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: menuOpen ? 1 : 0,
              }}
            >
              {lang === 'zh' ? item.zh : item.en}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}