import "server-only";
import { ConnectionError } from "@/lib/auth/connections";
import { ExchangeError } from "@/lib/exchange";
import { GitHubError } from "@/lib/github/client";
import { ApiError } from "@/lib/http";
import { BindingError } from "@/lib/repositories";

/**
 * Domain errors carry useful status codes and human messages. Translate them
 * once at the HTTP boundary instead of leaking stack traces or GitHub payloads.
 */
export function rethrowApi(error: unknown): never {
	if (error instanceof ApiError) throw error;
	if (error instanceof ExchangeError) {
		throw new ApiError(error.status, error.message, error.code);
	}
	if (error instanceof BindingError) {
		throw new ApiError(error.status, error.message, error.code);
	}
	if (error instanceof ConnectionError) {
		throw new ApiError(401, error.message, `connection_${error.code}`);
	}
	if (error instanceof GitHubError) {
		const status =
			error.code === "rate_limited"
				? 429
				: error.code === "unauthorized"
					? 401
					: error.code === "forbidden"
						? 403
						: 502;
		throw new ApiError(status, error.message, `github_${error.code}`);
	}
	throw error;
}
