import { and, eq, isNull, lt, or } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/crypto";
import { db } from "@/lib/db/client";
import { connections, exchangeStars, users } from "@/lib/db/schema";
import { verifyGivenStars } from "@/lib/exchange";
import { ensureDatabase } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function run(request: NextRequest) {
	const secret = process.env.CRON_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ ok: false, error: "CRON_SECRET is not configured." },
			{ status: 503 },
		);
	}

	const provided =
		request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
		request.headers.get("x-cron-secret") ??
		"";
	if (!safeEqual(secret, provided)) {
		return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
	}

	await ensureDatabase();
	const staleBefore = Date.now() - 24 * 3_600_000;

	const groups = await db
		.select({ giverId: exchangeStars.giverId })
		.from(exchangeStars)
		.innerJoin(users, eq(exchangeStars.giverId, users.id))
		.innerJoin(connections, eq(connections.userId, users.id))
		.where(
			and(
				eq(exchangeStars.status, "confirmed"),
				eq(users.status, "active"),
				eq(users.isDemo, false),
				eq(connections.needsReauth, false),
				or(isNull(exchangeStars.lastCheckedAt), lt(exchangeStars.lastCheckedAt, staleBefore)),
			),
		)
		.groupBy(exchangeStars.giverId)
		.limit(12);

	const summary = {
		members: groups.length,
		checked: 0,
		revoked: 0,
		errors: 0,
	};

	for (const group of groups) {
		try {
			const result = await verifyGivenStars(group.giverId, 10);
			summary.checked += result.checked;
			summary.revoked += result.revoked;
			summary.errors += result.errors;
		} catch {
			summary.errors += 1;
		}
	}

	return NextResponse.json({ ok: true, ...summary });
}

export async function GET(request: NextRequest) {
	return run(request);
}

export async function POST(request: NextRequest) {
	return run(request);
}
