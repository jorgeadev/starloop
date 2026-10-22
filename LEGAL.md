# Legal, policy, and compliance notes

> **This is not legal advice.** Starloop is a software project and a documented legal template. It does not create a lawyer–client relationship, does not guarantee compliance with GitHub policy, and does not replace review by qualified counsel in the operator's jurisdiction.

## 1. Current status

The repository contains public-facing legal pages at `/terms`, `/privacy`, and `/acceptable-use`, plus a Trust Center at `/legal`. They intentionally contain bracketed placeholders:

- `[OPERATOR LEGAL NAME]`
- `[CONTACT EMAIL]`
- `[OPERATOR POSTAL ADDRESS]`
- `[JURISDICTION]`

These are not cosmetic. A public deployment must replace them with the real operator identity, contact method, postal address, and governing jurisdiction, then have the documents reviewed. The code cannot make a legal entity appear by configuration.

`src/lib/legal.ts` is the single source of truth for the placeholders shown across the UI. If the operator details change, update that file and review the pages.

## 2. The GitHub policy problem

### 2.1 What GitHub's rules say

GitHub's [Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) prohibit, among other things:

- **rank abuse**, explicitly including “automated starring or following”;
- **inauthentic interactions**, such as fake accounts and automated inauthentic activity;
- **creation of or participation in secondary markets for the purpose of the proliferation of inauthentic activity**;
- content or activity **incentivized by (or incentivizes inauthentic engagement with) rewards such as cryptocurrency airdrops, tokens, credits, gifts or other give-aways**.

GitHub retains full discretion to remove content, remove stars, restrict accounts, or terminate accounts. It can change its policies at any time. The [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service) and [Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines) apply in addition to the Acceptable Use Policies.

### 2.2 Why Starloop is exposed

Starloop does not automate starring. A human opens a repository and performs the star. But automation is not the only prohibited category. A **credit-for-star exchange** supplies a reward for engagement, and the word “credits” appears in GitHub's own examples. Even though Starloop credits:

- have no cash value,
- cannot be bought or sold,
- are not transferable,
- and represent a reciprocity count rather than money,

GitHub could still characterize the exchange as **incentivized inauthentic engagement**, **rank abuse**, or a **secondary market for engagement**. The human action reduces one form of risk; it does not eliminate the policy risk.

The operator must not describe the service as “GitHub-approved,” “compliant,” “safe,” or “allowed.” The honest position is:

> Reciprocal star exchange may conflict with GitHub's Acceptable Use Policies. Participation is voluntary and at the participant's own risk. GitHub may remove stars or restrict accounts. Starloop does not automate stars and does not guarantee any outcome.

### 2.3 Enforcement risk

| Scenario                                                        | Possible GitHub response                                               | Product impact                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GitHub views credits as an incentive for inauthentic engagement | Warning, star removal, account restriction, suspension, or termination | Users lose stars or account access; the exchange may lose participants                        |
| GitHub views organized reciprocity as rank abuse                | Star removal or account action, especially for coordinated groups      | Credits reverse when stars disappear; reputational harm                                       |
| A participant uses automation despite the rules                 | Account restriction or termination                                     | The exchange's audit trail may show the activity; operator should suspend and reverse credits |
| A repository is misleading or abusive                           | Content removal, account action                                        | Queue removal and possible operator suspension                                                |
| GitHub changes its policies                                     | New restrictions or prohibitions                                       | The operator may need to shut down the exchange or change the model                           |

The operator cannot indemnify users against GitHub's decisions, and should not promise to.

### 2.4 The honest alternatives

If the operator or counsel concludes the risk is unacceptable, the responsible alternatives are:

1. **Do not launch the reciprocal exchange.**
2. Run a **one-way project showcase** with no star-for-credit mechanism. Users can browse and star independently; no reward is attached.
3. Keep the exchange **private, invite-only, and experimental**, with explicit consent and a clear shutdown plan. This reduces exposure but does not make it compliant.
4. Wait for written guidance from GitHub. Do not assume that silence, an existing similar site, or GitHub's API availability constitutes permission.

## 3. Document map

| Document          | Purpose                                                  | Operator action                                                       |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| `/terms`          | Contract, eligibility, credits, liability, termination   | Replace placeholders; review consumer-law limits and liability caps   |
| `/privacy`        | Data inventory, purposes, legal bases, retention, rights | Replace placeholders; confirm GDPR/CCPA/local requirements; sign DPAs |
| `/acceptable-use` | Hard conduct rules and enforcement                       | Replace placeholders; align with actual moderation capacity           |
| `/legal`          | Public Trust Center and policy-risk disclosure           | Keep in sync with the documents and actual practices                  |
| `SECURITY.md`     | Vulnerability disclosure and security design             | Add a monitored contact and response expectations                     |
| `README.md`       | Technical and operational overview                       | Keep accurate as the code changes                                     |

## 4. Operator launch checklist

### 4.1 Identity and contract

- [ ] Choose the legal entity or individual who operates the service.
- [ ] Replace `[OPERATOR LEGAL NAME]` with the exact legal name.
- [ ] Replace `[OPERATOR POSTAL ADDRESS]` with a real address suitable for legal notices.
- [ ] Replace `[CONTACT EMAIL]` with a monitored mailbox.
- [ ] Replace `[JURISDICTION]` and confirm the governing-law and venue clauses.
- [ ] Confirm the minimum age and capacity requirements in the operator's jurisdiction.
- [ ] Confirm whether consumer-protection rules limit the liability cap, disclaimers, or forum selection.
- [ ] Confirm whether the service needs business registration, tax registration, or a DSA/consumer-contact point.
- [ ] Do not use a fabricated entity, address, or jurisdiction.

### 4.2 Privacy and data protection

- [ ] Sign a data processing agreement with Neon (or the chosen database provider) and any host.
- [ ] Confirm the location of the database and any backups.
- [ ] Confirm the lawful basis for each processing purpose.
- [ ] Confirm whether an international transfer mechanism is required.
- [ ] Confirm whether a DPIA is required for the exchange or the GitHub credential processing.
- [ ] Confirm cookie rules. The app uses only session, CSRF, and OAuth-state cookies; it does not use advertising cookies.
- [ ] Confirm the retention schedule and that account deletion actually removes data as described.
- [ ] Confirm the process for access, correction, export, deletion, objection, and restriction requests.
- [ ] Confirm the breach-notification timeline and the incident owner.
- [ ] Confirm whether a privacy notice needs a representative in the EU/UK.
- [ ] Review the email address and postal address provided for privacy requests.

### 4.3 Security and operations

- [ ] Generate unique `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, and `CRON_SECRET` values.
- [ ] Store secrets in the hosting provider's secret manager, not in the repository.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the production HTTPS origin.
- [ ] Confirm HSTS is appropriate for the domain.
- [ ] Configure the GitHub OAuth callback for production.
- [ ] Require HTTPS and verify that cookies are `Secure` in production.
- [ ] Configure `/api/health` monitoring and an alert.
- [ ] Configure the daily verification cron.
- [ ] Keep `DEMO_MODE=false` and `SEED_DEMO_DATA=false`.
- [ ] Define who can suspend accounts, revoke credentials, and reverse credits.
- [ ] Define a backup and restore test.
- [ ] Define a key-rotation procedure (see `docs/operations.md`).
- [ ] Define an incident-response contact and timeline.
- [ ] Review dependency and platform security updates.

### 4.4 Product and moderation

- [ ] Confirm that the app cannot star without an explicit user action.
- [ ] Confirm that demo mode is disabled or clearly labeled.
- [ ] Confirm the daily caps and per-repository caps.
- [ ] Confirm one active repository per member is enforced.
- [ ] Confirm duplicate stars are rejected.
- [ ] Confirm reports reach a monitored inbox or admin process.
- [ ] Define the enforcement ladder and appeal process.
- [ ] Define what happens to credits when a repository is removed or a star disappears.
- [ ] Confirm that the UI does not promise stars, growth, or GitHub approval.
- [ ] Add a shutdown plan: how to notify users, export their data, and revoke tokens.

### 4.5 Trademarks and content

- [ ] Use “GitHub” only to refer accurately to GitHub's platform (nominative use).
- [ ] Do not use the GitHub logo in a way that implies endorsement.
- [ ] Keep the “not affiliated with GitHub, Inc.” disclosure visible.
- [ ] Confirm the license for the code and any assets.
- [ ] Confirm that repository metadata displayed by the app is public and used consistently with GitHub's API terms.
- [ ] Do not copy third-party legal text without checking its license and fit.

## 5. Product guardrails and their legal relevance

| Guardrail                  | Implementation                                                      | Legal/policy relevance                                 |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Human action only          | No starring endpoint runs without a user request; no cron job stars | Avoids the clearest “automated starring” prohibition   |
| No purchase or sale        | Credits cannot be bought, sold, or transferred; no checkout         | Reduces secondary-market and consumer-financial risk   |
| One active repository      | Partial unique index and server checks                              | Limits scale and coordinated promotion                 |
| Outgoing daily cap         | User setting capped at 20; UTC-day count                            | Limits bulk activity and reciprocity pressure          |
| Inbound per-repo cap       | Default 8 per UTC day                                               | Limits rank manipulation and queue flooding            |
| Duplicate protection       | Unique `(giver_id, repository_id)` index                            | Prevents repeated credit extraction                    |
| Eligibility checks         | Public, owned, non-fork, non-archived, description, recent activity | Reduces spam and misleading listings                   |
| Verification               | GitHub `GET /user/starred/{owner}/{repo}` with the giver's token    | Detects missing stars and reverses credits             |
| Explicit policy acceptance | `policyAcceptedAt` and version stored                               | Creates an auditable consent record                    |
| Risk disclosure            | Landing page, onboarding, Trust Center, legal pages                 | Reduces “we didn't know” and supports informed consent |
| Reports and suspension     | Report table, operator checks, status field                         | Provides an enforcement path                           |
| Token encryption           | AES-256-GCM, separate key, no token returned to browser             | Reduces credential risk                                |
| Self-service export/delete | Account API and Settings UI                                         | Supports access and erasure rights                     |

These controls reduce risk. They do not establish that GitHub permits the exchange.

## 6. Data inventory summary

| Data                                                    | Source              | Purpose                                    | Retention                                         |
| ------------------------------------------------------- | ------------------- | ------------------------------------------ | ------------------------------------------------- |
| GitHub ID, login, name, avatar, bio, profile URL, email | GitHub OAuth/API    | Identity, profile, contact                 | While account exists                              |
| OAuth/PAT token, refresh token, scopes, expiry, hint    | User authorization  | Star, verify, unstar, list owned repos     | While connection exists; deleted with account     |
| Repository public metadata                              | GitHub API          | Queue, eligibility, display                | While repository/account exists                   |
| Star records and credit ledger                          | User actions        | Exchange accounting, reversal, audit       | While account exists; backups may persist briefly |
| Activities                                              | User/system actions | Audit trail and UI                         | While account exists                              |
| Sessions, IP hash, user-agent, rate limits              | Requests            | Authentication, security, abuse prevention | Session expiry/short rate-limit windows           |
| Reports                                                 | User submissions    | Moderation and enforcement                 | While needed; deleted with account                |

The public privacy policy is the authoritative description. If the implementation changes, update both the policy and this document.

## 7. Risk register

| Risk                                             | Likelihood  | Impact | Mitigation                                                              | Residual risk                      |
| ------------------------------------------------ | ----------- | ------ | ----------------------------------------------------------------------- | ---------------------------------- |
| GitHub treats credits as incentivized engagement | Medium–high | High   | Explicit disclosure, no automation, no cash, caps, ability to shut down | Remains material                   |
| GitHub removes stars                             | Medium      | Medium | Verification reverses credits; no growth promises                       | Users lose stars and trust         |
| Account suspension for participants              | Medium      | High   | Disclosure and consent; no guarantee                                    | Operator cannot prevent            |
| Bought/sold accounts or automation               | Medium      | Medium | Reports, rate limits, fingerprinting, suspension, credential revocation | Detection is imperfect             |
| Token compromise                                 | Low–medium  | High   | AES-256-GCM, secret isolation, HTTPS, least-privilege scopes            | Host compromise remains possible   |
| Privacy-law noncompliance                        | Medium      | High   | Data inventory, rights, DPAs, counsel review                            | Depends on operator                |
| Consumer-law issue with liability terms          | Medium      | Medium | Counsel review; no paid service                                         | Depends on jurisdiction            |
| Trademark confusion                              | Low         | Medium | Nominative use and disclaimer                                           | Depends on presentation            |
| Availability incident                            | Medium      | Medium | Health checks, backups, provider SLAs                                   | Not a guarantee                    |
| Operator disappears                              | Low–medium  | High   | Export/delete, documented shutdown, source-available code               | Users still depend on the operator |

## 8. Launch gate

Do not open registration publicly until all of the following are true:

1. Every placeholder is replaced.
2. Counsel has reviewed the terms, privacy policy, and acceptable-use rules.
3. The operator has independently read the current GitHub Acceptable Use Policies and Terms of Service.
4. The operator accepts the residual GitHub policy risk in writing.
5. `DEMO_MODE` and `SEED_DEMO_DATA` are false.
6. Secrets are unique and stored outside the repository.
7. The OAuth callback, HTTPS origin, cron, health check, and backup process are verified.
8. A monitored abuse/report contact exists.
9. A shutdown and data-export plan exists.
10. The public UI does not claim GitHub approval or guaranteed growth.

If any item is unresolved, keep the deployment private or do not launch.

## 9. Review cadence

- Re-read GitHub's Acceptable Use Policies and Terms before launch and at least quarterly.
- Re-review the privacy policy when data sources, providers, or retention change.
- Re-review the terms when the credit model, pricing, or jurisdiction changes.
- Re-run the security and dependency checks after major upgrades.
- Record decisions and dates in the repository so future maintainers know why the model was chosen.

## 10. Official references

- GitHub Acceptable Use Policies: <https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies>
- GitHub Terms of Service: <https://docs.github.com/en/site-policy/github-terms/github-terms-of-service>
- GitHub Community Guidelines: <https://docs.github.com/en/site-policy/github-terms/github-community-guidelines>
- GitHub Privacy Statement: <https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement>
- GitHub REST API — starring: <https://docs.github.com/en/rest/activity/starring>
- GitHub personal access tokens: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens>
- GitHub OAuth apps: <https://docs.github.com/en/apps/oauth-apps>

Policy text and links can change. Verify them at the time of launch.
