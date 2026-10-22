import { NextResponse, type NextRequest } from "next/server";
import { CSRF_COOKIE } from "@/lib/auth/cookies";

/**
 * Edge-adjacent request layer: per-request CSP nonce and a double-submit CSRF
 * cookie. Keep this file free of database and Node-only imports.
 */
export function proxy(request: NextRequest) {
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const isDev = process.env.NODE_ENV === "development";
	const csp = [
		"default-src 'self'",
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https://avatars.githubusercontent.com",
		"font-src 'self' data:",
		"connect-src 'self'",
		"manifest-src 'self'",
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		isDev ? "" : "upgrade-insecure-requests",
	]
		.filter(Boolean)
		.join("; ");

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-nonce", nonce);
	requestHeaders.set("Content-Security-Policy", csp);

	const response = NextResponse.next({ request: { headers: requestHeaders } });
	response.headers.set("Content-Security-Policy", csp);

	if (!request.cookies.get(CSRF_COOKIE)) {
		response.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
		});
	}

	return response;
}

export const config = {
	matcher: [
		{
			source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
