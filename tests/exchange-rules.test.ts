import { describe, expect, it } from "vitest";
import { evaluateStarEligibility, type EligibilityInput } from "@/lib/exchange-rules";

const DAY = 86_400_000;

function makeInput(overrides: Partial<EligibilityInput> = {}): EligibilityInput {
	const now = Date.now();
	const base: EligibilityInput = {
		giver: {
			id: "giver",
			status: "active",
			policyAcceptedAt: now - DAY,
			dailyStarLimit: 5,
		},
		owner: {
			id: "owner",
			status: "active",
			credits: 3,
			pausePromotion: false,
		},
		repository: {
			id: "repo",
			userId: "owner",
			isActive: true,
			isPrivate: false,
			isArchived: false,
			isFork: false,
			description: "A sufficiently detailed project description.",
			pushedAt: now - DAY,
			status: "active",
		},
		givenToday: 0,
		inboundToday: 0,
		maxInboundPerDay: 8,
		alreadyStarred: false,
		now,
	};

	return {
		...base,
		...overrides,
		giver: { ...base.giver, ...overrides.giver },
		owner: { ...base.owner, ...overrides.owner },
		repository: { ...base.repository, ...overrides.repository },
	};
}

function codeFor(overrides: Partial<EligibilityInput>) {
	const result = evaluateStarEligibility(makeInput(overrides));
	return result.ok ? null : result.code;
}

describe("star eligibility", () => {
	it("allows a clean, human star", () => {
		expect(evaluateStarEligibility(makeInput())).toEqual({ ok: true });
	});

	it("requires an active account and accepted policy", () => {
		expect(codeFor({ giver: { ...makeInput().giver, status: "suspended" } })).toBe(
			"giver_inactive",
		);
		expect(codeFor({ giver: { ...makeInput().giver, policyAcceptedAt: null } })).toBe(
			"policy_required",
		);
	});

	it("rejects self-stars and ineligible repositories", () => {
		expect(codeFor({ repository: { ...makeInput().repository, userId: "giver" } })).toBe(
			"own_repository",
		);
		expect(codeFor({ repository: { ...makeInput().repository, isActive: false } })).toBe(
			"repo_inactive",
		);
		expect(codeFor({ repository: { ...makeInput().repository, isPrivate: true } })).toBe(
			"repo_private",
		);
		expect(codeFor({ repository: { ...makeInput().repository, isArchived: true } })).toBe(
			"repo_archived",
		);
		expect(codeFor({ repository: { ...makeInput().repository, isFork: true } })).toBe("repo_fork");
	});

	it("requires a funded, active, unpaused owner", () => {
		expect(codeFor({ owner: { ...makeInput().owner, status: "suspended" } })).toBe(
			"owner_inactive",
		);
		expect(codeFor({ owner: { ...makeInput().owner, pausePromotion: true } })).toBe("owner_paused");
		expect(codeFor({ owner: { ...makeInput().owner, credits: 0 } })).toBe("no_credits");
	});

	it("rejects duplicate stars and cap violations", () => {
		expect(codeFor({ alreadyStarred: true })).toBe("already_starred");
		expect(codeFor({ givenToday: 5 })).toBe("daily_limit");
		expect(codeFor({ givenToday: 20, giver: { ...makeInput().giver, dailyStarLimit: 99 } })).toBe(
			"daily_limit",
		);
		expect(codeFor({ inboundToday: 8 })).toBe("inbound_limit");
	});

	it("requires a meaningful description and recent activity", () => {
		expect(codeFor({ repository: { ...makeInput().repository, description: "Too short" } })).toBe(
			"description_short",
		);
		expect(
			codeFor({
				repository: { ...makeInput().repository, pushedAt: Date.now() - 549 * DAY },
			}),
		).toBe("repo_stale");
	});
});
