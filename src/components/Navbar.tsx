import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';
import { BRAND, pickLocalized } from '@/lib/brand';

const navItems = [
  { path: '/', zh: '首页', en: 'Home' },
  { path: '/about', zh: '关于', en: 'About' },
  { path: '/actions', zh: '行动', en: 'Action' },
  { path: '/join', zh: '加入我们', en: 'Join Us' },
];

interface NavbarProps {
  hideLogo?: boolean;
}

export default function Navbar({ hideLogo = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [logoVisible, setLogoVisible] = useState(!hideLogo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const brandName = pickLocalized(BRAND.name, lang);
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setLogoVisible(!hideLogo || y > 240);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hideLogo]);

  useEffect(() => {
    setMenuOpen(false);
    setPendingPath(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const showLogo = logoVisible;

  const handleMobileNavigate = (path: string) => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    if (path === location.pathname) {
      setPendingPath(null);
      setMenuOpen(false);
      return;
    }

    setPendingPath(path);
    setMenuOpen(false);

    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path);
      navigationTimeoutRef.current = null;
    }, 90);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-organic ${
          scrolled
            ? 'bg-background/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo with mascot */}
          <Link
            to="/"
            aria-label={brandName}
            className={`flex items-center gap-2 group transition-all duration-500 ease-out ${
              showLogo ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            <img
              src={mascotWide}
              alt={mascotAlt}
              className="h-8 md:h-10 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
            />
            <span className="font-serif text-lg md:text-xl font-semibold text-foreground transition-organic group-hover:text-primary">
              {brandName}
            </span>
          </Link>

          {/* Desktop nav */}
          <LayoutGroup>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const label = lang === 'zh' ? item.zh : item.en;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 text-sm transition-organic hover:text-primary group"
                >
                  <span className={`relative inline-flex pb-1 transition-organic ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {label}
                    {isActive ? (
                      <motion.span
                        layoutId="desktop-nav-active"
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-full rounded-full bg-primary"
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <span
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-0 rounded-full bg-primary opacity-0 transition-all duration-400 ease-out group-hover:w-full group-hover:opacity-50"
                      />
                    )}
                  </span>
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
          </LayoutGroup>

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
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/98 backdrop-blur-lg md:hidden"
          >
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path;
              const isPending = pendingPath === item.path;
              const label = lang === 'zh' ? item.zh : item.en;

              return (
                <motion.button
                  key={item.path}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.06 + i * 0.05,
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    transition: {
                      duration: 0.16,
                      ease: [0.4, 0, 1, 1],
                    },
                  }}
                  onClick={() => handleMobileNavigate(item.path)}
                  className={`font-serif text-3xl transition-all duration-300 ease-out hover:text-primary touch-target-apple ${
                    isActive || isPending ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  <span className="relative inline-flex pb-1">
                    {label}
                    {(isActive || isPending) && (
                      <motion.span
                        layoutId="mobile-nav-active"
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-full rounded-full bg-primary"
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
