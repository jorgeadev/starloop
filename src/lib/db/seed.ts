import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { activities, appMeta, creditLedger, exchangeStars, repositories, users } from "./schema";
import { resolveDatabaseEnvironment } from "./config";

const SEED_VERSION = "2026-10-22.1";
const DAY = 86_400_000;
const HOUR = 3_600_000;

const now = Date.now();

type SeedUser = {
	id: string;
	login: string;
	name: string;
	bio: string;
	credits: number;
	starsGiven: number;
	starsReceived: number;
};

type SeedRepo = {
	id: string;
	userId: string;
	githubId: number;
	fullName: string;
	description: string;
	language: string;
	stars: number;
	forks: number;
	topics: string[];
	active?: boolean;
	status?: "active" | "archived";
	boundDaysAgo: number;
};

const communityUsers: SeedUser[] = [
	{
		id: "u_north",
		login: "northstar-dev",
		name: "Nadia Okafor",
		bio: "Distributed systems, type safety, and very small binaries.",
		credits: 6,
		starsGiven: 24,
		starsReceived: 18,
	},
	{
		id: "u_orbit",
		login: "orbital-labs",
		name: "Léo Martin",
		bio: "Building calm infrastructure for small teams.",
		credits: 3,
		starsGiven: 11,
		starsReceived: 7,
	},
	{
		id: "u_paper",
		login: "paperplane-ui",
		name: "Priya Raman",
		bio: "Accessible interfaces, copied and pasted with care.",
		credits: 8,
		starsGiven: 41,
		starsReceived: 32,
	},
	{
		id: "u_sun",
		login: "sundial-labs",
		name: "Tomás Silva",
		bio: "CLI tools that stay out of the way.",
		credits: 2,
		starsGiven: 9,
		starsReceived: 5,
	},
	{
		id: "u_field",
		login: "field-notes",
		name: "Ines Weber",
		bio: "Notebooks for people who think in links.",
		credits: 4,
		starsGiven: 17,
		starsReceived: 13,
	},
	{
		id: "u_lowtide",
		login: "lowtide-dev",
		name: "Kai Nakamura",
		bio: "Databases, migrations, and boring reliability.",
		credits: 5,
		starsGiven: 22,
		starsReceived: 16,
	},
	{
		id: "u_harbor",
		login: "harbor-lines",
		name: "Sam Osei",
		bio: "Incident response tooling for humans.",
		credits: 3,
		starsGiven: 12,
		starsReceived: 8,
	},
	{
		id: "u_nine",
		login: "ninefold",
		name: "Elena Petrova",
		bio: "Making data feel local, fast and legible.",
		credits: 1,
		starsGiven: 7,
		starsReceived: 6,
	},
	{
		id: "u_still",
		login: "stillwater-io",
		name: "Jonas Berg",
		bio: "Double-entry accounting, single-entry complexity.",
		credits: 2,
		starsGiven: 8,
		starsReceived: 4,
	},
	{
		id: "u_fern",
		login: "fernway",
		name: "Aiko Tanaka",
		bio: "Native software with a soft edge.",
		credits: 4,
		starsGiven: 15,
		starsReceived: 11,
	},
	{
		id: "u_mono",
		login: "monogram",
		name: "Diego Alvarez",
		bio: "Design systems that fit in a weekend.",
		credits: 5,
		starsGiven: 19,
		starsReceived: 14,
	},
	{
		id: "u_cinder",
		login: "cinder-labs",
		name: "Ruth Cohen",
		bio: "Search, indexing, and the joy of a good query.",
		credits: 2,
		starsGiven: 6,
		starsReceived: 9,
	},
	{
		id: "u_lumen",
		login: "lumen-tools",
		name: "Fatima Zahra",
		bio: "Small tools for thought and note-taking.",
		credits: 6,
		starsGiven: 28,
		starsReceived: 21,
	},
	{
		id: "u_pine",
		login: "pine-and-co",
		name: "Ollie Grant",
		bio: "Compilers, parsers, and trees that stay upright.",
		credits: 3,
		starsGiven: 13,
		starsReceived: 10,
	},
];

const communityRepos: SeedRepo[] = [
	{
		id: "r_relay",
		userId: "u_north",
		githubId: 8002001,
		fullName: "northstar-dev/relay",
		description: "A typed, dependency-free event bus for TypeScript services.",
		language: "TypeScript",
		stars: 842,
		forks: 57,
		topics: ["typescript", "events", "backend"],
		boundDaysAgo: 12,
	},
	{
		id: "r_kepler",
		userId: "u_orbit",
		githubId: 8002002,
		fullName: "orbital-labs/kepler",
		description: "Self-hosted feature flags with a tiny footprint and a real audit log.",
		language: "Go",
		stars: 1930,
		forks: 121,
		topics: ["feature-flags", "go", "self-hosted"],
		boundDaysAgo: 9,
	},
	{
		id: "r_arc",
		userId: "u_paper",
		githubId: 8002003,
		fullName: "paperplane-ui/arc",
		description: "Accessible React primitives, copied into your project, not installed.",
		language: "TypeScript",
		stars: 4102,
		forks: 284,
		topics: ["react", "accessibility", "design-system"],
		boundDaysAgo: 21,
	},
	{
		id: "r_tempo",
		userId: "u_sun",
		githubId: 8002004,
		fullName: "sundial-labs/tempo",
		description: "A quiet time-tracking CLI that writes plain-text timesheets.",
		language: "Rust",
		stars: 529,
		forks: 31,
		topics: ["cli", "rust", "productivity"],
		boundDaysAgo: 6,
	},
	{
		id: "r_inkwell",
		userId: "u_field",
		githubId: 8002005,
		fullName: "field-notes/inkwell",
		description: "Markdown notebooks with backlinks, local files, and no lock-in.",
		language: "Svelte",
		stars: 2260,
		forks: 143,
		topics: ["notes", "markdown", "local-first"],
		boundDaysAgo: 17,
	},
	{
		id: "r_drift",
		userId: "u_lowtide",
		githubId: 8002006,
		fullName: "lowtide-dev/drift",
		description: "A migration runner for teams that want to read their SQL.",
		language: "Python",
		stars: 388,
		forks: 24,
		topics: ["database", "migrations", "python"],
		boundDaysAgo: 4,
	},
	{
		id: "r_signal",
		userId: "u_harbor",
		githubId: 8002007,
		fullName: "harbor-lines/signal",
		description: "Open-source incident timelines that read like a story.",
		language: "Elixir",
		stars: 1041,
		forks: 62,
		topics: ["incident-response", "elixir", "observability"],
		boundDaysAgo: 14,
	},
	{
		id: "r_querypad",
		userId: "u_nine",
		githubId: 8002008,
		fullName: "ninefold/querypad",
		description: "A SQL playground in the browser with instant sharing and saved queries.",
		language: "JavaScript",
		stars: 7530,
		forks: 402,
		topics: ["sql", "browser", "developer-tools"],
		boundDaysAgo: 31,
	},
	{
		id: "r_ledger",
		userId: "u_still",
		githubId: 8002009,
		fullName: "stillwater-io/ledger",
		description: "Double-entry accounting primitives for products that handle money.",
		language: "Rust",
		stars: 611,
		forks: 44,
		topics: ["fintech", "accounting", "rust"],
		boundDaysAgo: 8,
	},
	{
		id: "r_fern",
		userId: "u_fern",
		githubId: 8002010,
		fullName: "fernway/fern",
		description: "A focused RSS reader for iOS and macOS, built with SwiftUI.",
		language: "Swift",
		stars: 963,
		forks: 53,
		topics: ["swiftui", "rss", "apple"],
		boundDaysAgo: 19,
	},
	{
		id: "r_mono",
		userId: "u_mono",
		githubId: 8002011,
		fullName: "monogram/mono",
		description: "A design system starter with tokens, docs, and no runtime CSS.",
		language: "TypeScript",
		stars: 1490,
		forks: 96,
		topics: ["design-system", "tokens", "css"],
		boundDaysAgo: 10,
	},
	{
		id: "r_ash",
		userId: "u_cinder",
		githubId: 8002012,
		fullName: "cinder-labs/ash",
		description: "Fast full-text search over your Postgres data, with zero sync jobs.",
		language: "Go",
		stars: 2745,
		forks: 168,
		topics: ["search", "postgres", "go"],
		boundDaysAgo: 25,
	},
	{
		id: "r_glow",
		userId: "u_lumen",
		githubId: 8002013,
		fullName: "lumen-tools/glow",
		description: "A local-first library for highlights, quotes, and reading notes.",
		language: "Python",
		stars: 714,
		forks: 39,
		topics: ["reading", "local-first", "python"],
		boundDaysAgo: 5,
	},
	{
		id: "r_timber",
		userId: "u_pine",
		githubId: 8002014,
		fullName: "pine-and-co/timber",
		description: "An incremental parser toolkit with error recovery and great diagnostics.",
		language: "Rust",
		stars: 1875,
		forks: 112,
		topics: ["parser", "compiler", "rust"],
		boundDaysAgo: 16,
	},
];

const demoRepos: SeedRepo[] = [
	{
		id: "r_atlas",
		userId: "u_demo",
		githubId: 8001001,
		fullName: "mayachen/atlas",
		description:
			"A quiet, keyboard-first workspace for engineering teams. Notes, decisions, and deep work in one place.",
		language: "TypeScript",
		stars: 1284,
		forks: 96,
		topics: ["productivity", "electron", "typescript", "open-source"],
		active: true,
		boundDaysAgo: 46,
	},
	{
		id: "r_fold",
		userId: "u_demo",
		githubId: 8001002,
		fullName: "mayachen/fold",
		description: "A tiny CLI that folds long diffs into readable review units.",
		language: "Rust",
		stars: 312,
		forks: 18,
		topics: ["cli", "git", "rust"],
		status: "archived",
		boundDaysAgo: 120,
	},
];

export async function seedDemoData() {
	if (process.env.SEED_DEMO_DATA !== "true") return;
	if (resolveDatabaseEnvironment() === "production") return;

	const existing = await db
		.select({ value: appMeta.value })
		.from(appMeta)
		.where(eq(appMeta.key, "seed_version"))
		.limit(1);

	if (existing[0]?.value === SEED_VERSION) return;

	await db
		.insert(users)
		.values({
			id: "u_demo",
			githubId: 90_000_001,
			login: "mayachen",
			name: "Maya Chen",
			email: "maya@example.com",
			bio: "Design engineer. Building calm tools for busy teams.",
			profileUrl: "https://github.com/mayachen",
			credits: 12,
			starsGiven: 6,
			starsReceived: 4,
			dailyStarLimit: 5,
			policyVersion: process.env.POLICY_VERSION ?? "2026-10-22",
			policyAcceptedAt: now - 40 * DAY,
			onboardingCompletedAt: now - 40 * DAY,
			isDemo: true,
			status: "active",
			createdAt: now - 40 * DAY,
			updatedAt: now - 2 * HOUR,
			lastSeenAt: now - 2 * HOUR,
		})
		.onConflictDoNothing();

	for (const [index, user] of communityUsers.entries()) {
		await db
			.insert(users)
			.values({
				id: user.id,
				githubId: 91_000_001 + index,
				login: user.login,
				name: user.name,
				bio: user.bio,
				profileUrl: `https://github.com/${user.login}`,
				credits: user.credits,
				starsGiven: user.starsGiven,
				starsReceived: user.starsReceived,
				dailyStarLimit: 5,
				policyVersion: process.env.POLICY_VERSION ?? "2026-10-22",
				policyAcceptedAt: now - 30 * DAY,
				onboardingCompletedAt: now - 30 * DAY,
				status: "active",
				createdAt: now - 90 * DAY,
				updatedAt: now - 12 * HOUR,
			})
			.onConflictDoNothing();
	}

	for (const repo of demoRepos) {
		await db
			.insert(repositories)
			.values({
				id: repo.id,
				userId: repo.userId,
				githubId: repo.githubId,
				fullName: repo.fullName,
				owner: repo.fullName.split("/")[0]!,
				name: repo.fullName.split("/")[1]!,
				description: repo.description,
				language: repo.language,
				stars: repo.stars,
				forks: repo.forks,
				topics: JSON.stringify(repo.topics),
				isActive: Boolean(repo.active),
				status: repo.status ?? "active",
				boundAt: now - repo.boundDaysAgo * DAY,
				pushedAt: now - 12 * HOUR,
				syncedAt: now - 2 * HOUR,
			})
			.onConflictDoNothing();
	}

	for (const repo of communityRepos) {
		await db
			.insert(repositories)
			.values({
				id: repo.id,
				userId: repo.userId,
				githubId: repo.githubId,
				fullName: repo.fullName,
				owner: repo.fullName.split("/")[0]!,
				name: repo.fullName.split("/")[1]!,
				description: repo.description,
				language: repo.language,
				stars: repo.stars,
				forks: repo.forks,
				topics: JSON.stringify(repo.topics),
				isActive: true,
				status: "active",
				boundAt: now - repo.boundDaysAgo * DAY,
				pushedAt: now - (repo.boundDaysAgo % 7) * HOUR - HOUR,
				syncedAt: now - 3 * HOUR,
			})
			.onConflictDoNothing();
	}

	// Six stars Maya gave, matching the queue's "already starred" state.
	const givenRepoIds = ["r_relay", "r_kepler", "r_arc", "r_tempo", "r_inkwell", "r_drift"];
	const givenAt = [6, 5, 4, 3, 2, 1].map((days) => now - days * DAY);

	for (const [index, repoId] of givenRepoIds.entries()) {
		const repo = communityRepos.find((entry) => entry.id === repoId)!;
		await db
			.insert(exchangeStars)
			.values({
				id: `xs_given_${repo.id}`,
				giverId: "u_demo",
				repositoryId: repo.id,
				ownerId: repo.userId,
				status: "confirmed",
				creditTransferred: 1,
				createdAt: givenAt[index]!,
				verifiedAt: givenAt[index]!,
				lastCheckedAt: index < 4 ? now - 2 * DAY : null,
			})
			.onConflictDoNothing();
	}

	// Four stars Maya received on her active repository.
	const inbound = [
		{ user: "u_field", at: now - 7 * DAY },
		{ user: "u_lowtide", at: now - 4 * DAY },
		{ user: "u_harbor", at: now - 2 * DAY },
		{ user: "u_nine", at: now - 5 * HOUR },
	];

	for (const [index, entry] of inbound.entries()) {
		await db
			.insert(exchangeStars)
			.values({
				id: `xs_inbound_${entry.user}`,
				giverId: entry.user,
				repositoryId: "r_atlas",
				ownerId: "u_demo",
				status: "confirmed",
				creditTransferred: 1,
				createdAt: entry.at,
				verifiedAt: entry.at,
				lastCheckedAt: index === 3 ? null : now - 2 * DAY,
			})
			.onConflictDoNothing();
	}

	const ledger: Array<{
		id: string;
		delta: number;
		balanceAfter: number;
		reason: string;
		detail: string;
		createdAt: number;
	}> = [
		{
			id: "cl_welcome",
			delta: 3,
			balanceAfter: 3,
			reason: "welcome_grant",
			detail: "Three credits to start exchanging.",
			createdAt: now - 40 * DAY,
		},
		{
			id: "cl_founding",
			delta: 7,
			balanceAfter: 10,
			reason: "founding_grant",
			detail: "Founding member grant.",
			createdAt: now - 39 * DAY,
		},
	];
	let balance = 10;
	const ledgerEvents: Array<{
		at: number;
		delta: number;
		reason: string;
		detail: string;
		id: string;
	}> = [
		{
			at: givenAt[0]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred northstar-dev/relay",
			id: "cl_g1",
		},
		{
			at: givenAt[1]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred orbital-labs/kepler",
			id: "cl_g2",
		},
		{
			at: inbound[0]!.at,
			delta: -1,
			reason: "star_received",
			detail: "field-notes starred mayachen/atlas",
			id: "cl_r1",
		},
		{
			at: givenAt[2]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred paperplane-ui/arc",
			id: "cl_g3",
		},
		{
			at: givenAt[3]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred sundial-labs/tempo",
			id: "cl_g4",
		},
		{
			at: inbound[1]!.at,
			delta: -1,
			reason: "star_received",
			detail: "lowtide-dev starred mayachen/atlas",
			id: "cl_r2",
		},
		{
			at: givenAt[4]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred field-notes/inkwell",
			id: "cl_g5",
		},
		{
			at: inbound[2]!.at,
			delta: -1,
			reason: "star_received",
			detail: "harbor-lines starred mayachen/atlas",
			id: "cl_r3",
		},
		{
			at: givenAt[5]!,
			delta: 1,
			reason: "star_given",
			detail: "Starred lowtide-dev/drift",
			id: "cl_g6",
		},
		{
			at: inbound[3]!.at,
			delta: -1,
			reason: "star_received",
			detail: "ninefold starred mayachen/atlas",
			id: "cl_r4",
		},
	];

	ledgerEvents.sort((a, b) => a.at - b.at);
	for (const event of ledgerEvents) {
		balance += event.delta;
		ledger.push({
			id: event.id,
			delta: event.delta,
			balanceAfter: balance,
			reason: event.reason,
			detail: event.detail,
			createdAt: event.at,
		});
	}

	for (const entry of ledger) {
		await db
			.insert(creditLedger)
			.values({
				id: entry.id,
				userId: "u_demo",
				delta: entry.delta,
				balanceAfter: entry.balanceAfter,
				reason: entry.reason,
				detail: entry.detail,
				createdAt: entry.createdAt,
			})
			.onConflictDoNothing();
	}

	const activityRows = [
		{
			id: "act_welcome",
			type: "welcome",
			title: "Welcome to Starloop",
			detail: "Your workspace is ready. Bind a repository and start exchanging.",
			actorId: null as string | null,
			repoFullName: null as string | null,
			createdAt: now - 40 * DAY,
		},
		{
			id: "act_bind",
			type: "repo_bound",
			title: "atlas became your active repository",
			detail: "One repository at a time keeps the queue fair.",
			actorId: null as string | null,
			repoFullName: "mayachen/atlas",
			createdAt: now - 46 * DAY,
		},
		{
			id: "act_g1",
			type: "star_given",
			title: "You starred northstar-dev/relay",
			detail: "+1 credit added to your balance.",
			actorId: "u_demo",
			repoFullName: "northstar-dev/relay",
			createdAt: givenAt[0]!,
		},
		{
			id: "act_g2",
			type: "star_given",
			title: "You starred orbital-labs/kepler",
			detail: "+1 credit added to your balance.",
			actorId: "u_demo",
			repoFullName: "orbital-labs/kepler",
			createdAt: givenAt[1]!,
		},
		{
			id: "act_r1",
			type: "star_received",
			title: "field-notes starred mayachen/atlas",
			detail: "1 credit used to fund the exchange.",
			actorId: "u_field",
			repoFullName: "mayachen/atlas",
			createdAt: inbound[0]!.at,
		},
		{
			id: "act_g3",
			type: "star_given",
			title: "You starred paperplane-ui/arc",
			detail: "+1 credit added to your balance.",
			actorId: "u_demo",
			repoFullName: "paperplane-ui/arc",
			createdAt: givenAt[2]!,
		},
		{
			id: "act_r2",
			type: "star_received",
			title: "lowtide-dev starred mayachen/atlas",
			detail: "1 credit used to fund the exchange.",
			actorId: "u_lowtide",
			repoFullName: "mayachen/atlas",
			createdAt: inbound[1]!.at,
		},
		{
			id: "act_verify",
			type: "verification",
			title: "Six credited stars re-verified",
			detail: "GitHub confirmed the stars are still in place.",
			actorId: null as string | null,
			repoFullName: null as string | null,
			createdAt: now - 1 * DAY,
		},
		{
			id: "act_r3",
			type: "star_received",
			title: "harbor-lines starred mayachen/atlas",
			detail: "1 credit used to fund the exchange.",
			actorId: "u_harbor",
			repoFullName: "mayachen/atlas",
			createdAt: inbound[2]!.at,
		},
		{
			id: "act_r4",
			type: "star_received",
			title: "ninefold starred mayachen/atlas",
			detail: "1 credit used to fund the exchange.",
			actorId: "u_nine",
			repoFullName: "mayachen/atlas",
			createdAt: inbound[3]!.at,
		},
	];

	for (const activity of activityRows) {
		await db
			.insert(activities)
			.values({
				...activity,
				userId: "u_demo",
			})
			.onConflictDoNothing();
	}

	// A couple of useful notifications for other accounts keep owner pages real.
	await db
		.insert(activities)
		.values({
			id: "act_owner_relay",
			userId: "u_north",
			actorId: "u_demo",
			type: "star_received",
			title: "mayachen starred northstar-dev/relay",
			detail: "1 credit used to fund the exchange.",
			repoFullName: "northstar-dev/relay",
			createdAt: givenAt[0]!,
		})
		.onConflictDoNothing();

	await db
		.insert(appMeta)
		.values({ key: "seed_version", value: SEED_VERSION, updatedAt: now })
		.onConflictDoUpdate({
			target: appMeta.key,
			set: { value: SEED_VERSION, updatedAt: now },
		});
}

export async function getDemoUserId(): Promise<string | null> {
	const rows = await db
		.select({ id: users.id })
		.from(users)
		.where(and(eq(users.isDemo, true), eq(users.status, "active")))
		.limit(1);
	return rows[0]?.id ?? null;
}
