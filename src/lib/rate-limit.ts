import { client } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";

export type RateLimitResult = {
	ok: boolean;
	remaining: number;
	retryAfterSeconds: number;
};

/**
 * Fixed-window limiter backed by Postgres so it survives server restarts and
 * is shared by every request on the same database. Swap for Redis when running
 * multiple regions.
 */
export async function rateLimit(
	key: string,
	limit: number,
	windowMs: number,
): Promise<RateLimitResult> {
	await ensureDatabase();
	const now = Date.now();
	const windowStart = Math.floor(now / windowMs) * windowMs;
	const expiresAt = windowStart + windowMs;

	const rows = await client.unsafe<{ count: number }[]>(
		`INSERT INTO rate_limits (key, window_start, count, expires_at)
		 VALUES ($1, $2, 1, $3)
		 ON CONFLICT (key, window_start)
		 DO UPDATE SET count = rate_limits.count + 1
		 RETURNING count`,
		[key, windowStart, expiresAt],
	);

	const count = Number(rows[0]?.count ?? 1);
	const remaining = Math.max(0, limit - count);

	if (Math.random() < 0.02) {
		await client.unsafe(`DELETE FROM rate_limits WHERE expires_at < $1`, [now - 60_000]);
	}

	return {
		ok: count <= limit,
		remaining,
		retryAfterSeconds: Math.max(1, Math.ceil((expiresAt - now) / 1000)),
	};
}
