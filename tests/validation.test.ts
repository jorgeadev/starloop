import { describe, expect, it } from "vitest";
import {
	bindRepositorySchema,
	deleteAccountSchema,
	githubTokenSchema,
	policySchema,
	reportSchema,
	updateSettingsSchema,
} from "@/lib/validation";

describe("githubTokenSchema", () => {
	it("accepts classic, fine-grained, and OAuth token prefixes", () => {
		expect(githubTokenSchema.safeParse(`ghp_${"a".repeat(30)}`).success).toBe(true);
		expect(githubTokenSchema.safeParse(`github_pat_${"a".repeat(30)}`).success).toBe(true);
		expect(githubTokenSchema.safeParse(`gho_${"a".repeat(30)}`).success).toBe(true);
	});

	it("trims whitespace and rejects unknown prefixes", () => {
		const trimmed = githubTokenSchema.parse(`  ghp_${"a".repeat(30)}  `);
		expect(trimmed.startsWith("ghp_")).toBe(true);
		expect(githubTokenSchema.safeParse(`sk_${"a".repeat(30)}`).success).toBe(false);
	});

	it("rejects tokens that are obviously too short", () => {
		expect(githubTokenSchema.safeParse("ghp_short").success).toBe(false);
	});
});

describe("repository and exchange schemas", () => {
	it("requires owner/repo format for a full name", () => {
		expect(bindRepositorySchema.safeParse({ fullName: "jorge/project" }).success).toBe(true);
		expect(bindRepositorySchema.safeParse({ fullName: "not a repo" }).success).toBe(false);
	});

	it("validates report reasons", () => {
		expect(reportSchema.safeParse({ repositoryId: "repo_1", reason: "spam" }).success).toBe(true);
		expect(reportSchema.safeParse({ repositoryId: "repo_1", reason: "boring" }).success).toBe(
			false,
		);
	});

	it("coerces and caps the daily star limit", () => {
		expect(updateSettingsSchema.parse({ dailyStarLimit: "10" })).toEqual({
			dailyStarLimit: 10,
		});
		expect(updateSettingsSchema.safeParse({ dailyStarLimit: 999 }).success).toBe(false);
		expect(updateSettingsSchema.safeParse({ dailyStarLimit: 0 }).success).toBe(false);
	});
});

describe("consent schemas", () => {
	it("requires explicit policy acceptance", () => {
		expect(policySchema.safeParse({ accept: true }).success).toBe(true);
		expect(policySchema.safeParse({ accept: false }).success).toBe(false);
		expect(policySchema.safeParse({}).success).toBe(false);
	});

	it("requires the exact deletion confirmation phrase", () => {
		expect(deleteAccountSchema.safeParse({ confirmation: "delete my account" }).success).toBe(true);
		expect(deleteAccountSchema.safeParse({ confirmation: "delete" }).success).toBe(false);
	});
});
