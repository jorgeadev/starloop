import { describe, expect, it } from "vitest";
import { sanitizeReturnTo } from "@/lib/auth/oauth";

describe("sanitizeReturnTo", () => {
	it("keeps relative app paths and their query strings", () => {
		expect(sanitizeReturnTo("/dashboard")).toBe("/dashboard");
		expect(sanitizeReturnTo("/discover?sort=top&page=2")).toBe("/discover?sort=top&page=2");
		expect(sanitizeReturnTo("/legal#privacy")).toBe("/legal#privacy");
	});

	it("rejects absolute and protocol-relative destinations", () => {
		expect(sanitizeReturnTo("https://evil.example")).toBe("/dashboard");
		expect(sanitizeReturnTo("//evil.example")).toBe("/dashboard");
		expect(sanitizeReturnTo("/\\evil.example")).toBe("/dashboard");
		expect(sanitizeReturnTo("javascript:alert(1)")).toBe("/dashboard");
	});

	it("falls back when the value is missing or malformed", () => {
		expect(sanitizeReturnTo(null)).toBe("/dashboard");
		expect(sanitizeReturnTo(undefined)).toBe("/dashboard");
		expect(sanitizeReturnTo("")).toBe("/dashboard");
		expect(sanitizeReturnTo("not-a-path")).toBe("/dashboard");
	});
});
