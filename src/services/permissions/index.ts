import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

type AuthorizationContextRow = Database['public']['Functions']['get_my_authorization_context']['Returns'][number];
type AccessUserRow = Database['public']['Functions']['list_community_access_users']['Returns'][number];
type AccessRoleRow = Database['public']['Functions']['list_community_access_roles']['Returns'][number];

export type AccessRoleAssignment = {
  roleId: number;
  slug: string;
  name: string;
  isSystem: boolean;
  assignedAt: string;
  expiresAt: string | null;
};

export type AccessPermission = {
  key: string;
  description: string | null;
  isSensitive: boolean;
};

export type CommunityAccessUser = Omit<
  AccessUserRow,
  'member_since' | 'role_assignments' | 'suspended_at' | 'suspension_reason' | 'username'
> & {
  member_since: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  username: string | null;
  roleAssignments: AccessRoleAssignment[];
};

export type CommunityAccessRole = Omit<AccessRoleRow, 'description' | 'permissions'> & {
  description: string | null;
  permissions: AccessPermission[];
};

export type CommunityAccessFilters = {
  search?: string;
  membershipStatuses?: string[];
  roleSlugs?: string[];
  pageSize?: number;
  beforeRegisteredAt?: string;
  beforeUserId?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseAccessRoleAssignments(value: Json): AccessRoleAssignment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const expiresAt = item.expiresAt;
    if (
      typeof item.roleId !== 'number'
      || typeof item.slug !== 'string'
      || typeof item.name !== 'string'
      || typeof item.isSystem !== 'boolean'
      || typeof item.assignedAt !== 'string'
      || (expiresAt !== null && typeof expiresAt !== 'string')
    ) return [];
    return [{
      roleId: item.roleId,
      slug: item.slug,
      name: item.name,
      isSystem: item.isSystem,
      assignedAt: item.assignedAt,
      expiresAt: expiresAt as string | null,
    }];
  });
}

export function parseAccessPermissions(value: Json): AccessPermission[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const description = item.description;
    if (
      typeof item.key !== 'string'
      || (description !== null && typeof description !== 'string')
      || typeof item.isSensitive !== 'boolean'
    ) return [];
    return [{
      key: item.key,
      description: description as string | null,
      isSensitive: item.isSensitive,
    }];
  });
}

export async function getMyPermissions(): Promise<string[]> {
  const { data, error } = await getSupabaseClient().rpc('get_my_permissions');
  throwIfSupabaseError(error, 'PERMISSIONS_READ_FAILED');
  return data.map((row) => row.permission_key);
}

export async function hasPermission(permissionKey: string): Promise<boolean> {
  const { data, error } = await getSupabaseClient().rpc('has_permission', {
    permission_key: permissionKey,
  });
  throwIfSupabaseError(error, 'PERMISSION_CHECK_FAILED');
  return data;
}

export async function getMyAuthorizationContext(): Promise<AuthorizationContextRow> {
  const { data, error } = await getSupabaseClient().rpc('get_my_authorization_context');
  throwIfSupabaseError(error, 'AUTHORIZATION_CONTEXT_READ_FAILED');
  return data[0] ?? { is_super_admin: false, role_slugs: [] };
}

export async function listCommunityAccessUsers(
  filters: CommunityAccessFilters = {},
): Promise<CommunityAccessUser[]> {
  const { data, error } = await getSupabaseClient().rpc('list_community_access_users', {
    search_query: filters.search,
    membership_statuses: filters.membershipStatuses,
    role_slugs: filters.roleSlugs,
    page_size: filters.pageSize ?? 50,
    before_registered_at: filters.beforeRegisteredAt,
    before_user_id: filters.beforeUserId,
  });
  throwIfSupabaseError(error, 'COMMUNITY_ACCESS_USERS_READ_FAILED');
  return data.map(({ role_assignments, ...user }) => ({
    ...user,
    roleAssignments: parseAccessRoleAssignments(role_assignments),
  }));
}

export async function listCommunityAccessRoles(): Promise<CommunityAccessRole[]> {
  const { data, error } = await getSupabaseClient().rpc('list_community_access_roles');
  throwIfSupabaseError(error, 'COMMUNITY_ACCESS_ROLES_READ_FAILED');
  return data.map(({ permissions, ...role }) => ({
    ...role,
    permissions: parseAccessPermissions(permissions),
  }));
}

export async function listAuthorizationAuditLogs(pageSize = 50, beforeCreatedAt?: string) {
  const { data, error } = await getSupabaseClient().rpc('get_audit_logs', {
    page_size: pageSize,
    before_created_at: beforeCreatedAt,
  });
  throwIfSupabaseError(error, 'AUTHORIZATION_AUDIT_READ_FAILED');
  return data.filter((entry) => entry.entity_type === 'role' || entry.entity_type === 'user_role');
}

export async function createRole(slug: string, name: string, description?: string) {
  const { data, error } = await getSupabaseClient().rpc('create_role', {
    role_slug: slug,
    role_name: name,
    role_description: description,
  });
  throwIfSupabaseError(error, 'ROLE_CREATE_FAILED');
  return data;
}

export async function setRolePermissions(roleId: number, permissionKeys: string[]) {
  const { error } = await getSupabaseClient().rpc('set_role_permissions', {
    target_role_id: roleId,
    permission_keys: permissionKeys,
  });
  throwIfSupabaseError(error, 'ROLE_PERMISSIONS_UPDATE_FAILED');
}

export async function assignUserRole(userId: string, roleId: number, expiresAt?: string) {
  const { error } = await getSupabaseClient().rpc('assign_user_role', {
    target_user_id: userId,
    target_role_id: roleId,
    role_expires_at: expiresAt,
  });
  throwIfSupabaseError(error, 'USER_ROLE_ASSIGN_FAILED');
}

export async function revokeUserRole(userId: string, roleId: number) {
  const { error } = await getSupabaseClient().rpc('revoke_user_role', {
    target_user_id: userId,
    target_role_id: roleId,
  });
  throwIfSupabaseError(error, 'USER_ROLE_REVOKE_FAILED');
}
