import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteConnection, getConnection } from "@/lib/auth/connections";
import { destroySession } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/crypto";
import { db } from "@/lib/db/client";
import { activities, creditLedger, exchangeStars, repositories, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revokeOAuthToken } from "@/lib/github/client";
import { guardMutation, readJson, requireApiUser, withApi } from "@/lib/http";
import { deleteAccountSchema } from "@/lib/validation";

export async function GET() {
	return withApi(async () => {
		const session = await requireApiUser();
		const user = session.user;

		const [repoRows, givenRows, receivedRows, ledgerRows, activityRows] = await Promise.all([
			db.select().from(repositories).where(eq(repositories.userId, user.id)),
			db.select().from(exchangeStars).where(eq(exchangeStars.giverId, user.id)),
			db.select().from(exchangeStars).where(eq(exchangeStars.ownerId, user.id)),
			db.select().from(creditLedger).where(eq(creditLedger.userId, user.id)),
			db.select().from(activities).where(eq(activities.userId, user.id)),
		]);

		const payload = {
			exportedAt: new Date().toISOString(),
			app: "Starloop",
			account: {
				id: user.id,
				login: user.login,
				name: user.name,
				email: user.email,
				profileUrl: user.profileUrl,
				credits: user.credits,
				starsGiven: user.starsGiven,
				starsReceived: user.starsReceived,
				dailyStarLimit: user.dailyStarLimit,
				policyVersion: user.policyVersion,
				policyAcceptedAt: user.policyAcceptedAt,
				createdAt: user.createdAt,
			},
			repositories: repoRows,
			exchange: {
				given: givenRows,
				received: receivedRows,
			},
			credits: ledgerRows,
			activities: activityRows,
		};

		return new NextResponse(JSON.stringify(payload, null, 2), {
			status: 200,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Content-Disposition": `attachment; filename="starloop-${user.login}.json"`,
				"Cache-Control": "no-store",
			},
		});
	});
}

export async function DELETE(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();
		await readJson(request, deleteAccountSchema);

		if (session.user.isDemo) {
			await destroySession();
			return NextResponse.json({ ok: true, redirect: "/" });
		}

		const connection = await getConnection(session.user.id);
		if (connection?.kind === "oauth") {
			try {
				await revokeOAuthToken(decryptSecret(connection.tokenEnc));
			} catch {
				// Best effort.
			}
		}

		await destroySession();
		await deleteConnection(session.user.id);
		await db.delete(users).where(eq(users.id, session.user.id));

		return NextResponse.json({ ok: true, redirect: "/" });
	});
}
