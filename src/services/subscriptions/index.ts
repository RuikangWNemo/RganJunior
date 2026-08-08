import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type SubscriptionCategory =
  | 'field_notes'
  | 'nate_updates'
  | 'activities'
  | 'project_updates'
  | 'impact_report'
  | 'newsletter';

export async function requestSubscription(
  email: string,
  language: 'zh' | 'en' = 'zh',
  categories: SubscriptionCategory[] = ['field_notes'],
) {
  const { error } = await getSupabaseClient().rpc('request_subscription', {
    subscriber_email: email.trim().toLowerCase(),
    subscriber_language: language,
    requested_categories: categories,
  });
  throwIfSupabaseError(error, 'SUBSCRIPTION_REQUEST_FAILED');
}

export async function getMySubscription() {
  const { data, error } = await getSupabaseClient()
    .from('subscribers')
    .select('*, subscription_preferences(*)')
    .maybeSingle();
  throwIfSupabaseError(error, 'SUBSCRIPTION_READ_FAILED');
  return data;
}
