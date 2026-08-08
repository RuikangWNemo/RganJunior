import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpenText, ClipboardCheck, Home, MessageCircle, Settings, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';

const communityNav = [
  { to: '/community', label: 'navHome' as const, icon: Home, end: true },
  { to: '/community/stories', label: 'navStories' as const, icon: BookOpenText },
  { to: '/community/people', label: 'navPeople' as const, icon: Users },
  { to: '/community/practice', label: 'navPractice' as const, icon: Sparkles },
  { to: '/community/messages', label: 'navMessages' as const, icon: MessageCircle },
];

export default function CommunityShell() {
  const location = useLocation();
  const { permissions } = useAuth();
  const { t, copy } = useCommunityUi();
  const adminLinks = [
    permissions.includes('memberships.review') ? { to: '/community/admin/applications', label: copy('applications'), icon: ClipboardCheck } : null,
    permissions.includes('messages.moderate') ? { to: '/community/admin/reports', label: copy('reports'), icon: ShieldCheck } : null,
  ].filter(Boolean) as Array<{ to: string; label: string; icon: typeof ClipboardCheck }>;

  return (
    <div className="community-member-shell">
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="hidden lg:block">
          <div className="community-sidebar">
            <div className="px-3 pb-4 pt-2">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--community-orange))]">Community hub</p>
              <p className="mt-1 font-serif text-xl text-[hsl(var(--community-forest))]">{t('社群中枢', 'Your community')}</p>
            </div>
            <nav className="space-y-1" aria-label={copy('navigation')}>
              {communityNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `community-nav-link ${isActive ? 'is-active' : ''}`}>
                  <span className="community-nav-link__icon"><Icon className="size-4" aria-hidden="true" /></span>
                  {copy(label)}
                </NavLink>
              ))}
              <NavLink to="/community/settings" className={({ isActive }) => `community-nav-link ${isActive ? 'is-active' : ''}`}>
                <span className="community-nav-link__icon"><Settings className="size-4" aria-hidden="true" /></span>
                {copy('settings')}
              </NavLink>
            </nav>
            {adminLinks.length ? (
              <div className="mt-5 border-t border-[hsl(var(--community-forest)/0.1)] pt-5">
                <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-forest)/0.5)]">{copy('administration')}</p>
                {adminLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `community-nav-link ${isActive ? 'is-active' : ''}`}>
                    <span className="community-nav-link__icon"><Icon className="size-4" aria-hidden="true" /></span>
                    {label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <div key={location.pathname} className="community-member-content">
          <Outlet />
        </div>
      </div>

      <nav className="community-mobile-nav lg:hidden" aria-label={copy('mobileNavigation')}>
        {communityNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `community-mobile-nav__link ${isActive ? 'is-active' : ''}`}>
            <Icon className="size-5" aria-hidden="true" />
            <span>{copy(label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
