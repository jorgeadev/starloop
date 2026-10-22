import { NextResponse } from "next/server";
import { client, databaseEnvironment } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
	const started = Date.now();
	try {
		await ensureDatabase();
		await client.unsafe("SELECT 1");
		return NextResponse.json(
			{
				ok: true,
				app: "starloop",
				version: process.env.npm_package_version ?? "1.0.0",
				database: "ok",
				databaseTarget: databaseEnvironment,
				latencyMs: Date.now() - started,
				timestamp: new Date().toISOString(),
			},
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch {
		return NextResponse.json(
			{ ok: false, database: "unavailable", timestamp: new Date().toISOString() },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}
}
