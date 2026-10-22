import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import { verifyGivenStars } from "@/lib/exchange";
import { guardMutation, jsonError, ok, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		const limit = await rateLimit(`verify:${session.user.id}`, 6, 60 * 60_000);
		if (!limit.ok) {
			return jsonError(
				429,
				"Verification runs at most six times an hour. Try again later.",
				"rate_limited",
			);
		}

		const demo = session.user.isDemo && process.env.DEMO_MODE === "true";

		try {
			const result = await verifyGivenStars(session.user.id, 20, {
				skipGitHub: demo,
			});

			if (result.checked > 0) {
				await db.insert(activities).values({
					id: crypto.randomUUID(),
					userId: session.user.id,
					actorId: null,
					type: "verification",
					title: `Verified ${result.checked} ${result.checked === 1 ? "star" : "stars"}`,
					detail:
						result.revoked > 0
							? `${result.revoked} ${result.revoked === 1 ? "star was" : "stars were"} no longer present and ${result.revoked === 1 ? "was" : "were"} reversed.`
							: "Every credited star is still present on GitHub.",
					createdAt: Date.now(),
				});
			}

			return ok({ ...result, demo });
		} catch (error) {
			rethrowApi(error);
		}
	});
}
