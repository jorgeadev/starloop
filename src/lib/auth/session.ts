import { and, eq, gt, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_TTL_MS } from "@/lib/constants";
import { randomToken, sha256, signValue, unsignValue } from "@/lib/crypto";
import { db } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";
import { sessions, users, type User } from "@/lib/db/schema";
import { SESSION_COOKIE } from "./cookies";

export type SessionContext = {
	user: User;
	sessionId: string;
};

const isProduction = process.env.NODE_ENV === "production";

export async function createSession(
	userId: string,
	meta: { userAgent?: string | null; ipHash?: string | null } = {},
): Promise<void> {
	await ensureDatabase();
	const rawId = randomToken(32);
	const idHash = sha256(rawId);
	const now = Date.now();

	await db.insert(sessions).values({
		id: idHash,
		userId,
		createdAt: now,
		expiresAt: now + SESSION_TTL_MS,
		lastSeenAt: now,
		userAgent: meta.userAgent?.slice(0, 255) ?? null,
		ipHash: meta.ipHash ?? null,
	});

	await db.update(users).set({ lastSeenAt: now, updatedAt: now }).where(eq(users.id, userId));

	const jar = await cookies();
	jar.set(SESSION_COOKIE, signValue(rawId), {
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax",
		path: "/",
		maxAge: Math.floor(SESSION_TTL_MS / 1000),
	});
}

export const getSession = cache(async (): Promise<SessionContext | null> => {
	await ensureDatabase();
	const jar = await cookies();
	const signed = jar.get(SESSION_COOKIE)?.value;
	if (!signed) return null;

	const rawId = unsignValue(signed);
	if (!rawId) return null;

	const rows = await db
		.select({ user: users, sessionId: sessions.id })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.id, sha256(rawId)), gt(sessions.expiresAt, Date.now())))
		.limit(1);

	const row = rows[0];
	if (!row) return null;
	if (row.user.status === "suspended") return { user: row.user, sessionId: row.sessionId };

	const now = Date.now();
	if (!row.user.lastSeenAt || now - row.user.lastSeenAt > 10 * 60_000) {
		await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, row.sessionId));
		await db
			.update(users)
			.set({ lastSeenAt: now, updatedAt: now })
			.where(eq(users.id, row.user.id));
	}

	return { user: row.user, sessionId: row.sessionId };
});

export async function requireUser(options?: {
	allowIncompletePolicy?: boolean;
	next?: string;
}): Promise<User> {
	const session = await getSession();
	if (!session) {
		const next = options?.next ? `?next=${encodeURIComponent(options.next)}` : "";
		redirect(`/connect${next}`);
	}
	if (session.user.status === "suspended") {
		redirect("/connect?error=suspended");
	}
	if (!session.user.policyAcceptedAt && !options?.allowIncompletePolicy) {
		redirect("/welcome");
	}
	return session.user;
}

export async function destroySession(): Promise<void> {
	const jar = await cookies();
	const signed = jar.get(SESSION_COOKIE)?.value;
	if (signed) {
		const rawId = unsignValue(signed);
		if (rawId) {
			await db.delete(sessions).where(eq(sessions.id, sha256(rawId)));
		}
	}
	jar.delete(SESSION_COOKIE);
}

export async function revokeOtherSessions(userId: string, keepSessionId: string): Promise<void> {
	await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.id, keepSessionId)));
}

export async function revokeAllSessions(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}
