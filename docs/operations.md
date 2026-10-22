# Operations runbook

This is the operator-facing guide for deploying, monitoring, and maintaining Starloop. It assumes the code is current and the reader has access to the hosting provider, database, GitHub OAuth app, and scheduler.

## 1. Production topology

Recommended baseline:

- **Hosting:** Vercel (or any Node.js host that supports Next.js 16 route handlers)
- **Database:** Neon Postgres, pooled connection string (`-pooler` host)
- **Scheduler:** Vercel Cron, GitHub Actions, or another trusted scheduler
- **Secrets:** hosting provider's encrypted environment variables
- **DNS/TLS:** HTTPS only, HSTS enabled

The app does not require a separate worker, Redis, or object store. Verification is a route handler; the scheduler just calls it.

## 2. First deploy

### 2.1 Create the databases

1. Create a Neon project. Choose a region close to the application.
2. Create or choose two branches/databases:
   - a **development** database that may contain demo data;
   - an **empty production** database for real accounts.
3. Copy both **pooled** connection strings. They look like:
   `postgresql://USER:PASSWORD@ep-...-pooler.REGION.aws.neon.tech/DB?sslmode=require`
4. Store the production URL as `DATABASE_PROD_URL` and the development URL as `DATABASE_DEV_URL`. Do not commit either.
5. The first request runs the idempotent bootstrap. Verify with:
   ```bash
   curl -sS https://YOUR_ORIGIN/api/health
   ```
   Expected: HTTP 200, `{"ok":true,"database":"ok","databaseTarget":"production",...}`.

For stricter production control, generate versioned SQL first:

```bash
pnpm db:generate
```

Review the SQL, apply it with your migration runner, then deploy. Keep `src/lib/db/migrate.ts` in sync with `schema.ts`.

### 2.2 Configure environment variables

Set these in the hosting provider. Scope `DATABASE_PROD_URL` to **Production** only and `DATABASE_DEV_URL` to **Preview/Development**:

| Variable                       | Production value                        |
| ------------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_APP_URL`          | `https://your-domain.example`           |
| `AUTH_SECRET`                  | 32+ random bytes, hex or base64         |
| `TOKEN_ENCRYPTION_KEY`         | Base64-encoded 32-byte key              |
| `CRON_SECRET`                  | 24+ random bytes, hex                   |
| `DATABASE_PROD_URL`            | Empty production Neon pooled URL        |
| `DATABASE_DEV_URL`             | Development Neon pooled URL             |
| `DATABASE_URL`                 | Leave unset unless you need an override |
| `GITHUB_OAUTH_CLIENT_ID`       | OAuth App client ID                     |
| `GITHUB_OAUTH_CLIENT_SECRET`   | OAuth App client secret                 |
| `GITHUB_OAUTH_SCOPES`          | `read:user user:email public_repo`      |
| `DEMO_MODE`                    | `false`                                 |
| `SEED_DEMO_DATA`               | `false`                                 |
| `MAX_DAILY_STARS`              | `5` (or a deliberate value)             |
| `MAX_INBOUND_PER_REPO_PER_DAY` | `8` (or a deliberate value)             |
| `POLICY_VERSION`               | The date/version of the current terms   |

Selection rules:

- `next dev` → `DATABASE_DEV_URL`
- `next build` / `next start` → `DATABASE_PROD_URL`
- Vercel Preview (`VERCEL_ENV=preview`) → `DATABASE_DEV_URL`
- A local `DATABASE_URL` (`127.0.0.1` / `localhost`) → that local database, for PGlite
- `DATABASE_URL` is a remote fallback only when the target variable is missing

Generate secrets locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Use different values per environment. Never reuse the demo secrets.

### 2.3 Configure GitHub OAuth

In GitHub → Settings → Developer settings → OAuth Apps:

- **Homepage URL:** `https://your-domain.example`
- **Authorization callback URL:** `https://your-domain.example/api/auth/github/callback`

If the callback URL does not match exactly, GitHub returns an error before the app sees a code. After rotating the client secret, update the environment and redeploy.

### 2.4 Deploy

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

Deploy the build output with your host's normal flow. Vercel detects Next.js automatically. Set the Node version to 22.9 or newer.

### 2.5 Verify

- [ ] `/` renders and the live stats are not obviously broken.
- [ ] `/legal`, `/terms`, `/privacy`, `/acceptable-use` render.
- [ ] `/connect` offers GitHub OAuth and the token form.
- [ ] OAuth completes and lands on `/welcome` or `/dashboard`.
- [ ] A test account can bind an eligible public repository.
- [ ] A test star action succeeds and creates ledger entries.
- [ ] `/api/health` returns 200 and `databaseTarget` is `production`.
- [ ] The browser console has no CSP or hydration errors.
- [ ] `DEMO_MODE` is off in production.
- [ ] Security headers are present (`curl -I`).

## 3. Cron verification

The endpoint is `GET` or `POST /api/cron/verify` and requires:

```http
Authorization: Bearer $CRON_SECRET
```

Example:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.example/api/cron/verify
```

Successful response shape:

```json
{
	"ok": true,
	"members": 3,
	"checked": 12,
	"revoked": 1,
	"errors": 0
}
```

Schedule it daily. The route processes at most 12 users with up to 10 candidates each, so large deployments need a more sophisticated worker or multiple runs. It stops early on GitHub rate limits.

Vercel `vercel.json` example (if you use Vercel Cron):

```json
{
	"crons": [
		{
			"path": "/api/cron/verify",
			"schedule": "0 4 * * *"
		}
	]
}
```

Vercel Cron can send its own authorization header depending on configuration. If your plan does not support a bearer secret directly, use an external scheduler with the header above, or protect the route with a separate header check. Do not expose an unauthenticated verification endpoint.

### 3.1 Demo data cleanup

`SEED_DEMO_DATA=true` writes demo users, repositories, stars, and ledger entries into the selected database: `DATABASE_DEV_URL` under `next dev` / Vercel Preview, `DATABASE_PROD_URL` under `next build` / `next start`. The production guard refuses to seed when the selected target is production, but keep the flag false there anyway. Never enable it against a database that contains real users.

If a staging database was seeded and you want to remove the demo rows, delete the demo user and seeded community users. Foreign keys cascade to their repositories, stars, ledger entries, activities, and connections:

```sql
DELETE FROM users
WHERE left(id, 2) = 'u_';
```

The seeded users use readable `u_*` IDs; real accounts use UUIDs. Foreign keys cascade from there. Then delete the seed marker so a future seed does not assume the data is intact:

```sql
DELETE FROM app_meta WHERE key = 'seed_version';
```

Set `DEMO_MODE=false` and `SEED_DEMO_DATA=false`, redeploy, and confirm that `/connect` no longer shows the demo button and that `/discover` has no demo repositories. A fresh Neon branch is safer than cleaning a database that may contain real user data.

## 4. Monitoring

### Health

Poll `/api/health` every minute from your uptime monitor. It checks database connectivity with `SELECT 1`.

Alert on:

- non-200 for 3 consecutive checks;
- elevated p95 latency;
- 5xx rate above baseline;
- cron response missing or `errors` increasing;
- a sudden spike in `revoked` counts (could indicate GitHub enforcement or token problems);
- repeated `401` from GitHub (users need to reconnect).

### Application signals

The app logs unhandled API errors as a name only, not a stack trace or token. For production, add structured logging at the platform layer and keep secrets out of logs. Useful events:

- star action success/failure by code;
- verification run summary;
- connection `needs_reauth` transitions;
- report creation and moderation status;
- account deletions and exports;
- rate-limit rejections.

Do not log tokens, cookies, raw IP addresses, or full request bodies containing credentials.

### Database

Monitor connections, storage, CPU, and slow queries in Neon. The app uses a pool of 5 per process and `prepare: false` for the transaction-mode pooler. If you scale to many serverless instances, review connection limits and consider a larger pool or a direct connection for migrations.

Useful checks:

```sql
-- active repositories with no credits (should leave the queue)
SELECT count(*) FROM repositories r
JOIN users u ON u.id = r.user_id
WHERE r.is_active = true AND r.status = 'active' AND u.credits < 1;

-- connections needing reauth
SELECT count(*) FROM connections WHERE needs_reauth = true;

-- open reports
SELECT count(*) FROM reports WHERE status = 'open';

-- stars not checked in the last 24 hours
SELECT count(*) FROM exchange_stars
WHERE status = 'confirmed'
  AND (last_checked_at IS NULL OR last_checked_at < EXTRACT(EPOCH FROM now()) * 1000 - 86400000);
```

## 5. Backups and restore

Neon provides point-in-time restore depending on plan. Confirm the retention window and test a restore into a branch before relying on it.

Test procedure:

1. Create a Neon branch from a recent point in time.
2. Point a staging deployment at the branch.
3. Verify `/api/health`, a login, the queue, and an account export.
4. Never test destructive restore against production.

A logical backup may be useful for small deployments:

```bash
pg_dump "$DATABASE_PROD_URL" --format=custom --file=starloop-$(date +%F).dump
```

Restore into a new database, not over production:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_URL" starloop-YYYY-MM-DD.dump
```

Treat backups as sensitive: they contain GitHub identifiers, encrypted tokens, and exchange records.

## 6. Key and secret rotation

### `AUTH_SECRET`

Effects: all signed session cookies and OAuth state become invalid. Users are signed out.

1. Generate a new secret.
2. Update the environment.
3. Redeploy.
4. Announce the sign-out if the service has active users.

### `TOKEN_ENCRYPTION_KEY`

Effects: existing encrypted tokens cannot be decrypted. The current schema has no per-token key version, so rotation requires reconnection.

1. Schedule a maintenance window.
2. Notify users that GitHub must be reconnected.
3. Update the key.
4. Delete or mark all connections `needs_reauth = true`.
5. Redeploy.
6. Verify a new connection and a star action.
7. Consider adding key versioning before the next rotation.

### `CRON_SECRET`

1. Generate a new secret.
2. Update the scheduler and the app in the same window.
3. Confirm the next run returns 200.

### GitHub OAuth client secret

1. Generate a new secret in GitHub.
2. Update the environment.
3. Redeploy.
4. Confirm a fresh OAuth login.
5. Revoke the OAuth app authorization if compromise is suspected.

## 7. Incident response

### Suspected token exposure

1. Revoke affected OAuth grants or PATs at GitHub.
2. Mark connections `needs_reauth = true` (or delete them).
3. Rotate `TOKEN_ENCRYPTION_KEY` and `AUTH_SECRET` if the server environment or database was exposed.
4. Review access logs for star actions the user did not initiate.
5. Notify affected users and follow the privacy policy's breach process.

### Suspected database exposure

1. Rotate database credentials.
2. Rotate `AUTH_SECRET` and `TOKEN_ENCRYPTION_KEY`.
3. Preserve evidence and determine scope.
4. Notify users and authorities as required.
5. Review the privacy policy's retention and breach language.

### Abuse or coordinated ring

1. Preserve the relevant `exchange_stars`, `credit_ledger`, `activities`, and `reports` rows.
2. Suspend the accounts (`users.status = 'suspended'`) and mark connections as needing reauth if needed.
3. Reverse affected credits through the verification path or a reviewed manual transaction.
4. Remove repositories from the queue (`is_active = false`, `status = 'paused'`).
5. Document the decision and appeal path.

### GitHub enforcement against the service or users

1. Do not argue with GitHub on a user's behalf without consent.
2. Direct users to GitHub's appeal process.
3. Consider pausing the exchange and publishing a status note.
4. Re-read the current GitHub policies with counsel before resuming.
5. If the model is no longer viable, follow the shutdown plan below.

## 8. Shutdown plan

If the operator decides to stop the exchange:

1. Disable new sign-ins and star actions (feature flag or deploy a maintenance page).
2. Announce the shutdown and the data-export deadline.
3. Keep account export available for a defined window.
4. Provide a deletion path and honor it.
5. Revoke OAuth grants or instruct users to revoke them at GitHub.
6. Preserve only records required for legal/security obligations.
7. Delete the database and backups according to the retention policy.
8. Publish a short post-mortem for users if appropriate.

Do not leave encrypted tokens in an abandoned database indefinitely.

## 9. Moderation operations

There is no admin UI. Use SQL with care and record every action.

Useful updates:

```sql
-- Suspend an account
UPDATE users SET status = 'suspended', updated_at = extract(epoch from now()) * 1000
WHERE login = 'LOGIN';

-- Pause a repository
UPDATE repositories SET is_active = false, status = 'paused'
WHERE full_name = 'OWNER/REPO';

-- Close a report
UPDATE reports SET status = 'resolved'
WHERE id = 'REPORT_ID';
```

Credit adjustments should go through a reviewed transaction that inserts matching `credit_ledger` rows with a clear reason and detail. Never silently edit `users.credits` without a ledger entry.

## 10. Launch checklist

Operational:

- [ ] Production environment variables set and unique.
- [ ] `NEXT_PUBLIC_APP_URL` is the HTTPS origin.
- [ ] OAuth callback matches exactly.
- [ ] `DEMO_MODE=false`, `SEED_DEMO_DATA=false`.
- [ ] `/api/health` monitored.
- [ ] Cron configured with `CRON_SECRET`.
- [ ] Backups enabled and a restore tested.
- [ ] Error tracking configured without capturing secrets.
- [ ] Rate limits reviewed for expected traffic.
- [ ] Security headers verified.
- [ ] Dependency audit reviewed.
- [ ] Shutdown/export plan documented.

Legal:

- [ ] Operator placeholders replaced in `src/lib/legal.ts`.
- [ ] Terms, privacy, and acceptable use reviewed by counsel.
- [ ] GitHub policy risk accepted in writing.
- [ ] Security contact and abuse contact monitored.
- [ ] Privacy requests process defined.
- [ ] Data processing agreements signed.
- [ ] Cookie behavior matches the privacy policy.
- [ ] No claim of GitHub approval or guaranteed growth.

Product:

- [ ] One active repository per member verified.
- [ ] Outgoing and incoming caps verified.
- [ ] Duplicate star protection verified.
- [ ] Verification reverses a missing star.
- [ ] Account export and deletion verified.
- [ ] Reports reach a human.
- [ ] Demo mode cannot be reached in production.
- [ ] UI discloses the GitHub policy risk before sign-in and before onboarding.

## 11. Useful commands

```bash
pnpm check                 # lint + typecheck + tests
pnpm build                 # production build
pnpm db:generate           # generate Drizzle SQL
pnpm db:check              # print target + row counts
pnpm db:studio             # inspect the development database
curl -sS $ORIGIN/api/health
curl -sS -H "Authorization: Bearer $CRON_SECRET" -X POST $ORIGIN/api/cron/verify
```

See [architecture.md](architecture.md) for the request flows and [../SECURITY.md](../SECURITY.md) for disclosure and rotation details.
