import type { ReactNode } from 'react';
import { ArrowLeft, ChartLine, ChevronDown, ClipboardCheck, ExternalLink, LogOut, Settings, ShieldCheck, Tags } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import mascotWide from '@/assets/mascot-wide.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import { getCommunityRouteMeta } from '@/lib/communityNavigation';
import { localize, useCommunityUi } from '@/lib/communityUi';

export default function CommunityChrome({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, communityState, permissions, signOut } = useAuth();
  const { lang, setLang, t, copy } = useCommunityUi();
  const meta = getCommunityRouteMeta(location.pathname);
  const canReviewApplications = permissions.includes('memberships.review');
  const canManageIdentities = permissions.includes('people.manage');
  const canReviewReports = permissions.includes('messages.moderate');
  const canReadAnalytics = permissions.includes('analytics.read');
  const accountLabel = user?.email?.slice(0, 1).toUpperCase() || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/community/auth', { replace: true });
  };

  return (
    <div className="community-chrome">
      <div className="community-chrome__wash community-chrome__wash--one" aria-hidden="true" />
      <div className="community-chrome__wash community-chrome__wash--two" aria-hidden="true" />

      <header className="community-chrome__header">
        <div className="community-chrome__header-inner">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            {meta.back ? (
              <Link
                to={meta.back.to}
                className="community-icon-button sm:hidden"
                aria-label={`${copy('back')}${lang === 'zh' ? '：' : ': '}${localize(meta.back.label, lang)}`}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link to="/community/enter" className="community-brand-link" aria-label={t('进入社群首页', 'Go to community home')}>
              <span className="community-brand-link__mark">
                <img src={mascotWide} alt={pickLocalized(BRAND.mascotAlt, lang)} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-sm font-semibold text-[hsl(var(--community-forest))] sm:text-base">
                  {pickLocalized(BRAND.name, lang)}
                </span>
                <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--community-orange))]">
                  Community
                </span>
              </span>
            </Link>

            <span className="hidden h-7 w-px bg-[hsl(var(--community-forest)/0.14)] sm:block" aria-hidden="true" />
            <span className="hidden truncate text-sm text-[hsl(var(--community-forest)/0.66)] sm:block">
              {localize(meta.section, lang)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="community-language-switch" aria-label={t('语言选择', 'Language selection')}>
              <button type="button" aria-pressed={lang === 'zh'} onClick={() => setLang('zh')}>中</button>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            </div>

            <Link to="/" className="community-site-link" aria-label={copy('officialSite')}>
              <span className="hidden md:inline">{copy('officialSite')}</span>
              <ExternalLink className="size-4" aria-hidden="true" />
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="community-account-trigger" aria-label={copy('account')}>
                    <span>{accountLabel}</span>
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl border-[hsl(var(--community-forest)/0.12)] bg-[#fffdf7] p-2 shadow-[0_20px_70px_rgba(35,62,46,0.16)]">
                  <DropdownMenuLabel className="px-3 py-2">
                    <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {communityState?.membership_status === 'active' ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => navigate('/community/settings')}>
                      <Settings className="mr-2 size-4" />{copy('settings')}
                    </DropdownMenuItem>
                  ) : null}
                  {canReviewApplications ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => navigate('/community/admin/applications')}>
                      <ClipboardCheck className="mr-2 size-4" />{copy('applications')}
                    </DropdownMenuItem>
                  ) : null}
                  {canManageIdentities ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => navigate('/community/admin/identities')}>
                      <Tags className="mr-2 size-4" />{copy('identities')}
                    </DropdownMenuItem>
                  ) : null}
                  {canReviewReports ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => navigate('/community/admin/reports')}>
                      <ShieldCheck className="mr-2 size-4" />{copy('reports')}
                    </DropdownMenuItem>
                  ) : null}
                  {canReadAnalytics ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => navigate('/community/admin/analytics')}>
                      <ChartLine className="mr-2 size-4" />{copy('websiteAnalytics')}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-destructive focus:text-destructive" onSelect={() => void handleSignOut()}>
                    <LogOut className="mr-2 size-4" />{copy('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>

      <div className="community-chrome__body">{children}</div>
    </div>
  );
}
