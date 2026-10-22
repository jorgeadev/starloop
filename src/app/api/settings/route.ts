import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { activities, users } from "@/lib/db/schema";
import { guardMutation, jsonError, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { updateSettingsSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		const limit = await rateLimit(`settings:${session.user.id}`, 20, 60_000);
		if (!limit.ok) {
			return jsonError(429, "Too many setting changes. Try again shortly.", "rate_limited");
		}

		const body = await readJson(request, updateSettingsSchema);
		const now = Date.now();

		const updated = await db
			.update(users)
			.set({
				...(body.dailyStarLimit !== undefined ? { dailyStarLimit: body.dailyStarLimit } : {}),
				...(body.pausePromotion !== undefined ? { pausePromotion: body.pausePromotion } : {}),
				updatedAt: now,
			})
			.where(eq(users.id, session.user.id))
			.returning();

		const user = updated[0];
		if (!user) return jsonError(404, "Account not found.", "not_found");

		if (body.pausePromotion !== undefined) {
			await db.insert(activities).values({
				id: crypto.randomUUID(),
				userId: user.id,
				actorId: null,
				type: "repo_bound",
				title: body.pausePromotion ? "Promotion paused" : "Promotion resumed",
				detail: body.pausePromotion
					? "Your repository left the queue. Credits already received stay in your balance."
					: "Your active repository is back in the queue.",
				createdAt: now,
			});
		}

		return ok({
			settings: {
				dailyStarLimit: user.dailyStarLimit,
				pausePromotion: user.pausePromotion,
			},
		});
	});
}
