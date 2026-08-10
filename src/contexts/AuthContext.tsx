import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  getCurrentSession,
  signOut as signOutService,
  subscribeToAuthChanges,
} from '@/services/auth';
import { getMyCommunityState, type CommunityState } from '@/services/community-state';
import { subscribeToMyCommunityChanges } from '@/services/community-realtime';
import { getMyPermissions } from '@/services/permissions';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  communityState: CommunityState | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
  refreshCommunity: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [communityState, setCommunityState] = useState<CommunityState | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCommunity = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user) {
      setCommunityState(null);
      setPermissions([]);
      return;
    }

    const [nextState, nextPermissions] = await Promise.all([
      getMyCommunityState(),
      getMyPermissions(),
    ]);
    setCommunityState(nextState);
    setPermissions(nextPermissions);
  }, []);

  const refreshCommunity = useCallback(async () => {
    setError(null);
    try {
      await loadCommunity(session);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Community state is unavailable.');
      throw refreshError;
    }
  }, [loadCommunity, session]);

  useEffect(() => {
    let mounted = true;
    Promise.resolve()
      .then(getCurrentSession)
      .then(async (initialSession) => {
        if (!mounted) return;
        setSession(initialSession);
        await loadCommunity(initialSession);
      })
      .catch((initialError) => {
        if (mounted) setError(initialError instanceof Error ? initialError.message : 'Authentication is unavailable.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    let subscription: ReturnType<typeof subscribeToAuthChanges> | null = null;
    try {
      subscription = subscribeToAuthChanges((_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        window.setTimeout(() => {
          loadCommunity(nextSession).catch((authError) => {
            if (mounted) setError(authError instanceof Error ? authError.message : 'Community state is unavailable.');
          });
        }, 0);
      });
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : 'Authentication is unavailable.');
      setLoading(false);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadCommunity]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;

    const refresh = () => {
      void refreshCommunity().catch(() => {
        // The context exposes refresh failures through its error state.
      });
    };
    const subscription = subscribeToMyCommunityChanges(userId, refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [refreshCommunity, session?.user.id]);

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
    setCommunityState(null);
    setPermissions([]);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    communityState,
    permissions,
    loading,
    error,
    refreshCommunity,
    signOut,
  }), [communityState, error, loading, permissions, refreshCommunity, session, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context and hook intentionally share a module so consumers cannot import the raw context.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
