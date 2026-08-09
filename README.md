# R'gan Junior Website

A bilingual Vite + React website for `阿柑少年 / R'gan Junior`, backed by Supabase Auth, PostgreSQL, and Storage.

## Runtime

Use Node.js 22 or newer. Supabase JS 2.110+ no longer supports Node.js 20.

```bash
nvm use
npm install
```

## Development

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

The Vite development server also mounts the Community editor JSON endpoints and
starts the local Hocuspocus WebSocket server on port `1234`. The collaborative
editor requires `SUPABASE_SECRET_KEY` in `.env.local`; this key is server-only
and must never use a `VITE_` prefix.

Copy `.env.example` to `.env.local`. Browser code may only receive the Supabase URL and publishable key:

```bash
VITE_SUPABASE_URL=https://sronjswselrxewaqfcar.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Vercel Functions use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` with the caller's JWT. The collaborative editor additionally requires `SUPABASE_SECRET_KEY` for its server-only authorization, persistence, comments, and revision RPCs; it must never use a `VITE_` prefix.

## Build

```bash
npm run build
```

## Supabase project

- Project name: `rganjunior`
- Project ref: `sronjswselrxewaqfcar`
- Region: `ap-southeast-1` (Singapore)

This repository uses the hosted Supabase project only. Do not start or reset a local Supabase database for this project.

### Hosted Auth URLs

The hosted project's Authentication → URL Configuration must use:

```text
Site URL
https://www.rganjunior.org

Redirect URLs
https://www.rganjunior.org/community/auth/callback
https://www.rganjunior.org/community/reset-password
```

Localhost URLs may remain in the redirect allow list for development, but the hosted Site URL must never point to localhost. `supabase/config.toml` configures the local CLI environment and does not replace the hosted project's Dashboard settings.

### Link the CLI

```bash
supabase login
supabase link --project-ref sronjswselrxewaqfcar
supabase migration list --linked
```

Never commit the database password, access token, secret key, or generated signing keys.

### Migrations and Seed

All schema changes belong in `supabase/migrations/`. Create a migration with the CLI before editing it:

```bash
supabase migration new descriptive_name
supabase db push --dry-run
supabase db push --include-seed
```

`supabase/seed.sql` is idempotent and provides:

- `member`, `contributor`, `editor`, `admin`, and `super_admin` system roles;
- 26 fixed permission keys and default role mappings;
- initial identity labels and Field Notes topics.

Do not edit the production schema only through the Dashboard. Every schema change must have a matching migration.

### Remote database tests

The authorization suite runs in a transaction and rolls back all test users and content:

```bash
npm run supabase:test:remote
```

It covers registration triggers, public/private RLS, profile isolation, role escalation, Field Notes workflow, `created_by` spoofing, private Storage access, custom roles, audit logs, the last-super-admin rule, and the private growth timeline.

### Generate TypeScript types

After every schema change:

```bash
npm run supabase:types
npm run typecheck
```

`npm run typecheck` validates the generated database types, backend services, and Vercel helpers. `npm run typecheck:app` additionally checks the complete existing frontend.

Generated types are committed at `src/lib/supabase/database.types.ts`.

## Authorization model

The four concepts remain separate:

- Supabase `auth.users` answers whether an account can sign in.
- `people` represents real people, including people without accounts.
- Identity labels describe a person's relationship with R'gan Junior.
- Roles and permissions determine what an authenticated account can do.

RLS is enabled on every exposed table. `private.has_permission()` resolves authorization through `user_roles -> roles -> role_permissions -> permissions`. Public RPCs are `SECURITY INVOKER` wrappers; privilege-bearing implementations live in the unexposed `private` schema and repeat the permission checks.

Field Notes follow this workflow:

```text
draft -> submitted -> in_review -> changes_requested -> submitted
      -> in_review -> approved -> published -> archived
```

Database triggers reject invalid transitions, direct publishing, ownership spoofing, and edits to protected system fields.

## People and private growth records

- `people.nature_name` stores an optional, non-unique nature-education name independently from account usernames, display names, and private legal names.
- `profiles.registered_at` records the Auth account creation time and is immutable.
- Growth observations live in the unexposed `private` schema. Each record stores its real observation time, IANA timezone, note, author, system timestamps, archive state, and zero or more ordered photos.
- Only accounts with `impact.read` can list growth records. Creating, editing, archiving, uploading, attaching, or removing photos requires `impact.manage`.
- Growth photos use the private `private-impact` bucket and the path `{auth.uid}/{person_id}/{filename}`. Browser access uses short-lived signed URLs rather than public object URLs.

The typed client operations are in `src/services/growth/index.ts`. Storage uploads and deletions go through the Supabase Storage API; SQL stores only application metadata and growth-record associations.

## Create the first Super Admin

1. Register the first account through Supabase Auth.
2. In the Supabase SQL Editor, verify the target account by email.
3. Run the bootstrap function as the database owner:

```sql
select private.bootstrap_super_admin(
  (select id from auth.users where email = 'owner@example.com')
);
```

The function only succeeds while there is no active Super Admin. After bootstrap, role assignment must use the guarded `assign_user_role` RPC. The database prevents removal or expiry of the final active Super Admin.

## Backend code layout

```text
supabase/migrations/        Versioned database schema and policies
supabase/tests/database/    Transactional authorization tests
supabase/seed.sql           Idempotent system data
src/lib/supabase/           Typed browser client and generated schema types
src/services/               Auth, people, permissions, content, growth, media, and subscriptions
api/_lib/                   JWT and permission helpers for Vercel Functions
```

## Branding

- Shared brand copy and page titles live in `src/lib/brand.ts`
- Route and language-driven document metadata is managed by `src/components/BrandHead.tsx`
