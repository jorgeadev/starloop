import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { saveConnection } from "@/lib/auth/connections";
import { OAUTH_COOKIE } from "@/lib/auth/cookies";
import { exchangeOAuthCode, readOAuthState } from "@/lib/auth/oauth";
import { createSession, getSession } from "@/lib/auth/session";
import { upsertUserFromGitHub } from "@/lib/auth/users";
import { hashIdentifier } from "@/lib/crypto";
import { clientIp } from "@/lib/auth/csrf";
import { listPrimaryEmail, validateGitHubToken } from "@/lib/github/client";

export async function GET(request: NextRequest) {
	const jar = await cookies();
	const savedCookie = jar.get(OAUTH_COOKIE)?.value;
	const stateData = readOAuthState(savedCookie);
	jar.delete(OAUTH_COOKIE);

	if (!stateData) {
		return NextResponse.redirect(new URL("/connect?error=oauth_expired", request.url));
	}

	const state = request.nextUrl.searchParams.get("state");
	const code = request.nextUrl.searchParams.get("code");
	const oauthError = request.nextUrl.searchParams.get("error");

	if (oauthError) {
		return NextResponse.redirect(
			new URL(`/connect?error=${encodeURIComponent(oauthError)}`, request.url),
		);
	}
	if (!code || !state || state !== stateData.state) {
		return NextResponse.redirect(new URL("/connect?error=oauth_state", request.url));
	}

	try {
		const tokenResponse = await exchangeOAuthCode(code, stateData.verifier);
		if (!tokenResponse.access_token) {
			return NextResponse.redirect(new URL("/connect?error=oauth_exchange", request.url));
		}

		const validated = await validateGitHubToken(tokenResponse.access_token);
		const existingSession = await getSession();
		if (existingSession && existingSession.user.githubId !== validated.user.id) {
			return NextResponse.redirect(
				new URL("/connect?error=account_mismatch&manage=1", request.url),
			);
		}
		const email = validated.user.email ?? (await listPrimaryEmail(tokenResponse.access_token));
		const user = await upsertUserFromGitHub({ ...validated.user, email });

		await saveConnection(
			user.id,
			{
				...validated,
				kind: "oauth",
				scopes: tokenResponse.scope
					? tokenResponse.scope.split(",").map((scope) => scope.trim())
					: validated.scopes,
				expiresAt: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : null,
			},
			tokenResponse.access_token,
			tokenResponse.refresh_token ?? null,
		);

		await createSession(user.id, {
			userAgent: request.headers.get("user-agent"),
			ipHash: hashIdentifier(clientIp(request)),
		});

		const destination = user.policyAcceptedAt ? stateData.returnTo : "/welcome";
		return NextResponse.redirect(new URL(destination, request.url));
	} catch (error) {
		console.error("[oauth] callback failed:", error instanceof Error ? error.name : "unknown");
		return NextResponse.redirect(new URL("/connect?error=oauth_failed", request.url));
	}
}
