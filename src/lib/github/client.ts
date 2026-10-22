import "server-only";

const GITHUB_API = "https://api.github.com";
const API_VERSION = "2022-11-28";
const USER_AGENT = "Starloop/1.0 (+https://github.com/starloop)";

export type GitHubUser = {
	id: number;
	login: string;
	name: string | null;
	email: string | null;
	avatar_url: string;
	bio: string | null;
	html_url: string;
	created_at: string;
};

export type GitHubRepository = {
	id: number;
	full_name: string;
	name: string;
	owner: {
		login: string;
		avatar_url: string;
	};
	description: string | null;
	homepage: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	topics?: string[];
	private: boolean;
	fork: boolean;
	archived: boolean;
	visibility: string;
	pushed_at: string | null;
	created_at: string;
	permissions?: {
		admin: boolean;
		maintain?: boolean;
		push: boolean;
		triage?: boolean;
		pull: boolean;
	};
};

export class GitHubError extends Error {
	status: number;
	code: "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "network" | "unknown";
	documentationUrl?: string;
	acceptedPermissions?: string;

	constructor(
		message: string,
		status: number,
		code: GitHubError["code"],
		meta?: { documentationUrl?: string; acceptedPermissions?: string },
	) {
		super(message);
		this.name = "GitHubError";
		this.status = status;
		this.code = code;
		this.documentationUrl = meta?.documentationUrl;
		this.acceptedPermissions = meta?.acceptedPermissions;
	}
}

type GitHubResult<T> = {
	data: T;
	headers: Headers;
	status: number;
};

export async function githubRequest<T>(
	token: string,
	path: string,
	init: RequestInit = {},
): Promise<GitHubResult<T>> {
	let response: Response;
	try {
		response = await fetch(`${GITHUB_API}${path}`, {
			...init,
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${token}`,
				"X-GitHub-Api-Version": API_VERSION,
				"User-Agent": USER_AGENT,
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...init.headers,
			},
			cache: "no-store",
			signal: AbortSignal.timeout(15_000),
		});
	} catch {
		throw new GitHubError(
			"GitHub did not respond. Check your connection and try again.",
			0,
			"network",
		);
	}

	if (response.status === 204) {
		return { data: undefined as T, headers: response.headers, status: 204 };
	}

	const raw = await response.text();
	let body: unknown = null;
	if (raw) {
		try {
			body = JSON.parse(raw);
		} catch {
			body = raw;
		}
	}

	if (!response.ok) {
		const payload = body as { message?: string; documentation_url?: string } | null;
		const remaining = response.headers.get("x-ratelimit-remaining");
		const isRateLimited = response.status === 403 && remaining === "0";
		const code: GitHubError["code"] = isRateLimited
			? "rate_limited"
			: response.status === 401
				? "unauthorized"
				: response.status === 403
					? "forbidden"
					: response.status === 404
						? "not_found"
						: "unknown";
		const message = isRateLimited
			? "GitHub's API rate limit was reached. Try again in a little while."
			: (payload?.message ?? `GitHub returned ${response.status}.`);
		throw new GitHubError(message, response.status, code, {
			documentationUrl: payload?.documentation_url,
			acceptedPermissions: response.headers.get("x-accepted-github-permissions") ?? undefined,
		});
	}

	return { data: body as T, headers: response.headers, status: response.status };
}

export async function getGitHubUser(token: string): Promise<GitHubResult<GitHubUser>> {
	return githubRequest<GitHubUser>(token, "/user");
}

export async function listUserRepositories(
	token: string,
	page = 1,
): Promise<GitHubResult<GitHubRepository[]>> {
	return githubRequest<GitHubRepository[]>(
		token,
		`/user/repos?affiliation=owner&sort=updated&direction=desc&per_page=100&page=${page}`,
	);
}

export async function getRepository(
	token: string,
	fullName: string,
): Promise<GitHubResult<GitHubRepository>> {
	return githubRequest<GitHubRepository>(
		token,
		`/repos/${encodeURIComponent(fullName.split("/")[0]!)}/${encodeURIComponent(
			fullName.split("/")[1] ?? "",
		)}`,
	);
}

export async function starRepository(token: string, fullName: string): Promise<void> {
	const [owner, repo] = fullName.split("/");
	await githubRequest(
		token,
		`/user/starred/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`,
		{
			method: "PUT",
			headers: { "Content-Length": "0" },
		},
	);
}

export async function unstarRepository(token: string, fullName: string): Promise<void> {
	const [owner, repo] = fullName.split("/");
	await githubRequest(
		token,
		`/user/starred/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`,
		{ method: "DELETE" },
	);
}

export async function isRepositoryStarred(token: string, fullName: string): Promise<boolean> {
	const [owner, repo] = fullName.split("/");
	try {
		await githubRequest(
			token,
			`/user/starred/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`,
			{ method: "GET" },
		);
		return true;
	} catch (error) {
		if (error instanceof GitHubError && error.code === "not_found") return false;
		throw error;
	}
}

export async function listPrimaryEmail(token: string): Promise<string | null> {
	try {
		const { data } = await githubRequest<
			Array<{ email: string; primary: boolean; verified: boolean }>
		>(token, "/user/emails");
		return data.find((entry) => entry.primary && entry.verified)?.email ?? null;
	} catch {
		return null;
	}
}

export type TokenKind = "oauth" | "classic_pat" | "fine_grained_pat";

export function detectTokenKind(token: string): TokenKind {
	if (token.startsWith("github_pat_")) return "fine_grained_pat";
	if (token.startsWith("ghp_")) return "classic_pat";
	return "oauth";
}

export type ValidatedToken = {
	user: GitHubUser;
	kind: TokenKind;
	scopes: string[];
	expiresAt: number | null;
};

export async function validateGitHubToken(token: string): Promise<ValidatedToken> {
	const { data, headers } = await getGitHubUser(token);
	const scopes = (headers.get("x-oauth-scopes") ?? "")
		.split(",")
		.map((scope) => scope.trim())
		.filter(Boolean);
	const expiresHeader = headers.get("github-authentication-token-expiration");
	const expiresAt = expiresHeader ? Date.parse(expiresHeader) : null;
	return {
		user: data,
		kind: detectTokenKind(token),
		scopes,
		expiresAt: expiresAt && Number.isFinite(expiresAt) ? expiresAt : null,
	};
}

export async function refreshOAuthToken(refreshToken: string) {
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) return null;

	const response = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) return null;
	const data = (await response.json()) as {
		access_token?: string;
		refresh_token?: string;
		expires_in?: number;
		refresh_token_expires_in?: number;
		scope?: string;
		error?: string;
	};
	if (!data.access_token) return null;

	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? null,
		expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
		scopes: data.scope?.split(",").map((scope) => scope.trim()) ?? [],
	};
}

export async function revokeOAuthToken(token: string): Promise<void> {
	const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
	const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) return;
	const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
	try {
		await fetch(`https://api.github.com/applications/${clientId}/token`, {
			method: "DELETE",
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Basic ${basic}`,
				"Content-Type": "application/json",
				"User-Agent": USER_AGENT,
			},
			body: JSON.stringify({ access_token: token }),
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});
	} catch {
		// Revocation is best-effort; the local credential is deleted either way.
	}
}

export function mapRepositoryForDatabase(repo: GitHubRepository) {
	return {
		githubId: repo.id,
		fullName: repo.full_name,
		owner: repo.owner.login,
		name: repo.name,
		description: repo.description,
		homepage: repo.homepage,
		language: repo.language,
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		topics: JSON.stringify(repo.topics ?? []),
		avatarUrl: repo.owner.avatar_url,
		isPrivate: repo.private,
		isFork: repo.fork,
		isArchived: repo.archived,
		pushedAt: repo.pushed_at ? Date.parse(repo.pushed_at) : null,
		syncedAt: Date.now(),
	};
}
