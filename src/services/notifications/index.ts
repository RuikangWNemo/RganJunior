import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export async function listMyNotifications(limit = 20) {
  const { data, error } = await getSupabaseClient()
    .from('notifications')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  throwIfSupabaseError(error, 'NOTIFICATIONS_READ_FAILED');
  return data;
}

export async function markNotificationRead(id: number) {
  const { error } = await getSupabaseClient().rpc('mark_notification_read', {
    target_notification_id: id,
  });
  throwIfSupabaseError(error, 'NOTIFICATION_UPDATE_FAILED');
}
