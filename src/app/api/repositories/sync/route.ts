import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth/connections";
import { syncActiveRepository } from "@/lib/exchange";
import { guardMutation, jsonError, ok, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		if (session.user.isDemo) {
			return jsonError(400, "Demo data is already up to date.", "demo_mode");
		}

		const limit = await rateLimit(`sync:${session.user.id}`, 12, 60 * 60_000);
		if (!limit.ok) {
			return jsonError(429, "Too many sync requests. Try again later.", "rate_limited");
		}

		try {
			const { token } = await getAccessToken(session.user.id);
			const repository = await syncActiveRepository(session.user.id, token);
			if (!repository) {
				return jsonError(404, "Bind a repository before syncing.", "no_active_repository");
			}
			return ok({ repository: { id: repository.id, stars: repository.stars } });
		} catch (error) {
			rethrowApi(error);
		}
	});
}
