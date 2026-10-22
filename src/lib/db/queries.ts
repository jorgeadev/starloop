import { and, count, desc, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import { MAX_INBOUND_PER_REPO_PER_DAY } from "@/lib/constants";
import { startOfUtcDay } from "@/lib/utils";
import { client, db } from "./client";
import { ensureDatabase } from "./migrate";
import {
	activities,
	creditLedger,
	exchangeStars,
	repositories,
	users,
	type Repository,
} from "./schema";

export type QueueRepository = {
	id: string;
	fullName: string;
	owner: string;
	name: string;
	description: string | null;
	language: string | null;
	stars: number;
	forks: number;
	topics: string;
	avatarUrl: string | null;
	ownerLogin: string;
	ownerName: string | null;
	ownerAvatarUrl: string | null;
	ownerCredits: number;
	boundAt: number;
};

export type QueueOptions = {
	userId?: string;
	limit?: number;
	offset?: number;
	language?: string;
	search?: string;
	sort?: "for-you" | "newest" | "top" | "credits";
};

export async function getActiveRepository(userId: string): Promise<Repository | null> {
	await ensureDatabase();
	const rows = await db
		.select()
		.from(repositories)
		.where(and(eq(repositories.userId, userId), eq(repositories.isActive, true)))
		.limit(1);
	return rows[0] ?? null;
}

export async function getUserRepositories(userId: string): Promise<Repository[]> {
	await ensureDatabase();
	return db
		.select()
		.from(repositories)
		.where(eq(repositories.userId, userId))
		.orderBy(desc(repositories.isActive), desc(repositories.boundAt));
}

export async function getRepositoryById(id: string): Promise<Repository | null> {
	await ensureDatabase();
	const rows = await db.select().from(repositories).where(eq(repositories.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function getRepositoryWithOwner(id: string) {
	await ensureDatabase();
	const rows = await db
		.select({
			repository: repositories,
			ownerCredits: users.credits,
			ownerStatus: users.status,
			ownerPaused: users.pausePromotion,
			ownerLogin: users.login,
		})
		.from(repositories)
		.innerJoin(users, eq(repositories.userId, users.id))
		.where(eq(repositories.id, id))
		.limit(1);
	return rows[0] ?? null;
}

export type ActivityRow = {
	id: string;
	type: string;
	title: string;
	detail: string | null;
	repoFullName: string | null;
	createdAt: number;
	actorLogin: string | null;
	actorName: string | null;
	actorAvatarUrl: string | null;
};

export async function getRecentActivities(userId: string, limit = 8): Promise<ActivityRow[]> {
	await ensureDatabase();
	return db
		.select({
			id: activities.id,
			type: activities.type,
			title: activities.title,
			detail: activities.detail,
			repoFullName: activities.repoFullName,
			createdAt: activities.createdAt,
			actorLogin: users.login,
			actorName: users.name,
			actorAvatarUrl: users.avatarUrl,
		})
		.from(activities)
		.leftJoin(users, eq(activities.actorId, users.id))
		.where(eq(activities.userId, userId))
		.orderBy(desc(activities.createdAt))
		.limit(limit);
}

export async function getIncomingStars(userId: string, limit = 6) {
	await ensureDatabase();
	return db
		.select({
			id: exchangeStars.id,
			createdAt: exchangeStars.createdAt,
			status: exchangeStars.status,
			lastCheckedAt: exchangeStars.lastCheckedAt,
			repoFullName: repositories.fullName,
			login: users.login,
			name: users.name,
			avatarUrl: users.avatarUrl,
		})
		.from(exchangeStars)
		.innerJoin(users, eq(exchangeStars.giverId, users.id))
		.innerJoin(repositories, eq(exchangeStars.repositoryId, repositories.id))
		.where(and(eq(exchangeStars.ownerId, userId), eq(exchangeStars.status, "confirmed")))
		.orderBy(desc(exchangeStars.createdAt))
		.limit(limit);
}

export async function getLedger(userId: string, limit = 30) {
	await ensureDatabase();
	return db
		.select()
		.from(creditLedger)
		.where(eq(creditLedger.userId, userId))
		.orderBy(desc(creditLedger.createdAt))
		.limit(limit);
}

export async function getGivenStars(userId: string, limit = 30) {
	await ensureDatabase();
	return db
		.select({
			id: exchangeStars.id,
			status: exchangeStars.status,
			createdAt: exchangeStars.createdAt,
			lastCheckedAt: exchangeStars.lastCheckedAt,
			repoId: repositories.id,
			fullName: repositories.fullName,
			description: repositories.description,
			language: repositories.language,
			stars: repositories.stars,
			ownerLogin: users.login,
			ownerName: users.name,
			ownerAvatarUrl: users.avatarUrl,
		})
		.from(exchangeStars)
		.innerJoin(repositories, eq(exchangeStars.repositoryId, repositories.id))
		.innerJoin(users, eq(repositories.userId, users.id))
		.where(and(eq(exchangeStars.giverId, userId), eq(exchangeStars.status, "confirmed")))
		.orderBy(desc(exchangeStars.createdAt))
		.limit(limit);
}

export async function getDashboardStats(userId: string) {
	await ensureDatabase();
	const dayStart = startOfUtcDay();
	const [givenToday, receivedToday, verifiedCount, dueCount, activeRepoCount] = await Promise.all([
		db
			.select({ value: count() })
			.from(exchangeStars)
			.where(
				and(
					eq(exchangeStars.giverId, userId),
					eq(exchangeStars.status, "confirmed"),
					gte(exchangeStars.createdAt, dayStart),
				),
			),
		db
			.select({ value: count() })
			.from(exchangeStars)
			.where(
				and(
					eq(exchangeStars.ownerId, userId),
					eq(exchangeStars.status, "confirmed"),
					gte(exchangeStars.createdAt, dayStart),
				),
			),
		db
			.select({ value: count() })
			.from(exchangeStars)
			.where(and(eq(exchangeStars.giverId, userId), eq(exchangeStars.status, "confirmed"))),
		db
			.select({ value: count() })
			.from(exchangeStars)
			.where(
				and(
					eq(exchangeStars.giverId, userId),
					eq(exchangeStars.status, "confirmed"),
					or(
						isNull(exchangeStars.lastCheckedAt),
						lt(exchangeStars.lastCheckedAt, Date.now() - 7 * 86_400_000),
					),
				),
			),
		db
			.select({ value: count() })
			.from(repositories)
			.where(and(eq(repositories.userId, userId), eq(repositories.isActive, true))),
	]);

	return {
		givenToday: Number(givenToday[0]?.value ?? 0),
		receivedToday: Number(receivedToday[0]?.value ?? 0),
		verifiedGiven: Number(verifiedCount[0]?.value ?? 0),
		verificationDue: Number(dueCount[0]?.value ?? 0),
		activeRepositories: Number(activeRepoCount[0]?.value ?? 0),
	};
}

export async function getWeeklyRhythm(userId: string) {
	await ensureDatabase();
	const since = startOfUtcDay() - 6 * 86_400_000;
	const rows = await db
		.select({
			createdAt: exchangeStars.createdAt,
			giverId: exchangeStars.giverId,
			ownerId: exchangeStars.ownerId,
		})
		.from(exchangeStars)
		.where(
			and(
				eq(exchangeStars.status, "confirmed"),
				gte(exchangeStars.createdAt, since),
				or(eq(exchangeStars.giverId, userId), eq(exchangeStars.ownerId, userId)),
			),
		);

	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(since + index * 86_400_000);
		return {
			date,
			label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
			given: 0,
			received: 0,
		};
	});

	for (const row of rows) {
		const index = Math.floor((row.createdAt - since) / 86_400_000);
		const day = days[index];
		if (!day) continue;
		if (row.giverId === userId) day.given += 1;
		if (row.ownerId === userId) day.received += 1;
	}

	return days;
}

const queueSelect = `
	r.id,
	r.full_name AS "fullName",
	r.owner,
	r.name,
	r.description,
	r.language,
	r.stars,
	r.forks,
	r.topics,
	r.avatar_url AS "avatarUrl",
	u.login AS "ownerLogin",
	u.name AS "ownerName",
	u.avatar_url AS "ownerAvatarUrl",
	u.credits AS "ownerCredits",
	r.bound_at AS "boundAt"
`;

const queueFrom = `
	FROM repositories r
	INNER JOIN users u ON u.id = r.user_id
	WHERE r.is_active = true
		AND r.status = 'active'
		AND r.is_private = false
		AND r.is_archived = false
		AND u.status = 'active'
		AND u.pause_promotion = false
		AND u.credits > 0
		AND ($1::text IS NULL OR r.user_id <> $1)
		AND NOT EXISTS (
			SELECT 1 FROM exchange_stars xs
			WHERE xs.giver_id = $1 AND xs.repository_id = r.id AND xs.status = 'confirmed'
		)
		AND (
			SELECT count(*) FROM exchange_stars inbound
			WHERE inbound.repository_id = r.id AND inbound.created_at >= $2
		) < $3
`;

export async function getQueue(options: QueueOptions = {}): Promise<{
	items: QueueRepository[];
	total: number;
}> {
	await ensureDatabase();
	const limit = Math.min(Math.max(options.limit ?? 8, 1), 30);
	const offset = Math.max(options.offset ?? 0, 0);
	const userId = options.userId ?? null;
	const dayStart = startOfUtcDay();
	const search = options.search?.trim() ? `%${options.search.trim()}%` : null;
	const language = options.language?.trim() || null;

	const params: Array<string | number | null> = [
		userId,
		dayStart,
		MAX_INBOUND_PER_REPO_PER_DAY,
		search,
		language,
	];
	const filters = `
		AND ($4::text IS NULL OR r.full_name ILIKE $4 OR r.description ILIKE $4)
		AND ($5::text IS NULL OR r.language = $5)
	`;
	const seed = `${new Date(dayStart).toISOString().slice(0, 10)}-${offset}-${language ?? "all"}-${
		search ?? "all"
	}`;

	const sort = options.sort ?? "balanced";
	const queryParams: Array<string | number | null> = [...params];
	const order = (() => {
		switch (sort) {
			case "newest":
				return 'q."boundAt" DESC';
			case "top":
				return 'q.stars DESC, q."boundAt" DESC';
			case "credits":
				return 'q."ownerCredits" DESC, q."boundAt" DESC';
			default:
				queryParams.push(seed);
				return `md5(q.id || $${queryParams.length}::text)`;
		}
	})();
	const limitParam = `$${queryParams.length + 1}`;
	const offsetParam = `$${queryParams.length + 2}`;
	queryParams.push(limit, offset);

	const sqlQuery = `
		WITH eligible AS (
			SELECT DISTINCT ON (r.user_id) ${queueSelect}
			${queueFrom}
			${filters}
			ORDER BY r.user_id, r.bound_at DESC
		)
		SELECT * FROM eligible q
		ORDER BY ${order}
		LIMIT ${limitParam} OFFSET ${offsetParam}
	`;

	const countQuery = `
		SELECT count(*)::int AS total FROM (
			SELECT DISTINCT ON (r.user_id) r.id
			${queueFrom}
			${filters}
			ORDER BY r.user_id, r.bound_at DESC
		) AS eligible
	`;

	const [items, totalRows] = await Promise.all([
		client.unsafe<QueueRepository[]>(sqlQuery, queryParams),
		client.unsafe<{ total: number }[]>(countQuery, params),
	]);

	return {
		items: items.map((item) => ({
			...item,
			stars: Number(item.stars),
			forks: Number(item.forks),
			ownerCredits: Number(item.ownerCredits),
			boundAt: Number(item.boundAt),
		})),
		total: Number(totalRows[0]?.total ?? 0),
	};
}

export async function getQueueFacets(): Promise<string[]> {
	await ensureDatabase();
	const rows = await client.unsafe<{ language: string }[]>(`
		SELECT DISTINCT r.language
		FROM repositories r
		INNER JOIN users u ON u.id = r.user_id
		WHERE r.is_active = true AND r.status = 'active' AND u.credits > 0 AND r.language IS NOT NULL
		ORDER BY r.language
		LIMIT 24
	`);
	return rows.map((row) => row.language);
}

export async function getGivenToday(userId: string): Promise<number> {
	await ensureDatabase();
	const rows = await db
		.select({ value: count() })
		.from(exchangeStars)
		.where(
			and(
				eq(exchangeStars.giverId, userId),
				eq(exchangeStars.status, "confirmed"),
				gte(exchangeStars.createdAt, startOfUtcDay()),
			),
		);
	return Number(rows[0]?.value ?? 0);
}

export async function getCommunityStats() {
	await ensureDatabase();
	const [userRows, repoRows, starRows] = await Promise.all([
		db.select({ value: count() }).from(users).where(eq(users.status, "active")),
		db
			.select({ value: count() })
			.from(repositories)
			.where(and(eq(repositories.isActive, true), eq(repositories.status, "active"))),
		db.select({ value: count() }).from(exchangeStars).where(eq(exchangeStars.status, "confirmed")),
	]);
	return {
		members: Number(userRows[0]?.value ?? 0),
		repositories: Number(repoRows[0]?.value ?? 0),
		starsExchanged: Number(starRows[0]?.value ?? 0),
	};
}

export async function getPublicQueue(limit = 4) {
	const { items } = await getQueue({ limit, sort: "top" });
	return items;
}

export async function getVerificationCandidates(userId: string, limit = 20) {
	await ensureDatabase();
	return db
		.select({
			id: exchangeStars.id,
			repositoryId: exchangeStars.repositoryId,
			fullName: repositories.fullName,
			createdAt: exchangeStars.createdAt,
		})
		.from(exchangeStars)
		.innerJoin(repositories, eq(exchangeStars.repositoryId, repositories.id))
		.where(
			and(
				eq(exchangeStars.giverId, userId),
				eq(exchangeStars.status, "confirmed"),
				or(
					isNull(exchangeStars.lastCheckedAt),
					lt(exchangeStars.lastCheckedAt, Date.now() - 24 * 3_600_000),
				),
			),
		)
		.orderBy(sql`${exchangeStars.lastCheckedAt} ASC NULLS FIRST`)
		.limit(limit);
}

export async function getActiveRepoSyncInfo(userId: string) {
	await ensureDatabase();
	const rows = await db
		.select({
			id: repositories.id,
			fullName: repositories.fullName,
			stars: repositories.stars,
			forks: repositories.forks,
			syncedAt: repositories.syncedAt,
		})
		.from(repositories)
		.where(and(eq(repositories.userId, userId), eq(repositories.isActive, true)))
		.limit(1);
	return rows[0] ?? null;
}

export async function getTodayInboundForRepo(repoId: string) {
	await ensureDatabase();
	const rows = await db
		.select({ value: count() })
		.from(exchangeStars)
		.where(
			and(
				eq(exchangeStars.repositoryId, repoId),
				eq(exchangeStars.status, "confirmed"),
				gte(exchangeStars.createdAt, startOfUtcDay()),
			),
		);
	return Number(rows[0]?.value ?? 0);
}

export async function getDailyStarActivity(userId: string) {
	await ensureDatabase();
	const rows = await db
		.select({
			day: sql<string>`to_char(to_timestamp(${exchangeStars.createdAt} / 1000.0), 'YYYY-MM-DD')`,
			direction: sql<string>`CASE WHEN ${exchangeStars.giverId} = ${userId} THEN 'given' ELSE 'received' END`,
			value: count(),
		})
		.from(exchangeStars)
		.where(
			and(
				eq(exchangeStars.status, "confirmed"),
				gte(exchangeStars.createdAt, Date.now() - 30 * 86_400_000),
				or(eq(exchangeStars.giverId, userId), eq(exchangeStars.ownerId, userId)),
			),
		)
		.groupBy(
			sql`to_char(to_timestamp(${exchangeStars.createdAt} / 1000.0), 'YYYY-MM-DD')`,
			sql`CASE WHEN ${exchangeStars.giverId} = ${userId} THEN 'given' ELSE 'received' END`,
		)
		.orderBy(sql`1`);
	return rows;
}

export async function getUserByLogin(login: string) {
	await ensureDatabase();
	const rows = await db
		.select()
		.from(users)
		.where(sql`lower(${users.login}) = lower(${login})`)
		.limit(1);
	return rows[0] ?? null;
}
