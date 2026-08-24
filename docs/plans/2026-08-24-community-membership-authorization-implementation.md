# Community Membership Authorization Implementation Plan

> Approved design: `docs/plans/2026-08-24-community-membership-authorization-design.md`

## Phase 1: Backend contract and migration

Files:

- `supabase/migrations/<generated>_community_access_management.sql`
- `supabase/tests/database/015_community_access_management.sql`

Tasks:

1. Create the migration with `supabase migration new community_access_management`.
2. Replace the private `assign_user_role` and `revoke_user_role` implementations so `admin` and `super_admin` assignments require a current super administrator.
3. Keep public wrappers as `SECURITY INVOKER`; keep privileged implementations in `private` with empty search paths, schema-qualified references, explicit caller checks, and explicit grants/revocations.
4. Add `get_my_authorization_context()` returning the caller's active role slugs and `is_super_admin` state.
5. Add cursor-paginated `list_community_access_users(...)` returning safe profile, membership, and active-role data without email or `auth.users` exposure.
6. Add `list_community_access_roles()` returning active role definitions and aggregated permission metadata.
7. Add comments and audit-compatible behavior without introducing new exposed tables.
8. Add pgTAP regression coverage for privilege hierarchy, read boundaries, projections, super-admin actions, and audit events.

Verification gate before frontend:

- migration SQL reviewed for grants, wrapper/implementation security, and search paths;
- focused database test passes against the linked project in a rollback transaction;
- migration applied to the linked Supabase project with local/remote history aligned;
- security and performance advisors reviewed;
- authoritative remote smoke queries confirm the new function signatures and hierarchy.

## Phase 2: Generated types and client services

Files:

- `src/lib/supabase/database.types.ts`
- `src/services/permissions/index.ts`
- `src/services/memberships/index.ts`
- `src/services/permissions/index.test.ts` or a focused access-service test

Tasks:

1. Regenerate project TypeScript types from the migrated Supabase project.
2. Add typed authorization-context, account-roster, and role-catalog readers.
3. Add typed membership suspend/restore wrappers.
4. Preserve existing role assignment, revocation, and permission-replacement wrappers.
5. Add focused service tests for RPC names, argument mapping, and stable error codes.

## Phase 3: Community frontend

Files:

- `src/pages/community/CommunityAdminAccess.tsx`
- `src/pages/community/CommunityAdminAccess.test.tsx`
- `src/pages/community/CommunityRoutes.tsx`
- `src/components/community/CommunityShell.tsx`
- `src/components/community/CommunityShell.test.tsx`
- `src/lib/communityUi.ts`
- shared Community styles only if existing utilities are insufficient

Tasks:

1. Load the narrow UI skill selected for this React administration surface.
2. Add `/community/admin/access` behind appropriate permission guards.
3. Add a permission-aware administration navigation entry.
4. Build summary metrics, search/filter controls, cursor pagination, desktop table, and mobile cards.
5. Add membership suspension/restoration with reason capture and confirmation.
6. Add ordinary operational-role controls limited by backend-authorized role data.
7. Add super-admin-only administrator grant/revoke and administrator permission matrix.
8. Add recent authorization audit output when available.
9. Add bilingual copy, accessible labels, destructive confirmations, per-row pending states, notices, errors, empty states, and retries.

## Phase 4: Full verification

1. Run focused database and frontend tests.
2. Run backend/API and app TypeScript checks.
3. Run ESLint and the production build.
4. Start the local app and run desktop/mobile browser verification for navigation, roster rendering, super-admin controls, confirmations, overflow, console errors, and route guards.
5. Review the final diff for unrelated changes and security regressions.
6. Update `task_plan.md`, `findings.md`, and `progress.md` with exact results.

## Rollback and safety

- The migration only replaces functions and adds read RPCs; it does not delete user, membership, role, permission, or audit data.
- If the remote migration fails, stop before frontend work, record the exact error, and repair through a new reviewed migration rather than mutating migration history.
- All production verification writes use transaction rollback or isolated test UUIDs.
