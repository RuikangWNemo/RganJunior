import type { RealtimeChannel } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/lib/supabase/client';

export type CommunityRealtimeSubscription = {
  unsubscribe: () => void;
};

function subscribeToPrivateBroadcast(
  topic: string,
  event: string,
  onChange: () => void,
): CommunityRealtimeSubscription {
  const supabase = getSupabaseClient();
  let channel: RealtimeChannel | null = null;
  let cancelled = false;

  void supabase.realtime.setAuth()
    .then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(topic, { config: { private: true } })
        .on('broadcast', { event }, onChange)
        .subscribe();
    })
    .catch(() => {
      // Focus and online listeners provide a recovery path if Realtime cannot connect.
    });

  return {
    unsubscribe: () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    },
  };
}

export function subscribeToApplicationReviewChanges(onChange: () => void) {
  return subscribeToPrivateBroadcast(
    'community:applications:review',
    'application_changed',
    onChange,
  );
}

export function subscribeToMyCommunityChanges(userId: string, onChange: () => void) {
  return subscribeToPrivateBroadcast(
    `community:user:${userId}`,
    'community_state_changed',
    onChange,
  );
}
