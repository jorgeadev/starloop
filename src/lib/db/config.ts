export type DatabaseEnvironment = "development" | "production";

export type DatabaseSource = "DATABASE_URL" | "DATABASE_DEV_URL" | "DATABASE_PROD_URL";

export type DatabaseConfig = {
	url: string;
	source: DatabaseSource;
	environment: DatabaseEnvironment;
};

export function resolveDatabaseEnvironment(
	env: Record<string, string | undefined> = process.env,
): DatabaseEnvironment {
	const vercelEnvironment = env.VERCEL_ENV?.trim();
	if (vercelEnvironment === "production") return "production";
	if (vercelEnvironment === "preview" || vercelEnvironment === "development") {
		return "development";
	}
	return env.NODE_ENV === "production" ? "production" : "development";
}

function isLocalDatabaseUrl(url: string): boolean {
	return (
		url.includes("127.0.0.1") ||
		url.includes("localhost") ||
		url.includes("[::1]") ||
		url.includes("sslmode=disable")
	);
}

/**
 * Resolution order:
 * 1. A local DATABASE_URL (PGlite / local Postgres) always wins. This keeps
 *    `pnpm dev:local` working even when Neon URLs are configured.
 * 2. The environment-specific Neon URL: DATABASE_PROD_URL in production,
 *    DATABASE_DEV_URL everywhere else (including Vercel Preview).
 * 3. DATABASE_URL as a backwards-compatible remote fallback.
 */
export function resolveDatabaseConfig(
	env: Record<string, string | undefined> = process.env,
): DatabaseConfig {
	const environment = resolveDatabaseEnvironment(env);
	const explicit = env.DATABASE_URL?.trim();

	if (explicit && isLocalDatabaseUrl(explicit)) {
		return { url: explicit, source: "DATABASE_URL", environment };
	}

	const source: DatabaseSource =
		environment === "production" ? "DATABASE_PROD_URL" : "DATABASE_DEV_URL";
	const targeted = env[source]?.trim();

	if (targeted) {
		return { url: targeted, source, environment };
	}

	if (explicit) {
		return { url: explicit, source: "DATABASE_URL", environment };
	}

	throw new Error(
		`No database URL configured for ${environment}. Set ${source} in .env.local ` +
			"(or DATABASE_URL for a local/override database).",
	);
}
