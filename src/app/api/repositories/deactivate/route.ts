import { type NextRequest } from "next/server";
import { rethrowApi } from "@/lib/api-error";
import { guardMutation, jsonError, ok, requireApiUser, withApi } from "@/lib/http";
import { deactivateActiveRepository } from "@/lib/repositories";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		if (session.user.isDemo) {
			return jsonError(400, "Demo mode keeps its repository in place.", "demo_mode");
		}

		try {
			await deactivateActiveRepository(session.user.id);
			return ok({ active: false });
		} catch (error) {
			rethrowApi(error);
		}
	});
}
