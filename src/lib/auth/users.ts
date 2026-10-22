import { eq } from "drizzle-orm";
import { STARTER_CREDITS } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { ensureDatabase } from "@/lib/db/migrate";
import { activities, creditLedger, users, type User } from "@/lib/db/schema";
import type { GitHubUser } from "@/lib/github/client";

export async function upsertUserFromGitHub(profile: GitHubUser): Promise<User> {
	await ensureDatabase();
	const now = Date.now();

	const existing = await db.select().from(users).where(eq(users.githubId, profile.id)).limit(1);

	if (existing[0]) {
		const updated = await db
			.update(users)
			.set({
				login: profile.login,
				name: profile.name,
				email: profile.email,
				avatarUrl: profile.avatar_url,
				bio: profile.bio,
				profileUrl: profile.html_url,
				updatedAt: now,
				lastSeenAt: now,
			})
			.where(eq(users.id, existing[0].id))
			.returning();
		return updated[0] ?? existing[0];
	}

	const id = crypto.randomUUID();
	const user = {
		id,
		githubId: profile.id,
		login: profile.login,
		name: profile.name,
		email: profile.email,
		avatarUrl: profile.avatar_url,
		bio: profile.bio,
		profileUrl: profile.html_url,
		credits: STARTER_CREDITS,
		starsGiven: 0,
		starsReceived: 0,
		dailyStarLimit: Number(process.env.MAX_DAILY_STARS ?? 5),
		pausePromotion: false,
		policyVersion: null,
		policyAcceptedAt: null,
		onboardingCompletedAt: null,
		isDemo: false,
		status: "active",
		createdAt: now,
		updatedAt: now,
		lastSeenAt: now,
	};

	await db.transaction(async (tx) => {
		await tx.insert(users).values(user);
		await tx.insert(creditLedger).values({
			id: crypto.randomUUID(),
			userId: id,
			delta: STARTER_CREDITS,
			balanceAfter: STARTER_CREDITS,
			reason: "welcome_grant",
			detail: "Three credits to start exchanging.",
			createdAt: now,
		});
		await tx.insert(activities).values({
			id: crypto.randomUUID(),
			userId: id,
			actorId: null,
			type: "welcome",
			title: "Welcome to Starloop",
			detail: "Bind a repository and give your first star to start the loop.",
			createdAt: now,
		});
	});

	return user;
}

export async function acceptPolicy(userId: string, version: string): Promise<void> {
	const now = Date.now();
	await db
		.update(users)
		.set({
			policyVersion: version,
			policyAcceptedAt: now,
			onboardingCompletedAt: now,
			updatedAt: now,
		})
		.where(eq(users.id, userId));
}
