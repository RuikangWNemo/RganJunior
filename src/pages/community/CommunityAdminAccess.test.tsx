import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageProvider } from '@/contexts/LanguageContext';
import CommunityAdminAccess from './CommunityAdminAccess';

const {
  assignUserRole,
  authState,
  getMyAuthorizationContext,
  listAuthorizationAuditLogs,
  listCommunityAccessRoles,
  listCommunityAccessUsers,
  refreshCommunity,
  restoreCommunityMembership,
  revokeUserRole,
  setRolePermissions,
  suspendCommunityMembership,
} = vi.hoisted(() => ({
  assignUserRole: vi.fn(),
  authState: {
    permissions: ['users.read', 'memberships.manage', 'roles.read', 'roles.manage', 'role_assignments.manage', 'audit.read'],
    user: { id: 'operator-user' },
  },
  getMyAuthorizationContext: vi.fn(),
  listAuthorizationAuditLogs: vi.fn(),
  listCommunityAccessRoles: vi.fn(),
  listCommunityAccessUsers: vi.fn(),
  refreshCommunity: vi.fn(),
  restoreCommunityMembership: vi.fn(),
  revokeUserRole: vi.fn(),
  setRolePermissions: vi.fn(),
  suspendCommunityMembership: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ ...authState, refreshCommunity }),
}));

vi.mock('@/services/permissions', () => ({
  assignUserRole,
  getMyAuthorizationContext,
  listAuthorizationAuditLogs,
  listCommunityAccessRoles,
  listCommunityAccessUsers,
  revokeUserRole,
  setRolePermissions,
}));

vi.mock('@/services/memberships', () => ({
  restoreCommunityMembership,
  suspendCommunityMembership,
}));

const account = {
  user_id: 'member-user',
  display_name: '山风',
  username: 'shan-feng',
  account_status: 'active',
  registered_at: '2026-08-20T08:00:00Z',
  membership_status: 'active',
  member_since: '2026-08-21',
  suspended_at: null,
  suspension_reason: null,
  roleAssignments: [{
    roleId: 1,
    slug: 'registered_user',
    name: 'Registered User',
    isSystem: true,
    assignedAt: '2026-08-20T08:00:00Z',
    expiresAt: null,
  }],
};

const roles = [
  {
    id: 1,
    slug: 'registered_user',
    name: 'Registered User',
    description: 'Account holder',
    is_system: true,
    is_active: true,
    is_reserved: false,
    permissions: [],
  },
  {
    id: 4,
    slug: 'editor',
    name: 'Editor',
    description: 'Editorial role',
    is_system: true,
    is_active: true,
    is_reserved: false,
    permissions: [{ key: 'people.manage', description: 'Manage people', isSensitive: false }],
  },
  {
    id: 5,
    slug: 'admin',
    name: 'Admin',
    description: 'Administrator',
    is_system: true,
    is_active: true,
    is_reserved: true,
    permissions: [
      { key: 'people.manage', description: 'Manage people', isSensitive: false },
      { key: 'users.read', description: 'Read users', isSensitive: false },
    ],
  },
  {
    id: 6,
    slug: 'super_admin',
    name: 'Super Admin',
    description: 'Super administrator',
    is_system: true,
    is_active: true,
    is_reserved: true,
    permissions: [
      { key: 'audit.read', description: 'Read audit logs', isSensitive: true },
      { key: 'memberships.manage', description: 'Manage memberships', isSensitive: true },
      { key: 'people.manage', description: 'Manage people', isSensitive: false },
      { key: 'role_assignments.manage', description: 'Manage role assignments', isSensitive: true },
      { key: 'roles.manage', description: 'Manage roles', isSensitive: true },
      { key: 'users.read', description: 'Read users', isSensitive: false },
    ],
  },
];

function renderAccessPage() {
  return render(
    <MemoryRouter initialEntries={['/community/admin/access']}>
      <LanguageProvider initialLanguage="zh">
        <CommunityAdminAccess />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CommunityAdminAccess', () => {
  beforeEach(() => {
    window.localStorage.setItem('rgan-lang', 'zh');
    vi.clearAllMocks();
    authState.permissions = ['users.read', 'memberships.manage', 'roles.read', 'roles.manage', 'role_assignments.manage', 'audit.read'];
    getMyAuthorizationContext.mockResolvedValue({ is_super_admin: false, role_slugs: ['admin'] });
    listCommunityAccessUsers.mockResolvedValue([account]);
    listCommunityAccessRoles.mockResolvedValue(roles);
    listAuthorizationAuditLogs.mockResolvedValue([]);
    assignUserRole.mockResolvedValue(undefined);
    revokeUserRole.mockResolvedValue(undefined);
    setRolePermissions.mockResolvedValue(undefined);
    suspendCommunityMembership.mockResolvedValue(undefined);
    restoreCommunityMembership.mockResolvedValue(undefined);
    refreshCommunity.mockResolvedValue(undefined);
  });

  it('keeps administrator appointment controls exclusive to super administrators', async () => {
    renderAccessPage();

    expect(await screen.findByRole('heading', { name: '山风' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '授予 编辑' })).toHaveLength(2);
    expect(screen.queryAllByRole('button', { name: '授予 管理员' })).toHaveLength(0);
    expect(screen.queryByRole('heading', { name: '管理员权限集' })).not.toBeInTheDocument();
  });

  it('lets a super administrator confirm administrator appointment', async () => {
    getMyAuthorizationContext.mockResolvedValue({ is_super_admin: true, role_slugs: ['super_admin'] });
    renderAccessPage();

    fireEvent.click((await screen.findAllByRole('button', { name: '授予 管理员' }))[0]);
    expect(screen.getByRole('heading', { name: '确认授予角色' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '确认操作' }));

    await waitFor(() => expect(assignUserRole).toHaveBeenCalledWith('member-user', 5));
    expect(await screen.findByText('已授予管理员。')).toBeInTheDocument();
    expect(refreshCommunity).toHaveBeenCalledTimes(1);
  });

  it('requires and submits a membership suspension reason', async () => {
    renderAccessPage();

    fireEvent.click((await screen.findAllByRole('button', { name: '暂停会员' }))[0]);
    fireEvent.click(screen.getByRole('button', { name: '确认操作' }));
    expect(screen.getByRole('alert')).toHaveTextContent('请填写暂停原因。');

    fireEvent.change(screen.getByRole('textbox', { name: '暂停原因 *' }), {
      target: { value: '多次违反社群安全约定' },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认操作' }));

    await waitFor(() => expect(suspendCommunityMembership).toHaveBeenCalledWith('member-user', '多次违反社群安全约定'));
  });

  it('confirms replacement of the shared administrator permission set', async () => {
    getMyAuthorizationContext.mockResolvedValue({ is_super_admin: true, role_slugs: ['super_admin'] });
    renderAccessPage();

    const usersRead = await screen.findByRole('checkbox', { name: /users\.read/ });
    fireEvent.click(usersRead);
    fireEvent.click(screen.getByRole('button', { name: '保存权限' }));
    fireEvent.click(screen.getByRole('button', { name: '确认保存' }));

    await waitFor(() => expect(setRolePermissions).toHaveBeenCalledWith(5, ['people.manage']));
  });
});
