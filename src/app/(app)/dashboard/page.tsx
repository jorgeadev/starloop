import {
	ArrowRight,
	ArrowUpRight,
	CheckCircle2,
	Coins,
	GitFork,
	ShieldCheck,
	Sparkles,
	Star,
} from "lucide-react";
import Link from "next/link";
import { AttentionStrip } from "@/components/dashboard/attention-strip";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityList } from "@/components/activity/activity-list";
import { RepoRow } from "@/components/repo/repo-row";
import { SyncButton } from "@/components/repo/sync-button";
import { VerifyButton } from "@/components/repo/verify-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LanguageDot } from "@/components/ui/language-dot";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { RhythmChart } from "@/components/ui/rhythm-chart";
import { getConnection } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { buildAttentionItems } from "@/lib/attention";
import {
	getActiveRepository,
	getDashboardStats,
	getQueue,
	getRecentActivities,
	getWeeklyRhythm,
} from "@/lib/db/queries";
import { formatCompact, formatDate, formatNumber, parseTopics } from "@/lib/utils";

export const metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const user = await requireUser();
	const [connection, activeRepository, stats, queue, weekly, activity] = await Promise.all([
		getConnection(user.id),
		getActiveRepository(user.id),
		getDashboardStats(user.id),
		getQueue({ userId: user.id, limit: 3, sort: "for-you" }),
		getWeeklyRhythm(user.id),
		getRecentActivities(user.id, 5),
	]);

	const attention = buildAttentionItems({
		user,
		connection,
		activeRepository,
		verificationDue: stats.verificationDue,
	});

	const firstName = user.name?.split(" ")[0] ?? user.login;
	const givenWeek = weekly.reduce((total, day) => total + day.given, 0);
	const receivedWeek = weekly.reduce((total, day) => total + day.received, 0);
	const topics = activeRepository ? parseTopics(activeRepository.topics).slice(0, 4) : [];
	const demo = user.isDemo && process.env.DEMO_MODE === "true";

	const startingBalance = user.credits - (givenWeek - receivedWeek);
	const balanceSeries = weekly.map((_, index) =>
		weekly
			.slice(0, index + 1)
			.reduce((total, day) => total + day.given - day.received, startingBalance),
	);

	const today = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(new Date());

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow={today}
				title={`Welcome back, ${firstName}.`}
				description={
					activeRepository
						? `${activeRepository.fullName} is in the loop. ${stats.givenToday} of ${user.dailyStarLimit} stars given today, ${stats.verificationDue > 0 ? `${stats.verificationDue} awaiting verification` : "all stars verified"}.`
						: "Bind one public repository, then give a star to start the loop."
				}
				actions={
					<>
						<VerifyButton />
						<Link href="/discover" className={buttonStyles("primary", "md")}>
							Find a project <ArrowRight size={13} />
						</Link>
					</>
				}
			/>

			{attention.length > 0 ? <AttentionStrip items={attention} /> : null}

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<KpiCard
					label="Credit balance"
					value={formatNumber(user.credits)}
					unit="credits"
					hint={
						<>
							<span className="text-mint">+{givenWeek}</span> earned ·{" "}
							<span className="text-star">−{receivedWeek}</span> spent this week
						</>
					}
					icon={<Coins size={14} />}
					tone="star"
					values={balanceSeries}
				/>
				<KpiCard
					label="Stars given"
					value={formatNumber(user.starsGiven)}
					unit="total"
					hint={`${stats.givenToday} given today · cap ${user.dailyStarLimit}`}
					icon={<Star size={14} />}
					tone="star"
					values={weekly.map((day) => day.given)}
				/>
				<KpiCard
					label="Stars received"
					value={formatNumber(user.starsReceived)}
					unit="total"
					hint={`${receivedWeek} in the last 7 days`}
					icon={<Sparkles size={14} />}
					tone="mint"
					values={weekly.map((day) => day.received)}
				/>
				<KpiCard
					label="Repository stars"
					value={activeRepository ? formatCompact(activeRepository.stars) : "—"}
					unit={activeRepository ? activeRepository.fullName.split("/")[1] : undefined}
					hint={
						activeRepository
							? `Synced ${formatDate(activeRepository.syncedAt ?? activeRepository.boundAt, { year: undefined })}`
							: "No active repository"
					}
					icon={<GitFork size={14} />}
					tone="sky"
				/>
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.9fr)]">
				<div className="space-y-4">
					<Panel>
						<PanelHeader
							title="Active repository"
							description="One project at a time keeps the exchange legible."
							action={
								<Badge tone={user.pausePromotion ? "neutral" : "mint"} dot>
									{user.pausePromotion ? "Paused" : "In the queue"}
								</Badge>
							}
						/>
						{activeRepository ? (
							<>
								<div className="p-4 sm:p-5">
									<div className="flex items-start gap-3">
										<Avatar
											src={activeRepository.avatarUrl}
											name={activeRepository.owner}
											login={activeRepository.owner}
											size={42}
											ring
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<a
													href={`https://github.com/${activeRepository.fullName}`}
													target="_blank"
													rel="noreferrer"
													className="truncate font-mono text-[13px] text-ink transition-colors hover:text-star"
												>
													{activeRepository.fullName}
												</a>
												<ArrowUpRight size={12} className="shrink-0 text-muted" />
											</div>
											<p className="mt-1.5 text-[12px] leading-[19px] text-secondary">
												{activeRepository.description ?? "No description yet."}
											</p>
										</div>
									</div>

									<div className="mt-3 flex flex-wrap gap-1.5">
										{topics.length > 0 ? (
											topics.map((topic) => (
												<span
													key={topic}
													className="rounded border border-line-subtle bg-panel-raised/60 px-1.5 py-0.5 text-[9.5px] text-muted"
												>
													{topic}
												</span>
											))
										) : (
											<span className="text-[10px] text-muted/60">No topics</span>
										)}
									</div>

									<div className="mt-4 grid grid-cols-3 divide-x divide-line-subtle rounded-control border border-line-subtle bg-canvas/30">
										<div className="px-3 py-2.5">
											<p className="micro text-muted">Stars</p>
											<p className="numeric mt-1 text-[15px] text-ink">
												{formatNumber(activeRepository.stars)}
											</p>
										</div>
										<div className="px-3 py-2.5">
											<p className="micro text-muted">Forks</p>
											<p className="numeric mt-1 text-[15px] text-ink">
												{formatNumber(activeRepository.forks)}
											</p>
										</div>
										<div className="px-3 py-2.5">
											<p className="micro text-muted">Bound</p>
											<p className="mt-1 text-[12px] text-secondary">
												{formatDate(activeRepository.boundAt)}
											</p>
										</div>
									</div>

									<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
										<LanguageDot language={activeRepository.language} />
										<span className="text-[11px] text-muted">
											{receivedWeek} stars received this week
										</span>
										{stats.verificationDue > 0 ? (
											<span className="inline-flex items-center gap-1 text-[11px] text-star">
												<ShieldCheck size={11} /> {stats.verificationDue} to verify
											</span>
										) : (
											<span className="inline-flex items-center gap-1 text-[11px] text-mint">
												<CheckCircle2 size={11} /> Verified
											</span>
										)}
									</div>
								</div>
								<div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle px-4 py-3 sm:px-5">
									<div className="flex items-center gap-1.5">
										<SyncButton demo={demo} />
										<Link href="/repositories" className={buttonStyles("ghost", "sm")}>
											Manage
										</Link>
									</div>
									<a
										href={`https://github.com/${activeRepository.fullName}`}
										target="_blank"
										rel="noreferrer"
										className={buttonStyles("outline", "sm")}
									>
										View on GitHub <ArrowUpRight size={12} />
									</a>
								</div>
							</>
						) : (
							<div className="p-4 sm:p-5">
								<EmptyState
									icon={<GitFork size={16} />}
									title="No repository in the loop"
									description="Pick one public project with a clear description. That is what the queue will show to other members."
									action={
										<Link href="/repositories" className={buttonStyles("primary", "sm")}>
											Choose a repository <ArrowRight size={13} />
										</Link>
									}
									compact
								/>
							</div>
						)}
					</Panel>

					<Panel>
						<PanelHeader
							title="Worth your star"
							description="Human-reviewed projects from members with credits to spend."
							action={
								<Link
									href="/discover"
									className="inline-flex items-center gap-1 text-[11px] text-secondary transition-colors hover:text-ink"
								>
									See all <ArrowRight size={12} />
								</Link>
							}
						/>
						{queue.items.length > 0 ? (
							<div className="divide-y divide-line-subtle">
								{queue.items.map((repository) => (
									<RepoRow key={repository.id} repository={repository} demo={demo} />
								))}
							</div>
						) : (
							<div className="p-4">
								<EmptyState
									icon={<Star size={16} />}
									title="You cleared today's queue"
									description="New projects arrive as members bind repositories or top up their credits. Check back soon."
									action={
										<Link href="/discover" className={buttonStyles("outline", "sm")}>
											Refresh discovery
										</Link>
									}
									compact
								/>
							</div>
						)}
						<div className="flex items-center gap-2 border-t border-line-subtle px-4 py-2.5 text-[10.5px] text-muted">
							<Coins size={11} className="text-star" />
							Each verified star moves 1 credit from the project owner to you.
						</div>
					</Panel>
				</div>

				<div className="space-y-4">
					<Panel>
						<PanelHeader
							title="Loop rhythm"
							description="Verified stars, last seven days."
							action={
								<Link
									href="/activity"
									className="text-[10.5px] text-muted transition-colors hover:text-secondary"
								>
									Details
								</Link>
							}
						/>
						<div className="p-4">
							<div className="mb-4 grid grid-cols-2 gap-3">
								<div>
									<p className="micro text-muted">Given</p>
									<p className="numeric mt-1 text-[20px] text-star">{givenWeek}</p>
								</div>
								<div className="border-l border-line-subtle pl-3">
									<p className="micro text-muted">Received</p>
									<p className="numeric mt-1 text-[20px] text-mint">{receivedWeek}</p>
								</div>
							</div>
							<RhythmChart days={weekly} />
							<div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-[10.5px] text-muted">
								<span>Daily star cap</span>
								<span className="numeric text-secondary">
									{stats.givenToday} / {user.dailyStarLimit}
								</span>
							</div>
							<div className="mt-2 h-1 overflow-hidden rounded-pill bg-panel-muted">
								<div
									className="h-full rounded-pill bg-star"
									style={{
										width: `${Math.min(100, (stats.givenToday / Math.max(1, user.dailyStarLimit)) * 100)}%`,
									}}
								/>
							</div>
						</div>
					</Panel>

					<Panel>
						<PanelHeader
							title="Recent activity"
							action={
								<Link
									href="/activity"
									className="text-[10.5px] text-muted transition-colors hover:text-secondary"
								>
									View all
								</Link>
							}
						/>
						<ActivityList items={activity} compact />
					</Panel>

					{stats.verificationDue > 0 ? (
						<Notice
							tone="info"
							title="Keep your credits honest"
							action={<VerifyButton variant="quiet" size="sm" label="Verify" />}
						>
							{stats.verificationDue} credited{" "}
							{stats.verificationDue === 1 ? "star has" : "stars have"} not been checked in a while.
							Verification confirms they are still on GitHub.
						</Notice>
					) : (
						<Panel className="p-4">
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mint/20 bg-mint-soft text-mint">
									<ShieldCheck size={14} />
								</div>
								<div>
									<p className="text-[12px] font-medium text-ink">Credits are backed by stars</p>
									<p className="mt-1 text-[11px] leading-[17px] text-muted">
										{stats.verifiedGiven} verified {stats.verifiedGiven === 1 ? "star" : "stars"} on
										record. Every credit you earned maps to a real, human action.
									</p>
								</div>
							</div>
						</Panel>
					)}
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line-subtle bg-panel/50 px-4 py-3">
				<p className="text-[11px] leading-5 text-muted">
					Starloop is human-only by design. No bots, no automation, no bought stars — and no
					affiliation with GitHub.
				</p>
				<div className="flex items-center gap-3">
					<Link
						href="/legal"
						className="text-[10.5px] text-secondary underline decoration-line-strong underline-offset-2 hover:decoration-star"
					>
						Read the rules
					</Link>
					<Link
						href="/acceptable-use"
						className="text-[10.5px] text-muted transition-colors hover:text-secondary"
					>
						Acceptable use
					</Link>
				</div>
			</div>
		</div>
	);
}
