# RganJunior Production Deploy Hook Design

Date: 2026-08-10
Status: Approved

## Context

RganJunior is maintained by two GitHub collaborators while the Vercel project remains on a Hobby account owned by one person. Pull requests should preserve the real commit author, but production deployment must not depend on whether that author has access to the Vercel project.

The GitHub repository is public, `main` is the production branch, and the existing `CI` workflow validates pushes to `main` and pull requests targeting `main`.

## Decision

Use a Vercel Deploy Hook scoped to the `main` branch as the production deployment credential.

```text
feature branch -> pull request -> CI + Vercel Preview
                                      |
                                      v
                               reviewed merge
                                      |
                                      v
                                 CI on main
                                      |
                                      v
                           Vercel main Deploy Hook
                                      |
                                      v
                               rganjunior.org
```

- Pull-request Preview deployments remain enabled through the Vercel Git integration.
- Automatic Git deployment is disabled only for `main` to prevent a duplicate production build.
- A GitHub Actions workflow waits for the existing `CI` workflow to succeed on a `main` push, then calls the Deploy Hook.
- A manual dispatch is available only to `RuikangWNemo` for recovery or an intentional rebuild.
- The deployment keeps the original Git commit and author; no duplicate or impersonated commit is created.

## Secret Boundary

The Deploy Hook URL is stored only as the repository Actions secret `VERCEL_DEPLOY_HOOK_PRODUCTION`.

- It must not be committed, printed, copied into an Issue, or included in workflow output.
- The workflow passes it through an environment variable and discards the HTTP response body.
- If the URL is exposed, revoke the hook in Vercel, create a replacement, and update the GitHub secret.

## Failure Behaviour

- Failed or cancelled CI does not trigger production deployment.
- Pull-request CI never triggers the production hook.
- A failed Hook request fails the GitHub Actions job and can be rerun after investigation.
- A Vercel build failure remains visible in Vercel and through the GitHub deployment status.
- The workflow uses a single production concurrency group so two production triggers do not run simultaneously.

## Rollout

1. Create one Vercel Deploy Hook named `GitHub main production` for `main`.
2. Store the generated URL as `VERCEL_DEPLOY_HOOK_PRODUCTION` in GitHub Actions Secrets.
3. Add `.github/workflows/deploy-production.yml`.
4. Set `git.deploymentEnabled.main` to `false` in `vercel.json` while leaving other branches enabled.
5. Validate YAML, JSON, CI, and the Vercel Preview for the configuration PR.
6. After the configuration reaches `main`, the next successful `CI` run activates the production workflow.

The Hook is not manually triggered during setup because doing so would redeploy the current, older `main` before the release pull request is merged.
