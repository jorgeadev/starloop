import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { activities, reports, repositories, users } from "@/lib/db/schema";
import { guardMutation, jsonError, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { reportSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		const limit = await rateLimit(`report:${session.user.id}`, 5, 60 * 60_000);
		if (!limit.ok) {
			return jsonError(429, "You have sent several reports. Try again later.", "rate_limited");
		}

		const body = await readJson(request, reportSchema);
		const rows = await db
			.select({ repository: repositories, ownerId: users.id, ownerLogin: users.login })
			.from(repositories)
			.innerJoin(users, eq(repositories.userId, users.id))
			.where(eq(repositories.id, body.repositoryId))
			.limit(1);

		const row = rows[0];
		if (!row) return jsonError(404, "That repository was not found.", "not_found");
		if (row.ownerId === session.user.id) {
			return jsonError(400, "You cannot report your own repository.", "own_repository");
		}

		const now = Date.now();
		await db.transaction(async (tx) => {
			await tx.insert(reports).values({
				id: crypto.randomUUID(),
				reporterId: session.user.id,
				repoId: row.repository.id,
				reason: body.reason,
				details: body.details ?? null,
				status: "open",
				createdAt: now,
			});
			await tx.insert(activities).values([
				{
					id: crypto.randomUUID(),
					userId: session.user.id,
					actorId: null,
					type: "report",
					title: `Report sent for ${row.repository.fullName}`,
					detail: "A moderator will review it. Reports are private.",
					repoFullName: row.repository.fullName,
					createdAt: now,
				},
				{
					id: crypto.randomUUID(),
					userId: row.ownerId,
					actorId: null,
					type: "report",
					title: `A member reported ${row.repository.fullName}`,
					detail:
						"A moderator will review the repository. Reports do not remove stars automatically.",
					repoFullName: row.repository.fullName,
					createdAt: now,
				},
			]);
		});

		return ok({ reported: true });
	});
}
