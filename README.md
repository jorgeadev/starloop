# Starloop

> **Portfolio / engineering case study.** This repository is not operated as a service. It does not automate starring, pay for stars, or ask for stars. The credit-for-star concept may conflict with GitHub's Acceptable Use Policies. Do not deploy it as a live exchange.

**A constrained reciprocity-ledger experiment.** Starloop explores the engineering problem behind reciprocal attention: how to make a credit-backed exchange legible, hard to game, and honest about platform risk. It is built as a full-stack reference implementation with a custom dark product UI.

Starloop is independent and not affiliated with GitHub, Inc. It is meant to be read, audited, and discussed — not used to manufacture engagement.

**Public repository status:** this is a code and demo-screenshot portfolio piece. No live exchange is hosted from this repository.

**Running it yourself:** [open a **Run request** issue](../../issues/new?template=run-request.yml) from GitHub. The owner will review the request, provide setup guidance where appropriate, and reply. Do not deploy a copy without prior written permission.

![Starloop dashboard](docs/screenshots/dashboard.png)

## What this project demonstrates

The interesting part is not a “star for star” button. It is the set of constraints around it:

- **One verified star = one credit.** Giving a star moves one credit from the receiving project's owner to the giver. Receiving a star spends one of the owner's credits.
- **One active public repository per member.** The queue stays legible and nobody can promote a portfolio at once.
- **Human-only.** There is no automation, no background starring, no paid placement, and no cash value.
- **Server-enforced guardrails.** Daily outgoing and per-repository incoming caps, eligibility checks, duplicate protection, transactional credit transfers, and verification of whether a star still exists.
- **Honest risk disclosure.** Reciprocal starring may conflict with GitHub's Acceptable Use Policies. The app says so before onboarding and documents the risk in the Trust Center.

The repo is useful as an example of Next.js App Router structure, Drizzle/Postgres schema design, GitHub OAuth and PAT handling, encrypted credential storage, CSRF/rate-limit defenses, and a small custom design system.

## Screens

| Surface      | What it shows                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Landing page | Community stats, a queue preview, the exchange rules, trust guardrails, and FAQ                     |
| Dashboard    | Balance, weekly rhythm, incoming/outgoing activity, attention items, and active repository          |
| Discover     | Eligible repositories, filters, search, star confirmation, and verification                         |
| Repositories | Binding, syncing, pausing, and replacing the active repository                                      |
| Credits      | Ledger, given/received stars, withdrawal with credit reversal                                       |
| Activity     | Audit trail of stars, verification events, and repository changes                                   |
| Settings     | GitHub credential, daily limits, pause promotion, data export, session revocation, account deletion |
| Trust Center | GitHub policy risk, legal documents, enforcement model, security summary                            |

## Stack

- **Next.js 16.4** with the App Router, React 19.3, and Turbopack
- **TypeScript 5.9** in strict mode
- **Tailwind CSS v4** with a custom dark design system
- **Drizzle ORM** over **PostgreSQL** (`postgres.js`)
- **Neon** pooled Postgres in production; PGlite over TCP for fully local development
- **Custom GitHub OAuth + PAT authentication** (no third-party identity provider)
- **AES-256-GCM** token encryption, DB-backed sessions, CSRF double-submit, rate limits, strict CSP
- **Vitest** for focused unit tests
- **pnpm** for package management

## Quick start

### Prerequisites

- Node.js **22.9+**
- pnpm **12+** (`corepack enable` is recommended)
- A PostgreSQL database (Neon recommended) **or** the bundled local PGlite server

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

The environment template is deliberately **not published** in this repository. After approving a run request, the owner supplies a private template. Create `.env.local` from that template; never post secrets in an issue.

Generate the required secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Fill `.env.local`:

| Variable                       | Required  | Purpose                                                                                 |
| ------------------------------ | --------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`          | Yes       | Public origin used for metadata, OAuth return URLs, sitemap, and absolute links         |
| `AUTH_SECRET`                  | Yes       | At least 32 characters; signs session cookies and OAuth state                           |
| `TOKEN_ENCRYPTION_KEY`         | Yes       | Base64-encoded 32-byte key for AES-256-GCM token encryption                             |
| `CRON_SECRET`                  | For cron  | Bearer secret for `GET/POST /api/cron/verify`                                           |
| `DATABASE_DEV_URL`             | Yes       | Development PostgreSQL URL. Demo data lives here. Use the Neon `-pooler` host           |
| `DATABASE_PROD_URL`            | For prod  | Production PostgreSQL URL. Keep this database empty for real accounts                   |
| `DATABASE_URL`                 | No        | Local/legacy fallback. A local `127.0.0.1` URL wins; otherwise only if target is absent |
| `GITHUB_OAUTH_CLIENT_ID`       | For OAuth | GitHub OAuth App client ID                                                              |
| `GITHUB_OAUTH_CLIENT_SECRET`   | For OAuth | GitHub OAuth App client secret                                                          |
| `GITHUB_OAUTH_SCOPES`          | No        | Defaults to `read:user user:email public_repo`                                          |
| `DEMO_MODE`                    | No        | Enables the one-click demo login and simulated stars                                    |
| `SEED_DEMO_DATA`               | No        | Seeds the demo workspace on first database boot                                         |
| `MAX_DAILY_STARS`              | No        | Default outgoing star cap (default `5`, hard max `20`)                                  |
| `MAX_INBOUND_PER_REPO_PER_DAY` | No        | Per-repository incoming cap (default `8`)                                               |
| `POLICY_VERSION`               | No        | Version stored when a user accepts the rules                                            |

**Database selection:**

- `pnpm dev` (`NODE_ENV=development`) → `DATABASE_DEV_URL`
- `pnpm build` / `pnpm start` (`NODE_ENV=production`) → `DATABASE_PROD_URL`
- Vercel **Preview** → `DATABASE_DEV_URL`, even though `NODE_ENV` is production
- `pnpm dev:local` → local PGlite `DATABASE_URL`; a local URL always wins
- `DATABASE_URL` also acts as a fallback when the target variable is absent

`GET /api/health` reports `databaseTarget` as `development` or `production`, so you can verify which database a deployment is using without exposing the connection string.

> **Never commit `.env.local` or any real token.** The repository ignores both `.env` and `.env.local`.

### 3. Create the GitHub OAuth App

1. Open GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: your `NEXT_PUBLIC_APP_URL`.
3. Authorization callback URL: `${NEXT_PUBLIC_APP_URL}/api/auth/github/callback`.
4. Copy the client ID and client secret into `.env.local`.

Users can also connect with a **classic PAT** (`public_repo`, plus `read:user` for profile data) or a **fine-grained PAT** with:

- Account permissions → **Starring: Read and write**
- Repository permissions → **Metadata: Read** for the repository

Fine-grained tokens need access to the public repositories they will star. The connection screen explains this during onboarding.

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). With `pnpm dev`, the app uses `DATABASE_DEV_URL`. The schema is bootstrapped idempotently on the first database request, so a fresh Neon branch works without a separate migration step.

To run the production build locally against the production database:

```bash
pnpm build
pnpm start
```

To run a production build against `DATABASE_DEV_URL` instead, temporarily set `DATABASE_PROD_URL` to the dev URL in your shell, or use `pnpm dev`. Do not point a local production smoke test at real users unless that is intentional.

### Fully local database (optional)

If you do not want to use a remote database for development:

```bash
pnpm dev:local
```

This starts PGlite over TCP on `127.0.0.1:5433` and launches Next.js with a local `DATABASE_URL`. Because the URL is local, it overrides the Neon dev/prod targets. The local data directory is `data/pglite/` and is git-ignored. To run only the database server:

```bash
pnpm db:local
```

### Demo workspace (optional)

Set these in `.env.local`:

```dotenv
DEMO_MODE=true
SEED_DEMO_DATA=true
```

Then use **Explore the demo workspace** on `/connect`. Demo star actions are simulated: no GitHub request is made and no real star changes.

Demo seeding is refused when the selected target is production, even if `SEED_DEMO_DATA=true` is set by mistake. The one-click demo login and simulated stars are separately controlled by `DEMO_MODE`; the seeded rows remain in the dev database when `DEMO_MODE=false`, but the demo login button is hidden. Keep both flags **false** in production.

> **The seed writes to the selected database.** With `pnpm dev` / Vercel Preview, that is `DATABASE_DEV_URL`; under `pnpm build` / `pnpm start` it would be `DATABASE_PROD_URL`, but the production guard refuses to seed it. To remove demo data from a database that was used for a walkthrough, delete the seed users and let the foreign keys cascade:
>
> ```sql
> DELETE FROM users WHERE left(id, 2) = 'u_';
> DELETE FROM app_meta WHERE key = 'seed_version';
> ```
>
> For a clean production launch, prefer a fresh Neon branch/database and run with both demo flags false.

## Scripts

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start the Next.js development server              |
| `pnpm dev:local`    | Start PGlite + Next.js with a local database      |
| `pnpm db:local`     | Start only the PGlite TCP server                  |
| `pnpm db:check`     | Print the selected database target and row counts |
| `pnpm build`        | Production build                                  |
| `pnpm start`        | Serve the production build                        |
| `pnpm lint`         | ESLint with Next.js and TypeScript rules          |
| `pnpm typecheck`    | `tsc --noEmit`                                    |
| `pnpm test`         | Vitest unit tests                                 |
| `pnpm check`        | Lint, typecheck, and tests                        |
| `pnpm format`       | Prettier write                                    |
| `pnpm format:check` | Prettier check                                    |
| `pnpm db:generate`  | Generate Drizzle SQL migrations into `drizzle/`   |
| `pnpm db:studio`    | Open Drizzle Studio                               |

Recommended pre-merge check:

```bash
pnpm check && pnpm build
```

## The exchange model

```text
giver stars owner's repo on GitHub
        │
        ├── GitHub verifies the star with the giver's own credential
        │
        ▼
giver balance  +1 credit
owner balance  -1 credit
        │
        ├── ledger entry for both sides
        ├── activity entry for both sides
        └── repository star count +1

withdraw / verification sees no star
        │
        ▼
giver balance  -1 (clamped at 0)
owner balance  +1
ledger reversal entries for both sides
```

Repositories with zero credits leave the queue. A member can pause promotion without giving up credits. Verification runs on demand and through the cron endpoint, using `GET /user/starred/{owner}/{repo}` with the giver's token; private stargazer lists are not used.

### Inbound/outbound caps

- Outgoing: the lower of the user's setting and `MAX_DAILY_STAR_LIMIT` (20).
- Incoming: `MAX_INBOUND_PER_REPO_PER_DAY` per repository, per UTC day.
- Duplicate stars to the same repository are rejected by a unique `(giver_id, repository_id)` index and an application check.
- Ownership checks and row locks protect the credit transfer in a transaction.

## Architecture

| Path                       | Responsibility                                                       |
| -------------------------- | -------------------------------------------------------------------- |
| `src/app/(marketing)`      | Landing page and public legal pages                                  |
| `src/app/(auth)`           | Connect, OAuth/PAT onboarding, policy acceptance                     |
| `src/app/(app)`            | Authenticated workspace and app shell                                |
| `src/app/api`              | Auth, exchange, repository, settings, account, reports, cron, health |
| `src/lib/auth`             | OAuth/PKCE, PAT validation, encrypted connections, sessions, CSRF    |
| `src/lib/db`               | Drizzle schema, idempotent bootstrap, seed, queries                  |
| `src/lib/exchange.ts`      | Credit transfer, verification, reversal, unstar, repository sync     |
| `src/lib/github/client.ts` | GitHub REST client, token validation, fine-grained guidance          |
| `src/lib/repositories.ts`  | Repository eligibility and binding/deactivation                      |
| `src/lib/legal.ts`         | Legal operator placeholders and document index                       |
| `src/proxy.ts`             | CSP nonce and CSRF cookie                                            |
| `tests/`                   | Focused unit tests for formatting and validation                     |

See [docs/architecture.md](docs/architecture.md) for request flows, trust boundaries, and failure modes. See [docs/operations.md](docs/operations.md) for deployment, cron, key rotation, and incident response.

## Security

- GitHub tokens are encrypted with **AES-256-GCM**; the key is separate from the database.
- Session cookies contain a signed random ID; only its SHA-256 hash is stored.
- OAuth uses **PKCE + state** with a short-lived, HMAC-signed cookie.
- State-changing requests require an origin check and a double-submit CSRF token.
- Security headers include CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, and a restrictive permissions policy.
- Rate limits cover auth, star actions, reports, and other mutation endpoints.
- Account export and deletion are self-service in Settings.
- Operators can revoke a connection and suspend an account directly in the database.

Please read [SECURITY.md](SECURITY.md) before reporting a vulnerability.

## Legal and platform risk

**Read [LEGAL.md](LEGAL.md) and the in-app Trust Center before deploying this publicly.**

Starloop is a template with a documented legal posture, not a legal opinion. The legal pages intentionally render bracketed placeholders such as `[OPERATOR LEGAL NAME]` and `[CONTACT EMAIL]`. The operator must:

1. Replace every placeholder with real details.
2. Confirm the governing jurisdiction and consumer/privacy obligations.
3. Have qualified counsel review the terms, privacy policy, and acceptable-use rules.
4. Independently assess GitHub's current Acceptable Use Policies and Terms of Service.
5. Accept that GitHub may treat a star-for-credit exchange as rank abuse or incentivized inauthentic engagement. GitHub's Acceptable Use Policies expressly mention automated starring, inauthentic interactions, and activity incentivized by rewards such as credits, gifts, or giveaways. A human action and the absence of cash do not eliminate that risk. GitHub may remove stars or restrict accounts.

If you need zero platform risk, do not operate a reciprocal star exchange. The honest alternative is a one-way project showcase with no star-for-credit mechanism.

## Portfolio review guide

If you are reviewing this as an engineering portfolio piece, start here:

- `src/lib/exchange-rules.ts` — pure eligibility rules and limits.
- `src/lib/exchange.ts` — transactional credit transfer, reversal, verification, and GitHub calls.
- `src/lib/auth` — OAuth/PKCE, PAT validation, encrypted connections, sessions, CSRF.
- `src/lib/db/schema.ts` and `src/lib/db/queries.ts` — Postgres model and queue queries.
- `src/proxy.ts` — CSP nonce and CSRF cookie.
- `tests/` — eligibility, validation, URL sanitization, and formatting tests.
- `docs/architecture.md` and `docs/operations.md` — request flows, failure modes, and operator runbook.

The repository is intentionally not a turnkey hosted product. It is a documented engineering study with a functioning local/demo surface.

## Deployment

Deploying this as a live exchange is **not recommended** and is not the purpose of the public repository. If you choose to operate it privately, the shortest path is Vercel + Neon:

1. Create a Neon project and two branches/databases: one for development/demo data, one **empty** production database.
2. Copy both **pooled** connection strings.
3. Import the repository into Vercel.
4. Set `DATABASE_PROD_URL` for the Production environment and `DATABASE_DEV_URL` for Preview/Development.
5. Set `NEXT_PUBLIC_APP_URL` to the production origin, and set the production GitHub OAuth callback.
6. Set `DEMO_MODE=false` and `SEED_DEMO_DATA=false` in Production. You may enable both in Preview/Development against `DATABASE_DEV_URL`.
7. Deploy, then verify `/api/health` reports `databaseTarget: "production"`.
8. Configure a daily scheduler to call `/api/cron/verify` with `Authorization: Bearer $CRON_SECRET`.

Vercel Preview sets `NODE_ENV=production`, so the app checks `VERCEL_ENV` and routes preview deployments to `DATABASE_DEV_URL`. Never point previews at the production database. The app uses `prepare: false` for Neon's transaction-mode pooler. Do not point production traffic at a direct connection with a small connection limit unless you adjust the pool size.

## Known limitations

- Repository eligibility depends on GitHub metadata and may reject legitimate projects with short descriptions or no recent pushes.
- Credit reversal clamps a giver's balance at zero; it does not claw back credits already spent.
- Verification is best-effort. GitHub rate limits, revoked tokens, and API errors are counted and reported but do not retry automatically within the same run.
- There is no email delivery, password login, paid tier, admin UI, or notification system.
- The schema bootstrap is intentionally simple. For production migrations, generate and review versioned SQL with `pnpm db:generate` and apply it in your deploy pipeline.
- Legal pages are templates and the operator identity is unresolved until the placeholders are replaced.

## License

All rights reserved. See [LICENSE](LICENSE). The repository is published for viewing, evaluation, and portfolio review; copying, modification, deployment, or redistribution requires prior written permission. This does not grant rights to the Starloop name, logo, or any third-party marks. GitHub is a trademark of GitHub, Inc.
