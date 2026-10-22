import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth/connections";
import { guardMutation, jsonError, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { bindRepository } from "@/lib/repositories";
import { bindRepositorySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		if (session.user.isDemo) {
			return jsonError(
				400,
				"Demo mode uses a pre-bound repository. Connect GitHub to bind your own.",
				"demo_mode",
			);
		}

		const limit = await rateLimit(`bind:${session.user.id}`, 10, 60 * 60_000);
		if (!limit.ok) {
			return jsonError(429, "Too many repository changes. Try again later.", "rate_limited");
		}

		const body = await readJson(request, bindRepositorySchema);

		try {
			const { token } = await getAccessToken(session.user.id);
			const repository = await bindRepository({
				user: session.user,
				token,
				fullName: body.fullName,
				githubId: body.repositoryId ? Number(body.repositoryId) : undefined,
			});
			return ok({
				repository: {
					id: repository.id,
					fullName: repository.fullName,
					description: repository.description,
					stars: repository.stars,
					language: repository.language,
				},
			});
		} catch (error) {
			rethrowApi(error);
		}
	});
}
