import { useLayoutEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Runs again when Suspense reveals a delayed page. Do not restore an old page's
// offset into a loading placeholder, or let wheel inertia continue across routes.
export default function RouteViewport({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.dispatchEvent(new Event('rgan:smooth-scroll-sync'));
    const target = hash ? document.getElementById(decodeURIComponentSafe(hash.slice(1))) : null;
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('rgan:smooth-scroll-sync'));
    root.style.scrollBehavior = previousBehavior;
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, [pathname, hash]);
  return children;
}
function decodeURIComponentSafe(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}
