import { describe, expect, it } from "vitest";
import { resolveDatabaseConfig, resolveDatabaseEnvironment } from "@/lib/db/config";

describe("resolveDatabaseEnvironment", () => {
	it("uses NODE_ENV for local runs", () => {
		expect(resolveDatabaseEnvironment({ NODE_ENV: "development" })).toBe("development");
		expect(resolveDatabaseEnvironment({ NODE_ENV: "production" })).toBe("production");
		expect(resolveDatabaseEnvironment({})).toBe("development");
	});

	it("routes Vercel Preview to the development database", () => {
		expect(resolveDatabaseEnvironment({ NODE_ENV: "production", VERCEL_ENV: "preview" })).toBe(
			"development",
		);
		expect(resolveDatabaseEnvironment({ NODE_ENV: "production", VERCEL_ENV: "production" })).toBe(
			"production",
		);
	});
});

describe("resolveDatabaseConfig", () => {
	it("selects the development URL outside production", () => {
		const config = resolveDatabaseConfig({
			NODE_ENV: "development",
			DATABASE_DEV_URL: "postgres://dev",
			DATABASE_PROD_URL: "postgres://prod",
		});

		expect(config).toEqual({
			url: "postgres://dev",
			source: "DATABASE_DEV_URL",
			environment: "development",
		});
	});

	it("selects the production URL under next build/start", () => {
		const config = resolveDatabaseConfig({
			NODE_ENV: "production",
			DATABASE_DEV_URL: "postgres://dev",
			DATABASE_PROD_URL: "postgres://prod",
		});

		expect(config).toEqual({
			url: "postgres://prod",
			source: "DATABASE_PROD_URL",
			environment: "production",
		});
	});

	it("lets local PGlite override Neon in development", () => {
		const config = resolveDatabaseConfig({
			NODE_ENV: "development",
			DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5433/postgres",
			DATABASE_DEV_URL: "postgres://dev",
			DATABASE_PROD_URL: "postgres://prod",
		});

		expect(config.url).toContain("127.0.0.1:5433");
		expect(config.source).toBe("DATABASE_URL");
	});

	it("uses DATABASE_URL as a legacy fallback when the target is missing", () => {
		const config = resolveDatabaseConfig({
			NODE_ENV: "production",
			DATABASE_URL: "postgres://legacy",
		});

		expect(config.url).toBe("postgres://legacy");
		expect(config.source).toBe("DATABASE_URL");
	});

	it("throws a useful error when no URL is configured", () => {
		expect(() => resolveDatabaseConfig({ NODE_ENV: "production" })).toThrow(/DATABASE_PROD_URL/);
		expect(() => resolveDatabaseConfig({ NODE_ENV: "development" })).toThrow(/DATABASE_DEV_URL/);
	});
});
