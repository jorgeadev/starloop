import {
	ArrowUpRight,
	Check,
	FileText,
	Lock,
	Scale,
	ShieldCheck,
	ShieldAlert,
	Star,
	Users,
} from "lucide-react";
import Link from "next/link";
import {
	LEGAL_LAST_UPDATED,
	OPERATOR_ADDRESS,
	OPERATOR_CONTACT,
	OPERATOR_JURISDICTION,
	OPERATOR_NAME,
} from "@/lib/legal";

export const metadata = { title: "Trust & safety" };

const documents = [
	{
		href: "/legal#github-policy",
		label: "GitHub policy risk",
		description: "What can go wrong, what we do about it, and what is your decision.",
		icon: ShieldAlert,
	},
	{
		href: "/terms",
		label: "Terms of service",
		description: "The agreement, the credit model, liability, and termination.",
		icon: FileText,
	},
	{
		href: "/privacy",
		label: "Privacy policy",
		description: "What we collect, why, where it lives, and how to remove it.",
		icon: Lock,
	},
	{
		href: "/acceptable-use",
		label: "Acceptable use",
		description: "The hard limits on automation, payments, and queue manipulation.",
		icon: Scale,
	},
];

export default function TrustCenterPage() {
	return (
		<div className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 lg:py-14">
			<div className="max-w-[720px]">
				<p className="micro text-star">Trust center</p>
				<h1 className="mt-3 text-[32px] leading-[1.05] font-medium tracking-[-0.045em] text-ink sm:text-[42px]">
					Trust is a design constraint.
				</h1>
				<p className="mt-4 max-w-[62ch] text-[13px] leading-6 text-muted">
					Starloop is a small, independent experiment in reciprocal attention. It is not affiliated
					with GitHub, it does not automate stars, and it does not pretend the policy risk is zero.
					This page collects the rules, the safeguards, and the honest disclosure in one place.
				</p>
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-muted/70">
					<span>Last updated {LEGAL_LAST_UPDATED}</span>
					<span className="h-1 w-1 rounded-full bg-line-strong" />
					<span>Version 1.0</span>
					<span className="h-1 w-1 rounded-full bg-line-strong" />
					<span className="inline-flex items-center gap-1 text-mint">
						<span className="h-1.5 w-1.5 rounded-full bg-mint" /> Human-only by design
					</span>
				</div>
			</div>

			{/* Risk disclosure */}
			<section
				id="github-policy"
				className="mt-8 scroll-mt-24 overflow-hidden rounded-panel border border-star/30 bg-star-soft/25"
			>
				<div className="flex items-center gap-2 border-b border-star/15 px-5 py-3">
					<ShieldAlert size={15} className="text-star" />
					<p className="micro text-star">Read this before joining</p>
				</div>
				<div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
					<div>
						<h2 className="text-[20px] leading-tight font-medium tracking-[-0.03em] text-ink">
							GitHub policy risk disclosure
						</h2>
						<p className="mt-3 text-[12px] leading-6 text-secondary">
							GitHub&apos;s Acceptable Use Policies prohibit rank abuse such as automated starring
							or following, inauthentic interactions, and activity incentivized by rewards such as
							credits, gifts, or giveaways. A credit-for-star exchange may be treated as
							incentivized inauthentic engagement even though a human performs the star and no money
							changes hands. GitHub retains full discretion over its platform and may remove stars,
							restrict or suspend accounts, or change its policies at any time.
						</p>
						<p className="mt-3 text-[12px] leading-6 text-secondary">
							Starloop does not provide legal advice and cannot guarantee that participation is
							permitted under GitHub&apos;s rules or a repository maintainer&apos;s expectations.
							You are responsible for your own GitHub account and for reading the current GitHub
							policies. If you are not comfortable with that risk, do not participate.
						</p>
						<a
							href="https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies"
							target="_blank"
							rel="noreferrer"
							className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-star underline decoration-star/40 underline-offset-2 hover:decoration-star"
						>
							Read GitHub&apos;s Acceptable Use Policies <ArrowUpRight size={11} />
						</a>
					</div>

					<div className="space-y-2.5">
						{[
							[
								"No automation",
								"No scripts, bots, cron jobs, or background actions star on your behalf.",
							],
							["No payment", "Credits cannot be bought, sold, transferred, or redeemed for money."],
							["No guarantee", "Incoming stars depend on other members, not on Starloop."],
							["Verification", "Credits reverse when a star is no longer present on GitHub."],
							["Account risk", "GitHub may act independently of anything Starloop does."],
						].map(([title, body]) => (
							<div
								key={title}
								className="rounded-control border border-star/15 bg-canvas/30 px-3 py-2.5"
							>
								<p className="text-[11px] font-medium text-ink">{title}</p>
								<p className="mt-0.5 text-[10.5px] leading-4 text-muted">{body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Commitments */}
			<section className="mt-8 grid gap-3 md:grid-cols-3">
				{[
					{
						icon: Users,
						title: "Human action, every time",
						body: "A person opens the repository and stars it from their own account. The server records and verifies that action.",
					},
					{
						icon: Star,
						title: "Credits are not money",
						body: "Balances are a non-transferable reciprocity count with no cash value. There is no checkout, payout, or refund.",
					},
					{
						icon: ShieldCheck,
						title: "Constraints before growth",
						body: "Caps, one repository per member, and daily verification come before any growth feature.",
					},
				].map((item) => (
					<div
						key={item.title}
						className="rounded-panel border border-line bg-panel p-4 shadow-resting"
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-control border border-mint/20 bg-mint-soft text-mint">
							<item.icon size={14} />
						</span>
						<h2 className="mt-4 text-[13px] font-medium text-ink">{item.title}</h2>
						<p className="mt-1.5 text-[11px] leading-5 text-muted">{item.body}</p>
					</div>
				))}
			</section>

			{/* Documents */}
			<section className="mt-10">
				<div className="flex items-end justify-between gap-3">
					<div>
						<p className="micro text-muted">Documents</p>
						<h2 className="mt-2 text-[22px] font-medium tracking-[-0.03em] text-ink">
							The fine print, in plain sight.
						</h2>
					</div>
				</div>
				<div className="mt-4 grid gap-2 sm:grid-cols-2">
					{documents.map((document) => (
						<Link
							key={document.href}
							href={document.href}
							className="group flex items-start gap-3 rounded-panel border border-line bg-panel p-4 transition-colors hover:border-line-strong"
						>
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-line bg-panel-raised text-muted transition-colors group-hover:text-star">
								<document.icon size={14} />
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-[12.5px] font-medium text-ink">{document.label}</p>
								<p className="mt-1 text-[10.5px] leading-4 text-muted">{document.description}</p>
							</div>
							<ArrowUpRight
								size={13}
								className="mt-0.5 shrink-0 text-muted/50 transition-colors group-hover:text-secondary"
							/>
						</Link>
					))}
				</div>
			</section>

			{/* Enforcement */}
			<section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
				<div>
					<p className="micro text-muted">Enforcement</p>
					<h2 className="mt-2 text-[22px] font-medium tracking-[-0.03em] text-ink">
						What happens when the rules are broken
					</h2>
					<div className="mt-4 overflow-hidden rounded-panel border border-line">
						<table className="w-full border-collapse text-left text-[11px]">
							<thead className="bg-panel-raised/60">
								<tr>
									<th className="px-3 py-2 font-medium text-muted">Situation</th>
									<th className="px-3 py-2 font-medium text-muted">Response</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-line-subtle">
								{[
									[
										"Star no longer present",
										"Credit reverses on both sides; verification logs the change.",
									],
									[
										"Automation or token abuse",
										"Credential revoked, activity frozen, account suspended.",
									],
									["Bought or sold credits", "Balance removed, account terminated, no refund."],
									[
										"Misleading or unsafe repo",
										"Repository removed from the queue; report reviewed.",
									],
									["Repeated abusive withdrawals", "Withdrawal privilege removed; account review."],
								].map(([situation, response]) => (
									<tr key={situation} className="bg-panel/40">
										<td className="px-3 py-2.5 align-top text-secondary">{situation}</td>
										<td className="px-3 py-2.5 align-top text-muted">{response}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="mt-2 text-[9.5px] leading-4 text-muted/60">
						Enforcement is applied by the operator using the audit trail. GitHub may take separate
						action under its own policies.
					</p>
				</div>

				<div className="space-y-4">
					<div className="rounded-panel border border-line bg-panel p-4">
						<div className="flex items-center gap-2">
							<Lock size={13} className="text-mint" />
							<h2 className="text-[12.5px] font-medium text-ink">Data & security</h2>
						</div>
						<ul className="mt-3 space-y-2 text-[10.5px] leading-4 text-muted">
							{[
								"GitHub tokens are encrypted with AES-256-GCM and never shown in the browser.",
								"Sessions store hashed tokens, not raw session IDs.",
								"CSRF, origin checks, rate limits, and strict security headers are enabled.",
								"Tokens are only used for actions you initiate or explicit verification.",
								"You can export your data or delete the account from Settings.",
							].map((line) => (
								<li key={line} className="flex gap-2">
									<Check size={10} className="mt-0.5 shrink-0 text-mint" />
									{line}
								</li>
							))}
						</ul>
						<Link
							href="/privacy"
							className="mt-3 inline-flex items-center gap-1 text-[10px] text-secondary underline underline-offset-2 hover:text-ink"
						>
							Privacy policy <ArrowUpRight size={9} />
						</Link>
					</div>

					<div className="rounded-panel border border-line-subtle bg-panel/50 p-4">
						<p className="micro text-muted/80">Operator</p>
						<p className="mt-2 text-[10.5px] leading-5 text-muted">
							{OPERATOR_NAME}
							<br />
							{OPERATOR_ADDRESS}
							<br />
							Jurisdiction: {OPERATOR_JURISDICTION}
							<br />
							Contact: <span className="text-secondary">{OPERATOR_CONTACT}</span>
						</p>
						<p className="mt-2 border-t border-line-subtle pt-2 text-[9px] leading-4 text-star/70">
							Placeholders. The operator must replace these with real legal details and have the
							documents reviewed before a public launch.
						</p>
					</div>
				</div>
			</section>

			{/* Template note */}
			<section className="mt-10 rounded-panel border border-line-subtle bg-canvas/40 p-5">
				<div className="flex items-start gap-3">
					<Scale size={16} className="mt-0.5 shrink-0 text-muted" />
					<div>
						<h2 className="text-[12.5px] font-medium text-ink">
							These documents are a starting point, not legal advice
						</h2>
						<p className="mt-1.5 max-w-[80ch] text-[10.5px] leading-5 text-muted">
							The repository ships with a documented legal template so the operator can make
							deliberate choices instead of copy-pasting policy. Before opening the exchange to the
							public, replace every bracketed placeholder, confirm the jurisdiction and consumer-law
							requirements, and have qualified counsel review the terms, privacy policy, and
							acceptable-use rules. Nothing here creates a lawyer-client relationship or a warranty
							that the service complies with GitHub policy.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
