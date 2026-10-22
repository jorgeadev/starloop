import { NextResponse, type NextRequest } from "next/server";
import { acceptPolicy } from "@/lib/auth/users";
import { POLICY_VERSION } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import { guardMutation, ok, readJson, requireApiUser, withApi } from "@/lib/http";
import { policySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		const session = await requireApiUser();
		await readJson(request, policySchema);
		await acceptPolicy(session.user.id, POLICY_VERSION);
		await db.insert(activities).values({
			id: crypto.randomUUID(),
			userId: session.user.id,
			actorId: null,
			type: "policy",
			title: "Community rules accepted",
			detail: `Accepted version ${POLICY_VERSION}. Human-only, no automation, no bought stars.`,
			createdAt: Date.now(),
		});
		return ok({ redirect: "/repositories" });
	});
}

export function GET() {
	return NextResponse.json({ ok: false, error: "Use POST to accept the policy." }, { status: 405 });
}
