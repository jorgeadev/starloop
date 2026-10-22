import { NextResponse, type NextRequest } from "next/server";
import { saveConnection } from "@/lib/auth/connections";
import { clientIp } from "@/lib/auth/csrf";
import { createSession, getSession } from "@/lib/auth/session";
import { upsertUserFromGitHub } from "@/lib/auth/users";
import { hashIdentifier } from "@/lib/crypto";
import { validateGitHubToken } from "@/lib/github/client";
import { guardMutation, jsonError, ok, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { githubTokenSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);

		const limit = await rateLimit(
			`auth-token:${hashIdentifier(clientIp(request))}`,
			6,
			10 * 60_000,
		);
		if (!limit.ok) {
			return jsonError(
				429,
				"Too many token attempts. Wait a few minutes and try again.",
				"rate_limited",
			);
		}

		const body = await request.json().catch(() => null);
		const parsed = githubTokenSchema.safeParse((body as { token?: unknown } | null)?.token);
		if (!parsed.success) {
			return jsonError(
				422,
				parsed.error.issues[0]?.message ?? "That token does not look valid.",
				"validation_error",
			);
		}

		let validated;
		try {
			validated = await validateGitHubToken(parsed.data);
		} catch {
			return jsonError(
				401,
				"GitHub rejected this token. Check that it is valid and has not expired.",
				"invalid_token",
			);
		}

		if (
			validated.kind === "classic_pat" &&
			validated.scopes.length > 0 &&
			!validated.scopes.includes("public_repo") &&
			!validated.scopes.includes("repo")
		) {
			return jsonError(
				422,
				"This classic token needs the public_repo (or repo) scope to star repositories.",
				"missing_scope",
			);
		}

		const existingSession = await getSession();
		if (existingSession && existingSession.user.githubId !== validated.user.id) {
			return jsonError(
				409,
				`This token belongs to @${validated.user.login}. Sign out before connecting a different account.`,
				"account_mismatch",
			);
		}

		const user = await upsertUserFromGitHub(validated.user);
		await saveConnection(user.id, validated, parsed.data);

		if (!existingSession) {
			await createSession(user.id, {
				userAgent: request.headers.get("user-agent"),
				ipHash: hashIdentifier(clientIp(request)),
			});
		}

		return ok({
			redirect: user.policyAcceptedAt ? "/dashboard" : "/welcome",
			login: user.login,
			kind: validated.kind,
		});
	});
}

export async function GET() {
	return NextResponse.json({ ok: false, error: "Use POST to connect a token." }, { status: 405 });
}
