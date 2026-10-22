import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseConfig } from "./config";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

declare global {
	var __starloopSql: ReturnType<typeof postgres> | undefined;
	var __starloopDb: Database | undefined;
}

const databaseConfig = resolveDatabaseConfig();
const connectionString = databaseConfig.url;
export const databaseEnvironment = databaseConfig.environment;
export const databaseSource = databaseConfig.source;
const isLocal =
	connectionString.includes("127.0.0.1") ||
	connectionString.includes("localhost") ||
	connectionString.includes("sslmode=disable") ||
	connectionString.startsWith("postgresql://postgres:postgres@");

const sql =
	globalThis.__starloopSql ??
	postgres(connectionString, {
		max: 5,
		idle_timeout: 20,
		connect_timeout: 10,
		// Neon's pooled endpoint runs PgBouncer in transaction mode.
		prepare: false,
		ssl: isLocal ? false : "require",
		onnotice: () => {},
		transform: { undefined: null },
	});

export const db: Database = globalThis.__starloopDb ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
	globalThis.__starloopSql = sql;
	globalThis.__starloopDb = db;
}

export { sql as client };
export type { Database };
