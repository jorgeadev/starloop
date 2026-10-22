# Security policy

Starloop handles GitHub credentials, session cookies, and public repository data. Security reports are taken seriously. This document explains what is in scope, how to report a problem, and how the application is designed to reduce risk.

## Supported versions

| Version                  | Supported                                                           |
| ------------------------ | ------------------------------------------------------------------- |
| `main` / current `1.x`   | Yes                                                                 |
| Older snapshots or forks | Best effort; maintainers may ask you to reproduce on current `main` |

This is a small, self-hosted project. There is no guaranteed response SLA and no bug bounty.

## Reporting a vulnerability

**Do not open a public GitHub issue for a suspected vulnerability.** Use GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Advisories** → **Report a vulnerability**.
3. Include the details below.

If private reporting is not enabled, open a minimal public issue asking the maintainer for a private channel. Do not include exploit details, credentials, or personal data in that issue.

Include, where possible:

- a short description of the issue and its impact;
- the affected route, component, or dependency;
- reproduction steps or a proof of concept;
- whether any real user data was accessed;
- your preferred attribution, if any.

Please give the maintainer a reasonable opportunity to investigate and fix the issue before public disclosure. We will acknowledge good-faith reports as soon as practical and keep you informed of material progress.

## In scope

- Authentication and session handling
- GitHub OAuth flow (PKCE, state, callback validation)
- PAT validation and encrypted token storage
- Authorization and object-level access control (for example, editing another user's repository, ledger, or reports)
- CSRF, origin validation, and rate-limit bypass
- Cross-site scripting, injection, and unsafe rendering
- Server-side request forgery through GitHub or metadata input
- Sensitive data exposure in responses, logs, or exports
- Account deletion and export failures
- Credit-ledger manipulation or duplicate credit extraction
- Security header or CSP weaknesses that enable exploitation
- Dependency vulnerabilities with a realistic exploit path

## Out of scope

- Reports about GitHub itself, GitHub accounts, or GitHub policy enforcement. Contact GitHub Support or use GitHub's appeal process.
- Denial-of-service testing, traffic flooding, or resource exhaustion against a live deployment.
- Social engineering of members, maintainers, or the operator.
- Spam or low-quality repository listings without a security impact (use the report action or email the operator).
- Missing hardening headers with no demonstrated impact.
- Automated scanner output without a reproducible issue.
- Physical access, compromised devices, or a compromised GitHub account.
- Issues that require the victim to install malware or disclose a password.

## Safe harbor

The operator will not pursue legal action against researchers who:

- act in good faith and avoid privacy violations, data destruction, and service disruption;
- test only against their own accounts or a local deployment;
- report the issue privately and give a reasonable time to fix it;
- do not extort, demand payment, or threaten disclosure.

This safe harbor is limited to the operator's own rights. It does not bind GitHub, a hosting provider, or any third party. When in doubt, ask first.

## Security design

### Credentials

- OAuth access tokens and personal access tokens are encrypted with **AES-256-GCM** before storage.
- The encryption key (`TOKEN_ENCRYPTION_KEY`) is supplied through the server environment and is not stored in the database.
- Tokens are never returned to the browser after submission. The UI shows only a short hint.
- OAuth uses **PKCE** and a signed, short-lived state cookie.
- Fine-grained PATs should grant only `Starring: Read and write` and `Metadata: Read` for the repositories they need. Classic PATs should use `public_repo` and `read:user`, not private repository scopes.
- A connection can be marked `needs_reauth` when GitHub rejects it; the user must reconnect.

### Sessions

- The browser receives a signed random session ID in an `HttpOnly`, `SameSite=Lax` cookie, `Secure` in production.
- The database stores only the SHA-256 hash of the session ID.
- Sessions expire after 30 days. Users can revoke other sessions in Settings.
- Deleting an account destroys the session and deletes the user row, cascading to credentials and exchange data.

### Request protection

- State-changing API routes require an origin check and a double-submit CSRF token (`sl_csrf` cookie + `x-csrf-token` header).
- Rate limits cover authentication, token attempts, star actions, reports, and sensitive mutations.
- The proxy sets a per-request CSP nonce and security headers, including HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a restrictive permissions policy.
- API errors are mapped to safe messages; stack traces are not returned to clients.

### Exchange integrity

- Star eligibility is checked before the GitHub call and re-checked inside a database transaction with row locks.
- A unique `(giver_id, repository_id)` index prevents duplicate credit extraction.
- The credit transfer and ledger entries commit together.
- Verification uses `GET /user/starred/{owner}/{repo}` with the giver's own token. If the star is gone, the transfer is reversed.
- Demo mode simulates stars and is excluded from cron verification. It must be disabled in production.

### Data handling

- The app stores public GitHub profile and repository metadata, exchange records, and security metadata.
- It does not request private repository contents.
- Account export returns JSON for the authenticated user only.
- Account deletion is self-service and cascades to sessions, connection, repositories, stars, ledger, activities, and reports.
- Infrastructure providers may retain backups for a limited period; see the privacy policy.

## Operator security checklist

- [ ] Enable GitHub private vulnerability reporting for the repository.
- [ ] Use unique, high-entropy secrets for `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, and `CRON_SECRET`.
- [ ] Store secrets in the hosting provider's secret manager, never in git.
- [ ] Force HTTPS and confirm `Secure` cookies in production.
- [ ] Set a restrictive `NEXT_PUBLIC_APP_URL` and correct OAuth callback.
- [ ] Keep `DEMO_MODE` and `SEED_DEMO_DATA` false.
- [ ] Protect the cron endpoint with `CRON_SECRET` and restrict it at the edge if possible.
- [ ] Monitor `/api/health`, authentication failures, and unusual star volume.
- [ ] Review dependencies and platform advisories regularly.
- [ ] Test restore from backup.
- [ ] Document who can suspend accounts and revoke credentials.
- [ ] Keep an incident log with timestamps, scope, and decisions.

## Secret rotation

### `AUTH_SECRET`

Rotating `AUTH_SECRET` invalidates signed session cookies and in-flight OAuth state. Users will be signed out and must sign in again. Rotate immediately if the secret is exposed.

### `TOKEN_ENCRYPTION_KEY`

The current implementation uses a single encryption key and does not store a key version per token. Rotating this key makes existing encrypted GitHub credentials undecryptable. Plan for it:

1. Announce a reconnection window.
2. Rotate the key.
3. Mark all connections as needing reauthentication or delete them.
4. Require users to reconnect GitHub.
5. Verify that star actions and verification work with new credentials.

Do not rotate the key casually during an active incident without preserving a way to revoke affected tokens.

### `CRON_SECRET`

Rotate the secret and update the scheduler in the same change window. A mismatch returns `401` and no verification runs.

### GitHub OAuth client secret

Rotate the secret in GitHub, update the deployment's environment, and redeploy. Existing access tokens remain valid until revoked or expired; revoke the OAuth app authorization if compromise is suspected.

## Incident response

1. **Contain.** Disable the affected route or deployment, revoke exposed credentials, and rotate secrets as appropriate.
2. **Assess.** Determine what data and accounts were affected. Preserve relevant logs without copying unnecessary personal data.
3. **Notify.** Inform affected users and authorities where required by law or contract. Do not speculate publicly about scope before verification.
4. **Recover.** Restore from a known-good backup if needed, redeploy, and verify authentication, star actions, and cron.
5. **Learn.** Write a short incident record: timeline, root cause, impact, fixes, and follow-up owners. Add a regression test where possible.

If GitHub tokens may have been exposed, revoke them at GitHub and require reconnection. If session data may have been exposed, rotate `AUTH_SECRET` and invalidate sessions.

## Dependency and platform security

- Keep Next.js, React, Drizzle, and GitHub API client dependencies current.
- Review advisories for the hosting platform and database provider.
- Do not add analytics, session replay, or advertising scripts that would require weakening the CSP or disclosing new data flows without updating the privacy policy.
- Treat any new integration that receives GitHub tokens as a security-critical change.

## Legal note

This security policy is an operational document, not a warranty. See [LEGAL.md](LEGAL.md) and the in-app legal pages for the platform-risk and legal posture.
