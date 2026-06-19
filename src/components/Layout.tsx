import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BrandHead from './BrandHead';
import Navbar from './Navbar';
import Footer from './Footer';
import MascotCompanion from './MascotCompanion';
import TargetCursor from './ui/TargetCursor';

const routeShellVariants = {
  initial: (isHome: boolean) => ({
    opacity: 0,
    y: isHome ? 8 : 14,
    x: 0,
  }),
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.44,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (isHome: boolean) => ({
    opacity: 0,
    y: isHome ? -4 : -8,
    x: isHome ? 0 : -6,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const showMascotCompanion = !isHome && location.pathname !== '/about';

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const target = window.document.getElementById(location.hash.slice(1));
    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'start' });
      }, 80);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <BrandHead />
      <Navbar hideLogo={isHome} />
      <div className="route-stage flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.main
            key={location.pathname}
            custom={isHome}
            variants={routeShellVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="route-page-shell flex-1"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <Footer />
      {showMascotCompanion && <MascotCompanion />}
      <TargetCursor spinDuration={2.6} hideDefaultCursor={false} parallaxOn />
    </div>
  );
}
