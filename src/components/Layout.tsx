import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import BrandHead from './BrandHead';
import Navbar from './Navbar';
import Footer from './Footer';
import MascotCompanion from './MascotCompanion';
import SmoothScrollDamping from './SmoothScrollDamping';
import TargetCursor from './ui/TargetCursor';
import WebsiteAnalyticsTracker from './WebsiteAnalyticsTracker';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
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
