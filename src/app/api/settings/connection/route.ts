import { type NextRequest } from "next/server";
import { deleteConnection, getConnection } from "@/lib/auth/connections";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/crypto";
import { revokeOAuthToken } from "@/lib/github/client";
import { guardMutation, jsonError, ok, requireApiUser, withApi } from "@/lib/http";

export async function DELETE(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();

		if (session.user.isDemo) {
			return jsonError(400, "The demo connection is simulated.", "demo_mode");
		}

		const connection = await getConnection(session.user.id);
		if (!connection) {
			return ok({ disconnected: true });
		}

		if (connection.kind === "oauth") {
			try {
				await revokeOAuthToken(decryptSecret(connection.tokenEnc));
			} catch {
				// Best effort. Local deletion is what matters.
			}
		}

		await deleteConnection(session.user.id);
		await db.insert(activities).values({
			id: crypto.randomUUID(),
			userId: session.user.id,
			actorId: null,
			type: "verification",
			title: "GitHub connection removed",
			detail:
				"Your repository stays in the exchange, but star actions are paused until you reconnect.",
			createdAt: Date.now(),
		});

		return ok({ disconnected: true });
	});
}
