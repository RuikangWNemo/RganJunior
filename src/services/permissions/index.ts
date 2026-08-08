import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

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
