import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

const AUTH_LOAD_TIMEOUT_MS = 15_000;

async function withAuthTimeout<T>(request: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Account loading timed out. Please retry.')), AUTH_LOAD_TIMEOUT_MS);
  });
  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [communityState, setCommunityState] = useState<CommunityState | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadVersion = useRef(0);
  const activeSessionRef = useRef<Session | null>(null);
  const loadedUserId = useRef<string | null>(null);

  const loadCommunity = useCallback(async (activeSession: Session | null) => {
    const version = ++loadVersion.current;
    setError(null);
    if (!activeSession?.user) {
      loadedUserId.current = null;
      setCommunityState(null);
      setPermissions([]);
      setLoading(false);
      return;
    }

    if (loadedUserId.current !== activeSession.user.id) setLoading(true);
    try {
      const [nextState, nextPermissions] = await withAuthTimeout(Promise.all([
        getMyCommunityState(),
        getMyPermissions(),
      ]));
      if (version !== loadVersion.current) return;
      loadedUserId.current = activeSession.user.id;
      setCommunityState(nextState);
      setPermissions(nextPermissions);
    } catch (loadError) {
      if (version !== loadVersion.current) return;
      setError(loadError instanceof Error ? loadError.message : 'Community state is unavailable.');
      throw loadError;
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, []);

  const refreshCommunity = useCallback(async () => {
    await loadCommunity(activeSessionRef.current);
  }, [loadCommunity]);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    let refreshTimer: number | undefined;
    withAuthTimeout(Promise.resolve().then(getCurrentSession))
      .then(async (initialSession) => {
        if (!mounted || authEventReceived) return;
        activeSessionRef.current = initialSession;
        setSession(initialSession);
        await loadCommunity(initialSession);
      })
      .catch((initialError) => {
        if (mounted && !authEventReceived) {
          setError(initialError instanceof Error ? initialError.message : 'Authentication is unavailable.');
          setLoading(false);
        }
      });

    let subscription: ReturnType<typeof subscribeToAuthChanges> | null = null;
    try {
      subscription = subscribeToAuthChanges((_event, nextSession) => {
        if (!mounted) return;
        authEventReceived = true;
        // Invalidate in-flight data before publishing a new account/session.
        ++loadVersion.current;
        activeSessionRef.current = nextSession;
        setSession(nextSession);
        if (loadedUserId.current !== (nextSession?.user.id ?? null)) {
          loadedUserId.current = null;
          setCommunityState(null);
          setPermissions([]);
        }
        if (nextSession?.user && !loadedUserId.current) setLoading(true);
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => {
          if (!mounted) return;
          void loadCommunity(nextSession).catch(() => {
            // loadCommunity exposes the failure for the retry UI.
          });
        }, 0);
      });
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : 'Authentication is unavailable.');
      setLoading(false);
    }

    return () => {
      mounted = false;
      // This mutable counter invalidates every outstanding request at cleanup.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++loadVersion.current;
      window.clearTimeout(refreshTimer);
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
    ++loadVersion.current;
    activeSessionRef.current = null;
    loadedUserId.current = null;
    setSession(null);
    setCommunityState(null);
    setPermissions([]);
    setLoading(false);
    setError(null);
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
