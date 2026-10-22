import { and, eq } from "drizzle-orm";
import "server-only";
import { db } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";
import { activities, repositories, users, type Repository, type User } from "@/lib/db/schema";
import { GitHubError, getRepository, type GitHubRepository } from "@/lib/github/client";
import { mapRepositoryForDatabase } from "@/lib/github/client";

const MIN_DESCRIPTION_LENGTH = 20;
const MIN_REPO_AGE_MS = 3 * 86_400_000;
const MAX_STALE_MS = 548 * 86_400_000;

export type BindingEvaluation = { ok: true } | { ok: false; reason: string };

export function evaluateRepositoryBinding(
	repo: Pick<
		GitHubRepository,
		"private" | "fork" | "archived" | "description" | "pushed_at" | "created_at" | "owner"
	>,
	user: Pick<User, "login">,
	now = Date.now(),
): BindingEvaluation {
	if (repo.private) return { ok: false, reason: "Only public repositories can be promoted." };
	if (repo.fork) return { ok: false, reason: "Forked repositories are not eligible." };
	if (repo.archived) return { ok: false, reason: "Archived repositories are not eligible." };
	if (repo.owner.login.toLowerCase() !== user.login.toLowerCase()) {
		return { ok: false, reason: "You can only bind repositories you own." };
	}
	if (!repo.description || repo.description.trim().length < MIN_DESCRIPTION_LENGTH) {
		return {
			ok: false,
			reason: "Add a description of at least 20 characters so people can evaluate the project.",
		};
	}
	const createdAt = Date.parse(repo.created_at);
	if (Number.isFinite(createdAt) && now - createdAt < MIN_REPO_AGE_MS) {
		return { ok: false, reason: "Repositories must be at least 3 days old." };
	}
	const pushedAt = repo.pushed_at ? Date.parse(repo.pushed_at) : null;
	if (pushedAt && now - pushedAt > MAX_STALE_MS) {
		return {
			ok: false,
			reason:
				"This project has not been updated in over 18 months. Give it some fresh momentum first.",
		};
	}
	return { ok: true };
}

export class BindingError extends Error {
	code: string;
	status: number;

	constructor(code: string, message: string, status = 422) {
		super(message);
		this.name = "BindingError";
		this.code = code;
		this.status = status;
	}
}

export async function bindRepository(input: {
	user: User;
	token: string;
	fullName?: string;
	githubId?: number;
}): Promise<Repository> {
	await ensureDatabase();
	const { user, token } = input;

	if (!input.fullName) {
		throw new BindingError("missing_repository", "Choose a repository from the list.", 400);
	}

	let remote: GitHubRepository;
	try {
		const result = await getRepository(token, input.fullName);
		remote = result.data;
	} catch (error) {
		if (error instanceof GitHubError) {
			if (error.code === "not_found") {
				throw new BindingError(
					"not_found",
					"The repository was not found or your token cannot read its metadata. Fine-grained tokens need Metadata: Read for the repository.",
					404,
				);
			}
			if (error.code === "unauthorized") {
				throw new BindingError("unauthorized", "GitHub rejected the token.", 401);
			}
			throw new BindingError("github_error", error.message, 502);
		}
		throw error;
	}

	const evaluation = evaluateRepositoryBinding(remote, user);
	if (!evaluation.ok) {
		throw new BindingError("ineligible", evaluation.reason);
	}

	const now = Date.now();
	const existingRows = await db
		.select()
		.from(repositories)
		.where(and(eq(repositories.userId, user.id), eq(repositories.githubId, remote.id)))
		.limit(1);
	const existing = existingRows[0];

	const id = existing?.id ?? crypto.randomUUID();

	await db.transaction(async (tx) => {
		await tx
			.update(repositories)
			.set({ isActive: false, status: "inactive" })
			.where(and(eq(repositories.userId, user.id), eq(repositories.isActive, true)));

		if (existing) {
			await tx
				.update(repositories)
				.set({
					...mapRepositoryForDatabase(remote),
					isActive: true,
					status: "active",
					boundAt: now,
				})
				.where(eq(repositories.id, existing.id));
		} else {
			await tx.insert(repositories).values({
				id,
				userId: user.id,
				...mapRepositoryForDatabase(remote),
				isActive: true,
				status: "active",
				boundAt: now,
			});
		}

		await tx
			.update(users)
			.set({ pausePromotion: false, updatedAt: now })
			.where(eq(users.id, user.id));

		await tx.insert(activities).values({
			id: crypto.randomUUID(),
			userId: user.id,
			actorId: null,
			type: "repo_bound",
			title: `${remote.full_name} is now your active repository`,
			detail: "One repository at a time keeps the exchange fair.",
			repoFullName: remote.full_name,
			createdAt: now,
		});
	});

	const saved = await db.select().from(repositories).where(eq(repositories.id, id)).limit(1);
	if (!saved[0]) throw new BindingError("save_failed", "Could not save the repository.", 500);
	return saved[0];
}

export async function deactivateActiveRepository(userId: string): Promise<void> {
	await ensureDatabase();
	const active = await db
		.select()
		.from(repositories)
		.where(and(eq(repositories.userId, userId), eq(repositories.isActive, true)))
		.limit(1);
	const repo = active[0];
	if (!repo) return;

	await db.transaction(async (tx) => {
		await tx
			.update(repositories)
			.set({ isActive: false, status: "paused" })
			.where(eq(repositories.id, repo.id));
		await tx.insert(activities).values({
			id: crypto.randomUUID(),
			userId,
			actorId: null,
			type: "repo_bound",
			title: `${repo.fullName} left the exchange`,
			detail: "Your credits and starred projects are unchanged.",
			repoFullName: repo.fullName,
			createdAt: Date.now(),
		});
	});
}
