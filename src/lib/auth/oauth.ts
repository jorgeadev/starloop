import { createHash } from "node:crypto";
import { OAUTH_STATE_TTL_MS, GITHUB_OAUTH_SCOPES } from "@/lib/constants";
import { randomToken, signValue, unsignValue } from "@/lib/crypto";

export type OAuthState = {
	state: string;
	verifier: string;
	returnTo: string;
	expiresAt: number;
};

export function oauthConfigured(): boolean {
	return Boolean(process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET);
}

export function getRedirectUri(): string {
	const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
	return new URL("/api/auth/github/callback", base).toString();
}

export function sanitizeReturnTo(value: string | null | undefined): string {
	if (!value) return "/dashboard";
	if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
		return "/dashboard";
	}
	try {
		const base = new URL("https://starloop.invalid");
		const resolved = new URL(value, base);
		if (resolved.origin !== base.origin) return "/dashboard";
		return `${resolved.pathname}${resolved.search}${resolved.hash}`;
	} catch {
		return "/dashboard";
	}
}

export function createOAuthState(returnTo: string): {
	state: OAuthState;
	cookie: string;
	authorizeUrl: string;
} {
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	if (!clientId) throw new Error("GITHUB_OAUTH_CLIENT_ID is not configured.");

	const stateValue = randomToken(24);
	const verifier = randomToken(48);
	const challenge = createHash("sha256").update(verifier).digest("base64url");
	const state: OAuthState = {
		state: stateValue,
		verifier,
		returnTo: sanitizeReturnTo(returnTo),
		expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
	};

	const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
	const cookie = signValue(payload);

	const url = new URL("https://github.com/login/oauth/authorize");
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", getRedirectUri());
	url.searchParams.set("scope", GITHUB_OAUTH_SCOPES);
	url.searchParams.set("state", stateValue);
	url.searchParams.set("code_challenge", challenge);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("allow_signup", "true");

	return { state, cookie, authorizeUrl: url.toString() };
}

export function readOAuthState(cookieValue: string | undefined): OAuthState | null {
	if (!cookieValue) return null;
	const payload = unsignValue(cookieValue);
	if (!payload) return null;
	try {
		const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
		if (
			typeof parsed.state !== "string" ||
			typeof parsed.verifier !== "string" ||
			typeof parsed.expiresAt !== "number" ||
			parsed.expiresAt < Date.now()
		) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export type OAuthTokenResponse = {
	access_token?: string;
	refresh_token?: string;
	expires_in?: number;
	refresh_token_expires_in?: number;
	scope?: string;
	token_type?: string;
	error?: string;
	error_description?: string;
};

export async function exchangeOAuthCode(
	code: string,
	verifier: string,
): Promise<OAuthTokenResponse> {
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) throw new Error("GitHub OAuth is not configured.");

	const response = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"User-Agent": "Starloop/1.0",
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: getRedirectUri(),
			code_verifier: verifier,
		}),
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		throw new Error("GitHub rejected the OAuth code. Please try connecting again.");
	}

	return (await response.json()) as OAuthTokenResponse;
}
