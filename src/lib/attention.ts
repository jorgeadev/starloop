import "server-only";
import type { Connection, Repository, User } from "@/lib/db/schema";

export type AttentionItem = {
	id: string;
	title: string;
	detail: string;
	href: string;
	action: string;
	tone: "warning" | "danger" | "info";
};

export function buildAttentionItems({
	user,
	connection,
	activeRepository,
	verificationDue,
}: {
	user: User;
	connection: Connection | null;
	activeRepository: Repository | null;
	verificationDue: number;
}): AttentionItem[] {
	const items: AttentionItem[] = [];

	if (!user.policyAcceptedAt) {
		items.push({
			id: "policy",
			title: "Accept the community rules",
			detail: "One quick step before you can give or receive stars.",
			href: "/welcome",
			action: "Review",
			tone: "warning",
		});
	}

	if (!user.isDemo && !connection) {
		items.push({
			id: "connection",
			title: "Connect GitHub",
			detail: "Starring and verification need a GitHub credential on file.",
			href: "/connect?manage=1",
			action: "Connect",
			tone: "warning",
		});
	} else if (connection?.needsReauth) {
		items.push({
			id: "reauth",
			title: "GitHub needs reconnecting",
			detail: "The saved credential was rejected or expired.",
			href: "/connect?manage=1",
			action: "Reconnect",
			tone: "danger",
		});
	}

	if (!activeRepository) {
		items.push({
			id: "repository",
			title: "No active repository",
			detail: "Bind one public project so the queue can send stars your way.",
			href: "/repositories",
			action: "Choose repo",
			tone: "warning",
		});
	} else if (user.pausePromotion) {
		items.push({
			id: "paused",
			title: "Promotion is paused",
			detail: `${activeRepository.fullName} is hidden from the queue.`,
			href: "/settings",
			action: "Resume",
			tone: "info",
		});
	}

	if (user.credits < 2 && activeRepository) {
		items.push({
			id: "credits",
			title: "Low credit balance",
			detail: "Give a star to top up. The next incoming star needs a credit to spend.",
			href: "/discover",
			action: "Find a star",
			tone: "warning",
		});
	}

	if (verificationDue > 0) {
		items.push({
			id: "verify",
			title: `${verificationDue} ${verificationDue === 1 ? "star needs" : "stars need"} verification`,
			detail: "Confirm they are still on GitHub so credits stay backed by real stars.",
			href: "/credits",
			action: "Verify",
			tone: "info",
		});
	}

	if (activeRepository?.syncedAt && Date.now() - activeRepository.syncedAt > 7 * 86_400_000) {
		items.push({
			id: "stale",
			title: "Repository data is a week old",
			detail: "Sync stars and activity so the queue shows current numbers.",
			href: "/repositories",
			action: "Sync",
			tone: "info",
		});
	}

	return items;
}
