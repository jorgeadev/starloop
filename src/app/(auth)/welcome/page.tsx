import { ArrowRight, Check, Circle, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PolicyStep } from "@/components/auth/policy-step";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { connectionKindLabel, getConnection } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { POLICY_VERSION } from "@/lib/constants";
import { getActiveRepository } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Get started" };
export const dynamic = "force-dynamic";

export default async function WelcomePage() {
	const user = await requireUser({ allowIncompletePolicy: true });
	const [connection, activeRepository] = await Promise.all([
		getConnection(user.id),
		getActiveRepository(user.id),
	]);

	if (user.policyAcceptedAt && activeRepository) {
		redirect("/dashboard");
	}

	const connectionDone = user.isDemo || Boolean(connection && !connection.needsReauth);
	const policyDone = Boolean(user.policyAcceptedAt);
	const completed = [policyDone, connectionDone, Boolean(activeRepository)].filter(Boolean).length;
	const destination = activeRepository
		? "/dashboard"
		: connectionDone
			? "/repositories"
			: "/welcome";

	return (
		<div className="w-full max-w-[820px]">
			<div className="mb-5 text-center">
				<span className="inline-flex items-center gap-1.5 rounded-pill border border-star/25 bg-star-soft px-2.5 py-1 text-[10px] font-medium text-star">
					<Sparkles size={10} /> {completed} of 3 complete
				</span>
				<h1 className="mt-4 text-[26px] leading-tight font-medium tracking-[-0.04em] text-ink">
					Set up your side of the loop.
				</h1>
				<p className="mx-auto mt-2 max-w-[54ch] text-[12px] leading-5 text-muted">
					Three deliberate steps: agree to the rules, connect your own GitHub credential, and bind
					one public project. No automation anywhere.
				</p>
			</div>

			<div className="mb-4 h-1 overflow-hidden rounded-pill bg-panel-muted">
				<div
					className="h-full rounded-pill bg-star transition-[width] duration-500"
					style={{ width: `${(completed / 3) * 100}%` }}
				/>
			</div>

			<div className="space-y-3">
				<Step
					index={1}
					title="Accept the community rules"
					description="Human-only reciprocity, hard caps, and an honest disclosure of GitHub policy risk."
					state={policyDone ? "done" : "current"}
				>
					{policyDone ? (
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="inline-flex items-center gap-1.5 text-[11px] text-mint">
								<Check size={12} /> Accepted version {user.policyVersion ?? POLICY_VERSION}
							</p>
							<Link
								href="/acceptable-use"
								className="text-[10.5px] text-muted underline underline-offset-2 hover:text-secondary"
							>
								Review the rules
							</Link>
						</div>
					) : (
						<PolicyStep destination={destination} policyVersion={POLICY_VERSION} />
					)}
				</Step>

				<Step
					index={2}
					title="Connect your GitHub account"
					description="OAuth or a personal access token. The credential is encrypted and only used for actions you start."
					state={connectionDone ? "done" : policyDone ? "current" : "waiting"}
				>
					{connectionDone ? (
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Avatar src={user.avatarUrl} name={user.name} login={user.login} size={26} />
								<p className="text-[11px] text-secondary">
									@{user.login}{" "}
									<span className="text-muted">
										·{" "}
										{user.isDemo
											? "Demo workspace"
											: connection
												? connectionKindLabel(connection.kind)
												: ""}
									</span>
								</p>
							</div>
							<Link
								href={user.isDemo ? "/settings" : "/connect?manage=1"}
								className="text-[10.5px] text-muted underline underline-offset-2 hover:text-secondary"
							>
								{user.isDemo ? "Demo settings" : "Replace credential"}
							</Link>
						</div>
					) : (
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="max-w-[46ch] text-[11px] leading-5 text-muted">
								{policyDone
									? "Use GitHub OAuth or paste a classic / fine-grained token with Starring access."
									: "Accept the rules first. Then connect GitHub."}
							</p>
							<Link
								href={policyDone ? "/connect?next=/welcome" : "/welcome"}
								aria-disabled={!policyDone}
								className={cn(
									buttonStyles("star", "sm"),
									!policyDone && "pointer-events-none opacity-40",
								)}
							>
								<KeyRound size={12} /> Connect GitHub
							</Link>
						</div>
					)}
				</Step>

				<Step
					index={3}
					title="Bind one public repository"
					description="Public, owned by you, not a fork, with a real description and recent activity."
					state={activeRepository ? "done" : connectionDone ? "current" : "waiting"}
				>
					{activeRepository ? (
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="font-mono text-[11px] text-ink">{activeRepository.fullName}</p>
							<Link
								href="/repositories"
								className="inline-flex items-center gap-1 text-[10.5px] text-muted hover:text-secondary"
							>
								Manage <ArrowRight size={10} />
							</Link>
						</div>
					) : (
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="max-w-[46ch] text-[11px] leading-5 text-muted">
								{connectionDone
									? "Pick the project you want the queue to show. You can change it later."
									: "Complete the connection step to list your repositories."}
							</p>
							<Link
								href={connectionDone ? "/repositories" : "/welcome"}
								aria-disabled={!connectionDone}
								className={cn(
									buttonStyles(connectionDone ? "primary" : "outline", "sm"),
									!connectionDone && "pointer-events-none opacity-40",
								)}
							>
								Choose repository <ArrowRight size={12} />
							</Link>
						</div>
					)}
				</Step>
			</div>

			<div className="mt-4">
				<Notice tone="warning" title="Before you continue">
					Reciprocal star exchange can be read as artificial promotion. GitHub may remove stars,
					restrict accounts, or change policy. Starloop never automates a star, but participation is
					your decision and your risk.{" "}
					<Link href="/legal#github-policy" className="text-ink underline underline-offset-2">
						Read the full disclosure
					</Link>
					.
				</Notice>
			</div>

			<div className="mt-5 flex items-center justify-between text-[10px] text-muted/70">
				<span className="inline-flex items-center gap-1">
					<ShieldCheck size={11} /> Policy {POLICY_VERSION}
				</span>
				<Link href="/dashboard" className="hover:text-secondary">
					Skip for now
				</Link>
			</div>
		</div>
	);
}

function Step({
	index,
	title,
	description,
	state,
	children,
}: {
	index: number;
	title: string;
	description: string;
	state: "done" | "current" | "waiting";
	children: React.ReactNode;
}) {
	return (
		<section
			className={cn(
				"rounded-panel border p-4 sm:p-5",
				state === "current"
					? "border-star/30 bg-panel shadow-resting"
					: state === "done"
						? "border-line bg-panel/70"
						: "border-line-subtle bg-panel/40",
			)}
		>
			<div className="flex gap-3">
				<div
					className={cn(
						"mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
						state === "done"
							? "border-mint/30 bg-mint-soft text-mint"
							: state === "current"
								? "border-star/35 bg-star-soft text-star"
								: "border-line bg-panel-raised text-muted",
					)}
				>
					{state === "done" ? (
						<Check size={12} />
					) : state === "waiting" ? (
						<Circle size={7} />
					) : (
						index
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p className="micro text-muted">Step {index}</p>
							<h2 className="mt-1 text-[13.5px] font-medium tracking-[-0.01em] text-ink">
								{title}
							</h2>
						</div>
						{state === "done" ? <Badge tone="mint">Done</Badge> : null}
						{state === "waiting" ? <Badge tone="neutral">Waiting</Badge> : null}
					</div>
					<p className="mt-1 text-[10.5px] leading-4 text-muted">{description}</p>
					<div className="mt-3">{children}</div>
				</div>
			</div>
		</section>
	);
}
