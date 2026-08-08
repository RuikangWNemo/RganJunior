import type { ReactNode } from 'react';
import { AlertCircle, ArrowLeft, Inbox, RotateCcw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { getCommunityRouteMeta } from '@/lib/communityNavigation';
import { localize } from '@/lib/communityUi';
import { useCommunityUi } from '@/lib/communityUi';

type Breadcrumb = { label: string; to?: string };

export function CommunitySurface({
  eyebrow,
  title,
  description,
  children,
  aside,
  action,
  backTo,
  backLabel,
  breadcrumbs,
  width = 'default',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
  breadcrumbs?: Breadcrumb[];
  width?: 'default' | 'wide' | 'narrow';
}) {
  const location = useLocation();
  const { copy, lang, t } = useCommunityUi();
  const routeMeta = getCommunityRouteMeta(location.pathname);
  const widthClass = width === 'wide' ? 'max-w-7xl' : width === 'narrow' ? 'max-w-3xl' : 'max-w-5xl';
  const resolvedBackTo = backTo ?? routeMeta.back?.to;
  const resolvedBackLabel = backLabel ?? (routeMeta.back ? localize(routeMeta.back.label, lang) : undefined);
  const resolvedBreadcrumbs = breadcrumbs ?? (location.pathname === '/community' ? [] : routeMeta.crumbs.map((crumb) => ({
    to: crumb.to,
    label: localize(crumb.label, lang),
  })));

  return (
    <section className={`community-surface mx-auto w-full ${widthClass}`}>
      <header className="community-page-heading">
        {resolvedBreadcrumbs.length ? (
          <nav aria-label={t('面包屑导航', 'Breadcrumb')} className="community-breadcrumbs">
            {resolvedBreadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                {index ? <span aria-hidden="true">/</span> : null}
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        {resolvedBackTo ? (
          <Link to={resolvedBackTo} className="community-back-link">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {resolvedBackLabel || copy('back')}
          </Link>
        ) : null}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <p className="community-eyebrow">{eyebrow}</p> : null}
            <h1 className="community-page-title">{title}</h1>
            {description ? <p className="community-page-description">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>

      <div className={aside ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]' : ''}>
        <div className="community-content-panel">{children}</div>
        {aside ? <aside className="community-aside-panel">{aside}</aside> : null}
      </div>
    </section>
  );
}

type CommunityLoadingVariant = 'compact' | 'list' | 'cards' | 'form';

export function CommunityLoadingState({
  label,
  variant = 'compact',
  items,
}: {
  label?: string;
  variant?: CommunityLoadingVariant;
  items?: number;
}) {
  const { copy } = useCommunityUi();
  const itemCount = items ?? (variant === 'cards' ? 3 : variant === 'form' ? 6 : variant === 'list' ? 4 : 1);
  const resolvedLabel = label || copy('loading');

  return (
    <div className={`community-loading community-loading--${variant}`} role="status" aria-live="polite">
      {variant === 'compact' ? (
        <span className="community-state__pulse" aria-hidden="true" />
      ) : (
        <div className="community-loading__skeleton" aria-hidden="true">
          {Array.from({ length: itemCount }, (_, index) => (
            <span className="community-loading__item" key={index}>
              <span className="community-loading__avatar" />
              <span className="community-loading__copy">
                <span />
                <span />
              </span>
              <span className="community-loading__meta" />
            </span>
          ))}
        </div>
      )}
      <p className="community-loading__label">{resolvedLabel}</p>
    </div>
  );
}

export function CommunityEmptyState({ title, description, action }: { title?: string; description?: string; action?: ReactNode }) {
  const { copy } = useCommunityUi();
  return (
    <div className="community-empty-state">
      <span className="community-empty-state__icon"><Inbox className="size-5" aria-hidden="true" /></span>
      <h2>{title || copy('noResults')}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function CommunityErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { copy } = useCommunityUi();
  return (
    <div className="community-error-state" role="alert">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p>{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
            <RotateCcw className="size-3.5" aria-hidden="true" />{copy('retry')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const communityInputClass = 'community-field h-12 w-full px-4 text-base';
export const communityTextareaClass = 'community-field min-h-32 w-full resize-y px-4 py-3 text-base';
export const communityPrimaryButtonClass = 'community-button community-button--primary';
export const communitySecondaryButtonClass = 'community-button community-button--secondary';
