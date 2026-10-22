import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

try {
	loadEnvFile(".env.local");
} catch {
	// The file is optional in CI; the caller can provide DATABASE_URL instead.
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		// Drizzle tooling defaults to the development database. To inspect or
		// migrate production, provide DATABASE_URL explicitly in your shell.
		url:
			process.env.DATABASE_URL ??
			process.env.DATABASE_DEV_URL ??
			"postgresql://postgres:postgres@127.0.0.1:5433/postgres",
	},
});
