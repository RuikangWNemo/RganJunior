import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityLoadingState } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';

export default function CommunityAuthCallback() {
  const { user, loading } = useAuth();
  const { t } = useCommunityUi();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && user) navigate('/community/enter', { replace: true }); }, [loading, navigate, user]);

  return <div className="community-page-frame"><CommunityLoadingState label={t('正在完成登录…', 'Completing sign-in…')} /></div>;
}
