import { sql } from "drizzle-orm";
import { db } from "./client";

/**
 * Idempotent schema bootstrap for Neon Postgres.
 *
 * For production, generate versioned SQL with `pnpm db:generate` and apply it
 * in your deploy pipeline. This bootstrap exists so a fresh clone (or a new
 * Neon branch) is usable with a single request.
 */
const statements = [
	`CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		github_id BIGINT NOT NULL,
		login TEXT NOT NULL,
		name TEXT,
		email TEXT,
		avatar_url TEXT,
		bio TEXT,
		profile_url TEXT,
		credits INTEGER NOT NULL DEFAULT 3,
		stars_given INTEGER NOT NULL DEFAULT 0,
		stars_received INTEGER NOT NULL DEFAULT 0,
		daily_star_limit INTEGER NOT NULL DEFAULT 5,
		pause_promotion BOOLEAN NOT NULL DEFAULT FALSE,
		policy_version TEXT,
		policy_accepted_at BIGINT,
		onboarding_completed_at BIGINT,
		is_demo BOOLEAN NOT NULL DEFAULT FALSE,
		status TEXT NOT NULL DEFAULT 'active',
		created_at BIGINT NOT NULL,
		updated_at BIGINT NOT NULL,
		last_seen_at BIGINT,
		CONSTRAINT users_credits_non_negative CHECK (credits >= 0)
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_unique ON users(github_id)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS users_login_lower_unique ON users(lower(login))`,
	`CREATE INDEX IF NOT EXISTS users_credits_idx ON users(credits)`,
	`CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		created_at BIGINT NOT NULL,
		expires_at BIGINT NOT NULL,
		last_seen_at BIGINT NOT NULL,
		ip_hash TEXT,
		user_agent TEXT
	)`,
	`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`,
	`CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at)`,
	`CREATE TABLE IF NOT EXISTS connections (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		kind TEXT NOT NULL,
		token_enc TEXT NOT NULL,
		refresh_enc TEXT,
		token_hint TEXT NOT NULL,
		scopes TEXT NOT NULL DEFAULT '',
		token_expires_at BIGINT,
		needs_reauth BOOLEAN NOT NULL DEFAULT FALSE,
		last_validated_at BIGINT,
		created_at BIGINT NOT NULL,
		updated_at BIGINT NOT NULL
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS connections_user_unique ON connections(user_id)`,
	`CREATE TABLE IF NOT EXISTS repositories (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		github_id BIGINT NOT NULL,
		full_name TEXT NOT NULL,
		owner TEXT NOT NULL,
		name TEXT NOT NULL,
		description TEXT,
		homepage TEXT,
		language TEXT,
		stars INTEGER NOT NULL DEFAULT 0,
		forks INTEGER NOT NULL DEFAULT 0,
		topics TEXT NOT NULL DEFAULT '[]',
		avatar_url TEXT,
		is_private BOOLEAN NOT NULL DEFAULT FALSE,
		is_fork BOOLEAN NOT NULL DEFAULT FALSE,
		is_archived BOOLEAN NOT NULL DEFAULT FALSE,
		is_active BOOLEAN NOT NULL DEFAULT FALSE,
		status TEXT NOT NULL DEFAULT 'active',
		bound_at BIGINT NOT NULL,
		pushed_at BIGINT,
		synced_at BIGINT
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS repositories_user_github_unique ON repositories(user_id, github_id)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS repositories_full_name_lower_unique ON repositories(lower(full_name))`,
	`CREATE UNIQUE INDEX IF NOT EXISTS repositories_one_active_per_user ON repositories(user_id) WHERE is_active`,
	`CREATE INDEX IF NOT EXISTS repositories_owner_idx ON repositories(owner)`,
	`CREATE INDEX IF NOT EXISTS repositories_active_idx ON repositories(user_id, is_active)`,
	`CREATE INDEX IF NOT EXISTS repositories_queue_idx ON repositories(is_active, status)`,
	`CREATE TABLE IF NOT EXISTS exchange_stars (
		id TEXT PRIMARY KEY,
		giver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		repository_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
		owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		status TEXT NOT NULL DEFAULT 'confirmed',
		credit_transferred INTEGER NOT NULL DEFAULT 1,
		created_at BIGINT NOT NULL,
		verified_at BIGINT,
		last_checked_at BIGINT,
		revoked_at BIGINT
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS exchange_stars_giver_repo_unique ON exchange_stars(giver_id, repository_id)`,
	`CREATE INDEX IF NOT EXISTS exchange_stars_owner_idx ON exchange_stars(owner_id, status)`,
	`CREATE INDEX IF NOT EXISTS exchange_stars_giver_idx ON exchange_stars(giver_id, status)`,
	`CREATE INDEX IF NOT EXISTS exchange_stars_created_idx ON exchange_stars(created_at)`,
	`CREATE TABLE IF NOT EXISTS credit_ledger (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		delta INTEGER NOT NULL,
		balance_after INTEGER NOT NULL,
		reason TEXT NOT NULL,
		detail TEXT,
		ref_id TEXT,
		created_at BIGINT NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS credit_ledger_user_idx ON credit_ledger(user_id, created_at)`,
	`CREATE TABLE IF NOT EXISTS activities (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
		type TEXT NOT NULL,
		title TEXT NOT NULL,
		detail TEXT,
		repo_full_name TEXT,
		metadata TEXT,
		created_at BIGINT NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS activities_user_idx ON activities(user_id, created_at)`,
	`CREATE TABLE IF NOT EXISTS reports (
		id TEXT PRIMARY KEY,
		reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
		reason TEXT NOT NULL,
		details TEXT,
		status TEXT NOT NULL DEFAULT 'open',
		created_at BIGINT NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status, created_at)`,
	`CREATE TABLE IF NOT EXISTS rate_limits (
		key TEXT NOT NULL,
		window_start BIGINT NOT NULL,
		count INTEGER NOT NULL DEFAULT 0,
		expires_at BIGINT NOT NULL,
		PRIMARY KEY (key, window_start)
	)`,
	`CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON rate_limits(expires_at)`,
	`CREATE TABLE IF NOT EXISTS app_meta (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL,
		updated_at BIGINT NOT NULL
	)`,
];

let initialization: Promise<void> | null = null;

export function ensureDatabase(): Promise<void> {
	if (!initialization) {
		initialization = (async () => {
			for (const statement of statements) {
				await db.execute(sql.raw(statement));
			}
			const { seedDemoData } = await import("./seed");
			await seedDemoData();
		})().catch((error) => {
			initialization = null;
			throw error;
		});
	}
	return initialization;
}
