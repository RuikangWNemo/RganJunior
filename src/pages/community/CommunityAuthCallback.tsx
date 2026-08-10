import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { CommunityLoadingState } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { readAuthCallbackError } from '@/lib/authCallback';
import { useCommunityUi } from '@/lib/communityUi';
import { getCurrentSession } from '@/services/auth';

export default function CommunityAuthCallback() {
  const { user, loading, error: authError } = useAuth();
  const { t } = useCommunityUi();
  const navigate = useNavigate();
  const [callbackError, setCallbackError] = useState<string | null>(() => (
    readAuthCallbackError(window.location.search, window.location.hash)
      ? t('登录链接无效或已过期，请重新发送。', 'The sign-in link is invalid or expired. Please send a new one.')
      : null
  ));

  useEffect(() => {
    if (user) {
      navigate('/community/enter', { replace: true });
      return;
    }
    if (loading) return;
    if (callbackError) return;

    let active = true;
    getCurrentSession()
      .then((session) => {
        if (!active) return;
        if (session?.user) navigate('/community/enter', { replace: true });
        else setCallbackError(t('没有建立登录会话，链接可能已失效或已使用。', 'No sign-in session was created. The link may be expired or already used.'));
      })
      .catch(() => {
        if (active) setCallbackError(t('暂时无法完成登录，请返回后重新尝试。', 'We could not complete sign-in. Please go back and try again.'));
      });

    return () => { active = false; };
  }, [callbackError, loading, navigate, t, user]);

  if (!loading && !user && (callbackError || authError)) {
    return (
      <div className="community-page-frame">
        <div className="mx-auto flex min-h-[55dvh] max-w-lg items-center px-5 py-12">
          <div className="w-full rounded-[1.6rem] rounded-bl-[0.6rem] border border-primary/15 bg-white/80 p-6 shadow-[0_24px_70px_hsl(var(--community-forest)/0.08)] sm:p-8">
            <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
            <h1 className="mt-5 font-serif text-3xl text-primary">{t('登录未完成', 'Sign-in was not completed')}</h1>
            <p className="mt-3 text-sm leading-6 text-foreground/65" role="alert">
              {callbackError || t('认证服务返回了错误，请重新尝试。', 'The authentication service returned an error. Please try again.')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/community/auth" className="community-button community-button--primary gap-2">
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t('返回登录', 'Back to sign-in')}
              </Link>
              <button type="button" className="community-button community-button--secondary gap-2" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4" aria-hidden="true" />
                {t('重新检查', 'Check again')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="community-page-frame"><CommunityLoadingState label={t('正在完成登录…', 'Completing sign-in…')} /></div>;
}
