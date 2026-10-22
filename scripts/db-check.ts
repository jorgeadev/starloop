import { databaseEnvironment, databaseSource, db } from "../src/lib/db/client";
import { ensureDatabase } from "../src/lib/db/migrate";
import { repositories, users } from "../src/lib/db/schema";

async function main() {
	await ensureDatabase();
	const userRows = await db.select({ id: users.id }).from(users);
	const repoRows = await db.select({ id: repositories.id }).from(repositories);
	console.log(`target=${databaseEnvironment} source=${databaseSource}`);
	console.log(`users=${userRows.length} repositories=${repoRows.length}`);
	console.log(`demo=${userRows.some((row) => row.id === "u_demo") ? "present" : "missing"}`);
	process.exit(0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
