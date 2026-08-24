# Community Membership Authorization System Design

Date: 2026-08-24
Status: Approved

## Goal

Complete the Community membership authorization system with a strict authority hierarchy:

- only super administrators may grant or revoke administrator and super-administrator roles;
- administrators may manage members and assign ordinary operational roles within their own authority;
- super administrators may configure administrator permissions;
- every privileged action is enforced and audited in PostgreSQL, independently of frontend visibility.

Implementation must be completed and verified backend-first, then exposed through the Community frontend.

## Chosen Approach

Add a dedicated authorization read layer and a single Community access-management workspace while reusing the existing RBAC mutation, membership, and audit infrastructure.

This is preferred over reading RBAC tables directly in the UI because it provides stable, permission-checked projections. A full per-user policy engine is intentionally excluded because the existing role model already covers the requirement.

## Authorization Hierarchy

### Super administrator

- Grant and revoke `admin`.
- Grant and revoke `super_admin`, subject to the existing last-super-admin invariant.
- Configure permissions on system roles, including `admin`.
- Perform all membership and ordinary role-management actions.
- Read relevant authorization audit events.

### Administrator

- Read the account/member administration roster.
- Suspend and restore eligible Community memberships.
- Assign or revoke ordinary operational roles only when those roles do not exceed the administrator's own effective permissions.
- Review applications and manage other existing operational surfaces according to granular permissions.
- Cannot grant or revoke `admin` or `super_admin`.
- Cannot modify system-role permission sets.

### Member or unprivileged account

- Cannot read the authorization roster or role matrices.
- Cannot assign or revoke roles, suspend memberships, or access audit information.

## Backend Architecture

Create a Supabase migration using the repository CLI workflow. The migration will:

1. Harden the private role assignment and revocation implementations so both `admin` and `super_admin` are reserved for current super administrators.
2. Preserve the existing checks for valid users, active roles, expiry, no privilege amplification, and the final active super administrator.
3. Add a permission-checked current-user authorization-context RPC that returns effective role slugs and an explicit `is_super_admin` flag.
4. Add a permission-checked, paginated account/member roster RPC that returns only safe management fields: profile identity, account status, membership status/dates, and active role assignments with expiry metadata.
5. Add an aggregated role-catalog RPC for role and permission management without requiring the frontend to assemble raw tables.
6. Reuse existing `assign_user_role`, `revoke_user_role`, `set_role_permissions`, `suspend_community_membership`, `restore_community_membership`, and audit-log infrastructure.
7. Keep privilege-bearing implementations in the private schema with explicit `auth.uid()` and permission checks. Public functions remain `SECURITY INVOKER` wrappers with explicit grants and revocations.

No Supabase secret, service-role key, mutable user metadata, or direct browser access to `auth.users` will be introduced.

## Frontend Architecture

After backend verification, add `/community/admin/access` as the single authorization workspace.

The page will include:

- an overview of registered accounts, active/suspended memberships, administrators, and expiring role assignments;
- searchable/filterable account and membership management;
- per-user membership suspension and restoration;
- ordinary operational role assignment controls for authorized administrators;
- a super-admin-only administrator-governance area for granting/revoking administrators;
- a super-admin-only permission matrix for the administrator role;
- recent authorization audit events when `audit.read` is available.

The desktop layout will use a compact management table; narrow screens will use stacked member cards. Existing Community surfaces, inputs, buttons, bilingual copy, notices, loading states, and per-row busy-state patterns will be reused.

Frontend route guards and hidden controls are usability measures only. Database RPC checks remain the security boundary.

## Data Flow

1. The page loads the caller authorization context, roster, and role catalog in parallel.
2. The interface derives available controls from the returned context and effective permissions.
3. A mutation calls the existing protected RPC for exactly one action.
4. PostgreSQL revalidates the caller, target role, membership state, privilege hierarchy, and last-super-admin invariant in the transaction.
5. Existing audit infrastructure records the mutation.
6. The client reloads the affected roster/role state and refreshes current-user Community permissions if the caller changed their own assignment.

## Error Handling

- Require explicit confirmation for administrator revocation, membership suspension, and permission replacement.
- Use per-row or per-role pending state to prevent duplicate actions.
- Map stable database errors such as `SUPER_ADMIN_REQUIRED`, `LAST_SUPER_ADMIN_REQUIRED`, `PERMISSION_DENIED`, membership-state conflicts, and invalid expiry into bilingual user messages.
- Treat stale UI as expected: the database rejects conflicting operations, and the page refreshes authoritative state.
- Never optimistically display a successful privilege change before the RPC succeeds.

## Verification

### Database

- Ordinary administrator cannot grant or revoke `admin`.
- Ordinary administrator cannot grant or revoke `super_admin`.
- Super administrator can grant and revoke `admin`.
- Super administrator can manage the administrator permission set.
- The final active super administrator cannot be removed or expired.
- Privilege-amplification and expired-role checks remain enforced.
- Unprivileged users cannot read authorization projections.
- Membership suspension/restoration still removes/restores member access correctly.
- Privileged changes create audit records.

### Frontend

- Navigation and route access follow effective permissions.
- Ordinary administrators never receive administrator-governance controls.
- Super administrators can complete administrator and permission-management flows.
- Search, filters, empty states, confirmations, pending states, success notices, and error states work.
- Desktop and mobile layouts have no overflow or inaccessible controls.

### Project checks

- Focused database and Vitest suites.
- Backend/API and application TypeScript checks.
- ESLint and production build.
- Browser verification for administrator and super-administrator views at desktop and mobile widths.

## Out of Scope

- Per-user permission overrides.
- Replacing RBAC with attribute-based authorization.
- External identity-provider administration.
- Browser use of Supabase Admin APIs or secret keys.
- Deleting users or permanently deleting membership history.
