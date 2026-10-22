import { rethrowApi } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth/connections";
import { getUserRepositories } from "@/lib/db/queries";
import { listUserRepositories } from "@/lib/github/client";
import { jsonError, ok, requireApiUser, withApi } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateRepositoryBinding } from "@/lib/repositories";

export type RepositoryOption = {
	githubId: number;
	fullName: string;
	name: string;
	description: string | null;
	stars: number;
	language: string | null;
	isPrivate: boolean;
	isFork: boolean;
	isArchived: boolean;
	pushedAt: number | null;
	eligible: boolean;
	reason: string | null;
};

export async function GET() {
	return withApi(async () => {
		const session = await requireApiUser();
		const activeRows = await getUserRepositories(session.user.id);
		const active = activeRows.find((repository) => repository.isActive) ?? null;

		if (session.user.isDemo) {
			return ok({
				repositories: activeRows.map((repository) => ({
					githubId: repository.githubId,
					fullName: repository.fullName,
					name: repository.name,
					description: repository.description,
					stars: repository.stars,
					language: repository.language,
					isPrivate: repository.isPrivate,
					isFork: repository.isFork,
					isArchived: repository.isArchived,
					pushedAt: repository.pushedAt,
					eligible: false,
					reason: "Demo mode. Connect GitHub to bind your own repository.",
				})),
				activeFullName: active?.fullName ?? null,
				demo: true,
			});
		}

		const limit = await rateLimit(`github-repos:${session.user.id}`, 30, 60_000);
		if (!limit.ok) {
			return jsonError(429, "GitHub is being asked too often. Wait a minute.", "rate_limited");
		}

		try {
			const { token } = await getAccessToken(session.user.id);
			const { data } = await listUserRepositories(token, 1);

			const repositories: RepositoryOption[] = data
				.filter(
					(repository) => repository.owner.login.toLowerCase() === session.user.login.toLowerCase(),
				)
				.map((repository) => {
					const evaluation = evaluateRepositoryBinding(repository, session.user);
					return {
						githubId: repository.id,
						fullName: repository.full_name,
						name: repository.name,
						description: repository.description,
						stars: repository.stargazers_count,
						language: repository.language,
						isPrivate: repository.private,
						isFork: repository.fork,
						isArchived: repository.archived,
						pushedAt: repository.pushed_at ? Date.parse(repository.pushed_at) : null,
						eligible: evaluation.ok,
						reason: evaluation.ok ? null : evaluation.reason,
					};
				})
				.sort((left, right) => {
					if (left.eligible !== right.eligible) return left.eligible ? -1 : 1;
					return (right.pushedAt ?? 0) - (left.pushedAt ?? 0);
				});

			return ok({
				repositories,
				activeFullName: active?.fullName ?? null,
				truncated: data.length === 100,
			});
		} catch (error) {
			rethrowApi(error);
		}
	});
}
