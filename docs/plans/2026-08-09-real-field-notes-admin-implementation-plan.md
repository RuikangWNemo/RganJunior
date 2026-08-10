# Real Field Notes and Editorial Workflow Implementation Plan

1. Replace the mixed local/live public repository with a Supabase-only repository and derive people/topics from returned real articles.
2. Update Field Notes pages and tests for loading, failure, featured-empty, archive-empty, and real database records.
3. Add editorial service queries and mutations for the review queue, valid status transitions, preview records, and featured state.
4. Build a permission-guarded community editorial desk, route, navigation entry, preview surface, and focused component tests.
5. Harden Field Note media upload validation, cleanup, ownership checks, and durable URL handling.
6. Enable BlockNote uploads for every writable article collaborator and expose actionable upload errors.
7. Add or amend Supabase policies/functions needed for persistent public inline media without weakening draft privacy; update generated types only if the schema changes.
8. Run focused tests, typechecks, lint on changed files, production build, and browser verification. Fix only failures caused by this work and document unrelated pre-existing failures.
