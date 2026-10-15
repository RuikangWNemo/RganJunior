import { Navigate, useLocation } from 'react-router-dom';

export default function LegacyCommunityStoriesRedirect() {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`${pathname.replace(/^\/field-notes(?=\/|$)/, '/community-stories')}${search}${hash}`} replace />;
}
