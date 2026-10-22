import { z } from "zod";
import { MAX_DAILY_STAR_LIMIT } from "./constants";

export const githubTokenSchema = z
	.string()
	.trim()
	.min(20, "That token looks too short.")
	.max(255, "That token is too long.")
	.refine(
		(value) =>
			value.startsWith("ghp_") || value.startsWith("github_pat_") || value.startsWith("gho_"),
		"Use a GitHub classic PAT (ghp_), fine-grained PAT (github_pat_) or OAuth token (gho_).",
	);

export const bindRepositorySchema = z.object({
	repositoryId: z.string().min(1).max(64).optional(),
	fullName: z
		.string()
		.regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use the owner/repo format.")
		.max(140)
		.optional(),
});

export const starActionSchema = z.object({
	repositoryId: z.string().min(1).max(64),
});

export const unstarSchema = z.object({
	starId: z.string().min(1).max(64),
});

export const updateSettingsSchema = z.object({
	dailyStarLimit: z.coerce.number().int().min(1).max(MAX_DAILY_STAR_LIMIT).optional(),
	pausePromotion: z.boolean().optional(),
});

export const reportSchema = z.object({
	repositoryId: z.string().min(1).max(64),
	reason: z.enum(["spam", "inactive", "policy", "other"]),
	details: z.string().trim().max(800).optional(),
});

export const deleteAccountSchema = z.object({
	confirmation: z.literal("delete my account"),
});

export const policySchema = z.object({
	accept: z.literal(true),
});
