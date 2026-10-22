import {
	bigint,
	boolean,
	check,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Users are GitHub identities. We store the minimum needed to render the
 * product and never store passwords, OAuth codes or raw tokens.
 */
export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		githubId: bigint("github_id", { mode: "number" }).notNull(),
		login: text("login").notNull(),
		name: text("name"),
		email: text("email"),
		avatarUrl: text("avatar_url"),
		bio: text("bio"),
		profileUrl: text("profile_url"),
		credits: integer("credits").notNull().default(3),
		starsGiven: integer("stars_given").notNull().default(0),
		starsReceived: integer("stars_received").notNull().default(0),
		dailyStarLimit: integer("daily_star_limit").notNull().default(5),
		pausePromotion: boolean("pause_promotion").notNull().default(false),
		policyVersion: text("policy_version"),
		policyAcceptedAt: bigint("policy_accepted_at", { mode: "number" }),
		onboardingCompletedAt: bigint("onboarding_completed_at", { mode: "number" }),
		isDemo: boolean("is_demo").notNull().default(false),
		status: text("status").notNull().default("active"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
		lastSeenAt: bigint("last_seen_at", { mode: "number" }),
	},
	(table) => [
		uniqueIndex("users_github_id_unique").on(table.githubId),
		uniqueIndex("users_login_lower_unique").on(sql`lower(${table.login})`),
		index("users_credits_idx").on(table.credits),
		check("users_credits_non_negative", sql`${table.credits} >= 0`),
	],
);

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
		lastSeenAt: bigint("last_seen_at", { mode: "number" }).notNull(),
		ipHash: text("ip_hash"),
		userAgent: text("user_agent"),
	},
	(table) => [
		index("sessions_user_idx").on(table.userId),
		index("sessions_expires_idx").on(table.expiresAt),
	],
);

/** One active GitHub credential per account: OAuth, classic PAT or fine-grained PAT. */
export const connections = pgTable(
	"connections",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		kind: text("kind").notNull(),
		tokenEnc: text("token_enc").notNull(),
		refreshEnc: text("refresh_enc"),
		tokenHint: text("token_hint").notNull(),
		scopes: text("scopes").notNull().default(""),
		tokenExpiresAt: bigint("token_expires_at", { mode: "number" }),
		needsReauth: boolean("needs_reauth").notNull().default(false),
		lastValidatedAt: bigint("last_validated_at", { mode: "number" }),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
	},
	(table) => [uniqueIndex("connections_user_unique").on(table.userId)],
);

export const repositories = pgTable(
	"repositories",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		githubId: bigint("github_id", { mode: "number" }).notNull(),
		fullName: text("full_name").notNull(),
		owner: text("owner").notNull(),
		name: text("name").notNull(),
		description: text("description"),
		homepage: text("homepage"),
		language: text("language"),
		stars: integer("stars").notNull().default(0),
		forks: integer("forks").notNull().default(0),
		topics: text("topics").notNull().default("[]"),
		avatarUrl: text("avatar_url"),
		isPrivate: boolean("is_private").notNull().default(false),
		isFork: boolean("is_fork").notNull().default(false),
		isArchived: boolean("is_archived").notNull().default(false),
		isActive: boolean("is_active").notNull().default(false),
		status: text("status").notNull().default("active"),
		boundAt: bigint("bound_at", { mode: "number" }).notNull(),
		pushedAt: bigint("pushed_at", { mode: "number" }),
		syncedAt: bigint("synced_at", { mode: "number" }),
	},
	(table) => [
		uniqueIndex("repositories_user_github_unique").on(table.userId, table.githubId),
		uniqueIndex("repositories_full_name_lower_unique").on(sql`lower(${table.fullName})`),
		index("repositories_owner_idx").on(table.owner),
		index("repositories_active_idx").on(table.userId, table.isActive),
		index("repositories_queue_idx").on(table.isActive, table.status),
	],
);

/** A star actually written to GitHub, plus the credit it moved. */
export const exchangeStars = pgTable(
	"exchange_stars",
	{
		id: text("id").primaryKey(),
		giverId: text("giver_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		repositoryId: text("repository_id")
			.notNull()
			.references(() => repositories.id, { onDelete: "cascade" }),
		ownerId: text("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("confirmed"),
		creditTransferred: integer("credit_transferred").notNull().default(1),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
		verifiedAt: bigint("verified_at", { mode: "number" }),
		lastCheckedAt: bigint("last_checked_at", { mode: "number" }),
		revokedAt: bigint("revoked_at", { mode: "number" }),
	},
	(table) => [
		uniqueIndex("exchange_stars_giver_repo_unique").on(table.giverId, table.repositoryId),
		index("exchange_stars_owner_idx").on(table.ownerId, table.status),
		index("exchange_stars_giver_idx").on(table.giverId, table.status),
		index("exchange_stars_created_idx").on(table.createdAt),
	],
);

export const creditLedger = pgTable(
	"credit_ledger",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		delta: integer("delta").notNull(),
		balanceAfter: integer("balance_after").notNull(),
		reason: text("reason").notNull(),
		detail: text("detail"),
		refId: text("ref_id"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
	},
	(table) => [index("credit_ledger_user_idx").on(table.userId, table.createdAt)],
);

export const activities = pgTable(
	"activities",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
		type: text("type").notNull(),
		title: text("title").notNull(),
		detail: text("detail"),
		repoFullName: text("repo_full_name"),
		metadata: text("metadata"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
	},
	(table) => [index("activities_user_idx").on(table.userId, table.createdAt)],
);

export const reports = pgTable(
	"reports",
	{
		id: text("id").primaryKey(),
		reporterId: text("reporter_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		repoId: text("repo_id")
			.notNull()
			.references(() => repositories.id, { onDelete: "cascade" }),
		reason: text("reason").notNull(),
		details: text("details"),
		status: text("status").notNull().default("open"),
		createdAt: bigint("created_at", { mode: "number" }).notNull(),
	},
	(table) => [index("reports_status_idx").on(table.status, table.createdAt)],
);

export const rateLimits = pgTable(
	"rate_limits",
	{
		key: text("key").notNull(),
		windowStart: bigint("window_start", { mode: "number" }).notNull(),
		count: integer("count").notNull().default(0),
		expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.key, table.windowStart] }),
		index("rate_limits_expires_idx").on(table.expiresAt),
	],
);

export const appMeta = pgTable("app_meta", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Repository = typeof repositories.$inferSelect;
export type ExchangeStar = typeof exchangeStars.$inferSelect;
export type LedgerEntry = typeof creditLedger.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Connection = typeof connections.$inferSelect;
