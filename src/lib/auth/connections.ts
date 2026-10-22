import { eq } from "drizzle-orm";
import { decryptSecret, encryptSecret, tokenHint } from "@/lib/crypto";
import { db } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";
import { connections, type Connection } from "@/lib/db/schema";
import { refreshOAuthToken, type TokenKind, type ValidatedToken } from "@/lib/github/client";

export class ConnectionError extends Error {
	code: "missing" | "reauth" | "expired";

	constructor(code: ConnectionError["code"], message: string) {
		super(message);
		this.name = "ConnectionError";
		this.code = code;
	}
}

export async function saveConnection(
	userId: string,
	validated: ValidatedToken,
	token: string,
	refreshToken: string | null = null,
): Promise<void> {
	await ensureDatabase();
	const now = Date.now();
	const values = {
		id: crypto.randomUUID(),
		userId,
		kind: validated.kind,
		tokenEnc: encryptSecret(token),
		refreshEnc: refreshToken ? encryptSecret(refreshToken) : null,
		tokenHint: tokenHint(token),
		scopes: validated.scopes.join(","),
		tokenExpiresAt: validated.expiresAt,
		needsReauth: false,
		lastValidatedAt: now,
		createdAt: now,
		updatedAt: now,
	};

	await db
		.insert(connections)
		.values(values)
		.onConflictDoUpdate({
			target: connections.userId,
			set: {
				kind: values.kind,
				tokenEnc: values.tokenEnc,
				refreshEnc: values.refreshEnc,
				tokenHint: values.tokenHint,
				scopes: values.scopes,
				tokenExpiresAt: values.tokenExpiresAt,
				needsReauth: false,
				lastValidatedAt: now,
				updatedAt: now,
			},
		});
}

export async function getConnection(userId: string): Promise<Connection | null> {
	await ensureDatabase();
	const rows = await db.select().from(connections).where(eq(connections.userId, userId)).limit(1);
	return rows[0] ?? null;
}

export async function deleteConnection(userId: string): Promise<Connection | null> {
	const connection = await getConnection(userId);
	if (connection) {
		await db.delete(connections).where(eq(connections.userId, userId));
	}
	return connection;
}

export async function markConnectionNeedsReauth(userId: string): Promise<void> {
	await db
		.update(connections)
		.set({ needsReauth: true, updatedAt: Date.now() })
		.where(eq(connections.userId, userId));
}

export async function getAccessToken(
	userId: string,
): Promise<{ token: string; connection: Connection }> {
	const connection = await getConnection(userId);
	if (!connection) {
		throw new ConnectionError(
			"missing",
			"No GitHub connection yet. Add a token or connect with GitHub.",
		);
	}
	if (connection.needsReauth) {
		throw new ConnectionError(
			"reauth",
			"GitHub rejected the saved credential. Reconnect your account in Settings.",
		);
	}

	let token = decryptSecret(connection.tokenEnc);

	if (connection.tokenExpiresAt && connection.tokenExpiresAt < Date.now() + 120_000) {
		const refreshToken = connection.refreshEnc ? decryptSecret(connection.refreshEnc) : null;
		if (connection.kind !== "oauth" || !refreshToken) {
			await markConnectionNeedsReauth(userId);
			throw new ConnectionError(
				"expired",
				"Your GitHub access expired. Reconnect your account in Settings.",
			);
		}

		const refreshed = await refreshOAuthToken(refreshToken);
		if (!refreshed) {
			await markConnectionNeedsReauth(userId);
			throw new ConnectionError(
				"expired",
				"Your GitHub session expired and could not be refreshed. Reconnect in Settings.",
			);
		}

		await db
			.update(connections)
			.set({
				tokenEnc: encryptSecret(refreshed.accessToken),
				refreshEnc: refreshed.refreshToken
					? encryptSecret(refreshed.refreshToken)
					: connection.refreshEnc,
				tokenHint: tokenHint(refreshed.accessToken),
				scopes: refreshed.scopes.join(",") || connection.scopes,
				tokenExpiresAt: refreshed.expiresAt,
				needsReauth: false,
				lastValidatedAt: Date.now(),
				updatedAt: Date.now(),
			})
			.where(eq(connections.userId, userId));

		token = refreshed.accessToken;
	}

	return { token, connection: { ...connection, tokenEnc: "" } };
}

export function connectionKindLabel(kind: string): string {
	switch (kind) {
		case "oauth":
			return "GitHub OAuth";
		case "classic_pat":
			return "Classic personal access token";
		case "fine_grained_pat":
			return "Fine-grained personal access token";
		default:
			return "GitHub connection";
	}
}

export function canStarPublicRepos(connection: Connection): boolean {
	if (connection.kind === "fine_grained_pat") return true;
	const scopes = connection.scopes.split(",").map((scope) => scope.trim());
	return scopes.includes("public_repo") || scopes.includes("repo") || connection.kind === "oauth";
}

export type { TokenKind };
