import { and, eq, inArray, sql } from "drizzle-orm";
import "server-only";
import { getAccessToken, markConnectionNeedsReauth } from "@/lib/auth/connections";
import { MAX_DAILY_STAR_LIMIT, MAX_INBOUND_PER_REPO_PER_DAY } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";
import {
	activities,
	creditLedger,
	exchangeStars,
	repositories,
	users,
	type Repository,
	type User,
} from "@/lib/db/schema";
import {
	GitHubError,
	getRepository,
	isRepositoryStarred,
	starRepository,
	unstarRepository,
} from "@/lib/github/client";
import { truncate } from "@/lib/utils";

import { evaluateStarEligibility } from "@/lib/exchange-rules";

export class ExchangeError extends Error {
	code: string;
	status: number;

	constructor(code: string, message: string, status = 400) {
		super(message);
		this.name = "ExchangeError";
		this.code = code;
		this.status = status;
	}
}

type StarActionOptions = {
	giver: User;
	repositoryId: string;
	skipGitHub?: boolean;
};

export type StarActionResult = {
	starId: string;
	verified: boolean;
	credits: number;
	ownerCredits: number;
	alreadyStarred?: boolean;
};

export async function giveStar({
	giver,
	repositoryId,
	skipGitHub = false,
}: StarActionOptions): Promise<StarActionResult> {
	await ensureDatabase();

	const rows = await db
		.select({ repository: repositories, owner: users })
		.from(repositories)
		.innerJoin(users, eq(repositories.userId, users.id))
		.where(eq(repositories.id, repositoryId))
		.limit(1);

	const row = rows[0];
	if (!row) throw new ExchangeError("not_found", "That repository no longer exists.", 404);

	const { repository, owner } = row;

	const [existing, givenRows, inboundRows] = await Promise.all([
		db
			.select({ id: exchangeStars.id })
			.from(exchangeStars)
			.where(and(eq(exchangeStars.giverId, giver.id), eq(exchangeStars.repositoryId, repositoryId)))
			.limit(1),
		db
			.select({ id: exchangeStars.id })
			.from(exchangeStars)
			.where(
				and(
					eq(exchangeStars.giverId, giver.id),
					eq(exchangeStars.status, "confirmed"),
					sql`${exchangeStars.createdAt} >= ${startOfUtcDay()}`,
				),
			),
		db
			.select({ id: exchangeStars.id })
			.from(exchangeStars)
			.where(
				and(
					eq(exchangeStars.repositoryId, repositoryId),
					eq(exchangeStars.status, "confirmed"),
					sql`${exchangeStars.createdAt} >= ${startOfUtcDay()}`,
				),
			),
	]);

	const eligibility = evaluateStarEligibility({
		giver,
		owner,
		repository,
		givenToday: givenRows.length,
		inboundToday: inboundRows.length,
		maxInboundPerDay: MAX_INBOUND_PER_REPO_PER_DAY,
		alreadyStarred: existing.length > 0,
	});

	if (!eligibility.ok) {
		throw new ExchangeError(
			eligibility.code,
			eligibility.message,
			eligibility.code === "already_starred" ? 409 : 422,
		);
	}

	if (!skipGitHub) {
		const { token } = await getAccessToken(giver.id).catch(() => {
			throw new ExchangeError(
				"no_connection",
				"Connect a GitHub token or OAuth account before giving a star.",
				401,
			);
		});

		try {
			await starRepository(token, repository.fullName);
		} catch (error) {
			if (error instanceof GitHubError) {
				if (error.code === "unauthorized") {
					await markConnectionNeedsReauth(giver.id);
					throw new ExchangeError(
						"github_rejected",
						"GitHub rejected the saved credential. Reconnect in Settings.",
						401,
					);
				}
				if (error.code === "rate_limited") {
					throw new ExchangeError("rate_limited", error.message, 429);
				}
				if (error.code === "forbidden") {
					const hint = error.acceptedPermissions
						? ` The token needs: ${error.acceptedPermissions}.`
						: "";
					throw new ExchangeError(
						"github_permissions",
						`GitHub refused the star. A fine-grained token needs "Starring: Read and write" and "Metadata: Read" for this repository.${hint}`,
						403,
					);
				}
				throw new ExchangeError("github_error", error.message, 502);
			}
			throw error;
		}
	}

	const now = Date.now();
	const starId = crypto.randomUUID();

	const result = await db.transaction(async (tx) => {
		const locked = await tx
			.select()
			.from(users)
			.where(inArray(users.id, [giver.id, owner.id]))
			.for("update");

		const giverRow = locked.find((entry) => entry.id === giver.id);
		const ownerRow = locked.find((entry) => entry.id === owner.id);
		if (!giverRow || !ownerRow) {
			throw new ExchangeError("not_found", "Account not found.", 404);
		}
		if (ownerRow.credits < 1) {
			throw new ExchangeError(
				"no_credits",
				"This project just ran out of credits. Pick another repository.",
				409,
			);
		}

		const [givenTodayRows, inboundTodayRows] = await Promise.all([
			tx
				.select({ id: exchangeStars.id })
				.from(exchangeStars)
				.where(
					and(
						eq(exchangeStars.giverId, giver.id),
						eq(exchangeStars.status, "confirmed"),
						sql`${exchangeStars.createdAt} >= ${startOfUtcDay()}`,
					),
				),
			tx
				.select({ id: exchangeStars.id })
				.from(exchangeStars)
				.where(
					and(
						eq(exchangeStars.repositoryId, repository.id),
						eq(exchangeStars.status, "confirmed"),
						sql`${exchangeStars.createdAt} >= ${startOfUtcDay()}`,
					),
				),
		]);

		if (givenTodayRows.length >= Math.min(giverRow.dailyStarLimit, MAX_DAILY_STAR_LIMIT)) {
			throw new ExchangeError(
				"daily_limit",
				"You reached your daily star limit. The limit keeps the exchange human-paced.",
				429,
			);
		}
		if (inboundTodayRows.length >= MAX_INBOUND_PER_REPO_PER_DAY) {
			throw new ExchangeError(
				"inbound_limit",
				"This repository reached its daily incoming-star cap. Try again tomorrow.",
				429,
			);
		}

		await tx.insert(exchangeStars).values({
			id: starId,
			giverId: giver.id,
			repositoryId: repository.id,
			ownerId: owner.id,
			status: "confirmed",
			creditTransferred: 1,
			createdAt: now,
			verifiedAt: now,
		});

		const giverCredits = giverRow.credits + 1;
		const ownerCredits = ownerRow.credits - 1;

		await tx
			.update(users)
			.set({
				credits: giverCredits,
				starsGiven: giverRow.starsGiven + 1,
				updatedAt: now,
				lastSeenAt: now,
			})
			.where(eq(users.id, giver.id));

		await tx
			.update(users)
			.set({
				credits: ownerCredits,
				starsReceived: ownerRow.starsReceived + 1,
				updatedAt: now,
			})
			.where(eq(users.id, owner.id));

		await tx.insert(creditLedger).values([
			{
				id: crypto.randomUUID(),
				userId: giver.id,
				delta: 1,
				balanceAfter: giverCredits,
				reason: "star_given",
				detail: `Starred ${repository.fullName}`,
				refId: starId,
				createdAt: now,
			},
			{
				id: crypto.randomUUID(),
				userId: owner.id,
				delta: -1,
				balanceAfter: ownerCredits,
				reason: "star_received",
				detail: `${giver.login} starred ${repository.fullName}`,
				refId: starId,
				createdAt: now,
			},
		]);

		await tx.insert(activities).values([
			{
				id: crypto.randomUUID(),
				userId: giver.id,
				actorId: giver.id,
				type: "star_given",
				title: `You starred ${repository.fullName}`,
				detail: "+1 credit added to your balance.",
				repoFullName: repository.fullName,
				createdAt: now,
			},
			{
				id: crypto.randomUUID(),
				userId: owner.id,
				actorId: giver.id,
				type: "star_received",
				title: `${giver.login} starred ${repository.fullName}`,
				detail: "1 credit used to fund the exchange.",
				repoFullName: repository.fullName,
				createdAt: now,
			},
		]);

		await tx
			.update(repositories)
			.set({ stars: sql`${repositories.stars} + 1` })
			.where(eq(repositories.id, repository.id));

		return { giverCredits, ownerCredits };
	});

	return {
		starId,
		verified: true,
		credits: result.giverCredits,
		ownerCredits: result.ownerCredits,
	};
}

export type VerificationResult = {
	checked: number;
	revoked: number;
	stillStarred: number;
	errors: number;
};

async function reverseStar(
	starId: string,
	giverId: string,
	ownerId: string,
	repoFullName: string,
	giverLogin: string,
	now: number,
) {
	await db.transaction(async (tx) => {
		const rows = await tx
			.select()
			.from(exchangeStars)
			.where(and(eq(exchangeStars.id, starId), eq(exchangeStars.status, "confirmed")))
			.for("update");
		const star = rows[0];
		if (!star) return;

		const locked = await tx
			.select()
			.from(users)
			.where(inArray(users.id, [giverId, ownerId]))
			.for("update");
		const giverRow = locked.find((entry) => entry.id === giverId);
		const ownerRow = locked.find((entry) => entry.id === ownerId);
		if (!giverRow || !ownerRow) return;

		const giverCredits = Math.max(0, giverRow.credits - 1);
		const ownerCredits = ownerRow.credits + 1;

		await tx
			.update(exchangeStars)
			.set({ status: "revoked", revokedAt: now, lastCheckedAt: now })
			.where(eq(exchangeStars.id, starId));

		await tx
			.update(users)
			.set({
				credits: giverCredits,
				starsGiven: Math.max(0, giverRow.starsGiven - 1),
				updatedAt: now,
			})
			.where(eq(users.id, giverId));

		await tx
			.update(users)
			.set({
				credits: ownerCredits,
				starsReceived: Math.max(0, ownerRow.starsReceived - 1),
				updatedAt: now,
			})
			.where(eq(users.id, ownerId));

		await tx.insert(creditLedger).values([
			{
				id: crypto.randomUUID(),
				userId: giverId,
				delta: -1,
				balanceAfter: giverCredits,
				reason: "star_reversed",
				detail: `Star removed from ${repoFullName}`,
				refId: starId,
				createdAt: now,
			},
			{
				id: crypto.randomUUID(),
				userId: ownerId,
				delta: 1,
				balanceAfter: ownerCredits,
				reason: "star_refunded",
				detail: `${giverLogin} removed their star from ${repoFullName}`,
				refId: starId,
				createdAt: now,
			},
		]);

		await tx.insert(activities).values([
			{
				id: crypto.randomUUID(),
				userId: giverId,
				actorId: null,
				type: "verification",
				title: `Star removed from ${repoFullName}`,
				detail: "GitHub no longer shows this star. One credit was reversed.",
				repoFullName,
				createdAt: now,
			},
			{
				id: crypto.randomUUID(),
				userId: ownerId,
				actorId: giverId,
				type: "verification",
				title: `${giverLogin} un-starred ${repoFullName}`,
				detail: "One credit was returned to your balance.",
				repoFullName,
				createdAt: now,
			},
		]);
	});
}

export async function verifyGivenStars(
	userId: string,
	limit = 20,
	options: { skipGitHub?: boolean; demoValid?: boolean } = {},
): Promise<VerificationResult> {
	await ensureDatabase();
	const { getVerificationCandidates } = await import("@/lib/db/queries");
	const candidates = await getVerificationCandidates(userId, Math.min(limit, 30));

	const result: VerificationResult = {
		checked: 0,
		revoked: 0,
		stillStarred: 0,
		errors: 0,
	};

	if (candidates.length === 0) return result;

	if (options.skipGitHub) {
		const now = Date.now();
		for (const candidate of candidates) {
			await db
				.update(exchangeStars)
				.set({ lastCheckedAt: now })
				.where(eq(exchangeStars.id, candidate.id));
			result.checked += 1;
			result.stillStarred += 1;
		}
		return result;
	}

	const { token } = await getAccessToken(userId);
	const giverRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	const giver = giverRows[0];
	if (!giver) throw new ExchangeError("not_found", "Account not found.", 404);

	for (const candidate of candidates) {
		try {
			const stillStarred = await isRepositoryStarred(token, candidate.fullName);
			const now = Date.now();
			result.checked += 1;
			if (stillStarred) {
				result.stillStarred += 1;
				await db
					.update(exchangeStars)
					.set({ lastCheckedAt: now })
					.where(eq(exchangeStars.id, candidate.id));
			} else {
				result.revoked += 1;
				const ownerRows = await db
					.select({ ownerId: exchangeStars.ownerId })
					.from(exchangeStars)
					.where(eq(exchangeStars.id, candidate.id))
					.limit(1);
				if (ownerRows[0]) {
					await reverseStar(
						candidate.id,
						userId,
						ownerRows[0].ownerId,
						candidate.fullName,
						giver.login,
						now,
					);
				}
			}
		} catch (error) {
			result.errors += 1;
			if (error instanceof GitHubError && error.code === "unauthorized") {
				await markConnectionNeedsReauth(userId);
				break;
			}
			if (error instanceof GitHubError && error.code === "rate_limited") break;
		}
	}

	return result;
}

export async function unstarFromExchange(
	userId: string,
	starId: string,
	options: { skipGitHub?: boolean } = {},
): Promise<void> {
	await ensureDatabase();
	const rows = await db
		.select({
			star: exchangeStars,
			repoFullName: repositories.fullName,
			giverLogin: users.login,
		})
		.from(exchangeStars)
		.innerJoin(repositories, eq(exchangeStars.repositoryId, repositories.id))
		.innerJoin(users, eq(exchangeStars.giverId, users.id))
		.where(and(eq(exchangeStars.id, starId), eq(exchangeStars.giverId, userId)))
		.limit(1);

	const row = rows[0];
	if (!row) throw new ExchangeError("not_found", "That credited star was not found.", 404);
	if (row.star.status !== "confirmed") {
		throw new ExchangeError("not_confirmed", "That star is already withdrawn.", 409);
	}

	if (!options.skipGitHub) {
		const { token } = await getAccessToken(userId);
		try {
			await unstarRepository(token, row.repoFullName);
		} catch (error) {
			if (error instanceof GitHubError && error.code === "not_found") {
				// GitHub already lost the star; reverse the credit below.
			} else if (error instanceof GitHubError && error.code === "unauthorized") {
				await markConnectionNeedsReauth(userId);
				throw new ExchangeError("reauth", "Reconnect GitHub in Settings.", 401);
			} else {
				throw new ExchangeError(
					"github_error",
					"GitHub could not remove the star. Try again in a moment.",
					502,
				);
			}
		}
	}

	await reverseStar(
		row.star.id,
		userId,
		row.star.ownerId,
		row.repoFullName,
		row.giverLogin,
		Date.now(),
	);
}

export async function syncActiveRepository(
	userId: string,
	token: string,
): Promise<Repository | null> {
	await ensureDatabase();
	const active = await db
		.select()
		.from(repositories)
		.where(and(eq(repositories.userId, userId), eq(repositories.isActive, true)))
		.limit(1);
	const repo = active[0];
	if (!repo) return null;

	const { data } = await getRepository(token, repo.fullName);
	await db
		.update(repositories)
		.set({
			stars: data.stargazers_count,
			forks: data.forks_count,
			description: truncate(data.description ?? repo.description ?? "", 500) || null,
			language: data.language,
			topics: JSON.stringify(data.topics ?? []),
			isArchived: data.archived,
			isPrivate: data.private,
			pushedAt: data.pushed_at ? Date.parse(data.pushed_at) : null,
			syncedAt: Date.now(),
		})
		.where(eq(repositories.id, repo.id));

	return { ...repo, stars: data.stargazers_count, syncedAt: Date.now() };
}

function startOfUtcDay() {
	const now = new Date();
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}
