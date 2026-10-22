import { describe, expect, it } from "vitest";
import {
	absoluteUrl,
	clamp,
	formatCompact,
	formatNumber,
	formatRelativeTime,
	gradientFor,
	initials,
	parseTopics,
	pluralize,
	startOfUtcDay,
	truncate,
} from "@/lib/utils";

describe("formatting", () => {
	it("formats compact and full numbers", () => {
		expect(formatNumber(1200)).toBe("1,200");
		expect(formatCompact(1200)).toBe("1.2K");
	});

	it("formats relative times in the past and future", () => {
		const now = Date.UTC(2026, 9, 22, 12, 0, 0);
		expect(formatRelativeTime(now - 20_000, now)).toBe("just now");
		expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe("3 hours ago");
		expect(formatRelativeTime(now + 2 * 86_400_000, now)).toBe("in 2 days");
	});
});

describe("display helpers", () => {
	it("derives initials without crashing on sparse names", () => {
		expect(initials("Maya Chen")).toBe("MC");
		expect(initials("jorge")).toBe("JO");
		expect(initials(null)).toBe("SL");
		expect(initials("  ")).toBe("SL");
	});

	it("returns deterministic gradients per login", () => {
		expect(gradientFor("octocat")).toEqual(gradientFor("octocat"));
		expect(gradientFor("octocat")).toHaveLength(2);
	});

	it("parses topics defensively", () => {
		expect(parseTopics('["typescript","nextjs"]')).toEqual(["typescript", "nextjs"]);
		expect(parseTopics('["ok",1,null]')).toEqual(["ok"]);
		expect(parseTopics("not-json")).toEqual([]);
		expect(parseTopics(null)).toEqual([]);
	});

	it("clamps, truncates, and pluralizes", () => {
		expect(clamp(12, 1, 10)).toBe(10);
		expect(clamp(-3, 1, 10)).toBe(1);
		expect(truncate("a short sentence", 8)).toBe("a short…");
		expect(pluralize(1, "star")).toBe("star");
		expect(pluralize(2, "star")).toBe("stars");
	});
});

describe("time and urls", () => {
	it("starts the UTC day at midnight", () => {
		const value = startOfUtcDay(new Date("2026-10-22T18:45:12.000Z"));
		expect(new Date(value).toISOString()).toBe("2026-10-22T00:00:00.000Z");
	});

	it("builds absolute urls from the configured base", () => {
		expect(absoluteUrl("/legal")).toMatch(/^http:\/\/localhost:3000\/legal$/);
	});
});
