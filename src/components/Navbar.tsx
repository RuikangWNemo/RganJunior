import { type FocusEvent, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import BrandWordmark from '@/components/BrandWordmark';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotWide from '@/assets/mascot-wide.png';
import { actionPrograms, type ActionProgramId } from '@/content/actionPrograms';
import { BRAND, pickLocalized } from '@/lib/brand';
import { getCommunityEntryUrl } from '@/lib/communityEntry';
import {
  ABOUT_CHAPTER_CHANGE_EVENT,
  isAboutChapterId,
  readAboutChapterHash,
  requestAboutChapter,
  type AboutChapterId,
} from '@/lib/aboutNavigation';
import {
  isProgramSectionId,
  PROGRAM_SECTION_CHANGE_EVENT,
  readProgramLocation,
  requestProgramSection,
} from '@/lib/programNavigation';
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
  { path: '/programs', zh: '项目', en: 'Programs' },
  { path: '/story', zh: '发起人故事', en: 'Story' },
  { path: '/field-notes', zh: '田野笔记', en: 'Field Notes' },
  { path: '/impact', zh: '影响', en: 'Impact' },
  { path: '/join', zh: '加入我们', en: 'Join Us' },
];

const aboutSubItems = [
  { id: 'team' as const, path: '/about#team', zh: '我们的团队', en: 'Our Team' },
  { id: 'belief' as const, path: '/about#belief', zh: '我们相信', en: 'Our Belief' },
  { id: 'method' as const, path: '/about#method', zh: '我们的方法', en: 'Our Method' },
  { id: 'places' as const, path: '/about#places', zh: '空间与场域', en: 'Our Places' },
];

const fieldNotesSubItems = [
  { path: '/field-notes', zh: '精选文章', en: 'Featured Articles' },
  { path: '/field-notes/all', zh: '全部文章', en: 'All Articles' },
];

const impactSubItems = [
  { path: '/impact', zh: '统计', en: 'Overview' },
  { path: '/impact/awards', zh: '获奖情况', en: 'Recognition' },
];

const MOBILE_NAVIGATION_DELAY_MS = 160;
const DESKTOP_MENU_CLOSE_DELAY_MS = 2_000;

type DesktopMenu = '/about' | '/programs' | '/field-notes' | '/impact';

interface NavbarProps {
  hideLogo?: boolean;
}

export default function Navbar({ hideLogo = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [logoVisible, setLogoVisible] = useState(!hideLogo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [hoveredDesktopMenu, setHoveredDesktopMenu] = useState<DesktopMenu | null>(null);
  const [focusedDesktopMenu, setFocusedDesktopMenu] = useState<DesktopMenu | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopMenuCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const [activeAboutChapter, setActiveAboutChapter] = useState<AboutChapterId>(
    () => readAboutChapterHash(location.hash) ?? 'team',
  );
  const [activeProgram, setActiveProgram] = useState<ActionProgramId>(
    () => readProgramLocation(location.pathname, location.hash, location.search) ?? 'life-experience-camp',
  );
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);
  const communityEntryUrl = getCommunityEntryUrl();
  const mobileMenuLabel = lang === 'zh' ? '网站导航' : 'Site navigation';
  const mobileMenuTriggerLabel = menuOpen
    ? (lang === 'zh' ? '关闭导航菜单' : 'Close navigation menu')
    : (lang === 'zh' ? '打开导航菜单' : 'Open navigation menu');
  const activeDesktopMenu = hoveredDesktopMenu ?? focusedDesktopMenu;
  const isProgramsLocation = readProgramLocation(location.pathname, location.hash, location.search) !== null;

  const clearDesktopMenuCloseTimeout = () => {
    if (desktopMenuCloseTimeoutRef.current === null) return;
    clearTimeout(desktopMenuCloseTimeoutRef.current);
    desktopMenuCloseTimeoutRef.current = null;
  };

  const closeDesktopMenus = () => {
    clearDesktopMenuCloseTimeout();
    setHoveredDesktopMenu(null);
    setFocusedDesktopMenu(null);
  };

  const handleDesktopMenuEnter = (menu: DesktopMenu) => {
    clearDesktopMenuCloseTimeout();
    setHoveredDesktopMenu(menu);
  };

  const handleDesktopMenuLeave = () => {
    setHoveredDesktopMenu(null);
    clearDesktopMenuCloseTimeout();
    if (focusedDesktopMenu === null) return;

    desktopMenuCloseTimeoutRef.current = setTimeout(() => {
      setFocusedDesktopMenu(null);
      desktopMenuCloseTimeoutRef.current = null;
    }, DESKTOP_MENU_CLOSE_DELAY_MS);
  };

  const handleDesktopMenuFocus = (menu: DesktopMenu) => {
    clearDesktopMenuCloseTimeout();
    setFocusedDesktopMenu(menu);
  };

  const handleDesktopMenuBlur = (
    menu: DesktopMenu,
    event: FocusEvent<HTMLDivElement>,
  ) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setFocusedDesktopMenu((currentMenu) => (currentMenu === menu ? null : currentMenu));
  };

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
    const programId = readProgramLocation(location.pathname, location.hash, location.search);
    if (programId) setActiveProgram(programId);
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    const handleChapterChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isAboutChapterId(event.detail)) return;
      setActiveAboutChapter(event.detail);
    };

    window.addEventListener(ABOUT_CHAPTER_CHANGE_EVENT, handleChapterChange);
    return () => window.removeEventListener(ABOUT_CHAPTER_CHANGE_EVENT, handleChapterChange);
  }, []);

  useEffect(() => {
    const handleProgramChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isProgramSectionId(event.detail)) return;
      setActiveProgram(event.detail);
    };

    window.addEventListener(PROGRAM_SECTION_CHANGE_EVENT, handleProgramChange);
    return () => window.removeEventListener(PROGRAM_SECTION_CHANGE_EVENT, handleProgramChange);
  }, []);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (desktopMenuCloseTimeoutRef.current) clearTimeout(desktopMenuCloseTimeoutRef.current);
    };
  }, []);

  const handleMobileNavigate = (
    path: string,
    aboutChapter?: AboutChapterId,
    programId?: ActionProgramId,
  ) => {
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);

    const currentTarget = `${location.pathname}${location.hash}`;
    if (aboutChapter) setActiveAboutChapter(aboutChapter);
    if (programId) setActiveProgram(programId);

    if (path === currentTarget || (path === location.pathname && !location.hash)) {
      setPendingPath(null);
      setMenuOpen(false);
      if (aboutChapter && location.pathname === '/about') {
        window.setTimeout(() => requestAboutChapter(aboutChapter), MOBILE_NAVIGATION_DELAY_MS);
      } else if (programId && location.pathname === '/programs') {
        window.setTimeout(() => requestProgramSection(programId), MOBILE_NAVIGATION_DELAY_MS);
      } else if (path.includes('#')) {
        const sectionId = path.split('#')[1];
        window.setTimeout(() => {
          window.document.getElementById(sectionId)?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }, MOBILE_NAVIGATION_DELAY_MS);
      }
      return;
    }

    setPendingPath(path);
    setMenuOpen(false);
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path);
      if (aboutChapter && location.pathname === '/about') {
        requestAboutChapter(aboutChapter);
      } else if (programId && location.pathname === '/programs') {
        requestProgramSection(programId);
      }
      navigationTimeoutRef.current = null;
    }, MOBILE_NAVIGATION_DELAY_MS);
  };

  const isHomeHeroNavbar = location.pathname === '/' && !scrolled;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-organic ${
        scrolled ? 'bg-background/90 shadow-sm backdrop-blur-md' : 'bg-transparent'
      } ${isHomeHeroNavbar ? 'home-hero-navbar' : ''}`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <Link
          to="/"
          aria-label={lang === 'zh' ? '返回阿柑少年首页' : "Return to R-Gan Junior home"}
          className={`cursor-target group relative flex items-center gap-2 transition-all duration-500 ease-out ${
            logoVisible ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-4 opacity-0'
          }`}
        >
          <img
            src={mascotWide}
            alt={mascotAlt}
            className="h-8 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 md:h-10"
          />
          <BrandWordmark
            language={lang}
            aria-hidden="true"
            className="h-5 w-auto text-foreground transition-organic group-hover:text-primary md:h-6"
          />
        </Link>

        <LayoutGroup>
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive =
                item.path === '/programs'
                  ? location.pathname === '/programs' || location.pathname.startsWith('/programs/')
                  : item.path === '/field-notes'
                    ? location.pathname.startsWith('/field-notes')
                  : item.path === '/impact'
                    ? location.pathname.startsWith('/impact')
                  : location.pathname === item.path;
              const label = lang === 'zh' ? item.zh : item.en;
              const desktopMenu = item.path === '/about' || item.path === '/programs' || item.path === '/field-notes' || item.path === '/impact'
                ? item.path
                : null;
              const hasSubmenu = desktopMenu !== null;
              const navLink = (
                <Link
                  to={item.path}
                  aria-haspopup={hasSubmenu ? 'menu' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={desktopMenu ? () => handleDesktopMenuFocus(desktopMenu) : undefined}
                  className="cursor-target group/nav relative px-3 py-2 text-sm font-bold transition-organic hover:text-primary"
                >
                  <span
                    className={`relative inline-flex items-center gap-1 pb-1 transition-organic ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                    {hasSubmenu && (
                      <ChevronDown
                        aria-hidden="true"
                        className={`size-3.5 transition-transform duration-200 ${
                          activeDesktopMenu === item.path ? 'rotate-180' : ''
                        }`}
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

              if (item.path === '/programs') {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => handleDesktopMenuEnter('/programs')}
                    onMouseLeave={handleDesktopMenuLeave}
                    onFocusCapture={() => handleDesktopMenuFocus('/programs')}
                    onBlurCapture={(event) => handleDesktopMenuBlur('/programs', event)}
                  >
                    {navLink}
                    <div
                      className={`absolute left-1/2 top-full w-60 -translate-x-1/2 pt-2 transition duration-200 ${
                        activeDesktopMenu === '/programs'
                          ? 'visible pointer-events-auto opacity-100'
                          : 'invisible pointer-events-none opacity-0'
                      }`}
                    >
                      <div
                        role="menu"
                        aria-label={lang === 'zh' ? '项目次级菜单' : 'Programs submenu'}
                        className="overflow-hidden rounded-xl border border-primary/25 bg-popover p-2 shadow-xl"
                      >
                        {actionPrograms.map((program) => {
                          const isSubActive = isProgramsLocation && activeProgram === program.id;

                          return (
                            <Link
                              key={program.path}
                              to={program.path}
                              role="menuitem"
                              aria-current={isSubActive ? 'location' : undefined}
                              onClick={(event) => {
                                closeDesktopMenus();
                                setActiveProgram(program.id);
                                if (`${location.pathname}${location.hash}` !== program.path) return;
                                event.preventDefault();
                                requestProgramSection(program.id);
                              }}
                              className={`relative block overflow-hidden rounded-lg px-4 py-3 transition-colors duration-200 hover:bg-primary/[0.11] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isSubActive ? 'text-primary' : 'text-foreground/90'
                              }`}
                            >
                              {isSubActive ? (
                                <motion.span
                                  layoutId="desktop-program-submenu-active"
                                  className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.16]"
                                  transition={
                                    prefersReducedMotion
                                      ? { duration: 0 }
                                      : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                                  }
                                  aria-hidden="true"
                                />
                              ) : null}
                              <span className="relative block text-sm font-medium">
                                {pickLocalized(program.navTitle, lang)}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.path === '/field-notes') {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => handleDesktopMenuEnter('/field-notes')}
                    onMouseLeave={handleDesktopMenuLeave}
                    onFocusCapture={() => handleDesktopMenuFocus('/field-notes')}
                    onBlurCapture={(event) => handleDesktopMenuBlur('/field-notes', event)}
                  >
                    {navLink}
                    <div
                      className={`absolute left-1/2 top-full w-52 -translate-x-1/2 pt-2 transition duration-200 ${
                        activeDesktopMenu === '/field-notes'
                          ? 'visible pointer-events-auto opacity-100'
                          : 'invisible pointer-events-none opacity-0'
                      }`}
                    >
                      <div
                        role="menu"
                        aria-label={lang === 'zh' ? '田野笔记次级菜单' : 'Field Notes submenu'}
                        className="overflow-hidden rounded-xl border border-primary/25 bg-popover p-2 shadow-xl"
                      >
                        {fieldNotesSubItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              role="menuitem"
                              aria-current={isSubActive ? 'location' : undefined}
                              onClick={closeDesktopMenus}
                              className={`relative block overflow-hidden rounded-lg px-4 py-3 text-sm transition-colors duration-200 hover:bg-primary/[0.11] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isSubActive ? 'font-medium text-primary' : 'text-foreground/90'
                              }`}
                            >
                              {isSubActive ? (
                                <motion.span
                                  layoutId="desktop-field-notes-submenu-active"
                                  className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.16]"
                                  transition={
                                    prefersReducedMotion
                                      ? { duration: 0 }
                                      : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                                  }
                                  aria-hidden="true"
                                />
                              ) : null}
                              <span className="relative">{lang === 'zh' ? subItem.zh : subItem.en}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.path === '/impact') {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => handleDesktopMenuEnter('/impact')}
                    onMouseLeave={handleDesktopMenuLeave}
                    onFocusCapture={() => handleDesktopMenuFocus('/impact')}
                    onBlurCapture={(event) => handleDesktopMenuBlur('/impact', event)}
                  >
                    {navLink}
                    <div
                      className={`absolute left-1/2 top-full w-52 -translate-x-1/2 pt-2 transition duration-200 ${
                        activeDesktopMenu === '/impact'
                          ? 'visible pointer-events-auto opacity-100'
                          : 'invisible pointer-events-none opacity-0'
                      }`}
                    >
                      <div
                        role="menu"
                        aria-label={lang === 'zh' ? '影响次级菜单' : 'Impact submenu'}
                        className="overflow-hidden rounded-xl border border-primary/25 bg-popover p-2 shadow-xl"
                      >
                        {impactSubItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              role="menuitem"
                              aria-current={isSubActive ? 'location' : undefined}
                              onClick={closeDesktopMenus}
                              className={`relative block overflow-hidden rounded-lg px-4 py-3 text-sm transition-colors duration-200 hover:bg-primary/[0.11] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isSubActive ? 'font-medium text-primary' : 'text-foreground/90'
                              }`}
                            >
                              {isSubActive ? (
                                <motion.span
                                  layoutId="desktop-impact-submenu-active"
                                  className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.16]"
                                  transition={
                                    prefersReducedMotion
                                      ? { duration: 0 }
                                      : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                                  }
                                  aria-hidden="true"
                                />
                              ) : null}
                              <span className="relative">{lang === 'zh' ? subItem.zh : subItem.en}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.path !== '/about') return <div key={item.path}>{navLink}</div>;

              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => handleDesktopMenuEnter('/about')}
                  onMouseLeave={handleDesktopMenuLeave}
                  onFocusCapture={() => handleDesktopMenuFocus('/about')}
                  onBlurCapture={(event) => handleDesktopMenuBlur('/about', event)}
                >
                  {navLink}
                  <div
                    className={`absolute left-1/2 top-full w-52 -translate-x-1/2 pt-2 transition duration-200 ${
                      activeDesktopMenu === '/about'
                        ? 'visible pointer-events-auto opacity-100'
                        : 'invisible pointer-events-none opacity-0'
                    }`}
                  >
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
                              closeDesktopMenus();
                              setActiveAboutChapter(subItem.id);
                              if (location.pathname === '/about' && `${location.pathname}${location.hash}` === subItem.path) {
                                event.preventDefault();
                                requestAboutChapter(subItem.id);
                              }
                            }}
                            className={`relative block overflow-hidden rounded-lg px-4 py-3 text-sm transition-colors duration-200 hover:bg-primary/[0.11] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isSubActive ? 'font-medium text-primary' : 'text-foreground/90'
                            }`}
                          >
                            {isSubActive ? (
                              <motion.span
                                layoutId="desktop-about-submenu-active"
                                className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.16]"
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0 }
                                    : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                                }
                                aria-hidden="true"
                              />
                            ) : null}
                            <span className="relative">{lang === 'zh' ? subItem.zh : subItem.en}</span>
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

            <a
              href={communityEntryUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={lang === 'zh' ? '在新窗口进入阿柑少年社群' : "Open R-Gan Junior Community in a new window"}
              className="home-hero-community-link cursor-target ml-2 inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 motion-reduce:transform-none"
            >
              <span>{lang === 'zh' ? '进入社群' : 'Community'}</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </LayoutGroup>

        <div className="flex items-center gap-3 lg:hidden">
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
              <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-dvh w-3/4 max-w-xs flex-col border-l border-primary/15 bg-popover pl-6 pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg outline-none ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right data-[state=open]:duration-200 data-[state=closed]:duration-150 motion-reduce:animate-none lg:hidden">
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

                <div className="flex flex-1 flex-col overflow-y-auto py-6">
                  {navItems.map((item, index) => {
                    const isActive =
                      item.path === '/programs'
                        ? location.pathname === '/programs' || location.pathname.startsWith('/programs/')
                        : item.path === '/field-notes'
                          ? location.pathname.startsWith('/field-notes')
                        : item.path === '/impact'
                          ? location.pathname.startsWith('/impact')
                        : location.pathname === item.path;
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

                        {item.path === '/programs' && (
                          <div className="border-b border-border/70 py-2 pl-5">
                            {actionPrograms.map((program) => {
                              const isSubActive = isProgramsLocation && activeProgram === program.id;

                              return (
                                <SheetClose asChild key={program.path}>
                                  <button
                                    type="button"
                                    onClick={() => handleMobileNavigate(program.path, undefined, program.id)}
                                    aria-current={isSubActive ? 'location' : undefined}
                                    className={`block min-h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-200 hover:bg-primary/[0.1] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                      isSubActive || pendingPath === program.path
                                        ? 'bg-primary/[0.14] font-medium text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {pickLocalized(program.navTitle, lang)}
                                  </button>
                                </SheetClose>
                              );
                            })}
                          </div>
                        )}

                        {item.path === '/field-notes' && (
                          <div className="border-b border-border/70 py-2 pl-5">
                            {fieldNotesSubItems.map((subItem) => {
                              const isSubActive = location.pathname === subItem.path;

                              return (
                                <SheetClose asChild key={subItem.path}>
                                  <button
                                    type="button"
                                    onClick={() => handleMobileNavigate(subItem.path)}
                                    aria-current={isSubActive ? 'location' : undefined}
                                    className={`block min-h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-200 hover:bg-primary/[0.1] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                      isSubActive || pendingPath === subItem.path
                                        ? 'bg-primary/[0.14] font-medium text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {lang === 'zh' ? subItem.zh : subItem.en}
                                  </button>
                                </SheetClose>
                              );
                            })}
                          </div>
                        )}

                        {item.path === '/impact' && (
                          <div className="border-b border-border/70 py-2 pl-5">
                            {impactSubItems.map((subItem) => {
                              const isSubActive = location.pathname === subItem.path;

                              return (
                                <SheetClose asChild key={subItem.path}>
                                  <button
                                    type="button"
                                    onClick={() => handleMobileNavigate(subItem.path)}
                                    aria-current={isSubActive ? 'location' : undefined}
                                    className={`block min-h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-200 hover:bg-primary/[0.1] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                      isSubActive || pendingPath === subItem.path
                                        ? 'bg-primary/[0.14] font-medium text-primary'
                                        : 'text-muted-foreground'
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

                  <div className="mt-6 border-t border-border/80 pt-6">
                    <SheetClose asChild>
                      <a
                        href={communityEntryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={lang === 'zh' ? '在新窗口进入阿柑少年社群' : "Open R-Gan Junior Community in a new window"}
                        className="flex min-h-12 w-full items-center justify-between rounded-xl bg-primary px-4 font-medium text-primary-foreground transition duration-200 hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover active:scale-[0.98] motion-reduce:transform-none"
                      >
                        <span>{lang === 'zh' ? '进入社群' : 'Community'}</span>
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    </SheetClose>
                  </div>
                </div>
              </DialogPrimitive.Content>
            </SheetPortal>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
