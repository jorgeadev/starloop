import { type NextRequest } from "next/server";
import { revokeOtherSessions } from "@/lib/auth/session";
import { guardMutation, ok, requireApiUser, withApi } from "@/lib/http";

export async function DELETE(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();
		await revokeOtherSessions(session.user.id, session.sessionId);
		return ok({ revoked: true });
	});
}
