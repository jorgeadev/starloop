import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { getSession, type SessionContext } from "@/lib/auth/session";
import { validateCsrf, validateOrigin } from "@/lib/auth/csrf";

export class ApiError extends Error {
	status: number;
	code: string;
	details?: unknown;

	constructor(status: number, message: string, code = "bad_request", details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export function jsonError(
	status: number,
	message: string,
	code = "bad_request",
	extra?: Record<string, unknown>,
) {
	return NextResponse.json({ ok: false, error: message, code, ...extra }, { status });
}

export function ok<T extends Record<string, unknown>>(data: T, status = 200) {
	return NextResponse.json({ ok: true, ...data }, { status });
}

export async function withApi(handler: () => Promise<Response>): Promise<Response> {
	try {
		return await handler();
	} catch (error) {
		if (error instanceof ApiError) {
			return jsonError(error.status, error.message, error.code, {
				...(error.details ? { details: error.details } : {}),
			});
		}
		if (error instanceof ZodError) {
			return jsonError(422, "That input does not look right.", "validation_error", {
				details: error.issues.map((issue) => ({
					path: issue.path.join("."),
					message: issue.message,
				})),
			});
		}
		const message = error instanceof Error ? error.message : "Unknown error";
		const pgCode = (error as { code?: string } | null)?.code;
		if (pgCode === "23505" || message.includes("duplicate key value")) {
			return jsonError(409, "That action was already recorded.", "conflict");
		}
		console.error("[api] unhandled error:", error instanceof Error ? error.name : "unknown");
		return jsonError(500, "Something went wrong on our side. Please try again.", "internal_error");
	}
}

export async function requireApiUser(): Promise<SessionContext> {
	const session = await getSession();
	if (!session) {
		throw new ApiError(401, "Sign in with GitHub to continue.", "unauthorized");
	}
	if (session.user.status === "suspended") {
		throw new ApiError(403, "This account is suspended.", "suspended");
	}
	return session;
}

/** Origin + double-submit CSRF check for every state-changing endpoint. */
export function guardMutation(request: Request): void {
	if (!validateOrigin(request)) {
		throw new ApiError(403, "Cross-site request blocked.", "bad_origin");
	}
	if (!validateCsrf(request)) {
		throw new ApiError(
			403,
			"Your security token expired. Refresh the page and try again.",
			"csrf_failed",
		);
	}
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw new ApiError(400, "Expected a JSON body.", "invalid_json");
	}
	return schema.parse(body);
}

export function retryAfterResponse(message: string, seconds: number) {
	return NextResponse.json(
		{ ok: false, error: message, code: "rate_limited" },
		{ status: 429, headers: { "Retry-After": String(seconds) } },
	);
}
