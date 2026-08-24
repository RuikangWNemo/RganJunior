import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Clock3,
  History,
  KeyRound,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundCheck,
  Users,
  UserX,
} from 'lucide-react';

import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communityInputClass,
  communityPrimaryButtonClass,
  communitySecondaryButtonClass,
  communityTextareaClass,
} from '@/components/community/CommunitySurface';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import {
  restoreCommunityMembership,
  suspendCommunityMembership,
} from '@/services/memberships';
import {
  assignUserRole,
  getMyAuthorizationContext,
  listAuthorizationAuditLogs,
  listCommunityAccessRoles,
  listCommunityAccessUsers,
  revokeUserRole,
  setRolePermissions,
  type CommunityAccessRole,
  type CommunityAccessUser,
} from '@/services/permissions';

type AuthorizationContext = Awaited<ReturnType<typeof getMyAuthorizationContext>>;
type AuditEntry = Awaited<ReturnType<typeof listAuthorizationAuditLogs>>[number];
type PendingAction =
  | { kind: 'suspend'; user: CommunityAccessUser }
  | { kind: 'restore'; user: CommunityAccessUser }
  | { kind: 'assign-role' | 'revoke-role'; user: CommunityAccessUser; role: CommunityAccessRole }
  | { kind: 'save-permissions'; role: CommunityAccessRole };

const PAGE_SIZE = 50;
const BASELINE_ROLE_SLUGS = new Set(['registered_user', 'community_member']);
const RESERVED_ROLE_SLUGS = new Set(['admin', 'super_admin']);

const roleLabels: Record<string, { zh: string; en: string }> = {
  registered_user: { zh: '注册用户', en: 'Registered user' },
  community_member: { zh: '正式成员', en: 'Community member' },
  facilitator: { zh: '共练带领者', en: 'Facilitator' },
  editor: { zh: '编辑', en: 'Editor' },
  admin: { zh: '管理员', en: 'Administrator' },
  super_admin: { zh: '超级管理员', en: 'Super administrator' },
};

function userName(user: CommunityAccessUser) {
  return user.display_name || user.username || user.user_id.slice(0, 8);
}

export default function CommunityAdminAccess() {
  const { permissions, refreshCommunity } = useAuth();
  const { formatDate, formatDateTime, lang, status, t } = useCommunityUi();
  const [context, setContext] = useState<AuthorizationContext>({ is_super_admin: false, role_slugs: [] });
  const [users, setUsers] = useState<CommunityAccessUser[]>([]);
  const [roles, setRoles] = useState<CommunityAccessRole[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [adminPermissionDraft, setAdminPermissionDraft] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const canReadRoles = permissions.some((permission) => (
    ['roles.read', 'roles.manage', 'role_assignments.manage'].includes(permission)
  ));
  const canManageRoles = permissions.includes('role_assignments.manage');
  const canManageMemberships = permissions.includes('memberships.manage');
  const canReadAudit = permissions.includes('audit.read');

  const rosterFilters = useMemo(() => ({
    search: appliedSearch || undefined,
    membershipStatuses: membershipFilter === 'all' ? undefined : [membershipFilter],
    roleSlugs: roleFilter === 'all' ? undefined : [roleFilter],
    pageSize: PAGE_SIZE,
  }), [appliedSearch, membershipFilter, roleFilter]);

  const loadWorkspace = useCallback(async (background = false) => {
    const requestId = ++requestIdRef.current;
    if (!background) setLoading(true);
    setError(null);
    try {
      const [nextContext, nextUsers, nextRoles, nextAudit] = await Promise.all([
        getMyAuthorizationContext(),
        listCommunityAccessUsers(rosterFilters),
        canReadRoles ? listCommunityAccessRoles() : Promise.resolve([]),
        canReadAudit ? listAuthorizationAuditLogs(40) : Promise.resolve([]),
      ]);
      if (requestId !== requestIdRef.current) return;
      setContext(nextContext);
      setUsers(nextUsers);
      setRoles(nextRoles);
      setAuditEntries(nextAudit);
      setHasMore(nextUsers.length === PAGE_SIZE);
      const nextAdmin = nextRoles.find((role) => role.slug === 'admin');
      setAdminPermissionDraft(nextAdmin?.permissions.map((permission) => permission.key) ?? []);
    } catch (readError) {
      if (requestId !== requestIdRef.current) return;
      setError(readError instanceof Error ? readError.message : t('会员授权数据读取失败。', 'Could not load member access data.'));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [canReadAudit, canReadRoles, rosterFilters, t]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const loadMore = async () => {
    const lastUser = users.at(-1);
    if (!lastUser || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const nextUsers = await listCommunityAccessUsers({
        ...rosterFilters,
        beforeRegisteredAt: lastUser.registered_at,
        beforeUserId: lastUser.user_id,
      });
      setUsers((current) => {
        const known = new Set(current.map((item) => item.user_id));
        return [...current, ...nextUsers.filter((item) => !known.has(item.user_id))];
      });
      setHasMore(nextUsers.length === PAGE_SIZE);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('更多会员读取失败。', 'Could not load more accounts.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const roleLabel = useCallback((role: CommunityAccessRole | { slug: string; name: string }) => (
    roleLabels[role.slug]?.[lang] || role.name
  ), [lang]);

  const hasRole = (targetUser: CommunityAccessUser, roleSlug: string) => (
    targetUser.roleAssignments.some((assignment) => assignment.slug === roleSlug)
  );

  const operationalRoles = useMemo(() => roles.filter((role) => (
    role.is_active && !BASELINE_ROLE_SLUGS.has(role.slug) && !RESERVED_ROLE_SLUGS.has(role.slug)
  )), [roles]);
  const reservedRoles = useMemo(() => roles.filter((role) => (
    role.is_active && RESERVED_ROLE_SLUGS.has(role.slug)
  )), [roles]);
  const adminRole = roles.find((role) => role.slug === 'admin');

  const permissionGroups = useMemo(() => {
    const allPermissions = new Map(
      roles.flatMap((role) => role.permissions).map((permission) => [permission.key, permission]),
    );
    const groups = new Map<string, Array<(typeof allPermissions extends Map<string, infer Value> ? Value : never)>>();
    [...allPermissions.values()]
      .sort((left, right) => left.key.localeCompare(right.key))
      .forEach((permission) => {
        const group = permission.key.split('.')[0];
        groups.set(group, [...(groups.get(group) || []), permission]);
      });
    return [...groups.entries()];
  }, [roles]);

  const stats = useMemo(() => ({
    accounts: users.length,
    active: users.filter((item) => item.membership_status === 'active').length,
    suspended: users.filter((item) => item.membership_status === 'suspended').length,
    administrators: users.filter((item) => item.roleAssignments.some((role) => RESERVED_ROLE_SLUGS.has(role.slug))).length,
    expiring: users.reduce((count, item) => count + item.roleAssignments.filter((role) => role.expiresAt).length, 0),
  }), [users]);

  const friendlyError = (actionFailure: unknown) => {
    const message = actionFailure instanceof Error ? actionFailure.message : '';
    if (message.includes('SUPER_ADMIN_REQUIRED')) return t('只有超级管理员可以更改管理员授权。', 'Only a super administrator can change administrator access.');
    if (message.includes('LAST_SUPER_ADMIN_REQUIRED')) return t('系统必须至少保留一名有效的超级管理员。', 'At least one active super administrator must remain.');
    if (message.includes('SUSPENSION_REASON_REQUIRED')) return t('暂停会员必须填写原因。', 'A suspension reason is required.');
    if (message.includes('ACTIVE_MEMBERSHIP_NOT_FOUND')) return t('该账号当前没有可暂停的有效会员资格。', 'This account has no active membership to suspend.');
    if (message.includes('SUSPENDED_MEMBERSHIP_NOT_FOUND')) return t('该账号当前没有可恢复的暂停会员资格。', 'This account has no suspended membership to restore.');
    if (message.includes('PERMISSION_DENIED')) return t('当前账号没有执行此操作的权限。', 'Your account cannot perform this action.');
    return message || t('授权操作失败，请刷新后重试。', 'The access action failed. Refresh and try again.');
  };

  const actionKey = (action: PendingAction) => {
    if (action.kind === 'save-permissions') return `permissions-${action.role.id}`;
    if (action.kind === 'assign-role' || action.kind === 'revoke-role') return `${action.kind}-${action.user.user_id}-${action.role.id}`;
    return `${action.kind}-${action.user.user_id}`;
  };

  const openAction = (action: PendingAction) => {
    setActionError(null);
    setSuspensionReason('');
    setPendingAction(action);
  };

  const runPendingAction = async () => {
    const action = pendingAction;
    if (!action || busyKey) return;
    if (action.kind === 'suspend' && !suspensionReason.trim()) {
      setActionError(t('请填写暂停原因。', 'Enter a suspension reason.'));
      return;
    }

    setBusyKey(actionKey(action));
    setActionError(null);
    setError(null);
    setNotice(null);
    try {
      if (action.kind === 'suspend') {
        await suspendCommunityMembership(action.user.user_id, suspensionReason.trim());
        setNotice(t('会员资格已暂停，成员权限已立即收回。', 'Membership suspended and member access revoked immediately.'));
      } else if (action.kind === 'restore') {
        await restoreCommunityMembership(action.user.user_id);
        setNotice(t('会员资格已恢复。', 'Membership restored.'));
      } else if (action.kind === 'assign-role') {
        await assignUserRole(action.user.user_id, action.role.id);
        setNotice(t(`已授予${roleLabel(action.role)}。`, `${roleLabel(action.role)} granted.`));
      } else if (action.kind === 'revoke-role') {
        await revokeUserRole(action.user.user_id, action.role.id);
        setNotice(t(`已撤销${roleLabel(action.role)}。`, `${roleLabel(action.role)} revoked.`));
      } else {
        await setRolePermissions(action.role.id, adminPermissionDraft);
        setNotice(t('管理员权限集已更新。', 'Administrator permissions updated.'));
      }
      setPendingAction(null);
      setSuspensionReason('');
      await loadWorkspace(true);
      try {
        await refreshCommunity();
      } catch {
        setError(t('授权已保存，但当前会话权限刷新失败；请刷新页面。', 'Access was saved, but session permissions did not refresh. Reload the page.'));
      }
    } catch (actionFailure) {
      setActionError(friendlyError(actionFailure));
    } finally {
      setBusyKey(null);
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchDraft.trim());
  };

  const resetFilters = () => {
    setSearchDraft('');
    setAppliedSearch('');
    setMembershipFilter('all');
    setRoleFilter('all');
  };

  const actionTitle = pendingAction?.kind === 'suspend'
    ? t('暂停会员资格', 'Suspend membership')
    : pendingAction?.kind === 'restore'
      ? t('恢复会员资格', 'Restore membership')
      : pendingAction?.kind === 'save-permissions'
        ? t('更新管理员权限', 'Update administrator permissions')
        : pendingAction?.kind === 'assign-role'
          ? t('确认授予角色', 'Confirm role grant')
          : t('确认撤销角色', 'Confirm role revocation');

  const actionDescription = pendingAction?.kind === 'save-permissions'
    ? t('保存后，所有管理员的有效权限会立即按新权限集计算。', 'All administrators will immediately use the new permission set after saving.')
    : pendingAction && 'user' in pendingAction
      ? t(`目标账号：${userName(pendingAction.user)}`, `Target account: ${userName(pendingAction.user)}`)
      : '';

  const renderRoleControls = (targetUser: CommunityAccessUser) => {
    if (!canManageRoles) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {operationalRoles.map((role) => {
          const assigned = hasRole(targetUser, role.slug);
          return (
            <button
              key={role.id}
              type="button"
              className="rounded-full border border-primary/15 bg-white/65 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busyKey !== null}
              onClick={() => openAction({ kind: assigned ? 'revoke-role' : 'assign-role', user: targetUser, role })}
            >
              {assigned ? t('撤销', 'Revoke') : t('授予', 'Grant')} {roleLabel(role)}
            </button>
          );
        })}
        {context.is_super_admin ? reservedRoles.map((role) => {
          const assigned = hasRole(targetUser, role.slug);
          return (
            <button
              key={role.id}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${assigned ? 'border border-destructive/25 text-destructive hover:bg-destructive/5' : 'bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))] hover:bg-[hsl(var(--community-orange)/0.2)]'}`}
              disabled={busyKey !== null}
              onClick={() => openAction({ kind: assigned ? 'revoke-role' : 'assign-role', user: targetUser, role })}
            >
              {assigned ? t('撤销', 'Revoke') : t('授予', 'Grant')} {roleLabel(role)}
            </button>
          );
        }) : null}
      </div>
    );
  };

  return (
    <CommunitySurface
      eyebrow="Access control"
      title={t('会员与授权管理。', 'Members and access control.')}
      description={t('管理员负责会员运营；只有超级管理员可以任命管理员并调整管理员权限。所有操作由数据库校验并写入审计记录。', 'Administrators operate memberships. Only super administrators can appoint administrators and change administrator permissions. Every action is database-checked and audited.')}
      width="wide"
      action={(
        <button type="button" className={communitySecondaryButtonClass} disabled={loading || busyKey !== null} onClick={() => void loadWorkspace()}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
          {t('刷新', 'Refresh')}
        </button>
      )}
    >
      {error ? <div className="mb-5"><CommunityErrorState message={error} onRetry={() => void loadWorkspace()} /></div> : null}
      {notice ? <p className="mb-5 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary" role="status">{notice}</p> : null}
      {loading ? <CommunityLoadingState label={t('正在读取会员与授权数据…', 'Loading members and access…')} variant="cards" /> : null}

      {!loading ? (
        <div className="space-y-10">
          <section aria-labelledby="access-overview-title">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><KeyRound className="size-5" aria-hidden="true" /></span>
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Overview</p><h2 id="access-overview-title" className="font-serif text-2xl text-primary">{t('当前结果概览', 'Current result overview')}</h2></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: t('账号', 'Accounts'), value: stats.accounts, icon: Users },
                { label: t('有效会员', 'Active members'), value: stats.active, icon: UserCheck },
                { label: t('已暂停', 'Suspended'), value: stats.suspended, icon: UserX },
                { label: t('管理角色', 'Admin roles'), value: stats.administrators, icon: ShieldCheck },
                { label: t('限时角色', 'Expiring roles'), value: stats.expiring, icon: Clock3 },
              ].map(({ label, value, icon: Icon }) => (
                <article key={label} className="rounded-2xl border border-primary/10 bg-white/55 p-4">
                  <div className="flex items-center justify-between gap-3"><p className="text-xs text-foreground/55">{label}</p><Icon className="size-4 text-primary/45" aria-hidden="true" /></div>
                  <p className="mt-2 font-serif text-3xl text-primary">{value}</p>
                </article>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground/45">{context.is_super_admin ? t('当前身份：超级管理员', 'Current authority: super administrator') : t('当前身份：管理员', 'Current authority: administrator')}</p>
          </section>

          <section aria-labelledby="access-roster-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Roster</p><h2 id="access-roster-title" className="font-serif text-2xl text-primary">{t('会员与账号', 'Members and accounts')}</h2></div>
              <form className="grid w-full gap-2 md:max-w-3xl md:grid-cols-[minmax(12rem,1fr)_10rem_10rem_auto]" onSubmit={submitSearch}>
                <label className="sr-only" htmlFor="access-search">{t('搜索账号', 'Search accounts')}</label>
                <input id="access-search" className={communityInputClass} value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t('显示名、用户名或完整用户 ID', 'Display name, username, or full user ID')} />
                <label className="sr-only" htmlFor="access-membership-filter">{t('会员状态', 'Membership status')}</label>
                <select id="access-membership-filter" className={communityInputClass} value={membershipFilter} onChange={(event) => setMembershipFilter(event.target.value)}>
                  <option value="all">{t('全部会员状态', 'All membership states')}</option>
                  <option value="active">{t('有效会员', 'Active')}</option>
                  <option value="suspended">{t('已暂停', 'Suspended')}</option>
                  <option value="none">{t('尚未入群', 'Not a member')}</option>
                </select>
                <label className="sr-only" htmlFor="access-role-filter">{t('角色', 'Role')}</label>
                <select id="access-role-filter" className={communityInputClass} value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} disabled={!roles.length}>
                  <option value="all">{t('全部角色', 'All roles')}</option>
                  {roles.filter((role) => role.is_active).map((role) => <option key={role.id} value={role.slug}>{roleLabel(role)}</option>)}
                </select>
                <button className={communityPrimaryButtonClass} type="submit"><Search className="size-4" aria-hidden="true" />{t('筛选', 'Filter')}</button>
              </form>
            </div>
            {(appliedSearch || membershipFilter !== 'all' || roleFilter !== 'all') ? (
              <button type="button" className="mt-3 text-xs font-semibold text-primary underline underline-offset-4" onClick={resetFilters}>{t('清除筛选', 'Clear filters')}</button>
            ) : null}

            {users.length ? (
              <>
                <div className="mt-5 hidden overflow-x-auto rounded-[1.4rem] border border-primary/10 lg:block">
                  <table className="w-full min-w-[70rem] border-collapse text-left text-sm">
                    <thead className="bg-primary/[0.055] text-xs uppercase tracking-[0.08em] text-primary/55"><tr><th className="px-4 py-3">{t('账号', 'Account')}</th><th className="px-4 py-3">{t('会员状态', 'Membership')}</th><th className="px-4 py-3">{t('有效角色', 'Active roles')}</th><th className="px-4 py-3">{t('权限操作', 'Access actions')}</th></tr></thead>
                    <tbody>
                      {users.map((targetUser) => (
                        <tr key={targetUser.user_id} className="border-t border-primary/10 align-top">
                          <td className="px-4 py-4"><p className="font-serif text-lg text-primary">{userName(targetUser)}</p><p className="mt-1 text-xs text-foreground/45">@{targetUser.username || t('未设置用户名', 'no username')} · {targetUser.user_id.slice(0, 8)}…</p><p className="mt-1 text-xs text-foreground/45">{t('注册于', 'Registered')} {formatDate(targetUser.registered_at)}</p></td>
                          <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${targetUser.membership_status === 'active' ? 'bg-primary/10 text-primary' : targetUser.membership_status === 'suspended' ? 'bg-destructive/8 text-destructive' : 'bg-secondary text-foreground/60'}`}>{status(targetUser.membership_status)}</span>{targetUser.suspension_reason ? <p className="mt-2 max-w-52 text-xs leading-5 text-destructive/75">{targetUser.suspension_reason}</p> : null}</td>
                          <td className="px-4 py-4"><div className="flex max-w-64 flex-wrap gap-2">{targetUser.roleAssignments.map((role) => <span key={role.roleId} className={`rounded-full px-2.5 py-1 text-xs ${RESERVED_ROLE_SLUGS.has(role.slug) ? 'bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))]' : 'bg-secondary'}`}>{roleLabels[role.slug]?.[lang] || role.name}{role.expiresAt ? ` · ${formatDate(role.expiresAt)}` : ''}</span>)}</div></td>
                          <td className="px-4 py-4"><div className="space-y-3">{renderRoleControls(targetUser)}{canManageMemberships && targetUser.membership_status === 'active' ? <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive disabled:opacity-50" disabled={busyKey !== null} onClick={() => openAction({ kind: 'suspend', user: targetUser })}><UserX className="size-3.5" aria-hidden="true" />{t('暂停会员', 'Suspend')}</button> : null}{canManageMemberships && targetUser.membership_status === 'suspended' ? <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary disabled:opacity-50" disabled={busyKey !== null} onClick={() => openAction({ kind: 'restore', user: targetUser })}><UserRoundCheck className="size-3.5" aria-hidden="true" />{t('恢复会员', 'Restore')}</button> : null}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 space-y-4 lg:hidden">
                  {users.map((targetUser) => (
                    <article key={targetUser.user_id} className="rounded-[1.4rem] border border-primary/10 bg-white/55 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-xl text-primary">{userName(targetUser)}</h3><p className="mt-1 text-xs text-foreground/45">@{targetUser.username || t('未设置用户名', 'no username')} · {targetUser.user_id.slice(0, 8)}…</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${targetUser.membership_status === 'active' ? 'bg-primary/10 text-primary' : targetUser.membership_status === 'suspended' ? 'bg-destructive/8 text-destructive' : 'bg-secondary'}`}>{status(targetUser.membership_status)}</span></div>
                      <div className="mt-4 flex flex-wrap gap-2">{targetUser.roleAssignments.map((role) => <span key={role.roleId} className={`rounded-full px-2.5 py-1 text-xs ${RESERVED_ROLE_SLUGS.has(role.slug) ? 'bg-[hsl(var(--community-orange)/0.12)] text-[hsl(var(--community-orange))]' : 'bg-secondary'}`}>{roleLabels[role.slug]?.[lang] || role.name}</span>)}</div>
                      <div className="mt-4 border-t border-primary/10 pt-4">{renderRoleControls(targetUser)}<div className="mt-3">{canManageMemberships && targetUser.membership_status === 'active' ? <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive" disabled={busyKey !== null} onClick={() => openAction({ kind: 'suspend', user: targetUser })}><UserX className="size-3.5" aria-hidden="true" />{t('暂停会员', 'Suspend membership')}</button> : null}{canManageMemberships && targetUser.membership_status === 'suspended' ? <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary" disabled={busyKey !== null} onClick={() => openAction({ kind: 'restore', user: targetUser })}><UserRoundCheck className="size-3.5" aria-hidden="true" />{t('恢复会员', 'Restore membership')}</button> : null}</div></div>
                    </article>
                  ))}
                </div>

                {hasMore ? <div className="mt-5 text-center"><button type="button" className={communitySecondaryButtonClass} disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? t('正在加载…', 'Loading…') : t('加载更多', 'Load more')}</button></div> : null}
              </>
            ) : <div className="mt-5"><CommunityEmptyState title={t('没有找到匹配账号。', 'No matching accounts.')} description={t('尝试清除筛选或使用完整用户名。', 'Clear filters or try a full username.')} /></div>}
          </section>

          {context.is_super_admin && adminRole ? (
            <section aria-labelledby="admin-permissions-title" className="rounded-[1.5rem] border border-[hsl(var(--community-orange)/0.22)] bg-[hsl(var(--community-orange)/0.055)] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--community-orange)/0.13)] text-[hsl(var(--community-orange))]"><ShieldCheck className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--community-orange))]">Super admin</p><h2 id="admin-permissions-title" className="font-serif text-2xl text-primary">{t('管理员权限集', 'Administrator permission set')}</h2></div></div><button type="button" className={communityPrimaryButtonClass} disabled={busyKey !== null} onClick={() => openAction({ kind: 'save-permissions', role: adminRole })}><Save className="size-4" aria-hidden="true" />{t('保存权限', 'Save permissions')}</button></div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-foreground/60">{t('此处修改的是所有管理员共享的系统角色。管理员不能自行修改，也不能授权新的管理员。', 'This changes the system role shared by every administrator. Administrators cannot edit it or appoint new administrators.')}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {permissionGroups.map(([group, groupPermissions]) => (
                  <details key={group} className="rounded-2xl border border-primary/10 bg-white/55 p-4" open={['users', 'memberships', 'roles', 'role_assignments'].includes(group)}>
                    <summary className="cursor-pointer text-sm font-semibold text-primary">{group} · {groupPermissions.filter((permission) => adminPermissionDraft.includes(permission.key)).length}/{groupPermissions.length}</summary>
                    <div className="mt-3 space-y-2">
                      {groupPermissions.map((permission) => (
                        <label key={permission.key} className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-primary/[0.04]">
                          <input type="checkbox" className="mt-0.5 size-4 accent-[hsl(var(--community-orange))]" checked={adminPermissionDraft.includes(permission.key)} onChange={(event) => setAdminPermissionDraft((current) => event.target.checked ? [...new Set([...current, permission.key])].sort() : current.filter((key) => key !== permission.key))} />
                          <span><span className="font-mono text-xs text-primary">{permission.key}</span>{permission.isSensitive ? <span className="ml-2 rounded-full bg-destructive/8 px-2 py-0.5 text-[0.65rem] font-semibold text-destructive">{t('敏感', 'Sensitive')}</span> : null}<span className="mt-1 block text-xs leading-5 text-foreground/50">{permission.description || t('暂无说明', 'No description')}</span></span>
                        </label>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {canReadAudit ? (
            <section aria-labelledby="access-audit-title">
              <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><History className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Audit</p><h2 id="access-audit-title" className="font-serif text-2xl text-primary">{t('最近授权记录', 'Recent access history')}</h2></div></div>
              <div className="mt-5 space-y-2">
                {auditEntries.slice(0, 12).map((entry) => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-white/45 px-4 py-3 text-sm"><div><p className="font-semibold text-primary">{entry.action}</p><p className="mt-1 text-xs text-foreground/45">{entry.entity_type} · {entry.entity_id || '—'}</p></div><time className="text-xs text-foreground/45" dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time></article>)}
                {!auditEntries.length ? <CommunityEmptyState title={t('暂无授权记录。', 'No access history yet.')} /> : null}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => { if (!open && !busyKey) { setPendingAction(null); setActionError(null); setSuspensionReason(''); } }}>
        <AlertDialogContent className="rounded-[1.6rem] border-[hsl(var(--community-forest)/0.14)] bg-[hsl(var(--community-paper))] p-6 sm:p-7">
          <AlertDialogHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--community-orange))]">Authorization</p>
            <AlertDialogTitle className="font-serif text-2xl text-primary">{actionTitle}</AlertDialogTitle>
            <AlertDialogDescription className="leading-6 text-foreground/60">{actionDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {pendingAction?.kind === 'suspend' ? <label className="mt-3 block space-y-2 text-sm font-semibold"><span>{t('暂停原因 *', 'Suspension reason *')}</span><textarea className={communityTextareaClass} value={suspensionReason} onChange={(event) => setSuspensionReason(event.target.value)} placeholder={t('说明原因；成员会收到这一说明。', 'Explain why. The member will receive this note.')} disabled={Boolean(busyKey)} /></label> : null}
          {pendingAction && (pendingAction.kind === 'assign-role' || pendingAction.kind === 'revoke-role') ? <p className="mt-3 rounded-xl bg-primary/[0.055] px-4 py-3 text-sm text-primary">{pendingAction.kind === 'assign-role' ? t('将授予：', 'Grant: ') : t('将撤销：', 'Revoke: ')}{roleLabel(pendingAction.role)}</p> : null}
          {actionError ? <p className="mt-3 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive" role="alert">{actionError}</p> : null}
          <AlertDialogFooter className="mt-3">
            <AlertDialogCancel disabled={Boolean(busyKey)} className="rounded-full border-primary/15 bg-transparent">{t('取消', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction className={pendingAction?.kind === 'suspend' || pendingAction?.kind === 'revoke-role' ? 'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'rounded-full bg-primary text-primary-foreground hover:bg-primary/90'} disabled={Boolean(busyKey)} onClick={(event) => { event.preventDefault(); void runPendingAction(); }}>
              {busyKey ? t('正在处理…', 'Working…') : pendingAction?.kind === 'save-permissions' ? t('确认保存', 'Confirm save') : t('确认操作', 'Confirm action')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CommunitySurface>
  );
}
