import { getSupabaseClient } from '@/lib/supabase/client';
import type { TablesUpdate } from '@/lib/supabase/database.types';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';
import { getCurrentUser } from '@/services/auth';

export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  | 'username'
  | 'display_name'
  | 'avatar_media_id'
  | 'bio'
  | 'city'
  | 'region'
  | 'country'
  | 'preferred_language'
  | 'timezone'
  | 'website'
>;

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');

  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  throwIfSupabaseError(error, 'PROFILE_READ_FAILED');
  return data;
}

export async function updateCurrentProfile(input: ProfileUpdate) {
  const user = await getCurrentUser();
  if (!user) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');

  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .update(input)
    .eq('user_id', user.id)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'PROFILE_UPDATE_FAILED');
  return data;
}
