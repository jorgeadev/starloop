export class ClientApiError extends Error {
	status: number;
	code: string;

	constructor(message: string, status: number, code = "request_failed") {
		super(message);
		this.name = "ClientApiError";
		this.status = status;
		this.code = code;
	}
}

function csrfToken(): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(/(?:^|;\s*)sl_csrf=([^;]+)/);
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function apiRequest<T extends Record<string, unknown>>(
	path: string,
	init: RequestInit = {},
): Promise<T & { ok: true }> {
	const method = (init.method ?? "GET").toUpperCase();
	const token = csrfToken();

	const response = await fetch(path, {
		...init,
		headers: {
			...(init.body ? { "Content-Type": "application/json" } : {}),
			...(method !== "GET" && method !== "HEAD" && token ? { "x-csrf-token": token } : {}),
			...init.headers,
		},
		credentials: "same-origin",
		cache: "no-store",
	});

	let payload: Record<string, unknown> | null = null;
	try {
		payload = (await response.json()) as Record<string, unknown>;
	} catch {
		payload = null;
	}

	if (!response.ok || payload?.ok === false) {
		const message =
			typeof payload?.error === "string"
				? payload.error
				: response.status === 429
					? "Too many requests. Wait a moment and try again."
					: "Something went wrong. Please try again.";
		throw new ClientApiError(
			message,
			response.status,
			typeof payload?.code === "string" ? payload.code : "request_failed",
		);
	}

	return { ...(payload ?? {}), ok: true } as T & { ok: true };
}

export async function postJson<T extends Record<string, unknown>>(
	path: string,
	body: unknown,
): Promise<T & { ok: true }> {
	return apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) });
}
