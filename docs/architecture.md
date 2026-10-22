# Architecture

This document describes how Starloop is put together, where the trust boundaries are, and what happens when a request succeeds or fails. It is written for maintainers, reviewers, and operators.

## Runtime shape

```text
Browser
  │  HTTPS, CSP, HttpOnly session cookie, CSRF token
  ▼
Next.js on Vercel (or any Node host)
  ├── React Server Components for pages
  ├── Route handlers for /api/*
  ├── src/proxy.ts: CSP nonce + CSRF cookie
  └── server-only modules: auth, Drizzle, GitHub client, exchange engine
        │
        ├── PostgreSQL (Neon pooled host in production)
        │     users, sessions, connections, repositories,
        │     exchange_stars, credit_ledger, activities,
        │     reports, rate_limits, app_meta
        │
        └── GitHub REST API
              /user, /user/emails, /user/repos,
              PUT/DELETE /user/starred/{owner}/{repo},
              GET /user/starred/{owner}/{repo}
```

There is no separate backend service, queue worker, or cache tier. All mutations are synchronous request handlers. Verification has both an authenticated on-demand endpoint and a cron endpoint.

## Rendering and route groups

| Group                 | Purpose                                                        | Access                                 |
| --------------------- | -------------------------------------------------------------- | -------------------------------------- |
| `src/app/(marketing)` | Landing page, Trust Center, terms, privacy, acceptable use     | Public                                 |
| `src/app/(auth)`      | `/connect`, `/welcome`                                         | Public/pre-onboarding                  |
| `src/app/(app)`       | Dashboard, discover, repositories, credits, activity, settings | Authenticated; policy required         |
| `src/app/api`         | JSON API                                                       | Mixed; each route checks auth and CSRF |

The marketing layout calls `getSession()` to swap “Sign in” for “Open workspace.” The authenticated layout calls `requireUser()` and builds attention items for the sidebar. Pages are server components by default; interactive pieces are small client components.

`export const dynamic = "force-dynamic"` is used on database-backed pages so they are not prerendered with stale data. Legal pages inherit the marketing layout's session read, which also makes them dynamic; that is acceptable for this app.

## Authentication

### GitHub OAuth

1. `GET /api/auth/github` generates a PKCE verifier and state, stores a signed, short-lived `sl_oauth` cookie, and redirects to GitHub.
2. GitHub redirects to `/api/auth/github/callback` with a code and state.
3. The callback verifies the signed cookie, state, and PKCE verifier, then exchanges the code for a token.
4. The token is validated against `/user`; the primary email may be fetched from `/user/emails` (or `/user` if available).
5. `upsertUserFromGitHub` creates or updates the user.
6. `saveConnection` encrypts and upserts the token.
7. `createSession` stores a hash of the random session ID and sets the signed session cookie.
8. The user is redirected to `/welcome` if the policy is not accepted, otherwise to the sanitized `next` destination.

OAuth tokens are refreshed when they are close to expiry and a refresh token exists. If refresh fails, the connection is marked `needs_reauth`.

### Personal access tokens

1. The user pastes a classic, fine-grained, or OAuth token into `/connect`.
2. The server validates the shape, calls GitHub with the token, and records the token kind and scopes.
3. If an existing session belongs to a different GitHub account, the request is rejected; replacing a credential must keep the same account.
4. The token is encrypted before storage. The browser never sees it again.

Fine-grained PATs need `Starring: Read and write` and `Metadata: Read`. Classic PATs need `public_repo` (and `read:user` for profile data). The UI explains this before submission.

### Sessions

Sessions are database rows with a SHA-256 hash of the random ID, expiry, last-seen time, IP hash, and user-agent. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. `getSession()` is wrapped in React `cache()` so a layout and page do not query the session repeatedly in one render. Suspended users are returned from `getSession()` but rejected by `requireUser()` and `requireApiUser()`.

## Authorization model

- A user can only read and mutate their own repositories, connection, sessions, reports, ledger, and export.
- `requireApiUser()` rejects unauthenticated requests and suspended accounts.
- Repository binding verifies GitHub ownership, public status, fork/archive status, description length, repository age, and recent activity.
- Star actions reject self-stars, inactive repositories, private/archived/forked repositories, owners who paused promotion, owners with zero credits, duplicate stars, daily outgoing limits, and per-repository incoming limits.
- The exchange transaction re-checks owner credits under a row lock, so two concurrent givers cannot spend the same last credit.
- A partial unique index allows only one active repository per user.
- Deactivating a repository does not remove credits or given stars.

## The star transaction

```text
POST /api/exchange/star
  ├── guardMutation: origin + CSRF
  ├── rateLimit(user)
  ├── requireApiUser
  ├── validate repositoryId
  ├── load repository + owner + existing stars + daily counts
  ├── evaluateStarEligibility (pure guardrails)
  ├── decrypt giver token
  ├── PUT /user/starred/{owner}/{repo}
  │     ├── 401 → mark needs_reauth, return 401
  │     ├── 403 → permissions guidance, return 403
  │     └── 429 → rate-limit message, return 429
  └── database transaction
        ├── SELECT ... FOR UPDATE on giver and owner
        ├── re-check owner credits
        ├── insert exchange_stars (confirmed, 1 credit)
        ├── giver.credits += 1, stars_given += 1
        ├── owner.credits -= 1, stars_received += 1
        ├── insert credit_ledger (giver +1, owner -1)
        ├── insert activities (both sides)
        └── repository.stars += 1
```

If the GitHub call succeeds but the database transaction fails, the star exists on GitHub without a credit. This is an unavoidable dual-write failure mode without an outbox/compensation job. The next verification run will not see a credit row to reverse, and the user can re-attempt the star; the GitHub call is idempotent. A production system with strict accounting should add an outbox or reconciliation job that inspects recent GitHub stars against `exchange_stars`.

If the GitHub call succeeds and the user closes the browser before the response, the credit is still recorded because the transaction runs server-side. The UI should treat a network error as “check your balance/activity” rather than “nothing happened.”

## Verification and reversal

`verifyGivenStars(userId, limit)`:

1. Selects confirmed stars for the user that have never been checked or were last checked more than 24 hours ago.
2. For each candidate, calls `GET /user/starred/{owner}/{repo}` with the giver's token.
3. If the star is present, updates `lastCheckedAt`.
4. If the star is gone, calls `reverseStar()`:
   - locks the star row and both user rows;
   - marks the star `revoked`;
   - decrements the giver's credits (clamped at zero);
   - increments the owner's credits;
   - writes ledger entries `star_reversed` / `star_refunded`;
   - writes activities for both sides.
5. Stops early on `401` or `429` and marks `needs_reauth` on `401`.

The authenticated `/api/exchange/verify` route lets a user verify their own stars. `/api/cron/verify` processes up to 12 users with up to 10 candidates each, selected from active non-demo users with a connection that does not need reauthentication. It is protected by `CRON_SECRET`.

Demo users use `skipGitHub` and are excluded from cron verification.

## Queue

`getQueue()` builds a CTE with `DISTINCT ON (r.user_id)` to ensure at most one active repository per owner, then filters for active/eligible repositories with credits and remaining inbound capacity. It uses a parameterized query through `client.unsafe` with only enumerated sort modes:

- `balanced` (default): deterministic pseudo-random order seeded by UTC day, offset, language, and search;
- `newest`: bound time descending;
- `top`: repository star count descending;
- `credits`: owner credits descending.

Search uses `ILIKE` over full name and description; language is an exact match. Pagination is capped at 30 items. The count query mirrors the eligible set. The order is stable within a day for the same filters, which avoids a queue that reshuffles on every request.

## Data model

| Table            | Key relationships                 | Notes                                                                |
| ---------------- | --------------------------------- | -------------------------------------------------------------------- |
| `users`          | —                                 | One row per GitHub identity; credits, counters, policy state, status |
| `sessions`       | `user_id → users`                 | Stores only the SHA-256 hash of the session ID                       |
| `connections`    | `user_id → users`, unique         | Encrypted token, kind, scopes, expiry, reauth flag                   |
| `repositories`   | `user_id → users`                 | One active per user via partial unique index; public metadata        |
| `exchange_stars` | giver, repository, owner          | Unique `(giver_id, repository_id)`; status confirmed/revoked         |
| `credit_ledger`  | `user_id → users`                 | Append-only representation of balance changes                        |
| `activities`     | `user_id → users`, optional actor | User-facing audit trail                                              |
| `reports`        | reporter, repository              | Moderation queue                                                     |
| `rate_limits`    | —                                 | Composite key `(key, window_start)`; short-lived counters            |
| `app_meta`       | —                                 | Reserved for application metadata                                    |

Timestamps are epoch milliseconds in `BIGINT` columns. Booleans are real PostgreSQL booleans. Drizzle types are inferred from `src/lib/db/schema.ts`.

## Database bootstrap and migrations

`ensureDatabase()` runs idempotent `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` statements on request. This makes a fresh Neon branch or local PGlite usable immediately. It is not a substitute for a migration pipeline:

- schema changes to existing tables need explicit `ALTER TABLE` statements or a generated migration;
- destructive changes need a reviewed backfill;
- production deploys should generate versioned SQL with `pnpm db:generate` and apply it before the app serves traffic;
- the bootstrap SQL and the Drizzle schema must stay in sync.

## Security boundaries

| Boundary                   | Control                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Browser → server           | HTTPS, CSP nonce, HSTS, `HttpOnly` session cookie, CSRF double-submit, origin check |
| Server → database          | Parameterized queries, least-privilege DB user, pooled connection, SSL              |
| Server → GitHub            | Per-user token, least-privilege scopes, no token in logs or responses               |
| Server → cron              | Constant-time `CRON_SECRET` comparison                                              |
| User → another user's data | Session-derived user ID; no client-supplied actor ID; ownership checks              |
| Token at rest              | AES-256-GCM with a key outside the database                                         |
| Export/delete              | Authenticated self-service only; cascade deletes                                    |

### CSP note

`src/proxy.ts` generates a nonce per request and sets a CSP header. Next.js needs the nonce for its framework scripts. If the app is deployed behind a proxy that strips or rewrites the CSP header, hydration may fail. Verify the browser console after deploy. Do not add `unsafe-inline` to `script-src` to work around a misconfiguration; fix the header path instead.

## Failure modes

| Failure                        | Behavior                                                    | Operator action                                              |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| Database unavailable           | Pages/API return an error; `/api/health` returns 503        | Check Neon/host status, connection limits, restore if needed |
| GitHub token revoked           | Connection marked `needs_reauth`; star action returns 401   | User reconnects; no automatic retry                          |
| GitHub rate limit              | Action returns 429 with a message; verification stops early | Wait; consider a GitHub App or higher limits if scaling      |
| GitHub star succeeds, DB fails | Possible orphan star without credit                         | Reconciliation job; user can retry idempotently              |
| Cron secret missing            | `/api/cron/verify` returns 503                              | Set `CRON_SECRET`                                            |
| Cron secret wrong              | 401, no work done                                           | Fix scheduler header                                         |
| Duplicate star race            | Unique index returns 409; no double credit                  | Safe to retry after reading the message                      |
| Lost encryption key            | All stored tokens undecryptable                             | Rotate and require reconnection (see SECURITY.md)            |
| Demo mode left on              | Simulated actions possible in production                    | Set `DEMO_MODE=false`, `SEED_DEMO_DATA=false`, redeploy      |

## Scaling notes

The current design is intentionally simple. Before scaling:

- Add indexes for the actual queue filters and verification workload; inspect query plans.
- Move verification to a queue/worker with per-user concurrency and backoff.
- Add an outbox for GitHub/DB dual writes.
- Introduce a cache for public stats/queue only if staleness is acceptable.
- Add structured logging and metrics without logging tokens or personal data.
- Split read replicas only if the queue/read load justifies it.
- Re-evaluate GitHub API limits and the policy risk before adding users.

## Extension points

Safe extensions preserve the human-only, non-monetary, capped model:

- richer repository quality signals (license, release cadence) with transparent rules;
- moderator tooling backed by the existing reports/status fields;
- email notifications with a proper provider and updated privacy policy;
- an audit export for operators;
- accessibility and localization improvements.

Unsafe extensions include automated starring, paid credits, purchased queue placement, multi-repository promotion, and features that obscure or remove the GitHub policy disclosure.
