import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { buildAuthRedirectUrl } from '@/lib/authRedirect';
import { getSupabaseClient } from '@/lib/supabase/client';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';

export type AgeBand = 'under_14' | 'age_14_17' | 'adult_18_plus';

export type SignUpInput = {
  email: string;
  password: string;
  ageBand: AgeBand;
};

export async function signUp(input: SignUpInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { age_band: input.ageBand },
      emailRedirectTo: buildAuthRedirectUrl('/community/auth/callback'),
    },
  });
  throwIfSupabaseError(error, 'AUTH_SIGN_UP_FAILED');
  return data;
}

export async function signInWithIdentifier(identifier: string, password: string) {
  const response = await fetch('/api/community/username-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const result = await response.json() as {
    ok?: boolean;
    code?: string;
    message?: string;
    session?: { accessToken: string; refreshToken: string };
  };
  if (!response.ok || !result.session) {
    throw new BackendServiceError(
      result.code || 'AUTH_SIGN_IN_FAILED',
      result.message || 'Unable to sign in.',
      response.status,
    );
  }

  const { data, error } = await getSupabaseClient().auth.setSession({
    access_token: result.session.accessToken,
    refresh_token: result.session.refreshToken,
  });
  throwIfSupabaseError(error, 'AUTH_SESSION_SAVE_FAILED');
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  throwIfSupabaseError(error, 'AUTH_SIGN_IN_FAILED');
  return data;
}

export async function sendMagicLink(email: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: buildAuthRedirectUrl('/community/auth/callback'),
    },
  });
  throwIfSupabaseError(error, 'AUTH_MAGIC_LINK_FAILED');
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data, error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: buildAuthRedirectUrl('/community/reset-password') },
  );
  throwIfSupabaseError(error, 'AUTH_PASSWORD_RESET_FAILED');
  return data;
}

export async function updatePassword(password: string) {
  const { data, error } = await getSupabaseClient().auth.updateUser({ password });
  throwIfSupabaseError(error, 'AUTH_PASSWORD_UPDATE_FAILED');
  return data;
}

export async function updateEmail(email: string) {
  const { data, error } = await getSupabaseClient().auth.updateUser({
    email: email.trim().toLowerCase(),
  });
  throwIfSupabaseError(error, 'AUTH_EMAIL_UPDATE_FAILED');
  return data;
}

export async function reauthenticate() {
  const { data, error } = await getSupabaseClient().auth.reauthenticate();
  throwIfSupabaseError(error, 'AUTH_REAUTHENTICATION_FAILED');
  return data;
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut();
  throwIfSupabaseError(error, 'AUTH_SIGN_OUT_FAILED');
}

export async function getCurrentUser() {
  const { data, error } = await getSupabaseClient().auth.getUser();
  throwIfSupabaseError(error, 'AUTH_USER_LOOKUP_FAILED');
  return data.user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  throwIfSupabaseError(error, 'AUTH_SESSION_LOOKUP_FAILED');
  return data.session;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return getSupabaseClient().auth.onAuthStateChange(callback).data.subscription;
}
