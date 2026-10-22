import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { unstarFromExchange } from "@/lib/exchange";
import { guardMutation, jsonError, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { unstarSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		const limit = await rateLimit(`unstar:${session.user.id}`, 10, 60_000);
		if (!limit.ok) {
			return jsonError(429, "Slow down a little. Try again in a minute.", "rate_limited");
		}

		const body = await readJson(request, unstarSchema);
		const demo = session.user.isDemo && process.env.DEMO_MODE === "true";

		try {
			await unstarFromExchange(session.user.id, body.starId, { skipGitHub: demo });
			return ok({ withdrawn: true, demo });
		} catch (error) {
			rethrowApi(error);
		}
	});
}
