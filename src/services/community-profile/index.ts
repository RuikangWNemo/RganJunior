import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type CommunityOnboardingInput = {
  username: string;
  displayName: string;
  nameZh?: string;
  nameEn?: string;
  natureName?: string;
  bio?: string;
  city?: string;
  region?: string;
  country?: string;
  profileVisibility: 'private' | 'members' | 'public';
  showRealName: boolean;
  allowMessages: boolean;
  language: 'zh' | 'en';
  timezone: string;
};

export async function completeCommunityOnboarding(input: CommunityOnboardingInput) {
  const { data, error } = await getSupabaseClient().rpc('complete_community_onboarding', {
    account_username: input.username,
    person_display_name: input.displayName,
    person_name_zh: input.nameZh,
    person_name_en: input.nameEn,
    person_nature_name: input.natureName,
    person_bio: input.bio,
    person_city: input.city,
    person_region: input.region,
    person_country: input.country,
    requested_profile_visibility: input.profileVisibility,
    requested_show_real_name: input.showRealName,
    requested_allow_messages: input.allowMessages,
    requested_language: input.language,
    requested_timezone: input.timezone,
  });
  throwIfSupabaseError(error, 'COMMUNITY_ONBOARDING_FAILED');
  return data;
}

export async function getMyCommunityProfile() {
  const { data, error } = await getSupabaseClient().rpc('get_my_community_profile');
  throwIfSupabaseError(error, 'COMMUNITY_PROFILE_READ_FAILED');
  return data[0] ?? null;
}

export async function updateMyCommunityProfile(input: Omit<CommunityOnboardingInput, 'username' | 'language' | 'timezone'> & { fullNamePrivate?: string }) {
  const { error } = await getSupabaseClient().rpc('update_my_community_profile', {
    person_display_name: input.displayName,
    person_full_name_private: input.fullNamePrivate,
    person_name_zh: input.nameZh,
    person_name_en: input.nameEn,
    person_nature_name: input.natureName,
    person_bio: input.bio,
    person_city: input.city,
    person_region: input.region,
    person_country: input.country,
    requested_profile_visibility: input.profileVisibility,
    requested_show_real_name: input.showRealName,
    requested_allow_messages: input.allowMessages,
  });
  throwIfSupabaseError(error, 'COMMUNITY_PROFILE_UPDATE_FAILED');
}
