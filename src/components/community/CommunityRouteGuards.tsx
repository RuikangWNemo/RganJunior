import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';

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

export function CommunitySmartEntry() {
  const { user, communityState, loading } = useAuth();
  if (loading) return <CommunityLoading />;
  if (!user) return <Navigate to="/community/auth" replace />;
  return <Navigate to={communityState?.destination || '/community/auth'} replace />;
}

export function CommunityRequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <CommunityLoading />;
  if (!user) {
    return <Navigate to="/community/auth" replace state={{ from: location.pathname }} />;
  }
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
