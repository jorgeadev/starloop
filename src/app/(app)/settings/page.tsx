import {
	ArrowUpRight,
	Check,
	ExternalLink,
	KeyRound,
	Scale,
	ShieldCheck,
	Star,
} from "lucide-react";
import Link from "next/link";
import { ConnectionActions } from "@/components/settings/connection-actions";
import { DataActions } from "@/components/settings/data-actions";
import { ExchangeSettings } from "@/components/settings/exchange-settings";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { canStarPublicRepos, connectionKindLabel, getConnection } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { POLICY_VERSION } from "@/lib/constants";
import { getActiveRepository } from "@/lib/db/queries";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
	const user = await requireUser();
	const [connection, activeRepository] = await Promise.all([
		getConnection(user.id),
		getActiveRepository(user.id),
	]);

	const scopes = connection?.scopes
		? connection.scopes
				.split(",")
				.map((scope) => scope.trim())
				.filter(Boolean)
		: [];

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Settings"
				title="Make the loop yours."
				description="Your identity, your credential, your pace. Starloop keeps the surface small so the exchange stays legible."
			/>

			{user.isDemo ? (
				<Notice tone="info" title="Demo workspace">
					Changes are applied to the seeded workspace. GitHub actions are simulated. Connect a real
					account from the sign-in screen when you are ready.
				</Notice>
			) : null}

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
				<div className="space-y-4">
					<Panel>
						<PanelHeader title="Account" description="Your GitHub identity, mirrored." />
						<div className="p-4 sm:p-5">
							<div className="flex flex-wrap items-start gap-3">
								<Avatar src={user.avatarUrl} name={user.name} login={user.login} size={46} ring />
								<div className="min-w-0 flex-1">
									<p className="text-[14px] font-medium text-ink">{user.name ?? user.login}</p>
									<p className="mt-0.5 text-[11.5px] text-muted">
										@{user.login}
										{user.email ? ` · ${user.email}` : ""}
									</p>
									{user.bio ? (
										<p className="mt-2 max-w-[60ch] text-[11.5px] leading-5 text-secondary">
											{user.bio}
										</p>
									) : null}
								</div>
								<a
									href={user.profileUrl ?? `https://github.com/${user.login}`}
									target="_blank"
									rel="noreferrer"
									className={buttonStyles("outline", "sm")}
								>
									GitHub <ArrowUpRight size={12} />
								</a>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
								<div className="rounded-control border border-line-subtle bg-canvas/30 px-3 py-2.5">
									<p className="micro text-muted">Credits</p>
									<p className="numeric mt-1 text-[15px] text-star">{user.credits}</p>
								</div>
								<div className="rounded-control border border-line-subtle bg-canvas/30 px-3 py-2.5">
									<p className="micro text-muted">Given</p>
									<p className="numeric mt-1 text-[15px] text-ink">{user.starsGiven}</p>
								</div>
								<div className="rounded-control border border-line-subtle bg-canvas/30 px-3 py-2.5">
									<p className="micro text-muted">Received</p>
									<p className="numeric mt-1 text-[15px] text-ink">{user.starsReceived}</p>
								</div>
								<div className="rounded-control border border-line-subtle bg-canvas/30 px-3 py-2.5">
									<p className="micro text-muted">Member since</p>
									<p className="mt-1 truncate text-[11px] text-secondary">
										{formatDate(user.createdAt, { month: "short", year: "numeric" })}
									</p>
								</div>
							</div>
						</div>
					</Panel>

					<Panel>
						<PanelHeader
							title="GitHub connection"
							description="One encrypted credential per account. Never your password."
							action={
								user.isDemo ? (
									<Badge tone="star" dot>
										Simulated
									</Badge>
								) : connection ? (
									<Badge tone={connection.needsReauth ? "rose" : "mint"} dot>
										{connection.needsReauth ? "Reconnect" : "Connected"}
									</Badge>
								) : (
									<Badge tone="neutral">Not connected</Badge>
								)
							}
						/>
						<div className="p-4 sm:p-5">
							{connection ? (
								<>
									<div className="flex items-start gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-panel-raised text-secondary">
											<KeyRound size={15} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-[12.5px] font-medium text-ink">
												{connectionKindLabel(connection.kind)}
											</p>
											<p className="mt-0.5 font-mono text-[11px] text-muted">
												{connection.tokenHint}
											</p>
											<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted">
												<span>
													Validated{" "}
													{connection.lastValidatedAt
														? formatRelativeTime(connection.lastValidatedAt)
														: "never"}
												</span>
												<span>
													Expires{" "}
													{connection.tokenExpiresAt
														? formatDate(connection.tokenExpiresAt)
														: "never"}
												</span>
												<span
													className={canStarPublicRepos(connection) ? "text-mint" : "text-star"}
												>
													{canStarPublicRepos(connection)
														? "Can star public repos"
														: "Missing star permission"}
												</span>
											</div>
										</div>
										<ConnectionActions isDemo={false} needsReauth={connection.needsReauth} />
									</div>

									{scopes.length > 0 ? (
										<div className="mt-4 flex flex-wrap gap-1.5 border-t border-line-subtle pt-3">
											{scopes.map((scope) => (
												<span
													key={scope}
													className="rounded border border-line-subtle bg-panel-raised/60 px-1.5 py-0.5 font-mono text-[9.5px] text-muted"
												>
													{scope}
												</span>
											))}
										</div>
									) : null}

									{connection.needsReauth ? (
										<div className="mt-3">
											<Notice tone="danger" title="GitHub rejected this credential">
												Replace it to keep giving and verifying stars. Your current repository and
												balance are untouched.
											</Notice>
										</div>
									) : null}
								</>
							) : (
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-[12.5px] font-medium text-ink">
											{user.isDemo ? "Demo connection is simulated" : "No credential on file"}
										</p>
										<p className="mt-1 max-w-[62ch] text-[11px] leading-5 text-muted">
											{user.isDemo
												? "Star actions in the demo never touch GitHub. Connect a real account to use the exchange."
												: "Add a classic PAT, a fine-grained PAT, or use GitHub OAuth. The credential is AES-256-GCM encrypted and can be removed at any time."}
										</p>
									</div>
									<div className="flex items-center gap-2">
										{user.isDemo ? (
											<ConnectionActions isDemo needsReauth={false} />
										) : (
											<Link href="/connect?manage=1" className={buttonStyles("star", "sm")}>
												<KeyRound size={12} /> Connect GitHub
											</Link>
										)}
									</div>
								</div>
							)}
						</div>
					</Panel>

					<Panel>
						<PanelHeader
							title="Exchange preferences"
							description="Human pace, explicit limits."
							action={
								<span className="inline-flex items-center gap-1 text-[10px] text-muted">
									<ShieldCheck size={11} /> Server enforced
								</span>
							}
						/>
						<div className="p-4 sm:p-5">
							<ExchangeSettings
								dailyStarLimit={user.dailyStarLimit}
								pausePromotion={user.pausePromotion}
								isDemo={user.isDemo}
							/>
						</div>
					</Panel>

					<Panel>
						<PanelHeader
							title="Data & sessions"
							description="Export, revoke, or close the account."
						/>
						<div className="p-4 sm:p-5">
							<DataActions isDemo={user.isDemo} login={user.login} />
						</div>
					</Panel>
				</div>

				<aside className="space-y-4">
					<Panel className="p-4">
						<h2 className="text-[12.5px] font-medium text-ink">At a glance</h2>
						<dl className="mt-3 space-y-2 text-[11px]">
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Active repository</dt>
								<dd className="max-w-[150px] truncate font-mono text-[10.5px] text-secondary">
									{activeRepository?.fullName ?? "None"}
								</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Promotion</dt>
								<dd className={user.pausePromotion ? "text-star" : "text-mint"}>
									{user.pausePromotion ? "Paused" : "Active"}
								</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Daily cap</dt>
								<dd className="numeric text-secondary">{user.dailyStarLimit}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Policy</dt>
								<dd className="text-secondary">v{POLICY_VERSION}</dd>
							</div>
						</dl>
					</Panel>

					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<Scale size={13} className="text-star" />
							<h2 className="text-[12.5px] font-medium text-ink">Policies</h2>
						</div>
						<ul className="mt-3 space-y-2 text-[11px]">
							{[
								["/terms", "Terms of service"],
								["/privacy", "Privacy policy"],
								["/acceptable-use", "Acceptable use"],
								["/legal", "Trust & safety"],
							].map(([href, label]) => (
								<li key={href}>
									<Link
										href={href!}
										className="inline-flex items-center gap-1 text-secondary transition-colors hover:text-ink"
									>
										<Check size={10} className="text-mint" /> {label}
									</Link>
								</li>
							))}
						</ul>
					</Panel>

					<div className="rounded-panel border border-line-subtle bg-panel/50 p-4">
						<p className="text-[10px] leading-4 text-muted/80">
							Starloop is independent and not affiliated with GitHub, Inc. Reciprocal starring may
							conflict with GitHub policy or a maintainer&apos;s expectations. Read the{" "}
							<Link
								href="/legal#github-policy"
								className="text-secondary underline underline-offset-2"
							>
								risk disclosure
							</Link>{" "}
							before participating.
						</p>
						<a
							href="https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies"
							target="_blank"
							rel="noreferrer"
							className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted hover:text-secondary"
						>
							GitHub Acceptable Use <ExternalLink size={9} />
						</a>
					</div>

					{activeRepository ? (
						<Link
							href={`https://github.com/${activeRepository.fullName}`}
							target="_blank"
							rel="noreferrer"
							className={buttonStyles("outline", "sm", "w-full justify-between")}
						>
							<span className="inline-flex items-center gap-1.5">
								<Star size={12} /> {activeRepository.fullName}
							</span>
							<ArrowUpRight size={12} />
						</Link>
					) : null}
				</aside>
			</div>
		</div>
	);
}
