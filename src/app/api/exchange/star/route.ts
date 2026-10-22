import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { giveStar } from "@/lib/exchange";
import { guardMutation, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { starActionSchema } from "@/lib/validation";
import { jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		const limit = await rateLimit(`star:${session.user.id}`, 20, 60_000);
		if (!limit.ok) {
			return jsonError(429, "Slow down a little. Try again in a minute.", "rate_limited");
		}

		const body = await readJson(request, starActionSchema);
		const demo = session.user.isDemo && process.env.DEMO_MODE === "true";

		try {
			const result = await giveStar({
				giver: session.user,
				repositoryId: body.repositoryId,
				skipGitHub: demo,
			});
			return ok({ ...result, demo });
		} catch (error) {
			rethrowApi(error);
		}
	});
}
