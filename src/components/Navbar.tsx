import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';
import { BRAND, pickLocalized } from '@/lib/brand';
import {
  ABOUT_CHAPTER_CHANGE_EVENT,
  isAboutChapterId,
  readAboutChapterHash,
  requestAboutChapter,
  type AboutChapterId,
} from '@/lib/aboutNavigation';
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  { path: '/', zh: '首页', en: 'Home' },
  { path: '/about', zh: '关于', en: 'About' },
  { path: '/actions', zh: '行动', en: 'Action' },
  { path: '/join', zh: '加入我们', en: 'Join Us' },
];

const aboutSubItems = [
  { id: 'mission' as const, path: '/about#mission', zh: '理念', en: 'Philosophy' },
  { id: 'story' as const, path: '/about#story', zh: '故事', en: 'Story' },
  { id: 'team' as const, path: '/about#team', zh: '团队', en: 'Team' },
];

const MOBILE_NAVIGATION_DELAY_MS = 160;

interface NavbarProps {
  hideLogo?: boolean;
}

export default function Navbar({ hideLogo = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [logoVisible, setLogoVisible] = useState(!hideLogo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const [activeAboutChapter, setActiveAboutChapter] = useState<AboutChapterId>(
    () => readAboutChapterHash(location.hash) ?? 'mission',
  );
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const brandName = pickLocalized(BRAND.name, lang);
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);
  const mobileMenuLabel = lang === 'zh' ? '网站导航' : 'Site navigation';
  const mobileMenuTriggerLabel = menuOpen
    ? (lang === 'zh' ? '关闭导航菜单' : 'Close navigation menu')
    : (lang === 'zh' ? '打开导航菜单' : 'Open navigation menu');

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
    if (location.pathname !== '/about') return;
    const chapterId = readAboutChapterHash(location.hash);
    if (chapterId) setActiveAboutChapter(chapterId);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleChapterChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isAboutChapterId(event.detail)) return;
      setActiveAboutChapter(event.detail);
    };

    window.addEventListener(ABOUT_CHAPTER_CHANGE_EVENT, handleChapterChange);
    return () => window.removeEventListener(ABOUT_CHAPTER_CHANGE_EVENT, handleChapterChange);
  }, []);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  const handleMobileNavigate = (path: string, aboutChapter?: AboutChapterId) => {
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);

    const currentTarget = `${location.pathname}${location.hash}`;
    if (aboutChapter) setActiveAboutChapter(aboutChapter);

    if (path === currentTarget || (path === location.pathname && !location.hash)) {
      setPendingPath(null);
      setMenuOpen(false);
      if (aboutChapter && location.pathname === '/about') {
        window.setTimeout(() => requestAboutChapter(aboutChapter), MOBILE_NAVIGATION_DELAY_MS);
      }
      return;
    }

    setPendingPath(path);
    setMenuOpen(false);
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path);
      if (aboutChapter && location.pathname === '/about') {
        requestAboutChapter(aboutChapter);
      }
      navigationTimeoutRef.current = null;
    }, MOBILE_NAVIGATION_DELAY_MS);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-organic ${
        scrolled ? 'bg-background/90 shadow-sm backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <Link
          to="/"
          aria-label={brandName}
          className={`cursor-target group flex items-center gap-2 transition-all duration-500 ease-out ${
            logoVisible ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'
          }`}
        >
          <img
            src={mascotWide}
            alt={mascotAlt}
            className="h-8 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 md:h-10"
          />
          <span className="font-serif text-lg font-semibold text-foreground transition-organic group-hover:text-primary md:text-xl">
            {brandName}
          </span>
        </Link>

        <LayoutGroup>
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const label = lang === 'zh' ? item.zh : item.en;
              const navLink = (
                <Link
                  to={item.path}
                  aria-haspopup={item.path === '/about' ? 'menu' : undefined}
                  className="cursor-target group/nav relative px-3 py-2 text-sm transition-organic hover:text-primary"
                >
                  <span
                    className={`relative inline-flex items-center gap-1 pb-1 transition-organic ${
                      isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                    {item.path === '/about' && (
                      <ChevronDown
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-200 group-hover/nav:rotate-180"
                      />
                    )}
                    {isActive ? (
                      <motion.span
                        layoutId="desktop-nav-active"
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-full rounded-full bg-primary"
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-0 rounded-full bg-primary opacity-0 transition-all duration-300 ease-out group-hover/nav:w-full group-hover/nav:opacity-50" />
                    )}
                  </span>
                </Link>
              );

              if (item.path !== '/about') return <div key={item.path}>{navLink}</div>;

              return (
                <div key={item.path} className="group/about relative">
                  {navLink}
                  <div className="invisible absolute left-1/2 top-full w-52 -translate-x-1/2 pt-2 opacity-0 transition duration-200 group-hover/about:visible group-hover/about:opacity-100 group-focus-within/about:visible group-focus-within/about:opacity-100">
                    <div
                      role="menu"
                      aria-label={lang === 'zh' ? '关于次级菜单' : 'About submenu'}
                      className="overflow-hidden rounded-xl border border-primary/25 bg-popover p-2 shadow-xl"
                    >
                      {aboutSubItems.map((subItem) => {
                        const isSubActive = location.pathname === '/about' && activeAboutChapter === subItem.id;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            role="menuitem"
                            aria-current={isSubActive ? 'location' : undefined}
                            onClick={(event) => {
                              setActiveAboutChapter(subItem.id);
                              if (location.pathname === '/about' && `${location.pathname}${location.hash}` === subItem.path) {
                                event.preventDefault();
                                requestAboutChapter(subItem.id);
                              }
                            }}
                            className={`block rounded-lg px-4 py-3 text-sm transition-colors duration-200 hover:bg-primary/[0.11] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isSubActive ? 'bg-primary/[0.16] font-medium text-primary' : 'text-foreground/90'
                            }`}
                          >
                            {lang === 'zh' ? subItem.zh : subItem.en}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="cursor-target relative ml-4 overflow-hidden rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-organic hover:border-foreground hover:text-foreground"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </LayoutGroup>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="min-h-11 rounded-full border border-border px-3 text-xs text-muted-foreground transition-colors duration-200 ease-out hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors duration-200 ease-out hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={mobileMenuTriggerLabel}
              >
                <span
                  className={`block transition-transform duration-200 ease-out motion-reduce:transition-none ${
                    menuOpen ? 'rotate-90 scale-105' : ''
                  }`}
                  aria-hidden="true"
                >
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </span>
              </button>
            </SheetTrigger>

            <SheetPortal>
              <SheetOverlay className="bg-foreground/15 duration-200 data-[state=closed]:duration-150 motion-reduce:animate-none" />
              <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-dvh w-3/4 max-w-xs flex-col border-l border-primary/15 bg-popover pl-6 pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg outline-none ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:duration-200 data-[state=closed]:duration-150 motion-reduce:animate-none md:hidden">
                <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-5">
                  <div className="min-w-0">
                    <SheetTitle className="font-serif text-base font-medium text-foreground">
                      {mobileMenuLabel}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      {lang === 'zh' ? '选择页面进行浏览' : 'Choose a page to navigate'}
                    </SheetDescription>
                  </div>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 ease-out hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
                      aria-label={lang === 'zh' ? '关闭导航抽屉' : 'Close navigation drawer'}
                    >
                      <X size={24} aria-hidden="true" />
                    </button>
                  </SheetClose>
                </div>

                <div className="flex flex-1 flex-col justify-center py-6">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    const isPending = pendingPath === item.path;
                    const label = lang === 'zh' ? item.zh : item.en;

                    return (
                      <div key={item.path}>
                        <SheetClose asChild>
                          <button
                            type="button"
                            onClick={() => handleMobileNavigate(item.path)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex min-h-14 w-full items-center border-b border-border/70 text-left font-serif text-2xl transition-colors duration-200 ease-out hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover ${
                              isActive || isPending ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            <motion.span
                              initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: prefersReducedMotion ? 0 : 0.12,
                                delay: prefersReducedMotion ? 0 : index * 0.02,
                                ease: 'easeOut',
                              }}
                            >
                              {label}
                            </motion.span>
                          </button>
                        </SheetClose>

                        {item.path === '/about' && (
                          <div className="border-b border-border/70 py-2 pl-5">
                            {aboutSubItems.map((subItem) => {
                              const isSubActive = location.pathname === '/about' && activeAboutChapter === subItem.id;
                              return (
                                <SheetClose asChild key={subItem.path}>
                                  <button
                                    type="button"
                                    onClick={() => handleMobileNavigate(subItem.path, subItem.id)}
                                    aria-current={isSubActive ? 'location' : undefined}
                                    className={`block min-h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-200 hover:bg-primary/[0.1] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                      isSubActive || pendingPath === subItem.path ? 'bg-primary/[0.14] font-medium text-primary' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {lang === 'zh' ? subItem.zh : subItem.en}
                                  </button>
                                </SheetClose>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </DialogPrimitive.Content>
            </SheetPortal>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
