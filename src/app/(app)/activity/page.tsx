import { ArrowRight, Download, Filter, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ActivityList } from "@/components/activity/activity-list";
import { VerifyButton } from "@/components/repo/verify-button";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { RhythmChart } from "@/components/ui/rhythm-chart";
import { requireUser } from "@/lib/auth/session";
import {
	getDashboardStats,
	getIncomingStars,
	getRecentActivities,
	getWeeklyRhythm,
} from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Activity" };
export const dynamic = "force-dynamic";

const filters = [
	{ value: "all", label: "Everything", types: null },
	{ value: "given", label: "Stars given", types: ["star_given"] },
	{ value: "received", label: "Stars received", types: ["star_received"] },
	{ value: "verification", label: "Verification", types: ["verification"] },
	{ value: "repository", label: "Repository", types: ["repo_bound"] },
] as const;

export default async function ActivityPage({
	searchParams,
}: {
	searchParams: Promise<{ filter?: string }>;
}) {
	const user = await requireUser();
	const params = await searchParams;
	const selected = filters.find((filter) => filter.value === params.filter) ?? filters[0];

	const [activity, weekly, stats, incoming] = await Promise.all([
		getRecentActivities(user.id, 60),
		getWeeklyRhythm(user.id),
		getDashboardStats(user.id),
		getIncomingStars(user.id, 4),
	]);

	const filtered = selected.types
		? activity.filter((item) => (selected.types as readonly string[]).includes(item.type))
		: activity;

	const givenWeek = weekly.reduce((total, day) => total + day.given, 0);
	const receivedWeek = weekly.reduce((total, day) => total + day.received, 0);

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Activity"
				title="Every turn of the loop."
				description="A plain audit trail of the stars you gave, the ones you received, and every credit that moved because of them."
				actions={
					<>
						<VerifyButton />
						<Link href="/discover" className={buttonStyles("primary", "md")}>
							Give a star <ArrowRight size={13} />
						</Link>
					</>
				}
			/>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)]">
				<Panel className="overflow-hidden">
					<div className="flex items-center gap-1 overflow-x-auto border-b border-line-subtle p-2">
						<Filter size={12} className="mx-1 hidden shrink-0 text-muted sm:block" />
						{filters.map((filter) => (
							<Link
								key={filter.value}
								href={filter.value === "all" ? "/activity" : `/activity?filter=${filter.value}`}
								className={cn(
									"shrink-0 rounded-control px-2.5 py-1.5 text-[11px] transition-colors",
									selected.value === filter.value
										? "bg-panel-raised font-medium text-ink"
										: "text-muted hover:bg-panel-raised/60 hover:text-secondary",
								)}
							>
								{filter.label}
							</Link>
						))}
						<span className="ml-auto shrink-0 pr-2 text-[10px] text-muted/70">
							{filtered.length} events
						</span>
					</div>
					<ActivityList items={filtered} />
					{filtered.length === 0 ? (
						<div className="border-t border-line-subtle px-4 py-4 text-center text-[11px] text-muted">
							Nothing in this filter yet.
						</div>
					) : null}
				</Panel>

				<aside className="space-y-4">
					<Panel>
						<PanelHeader
							title="This week"
							description="Verified movement only."
							action={
								<a
									href="/api/account"
									className="inline-flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-secondary"
								>
									<Download size={10} /> Export
								</a>
							}
						/>
						<div className="p-4">
							<div className="mb-4 grid grid-cols-2 gap-3">
								<div>
									<p className="micro text-muted">Given</p>
									<p className="numeric mt-1 text-[22px] text-star">{givenWeek}</p>
									<p className="text-[10px] text-muted">{stats.givenToday} today</p>
								</div>
								<div className="border-l border-line-subtle pl-3">
									<p className="micro text-muted">Received</p>
									<p className="numeric mt-1 text-[22px] text-mint">{receivedWeek}</p>
									<p className="text-[10px] text-muted">{stats.receivedToday} today</p>
								</div>
							</div>
							<RhythmChart days={weekly} />
						</div>
					</Panel>

					<Panel>
						<PanelHeader title="Recent incoming" description="Stars on your project." />
						{incoming.length > 0 ? (
							<ul className="divide-y divide-line-subtle">
								{incoming.map((star) => (
									<li key={star.id} className="flex items-center gap-2.5 px-4 py-2.5">
										<div className="min-w-0 flex-1">
											<p className="truncate text-[11.5px] text-ink">
												<span className="font-medium">@{star.login}</span> starred{" "}
												<span className="font-mono text-[10.5px] text-muted">
													{star.repoFullName}
												</span>
											</p>
											<p className="mt-0.5 text-[10px] text-muted/70">
												{star.lastCheckedAt ? "Verified against GitHub" : "Verification due"}
											</p>
										</div>
										<span
											className={
												star.lastCheckedAt
													? "h-1.5 w-1.5 shrink-0 rounded-full bg-mint"
													: "h-1.5 w-1.5 shrink-0 rounded-full bg-star"
											}
										/>
									</li>
								))}
							</ul>
						) : (
							<p className="px-4 py-6 text-center text-[11px] text-muted">No incoming stars yet.</p>
						)}
					</Panel>

					<div className="rounded-panel border border-line-subtle bg-panel/50 p-4">
						<div className="flex items-start gap-2.5">
							<ShieldCheck size={14} className="mt-0.5 shrink-0 text-mint" />
							<div>
								<p className="text-[11.5px] font-medium text-ink">A verified trail</p>
								<p className="mt-1 text-[10.5px] leading-4 text-muted">
									Stars are re-checked against GitHub. If one disappears, the credit reverses and
									the owner is refunded. No silent corrections.
								</p>
								<Link
									href="/credits"
									className="mt-2 inline-flex items-center gap-1 text-[10px] text-secondary hover:text-ink"
								>
									Open the ledger <ArrowRight size={10} />
								</Link>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
