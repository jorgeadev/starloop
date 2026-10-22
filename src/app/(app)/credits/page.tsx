import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	CheckCircle2,
	Coins,
	ShieldCheck,
	Star,
	Undo2,
} from "lucide-react";
import Link from "next/link";
import { WithdrawStarButton } from "@/components/credits/withdraw-star-button";
import { VerifyButton } from "@/components/repo/verify-button";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { requireUser } from "@/lib/auth/session";
import { CREDIT_REASON_LABELS, MAX_INBOUND_PER_REPO_PER_DAY } from "@/lib/constants";
import { getDashboardStats, getGivenStars, getLedger } from "@/lib/db/queries";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Credits" };
export const dynamic = "force-dynamic";

export default async function CreditsPage() {
	const user = await requireUser();
	const [ledger, given, stats] = await Promise.all([
		getLedger(user.id, 40),
		getGivenStars(user.id, 12),
		getDashboardStats(user.id),
	]);

	const earned = ledger
		.filter((entry) => entry.delta > 0)
		.reduce((sum, entry) => sum + entry.delta, 0);
	const spent = ledger
		.filter((entry) => entry.delta < 0)
		.reduce((sum, entry) => sum + Math.abs(entry.delta), 0);
	const demo = user.isDemo && process.env.DEMO_MODE === "true";

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Credits"
				title="Reciprocity, with a receipt."
				description="Credits are not money. They are a count of verified give-and-take: one credit earned per real star given, one credit spent when a star is received."
				actions={
					<>
						<VerifyButton />
						<Link href="/discover" className={buttonStyles("primary", "md")}>
							Earn a credit <ArrowRight size={13} />
						</Link>
					</>
				}
			/>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<div className="rounded-panel border border-star/20 bg-star-soft/35 p-4">
					<p className="micro text-star/90">Balance</p>
					<p className="numeric mt-2 text-[28px] leading-none text-ink">{user.credits}</p>
					<p className="mt-2 text-[10.5px] text-muted">Available to receive stars</p>
				</div>
				<div className="rounded-panel border border-line bg-panel p-4">
					<p className="micro text-muted">Earned all time</p>
					<p className="numeric mt-2 text-[28px] leading-none text-mint">+{earned}</p>
					<p className="mt-2 text-[10.5px] text-muted">{user.starsGiven} stars given</p>
				</div>
				<div className="rounded-panel border border-line bg-panel p-4">
					<p className="micro text-muted">Spent all time</p>
					<p className="numeric mt-2 text-[28px] leading-none text-star">−{spent}</p>
					<p className="mt-2 text-[10.5px] text-muted">{user.starsReceived} stars received</p>
				</div>
				<div className="rounded-panel border border-line bg-panel p-4">
					<p className="micro text-muted">Verification</p>
					<p className="numeric mt-2 text-[28px] leading-none text-ink">
						{stats.verificationDue === 0 ? "Clear" : stats.verificationDue}
					</p>
					<p className="mt-2 text-[10.5px] text-muted">
						{stats.verificationDue === 0
							? `${stats.verifiedGiven} stars backed`
							: "stars need re-checking"}
					</p>
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)]">
				<div className="space-y-4">
					<Panel>
						<PanelHeader
							title="Credit ledger"
							description="Every movement, in order. No hidden adjustments."
							action={<Badge tone="neutral">{ledger.length} entries</Badge>}
						/>
						{ledger.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full min-w-[560px] border-collapse">
									<thead>
										<tr className="border-b border-line-subtle text-left">
											<th className="micro px-4 py-2.5 font-normal text-muted">Movement</th>
											<th className="micro px-3 py-2.5 font-normal text-muted">Date</th>
											<th className="micro px-3 py-2.5 text-right font-normal text-muted">
												Change
											</th>
											<th className="micro px-4 py-2.5 text-right font-normal text-muted">
												Balance
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-line-subtle">
										{ledger.map((entry) => (
											<tr key={entry.id} className="transition-colors hover:bg-panel-raised/25">
												<td className="px-4 py-3">
													<div className="flex items-start gap-2.5">
														<span
															className={
																entry.delta > 0
																	? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-mint/20 bg-mint-soft text-mint"
																	: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-star/20 bg-star-soft text-star"
															}
														>
															{entry.delta > 0 ? (
																<ArrowDownLeft size={11} />
															) : (
																<ArrowUpRight size={11} />
															)}
														</span>
														<div className="min-w-0">
															<p className="text-[12px] font-medium text-ink">
																{CREDIT_REASON_LABELS[entry.reason] ?? entry.reason}
															</p>
															<p className="mt-0.5 line-clamp-2 text-[10.5px] leading-4 text-muted">
																{entry.detail ?? "—"}
															</p>
														</div>
													</div>
												</td>
												<td className="px-3 py-3 text-[10.5px] whitespace-nowrap text-muted">
													{formatDateTime(entry.createdAt)}
												</td>
												<td
													className={
														entry.delta > 0
															? "numeric px-3 py-3 text-right text-[12px] text-mint"
															: "numeric px-3 py-3 text-right text-[12px] text-star"
													}
												>
													{entry.delta > 0 ? "+" : ""}
													{entry.delta}
												</td>
												<td className="numeric px-4 py-3 text-right text-[11.5px] text-secondary">
													{entry.balanceAfter}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="p-4">
								<EmptyState
									icon={<Coins size={16} />}
									title="No credit movement yet"
									description="Give your first star to create the first entry."
									action={
										<Link href="/discover" className={buttonStyles("primary", "sm")}>
											Discover projects
										</Link>
									}
									compact
								/>
							</div>
						)}
					</Panel>

					<Panel>
						<PanelHeader
							title="Stars you gave"
							description="Withdrawing reverses the credit on both sides."
							action={
								<Link
									href="/discover"
									className="text-[10.5px] text-muted transition-colors hover:text-secondary"
								>
									Find more
								</Link>
							}
						/>
						{given.length > 0 ? (
							<ul className="divide-y divide-line-subtle">
								{given.map((star) => (
									<li
										key={star.id}
										className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel-raised/25"
									>
										<div className="min-w-0 flex-1">
											<a
												href={`https://github.com/${star.fullName}`}
												target="_blank"
												rel="noreferrer"
												className="truncate font-mono text-[11.5px] text-ink hover:text-star"
											>
												{star.fullName}
											</a>
											<div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted">
												<span>@{star.ownerLogin}</span>
												<span>·</span>
												<span>{formatRelativeTime(star.createdAt)}</span>
												<span>·</span>
												<span className="inline-flex items-center gap-1 text-mint">
													<CheckCircle2 size={9} /> Verified
												</span>
											</div>
										</div>
										<WithdrawStarButton starId={star.id} repoFullName={star.fullName} demo={demo} />
									</li>
								))}
							</ul>
						) : (
							<div className="p-4">
								<EmptyState
									icon={<Star size={16} />}
									title="No stars given yet"
									description="A star is a real action on GitHub, not a click in this app."
									compact
								/>
							</div>
						)}
					</Panel>
				</div>

				<aside className="space-y-4">
					<Panel className="p-4">
						<h2 className="text-[12.5px] font-medium text-ink">How a credit moves</h2>
						<ol className="mt-3 space-y-3">
							<li className="flex gap-2.5">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-star/25 bg-star-soft text-star">
									<Star size={11} />
								</span>
								<div>
									<p className="text-[11.5px] font-medium text-secondary">You give a star</p>
									<p className="mt-0.5 text-[10.5px] leading-4 text-muted">
										GitHub records it. Your balance <span className="text-mint">+1</span>.
									</p>
								</div>
							</li>
							<li className="flex gap-2.5">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-mint/25 bg-mint-soft text-mint">
									<ArrowDownLeft size={11} />
								</span>
								<div>
									<p className="text-[11.5px] font-medium text-secondary">Someone gives to you</p>
									<p className="mt-0.5 text-[10.5px] leading-4 text-muted">
										One of your credits is spent. Real attention, not a free boost.
									</p>
								</div>
							</li>
							<li className="flex gap-2.5">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-panel-raised text-secondary">
									<Undo2 size={11} />
								</span>
								<div>
									<p className="text-[11.5px] font-medium text-secondary">A star disappears</p>
									<p className="mt-0.5 text-[10.5px] leading-4 text-muted">
										Verification reverses the credit. The owner is refunded.
									</p>
								</div>
							</li>
						</ol>
					</Panel>

					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<ShieldCheck size={13} className="text-mint" />
							<h2 className="text-[12.5px] font-medium text-ink">Hard limits</h2>
						</div>
						<dl className="mt-3 space-y-2 text-[11px]">
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Stars per day</dt>
								<dd className="numeric text-secondary">{user.dailyStarLimit}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Incoming per repo</dt>
								<dd className="numeric text-secondary">{MAX_INBOUND_PER_REPO_PER_DAY}/day</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Active repositories</dt>
								<dd className="numeric text-secondary">1</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Cash value</dt>
								<dd className="text-secondary">None</dd>
							</div>
						</dl>
						<Link
							href="/settings"
							className="mt-3 inline-flex items-center gap-1 border-t border-line-subtle pt-3 text-[10.5px] text-secondary transition-colors hover:text-ink"
						>
							Adjust your daily cap <ArrowRight size={11} />
						</Link>
					</Panel>

					<div className="rounded-panel border border-line-subtle bg-panel/50 p-4">
						<p className="text-[10px] leading-4 text-muted/80">
							Credits are non-transferable, have no monetary value, and may not be purchased, sold,
							or exchanged for anything of value. Balances can be adjusted only for verification,
							reversals, or policy enforcement.
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
