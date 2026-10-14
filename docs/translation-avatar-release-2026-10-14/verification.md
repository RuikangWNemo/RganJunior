# English corrections and Field Notes portraits — 2026-10-14

Based on production 0ae0b4c / dpl_NVzonfJkCY6KNWhyXfF2NVuJzNNV. This task is the sole publisher; both related tasks confirmed no competing deployment.

Restored the local refinement translation handoff: all 457 paired English corrections are present, including the accepted homepage sentence, Life Immersion Camp, Mykunda, Rosie Chen, Tianshi Zhang, Founder/Co-creator and dynamic category/role translations. Included ordinary English constants, image descriptions, and email copy; regenerated email runtime locally. Existing seven complete bilingual article bodies, featured reader, article-author management, guardian roster and responsive layout remain on the production baseline. Unrelated local Impact and Join page restructuring is excluded; Chinese navigation remains unchanged.

Field Notes previously hardcoded every author to the mascot. Added a public-author-slug portrait mapping for Rosie, Ruby, Tianshi, Nate and Orange. First four reuse About assets. Orange uses the photograph supplied and identified by the user on 2026-10-14. Source is retained unchanged; the page uses a fixed square object-cover circle. Supabase was queried read-only for published author slugs; no database, profile or authorization changes.

Validation: 325 tests passed in the initial full suite; two navigation failures were corrected by preserving production Chinese labels and all 22 tests in those files passed on rerun. Field Notes and repository tests passed again after avatar sizing. Five-author mapping coverage includes Orange. Application/backend/API type checks passed. Changed-file ESLint: zero errors, two existing Fast Refresh warnings. Local Node 24 Vercel production prebuild passed. Browser verified English home sentence/aria-label, Life Immersion Camp, seven public articles, author images; 390px home layout has no horizontal overflow. Asset/build warnings about large bundles remain.

Publishing uses only locally verified prebuilt artifacts. No git push, GitHub build, ECS access, or production database write.
