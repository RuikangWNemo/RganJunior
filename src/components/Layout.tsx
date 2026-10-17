import { ReactNode, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BrandHead from './BrandHead';
import Navbar from './Navbar';
import Footer from './Footer';
import MascotCompanion from './MascotCompanion';
import SmoothScrollDamping from './SmoothScrollDamping';
import TargetCursor from './ui/TargetCursor';
import WebsiteAnalyticsTracker from './WebsiteAnalyticsTracker';

function syncSmoothScrollDamping() {
  window.dispatchEvent(new Event('rgan:smooth-scroll-sync'));
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const isHome = location.pathname === '/';
  const isEditorialRoute =
    location.pathname.startsWith('/about') ||
    location.pathname === '/story' ||
    location.pathname.startsWith('/community-stories') ||
    location.pathname.startsWith('/impact') ||
    location.pathname.startsWith('/voices');
  const showMascotCompanion =
    !isHome &&
    !isEditorialRoute &&
    location.pathname !== '/join';

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0 });
      syncSmoothScrollDamping();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const target = window.document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        syncSmoothScrollDamping();
      }
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash, reducedMotion]);

  // Keep one visible shell across PUSH/POP and lazy-route resolution. An exiting
  // pathname-keyed shell could hide the returning page during rapid history changes.
  const routeContent = (
    <main className="route-stage flex-1" data-route-transition="stable">
      {children}
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WebsiteAnalyticsTracker />
      <SmoothScrollDamping />
      <BrandHead />
      <Navbar hideLogo={isHome} />
      {routeContent}
      <Footer />
      {showMascotCompanion && <MascotCompanion />}
      <TargetCursor spinDuration={2.6} hideDefaultCursor={false} parallaxOn />
    </div>
  );
}
