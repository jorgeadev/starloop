# Contributing to Starloop

Thanks for taking the time to improve the project. Starloop is small on purpose: the exchange rules, the audit trail, and the legal posture are part of the product, not an afterthought. Contributions that weaken those constraints will be declined even if they are technically elegant.

## Before you start

1. Read the [README](README.md), [LEGAL.md](LEGAL.md), and [SECURITY.md](SECURITY.md).
2. Open an issue for a substantial feature, schema change, or policy change. Explain the user problem and how it fits the exchange model.
3. Do not add features that automate starring, pay for stars or credits, create engagement rings, or obscure the GitHub policy risk.
4. Do not commit secrets, `.env.local`, real user data, or production database dumps.

## Development setup

External contributions are not accepted by default. Contact the repository owner first by [opening a Run request issue](../../issues/new?template=run-request.yml); the owner will provide the private environment template and setup guidance if appropriate.

```bash
pnpm install
pnpm dev:local
```

`pnpm dev:local` starts PGlite over TCP and runs Next.js with a local `DATABASE_URL`. Because the URL is local, it takes precedence over the Neon dev/prod targets. If you prefer Neon, set `DATABASE_DEV_URL` and run `pnpm dev`; production builds use `DATABASE_PROD_URL`.

The schema is bootstrapped idempotently on first request. For schema edits:

- Update `src/lib/db/schema.ts` and the matching bootstrap SQL in `src/lib/db/migrate.ts`.
- Run `pnpm db:generate` if you want a versioned migration artifact.
- Test against a fresh database, not only an existing one.
- Document any migration or data-backfill requirement in `docs/operations.md` or the pull request.

## Checks

Run the full local gate before opening a pull request:

```bash
pnpm check
pnpm build
```

`pnpm check` runs ESLint, strict TypeScript, and Vitest. The production build must pass with no warnings that indicate a real problem. Formatting:

```bash
pnpm format
pnpm format:check
```

## Code style

- TypeScript strict mode; avoid `any`, unsafe casts, and silent `catch` blocks unless the failure is genuinely best-effort and commented.
- Use the existing design tokens and components. Do not introduce a second color system or a generic component library.
- Server-only modules should import `server-only` where appropriate and must not leak secrets to client components.
- API routes should use `withApi`, `requireApiUser`, `guardMutation`, and the shared validation schemas.
- New state-changing routes must include origin/CSRF protection, rate limiting, validation, and safe error mapping.
- Keep database access parameterized. Do not interpolate user input into SQL.
- Prefer server components; use client components only for interaction.
- Keep text honest. Do not promise stars, growth, GitHub approval, or compliance.

### UI conventions

- Dark theme only, with the tokens in `src/app/globals.css`.
- Small type, restrained borders, narrow content columns, and low-chrome panels.
- Use `Button`, `Badge`, `Avatar`, `Notice`, `Panel`, and `PageHeader` before writing new primitives.
- Every new surface needs an empty state, a loading state where relevant, and a sensible mobile layout.
- Respect `prefers-reduced-motion`; do not add gratuitous animation.
- Accessibility: real buttons and links, visible focus, labels on inputs, `aria-*` where needed, and no color-only status.

## Tests

Add tests when you change:

- validation schemas or boundary values;
- formatting and display helpers;
- eligibility rules or credit math;
- security-sensitive parsing or origin/CSRF behavior;
- any bug that could recur.

Run a single test file:

```bash
pnpm vitest run tests/validation.test.ts
```

Tests live in `tests/` and use the `@/` alias. Do not require a live GitHub token or production database for unit tests. If a test needs a database, use a local PGlite instance and document the setup.

## Pull requests

A good pull request:

- explains the user problem and the chosen approach;
- calls out schema, security, privacy, or policy implications;
- includes screenshots for visual changes;
- includes tests for behavior changes;
- updates documentation when routes, environment variables, data flows, or rules change;
- keeps unrelated refactors out.

Use clear commit messages. Conventional Commits are welcome but not required. Do not rewrite shared history or force-push a branch others may be using.

## Reporting bugs

Use the repository issue tracker for non-sensitive bugs. Include:

- what you expected and what happened;
- steps to reproduce;
- environment (local PGlite or Neon, browser, Node version);
- console or server errors with secrets redacted.

Do **not** report a vulnerability in a public issue. Follow [SECURITY.md](SECURITY.md).

## Community

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Be direct about the work, generous with context, and careful with other people's time.

## License

This repository is all rights reserved. Do not submit code expecting it to be published, merged, or redistributed without a prior written agreement with the owner. See [LICENSE](LICENSE).
