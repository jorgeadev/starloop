import { NextResponse, type NextRequest } from "next/server";
import { clientIp } from "@/lib/auth/csrf";
import { createSession } from "@/lib/auth/session";
import { hashIdentifier } from "@/lib/crypto";
import { getDemoUserId } from "@/lib/db/seed";
import { ensureDatabase } from "@/lib/db/migrate";
import { rateLimit } from "@/lib/rate-limit";
import { guardMutation, jsonError, ok, withApi } from "@/lib/http";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		if (process.env.DEMO_MODE !== "true") {
			return jsonError(404, "Demo mode is turned off.", "demo_disabled");
		}

		const limit = await rateLimit(`demo-login:${hashIdentifier(clientIp(request))}`, 10, 60_000);
		if (!limit.ok) {
			return jsonError(429, "Too many demo logins. Try again in a minute.", "rate_limited");
		}

		await ensureDatabase();
		const demoId = await getDemoUserId();
		if (!demoId) {
			return jsonError(
				503,
				"The demo workspace has no data. Set SEED_DEMO_DATA=true and restart.",
				"demo_unavailable",
			);
		}

		await createSession(demoId, {
			userAgent: request.headers.get("user-agent"),
			ipHash: hashIdentifier(clientIp(request)),
		});

		return ok({ redirect: "/dashboard" });
	});
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
	return NextResponse.redirect(
		new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
	);
}
