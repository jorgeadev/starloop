import { MAX_DAILY_STAR_LIMIT } from "@/lib/constants";
import type { Repository, User } from "@/lib/db/schema";

export type EligibilityInput = {
	giver: Pick<User, "id" | "status" | "policyAcceptedAt" | "dailyStarLimit">;
	owner: Pick<User, "id" | "status" | "credits" | "pausePromotion">;
	repository: Pick<
		Repository,
		| "id"
		| "userId"
		| "isActive"
		| "isPrivate"
		| "isArchived"
		| "isFork"
		| "description"
		| "pushedAt"
		| "status"
	>;
	givenToday: number;
	inboundToday: number;
	maxInboundPerDay: number;
	alreadyStarred: boolean;
	now?: number;
};

export type EligibilityResult =
	| { ok: true }
	| {
			ok: false;
			code: string;
			message: string;
	  };

const MAX_STALE_DAYS = 548;

/**
 * Pure guardrails, tested separately from GitHub and the database. The rules
 * deliberately favor quality over volume: one active repo, a daily cap, a
 * per-repo inbound cap, public non-fork projects, and a human action.
 */
export function evaluateStarEligibility(input: EligibilityInput): EligibilityResult {
	const now = input.now ?? Date.now();

	if (input.giver.status !== "active") {
		return { ok: false, code: "giver_inactive", message: "This account is not active." };
	}
	if (!input.giver.policyAcceptedAt) {
		return {
			ok: false,
			code: "policy_required",
			message: "Accept the community rules before giving a star.",
		};
	}
	if (input.repository.userId === input.giver.id) {
		return {
			ok: false,
			code: "own_repository",
			message: "You cannot exchange a star with your own repository.",
		};
	}
	if (!input.repository.isActive || input.repository.status !== "active") {
		return {
			ok: false,
			code: "repo_inactive",
			message: "This repository is not active in the exchange.",
		};
	}
	if (input.repository.isPrivate) {
		return {
			ok: false,
			code: "repo_private",
			message: "Only public repositories can participate.",
		};
	}
	if (input.repository.isArchived) {
		return {
			ok: false,
			code: "repo_archived",
			message: "Archived repositories are not eligible.",
		};
	}
	if (input.repository.isFork) {
		return {
			ok: false,
			code: "repo_fork",
			message: "Forked repositories are not eligible. Promote the original project.",
		};
	}
	if (input.owner.status !== "active") {
		return { ok: false, code: "owner_inactive", message: "The owner's account is not active." };
	}
	if (input.owner.pausePromotion) {
		return {
			ok: false,
			code: "owner_paused",
			message: "This owner paused their promotion.",
		};
	}
	if (input.owner.credits < 1) {
		return {
			ok: false,
			code: "no_credits",
			message:
				"This project has no credits left. It has left the queue until the owner gives stars.",
		};
	}
	if (input.alreadyStarred) {
		return {
			ok: false,
			code: "already_starred",
			message: "You already credited this repository.",
		};
	}
	if (input.givenToday >= Math.min(input.giver.dailyStarLimit, MAX_DAILY_STAR_LIMIT)) {
		return {
			ok: false,
			code: "daily_limit",
			message: "You reached your daily star limit. The limit keeps the exchange human-paced.",
		};
	}
	if (input.inboundToday >= input.maxInboundPerDay) {
		return {
			ok: false,
			code: "inbound_limit",
			message: "This repository reached its daily incoming-star cap. Try again tomorrow.",
		};
	}
	if (!input.repository.description || input.repository.description.trim().length < 20) {
		return {
			ok: false,
			code: "description_short",
			message: "This repository needs a meaningful description before it can be promoted.",
		};
	}
	if (input.repository.pushedAt && now - input.repository.pushedAt > MAX_STALE_DAYS * 86_400_000) {
		return {
			ok: false,
			code: "repo_stale",
			message: "This project has not been updated in over 18 months.",
		};
	}

	return { ok: true };
}
