import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { CommunityErrorState } from '@/components/community/CommunitySurface';

function CommunityLoading() {
  const { t } = useCommunityUi();
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
        <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
        {t('正在确认社群状态…', 'Checking your community access…')}
      </div>
    </div>
  );
}

function CommunityAccessError() {
  const { refreshCommunity } = useAuth();
  const { t } = useCommunityUi();
  return (
    <div className="community-page-frame mx-auto max-w-lg py-12">
      <CommunityErrorState
        message={t('账号已登录，但社群资料暂时未能加载，请重试。', 'You are signed in, but your community details could not load. Please retry.')}
        onRetry={() => { void refreshCommunity().catch(() => {}); }}
      />
    </div>
  );
}

export function CommunitySmartEntry() {
  const { user, communityState, loading, error } = useAuth();
  if (loading) return <CommunityLoading />;
  if (!user) return <Navigate to="/community/auth" replace />;
  if (!communityState) return error ? <CommunityAccessError /> : <CommunityLoading />;
  return <Navigate to={communityState.destination} replace />;
}

export function CommunityRequireAuth() {
  const { user, communityState, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <CommunityLoading />;
  if (!user) {
    return <Navigate to="/community/auth" replace state={{ from: location.pathname }} />;
  }
  if (!communityState) return error ? <CommunityAccessError /> : <CommunityLoading />;
  return <Outlet />;
}

export function CommunityRequireMember() {
  const { communityState, loading } = useAuth();
  if (loading) return <CommunityLoading />;
  if (communityState?.membership_status !== 'active') {
    return <Navigate to={communityState?.destination || '/community/apply'} replace />;
  }
  return <Outlet />;
}

export function CommunityRequirePermission({ permission }: { permission: string }) {
  const { permissions, loading } = useAuth();
  if (loading) return <CommunityLoading />;
  if (!permissions.includes(permission)) return <Navigate to="/community" replace />;
  return <Outlet />;
}

export function CommunityRequireAnyPermission({ permissions: required }: { permissions: string[] }) {
  const { permissions, loading } = useAuth();
  if (loading) return <CommunityLoading />;
  if (!required.some((permission) => permissions.includes(permission))) return <Navigate to="/community" replace />;
  return <Outlet />;
}
