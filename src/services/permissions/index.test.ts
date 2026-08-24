import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getMyAuthorizationContext,
  listCommunityAccessRoles,
  listCommunityAccessUsers,
  parseAccessPermissions,
  parseAccessRoleAssignments,
} from './index';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ rpc }),
}));

describe('Community access authorization service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads explicit super-admin context', async () => {
    rpc.mockResolvedValue({
      data: [{ is_super_admin: true, role_slugs: ['registered_user', 'super_admin'] }],
      error: null,
    });

    await expect(getMyAuthorizationContext()).resolves.toEqual({
      is_super_admin: true,
      role_slugs: ['registered_user', 'super_admin'],
    });
    expect(rpc).toHaveBeenCalledWith('get_my_authorization_context');
  });

  it('maps roster filters and parses active role assignments', async () => {
    rpc.mockResolvedValue({
      data: [{
        user_id: 'user-1',
        display_name: '山风',
        username: 'shan-feng',
        account_status: 'active',
        registered_at: '2026-08-24T00:00:00Z',
        membership_status: 'active',
        member_since: '2026-08-24',
        suspended_at: null,
        suspension_reason: null,
        role_assignments: [{
          roleId: 5,
          slug: 'admin',
          name: 'Admin',
          isSystem: true,
          assignedAt: '2026-08-24T00:00:00Z',
          expiresAt: null,
        }],
      }],
      error: null,
    });

    const result = await listCommunityAccessUsers({
      search: '山风',
      membershipStatuses: ['active'],
      roleSlugs: ['admin'],
      pageSize: 25,
    });

    expect(rpc).toHaveBeenCalledWith('list_community_access_users', {
      search_query: '山风',
      membership_statuses: ['active'],
      role_slugs: ['admin'],
      page_size: 25,
      before_registered_at: undefined,
      before_user_id: undefined,
    });
    expect(result[0].roleAssignments).toEqual([
      expect.objectContaining({ roleId: 5, slug: 'admin', expiresAt: null }),
    ]);
    expect(result[0]).not.toHaveProperty('role_assignments');
  });

  it('parses role permissions and drops malformed projection entries', async () => {
    rpc.mockResolvedValue({
      data: [{
        id: 5,
        slug: 'admin',
        name: 'Admin',
        description: 'Administrator',
        is_system: true,
        is_active: true,
        is_reserved: true,
        permissions: [
          { key: 'users.read', description: 'Read users', isSensitive: false },
          { key: 12, description: null, isSensitive: false },
        ],
      }],
      error: null,
    });

    const roles = await listCommunityAccessRoles();

    expect(rpc).toHaveBeenCalledWith('list_community_access_roles');
    expect(roles[0].permissions).toEqual([
      { key: 'users.read', description: 'Read users', isSensitive: false },
    ]);
  });

  it('returns empty arrays for malformed JSON projections', () => {
    expect(parseAccessRoleAssignments({ broken: true })).toEqual([]);
    expect(parseAccessPermissions(['broken'])).toEqual([]);
  });
});
