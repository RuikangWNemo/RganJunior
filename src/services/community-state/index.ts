import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type CommunityState = {
  user_id: string;
  account_status: string;
  onboarding_completed: boolean;
  age_band: string;
  guardian_consent_status: string;
  identity_verification_status: string;
  person_id: number | null;
  application_status: string | null;
  membership_status: string | null;
  destination: string;
};

export async function getMyCommunityState(): Promise<CommunityState> {
  const { data, error } = await getSupabaseClient().rpc('get_my_community_state');
  throwIfSupabaseError(error, 'COMMUNITY_STATE_READ_FAILED');
  if (!data[0]) throw new Error('Community state is unavailable.');
  return data[0] as CommunityState;
}
