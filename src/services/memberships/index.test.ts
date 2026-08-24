import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreCommunityMembership, suspendCommunityMembership } from './index';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ rpc }),
}));

describe('Community membership administration service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: undefined, error: null });
  });

  it('suspends a membership with its required reason', async () => {
    await suspendCommunityMembership('user-1', 'Repeated safety violations');

    expect(rpc).toHaveBeenCalledWith('suspend_community_membership', {
      target_user_id: 'user-1',
      target_reason: 'Repeated safety violations',
    });
  });

  it('restores a suspended membership', async () => {
    await restoreCommunityMembership('user-1');

    expect(rpc).toHaveBeenCalledWith('restore_community_membership', {
      target_user_id: 'user-1',
    });
  });
});
