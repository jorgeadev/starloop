import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_COOKIE } from "@/lib/auth/cookies";
import { createOAuthState, oauthConfigured } from "@/lib/auth/oauth";
import { sanitizeReturnTo } from "@/lib/auth/oauth";

export async function GET(request: NextRequest) {
	if (!oauthConfigured()) {
		return NextResponse.redirect(new URL("/connect?error=oauth_not_configured", request.url));
	}

	const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("next"));
	const { cookie, authorizeUrl } = createOAuthState(returnTo);
	const jar = await cookies();
	jar.set(OAUTH_COOKIE, cookie, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 600,
	});

	return NextResponse.redirect(authorizeUrl);
}
