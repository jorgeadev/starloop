import { type NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { guardMutation, ok, withApi } from "@/lib/http";

export async function POST(request: NextRequest) {
	return withApi(async () => {
		guardMutation(request);
		await destroySession();
		return ok({ redirect: "/" });
	});
}
