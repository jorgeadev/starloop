import { ArrowRight, Check, CircleDashed, ShieldAlert, Star } from "lucide-react";
import Link from "next/link";
import { RepositoryManager, type RepoView } from "@/components/repositories/repository-manager";
import { VerifyButton } from "@/components/repo/verify-button";
import { buttonStyles } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { connectionKindLabel, getConnection } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { getUserRepositories } from "@/lib/db/queries";

export const metadata = { title: "Repositories" };
export const dynamic = "force-dynamic";

const requirements = [
	"Public, not archived",
	"You own it",
	"Not a fork",
	"20+ character description",
	"Updated in the last 18 months",
	"At least 3 days old",
];

export default async function RepositoriesPage() {
	const user = await requireUser();
	const [connection, rows] = await Promise.all([
		getConnection(user.id),
		getUserRepositories(user.id),
	]);

	const repositories: RepoView[] = rows.map((repository) => ({
		id: repository.id,
		fullName: repository.fullName,
		name: repository.name,
		owner: repository.owner,
		description: repository.description,
		stars: repository.stars,
		forks: repository.forks,
		language: repository.language,
		topics: repository.topics,
		avatarUrl: repository.avatarUrl,
		isActive: repository.isActive,
		status: repository.status,
		boundAt: repository.boundAt,
		syncedAt: repository.syncedAt,
	}));

	const active = repositories.find((repository) => repository.isActive) ?? null;
	const canManage = !user.isDemo && Boolean(connection) && !connection?.needsReauth;
	const connectionLabel = user.isDemo
		? "Demo workspace"
		: connection
			? connectionKindLabel(connection.kind)
			: null;

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Repositories"
				title="One project, clearly presented."
				description="The exchange works best when the queue has one legible project per member. Bind a public repository you own; you can change it whenever you like."
				actions={
					<>
						<VerifyButton />
						<Link href="/discover" className={buttonStyles("primary", "md")}>
							Give a star <ArrowRight size={13} />
						</Link>
					</>
				}
			/>

			{user.isDemo ? (
				<Notice tone="info" title="You are in the demo workspace">
					The active repository is <span className="font-mono text-ink">mayachen/atlas</span>.
					GitHub actions are simulated. Connect a real account to bind your own project.
				</Notice>
			) : !connection ? (
				<Notice
					tone="warning"
					title="Connect GitHub to manage repositories"
					action={
						<Link href="/connect?manage=1" className={buttonStyles("star", "sm")}>
							Connect
						</Link>
					}
				>
					Starring, binding, and syncing use your own GitHub credential. Starloop never asks for
					your GitHub password.
				</Notice>
			) : connection.needsReauth ? (
				<Notice
					tone="danger"
					title="Your GitHub credential needs to be replaced"
					action={
						<Link href="/connect?manage=1" className={buttonStyles("star", "sm")}>
							Reconnect
						</Link>
					}
				>
					GitHub rejected the saved token or it expired. Your repository and credits are safe.
				</Notice>
			) : null}

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
				<RepositoryManager
					repositories={repositories}
					active={active}
					canManage={canManage}
					isDemo={user.isDemo}
					connectionLabel={connectionLabel}
				/>

				<aside className="space-y-4">
					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<Star size={13} className="text-star" />
							<h2 className="text-[12.5px] font-medium text-ink">Eligibility</h2>
						</div>
						<p className="mt-1 text-[10.5px] leading-4 text-muted">
							Checked against GitHub when you bind. No exceptions, no manual overrides.
						</p>
						<ul className="mt-3 space-y-2">
							{requirements.map((requirement) => (
								<li key={requirement} className="flex items-start gap-2 text-[11px] text-secondary">
									<Check size={12} className="mt-0.5 shrink-0 text-mint" />
									{requirement}
								</li>
							))}
						</ul>
					</Panel>

					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<CircleDashed size={13} className="text-sky" />
							<h2 className="text-[12.5px] font-medium text-ink">What one-at-a-time means</h2>
						</div>
						<ul className="mt-3 space-y-2.5 text-[10.5px] leading-4 text-muted">
							<li>
								<span className="text-secondary">One active repo.</span> Binding a new project
								deactivates the old one but keeps its history.
							</li>
							<li>
								<span className="text-secondary">Stars can keep arriving.</span> Incoming stars
								spend your credits even if you pause promotion.
							</li>
							<li>
								<span className="text-secondary">No transfers.</span> Repositories cannot be moved
								between members to farm credits.
							</li>
						</ul>
					</Panel>

					<Notice
						tone="warning"
						title="GitHub policy risk is real"
						action={
							<Link href="/legal#github-policy" className={buttonStyles("quiet", "sm")}>
								Read
							</Link>
						}
					>
						Reciprocal starring may conflict with GitHub&apos;s rules or a maintainer&apos;s
						expectations. Participation is voluntary and at your own risk.
					</Notice>

					<Panel className="p-4">
						<div className="flex items-start gap-2">
							<ShieldAlert size={13} className="mt-0.5 shrink-0 text-muted" />
							<p className="text-[10px] leading-4 text-muted/80">
								Starloop is not affiliated with GitHub, Inc. We do not automate stars, sell stars,
								or guarantee growth.
							</p>
						</div>
					</Panel>
				</aside>
			</div>
		</div>
	);
}
