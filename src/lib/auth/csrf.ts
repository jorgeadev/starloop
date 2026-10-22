import { safeEqual } from "@/lib/crypto";
import { CSRF_COOKIE, CSRF_HEADER } from "./cookies";

function cookieFromHeader(request: Request, name: string): string | null {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) return decodeURIComponent(rest.join("="));
	}
	return null;
}

export function validateCsrf(request: Request): boolean {
	const cookie = cookieFromHeader(request, CSRF_COOKIE);
	const header = request.headers.get(CSRF_HEADER);
	if (!cookie || !header) return false;
	return safeEqual(cookie, header);
}

/**
 * Browsers send Origin on state-changing fetches. Rejecting cross-site origins
 * protects even if a CSRF token ever leaks.
 */
export function validateOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return false;
	let originHost: string;
	try {
		originHost = new URL(origin).host;
	} catch {
		return false;
	}
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
	if (!host) return false;
	if (originHost === host) return true;

	const appUrl = process.env.NEXT_PUBLIC_APP_URL;
	if (!appUrl) return false;
	try {
		return new URL(appUrl).host === originHost;
	} catch {
		return false;
	}
}

export function clientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]!.trim();
	return request.headers.get("x-real-ip") ?? "0.0.0.0";
}
