import {
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	Coins,
	Compass,
	GitFork,
	HeartHandshake,
	ShieldCheck,
	Sparkles,
	Star,
	Target,
	Users,
} from "lucide-react";
import Link from "next/link";
import { GithubIcon } from "@/components/github-icon";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { LanguageDot } from "@/components/ui/language-dot";
import { getCommunityStats, getPublicQueue } from "@/lib/db/queries";
import { APP_DESCRIPTION } from "@/lib/constants";
import { formatCompact, formatNumber, parseTopics } from "@/lib/utils";

export const metadata = {
	title: { absolute: "Starloop — Stars should follow the work." },
	description: APP_DESCRIPTION,
};
export const dynamic = "force-dynamic";

const fallbackPreview = [
	{
		id: "preview-1",
		fullName: "northstar-dev/hollow",
		description: "A tiny, dependency-free event log for local-first apps.",
		ownerLogin: "northstar-dev",
		ownerName: "Nadia Okafor",
		ownerAvatarUrl: null,
		ownerCredits: 6,
		stars: 842,
		language: "TypeScript",
		topics: "[]",
		boundAt: Date.now(),
		forks: 52,
	},
	{
		id: "preview-2",
		fullName: "orbital-labs/drift",
		description: "Visual regression testing that runs where your tests already run.",
		ownerLogin: "orbital-labs",
		ownerName: "Léo Martin",
		ownerAvatarUrl: null,
		ownerCredits: 4,
		stars: 1210,
		language: "Rust",
		topics: "[]",
		boundAt: Date.now(),
		forks: 74,
	},
	{
		id: "preview-3",
		fullName: "mayachen/atlas",
		description: "A quiet, keyboard-first workspace for engineering teams.",
		ownerLogin: "mayachen",
		ownerName: "Maya Chen",
		ownerAvatarUrl: null,
		ownerCredits: 9,
		stars: 1284,
		language: "TypeScript",
		topics: "[]",
		boundAt: Date.now(),
		forks: 96,
	},
];

export default async function LandingPage() {
	const [stats, queue] = await Promise.all([
		getCommunityStats().catch(() => null),
		getPublicQueue(4).catch(() => []),
	]);

	const preview = queue.length > 0 ? queue.slice(0, 3) : fallbackPreview;
	const hasLiveQueue = queue.length > 0;
	const members = stats?.members ?? 0;
	const repositories = stats?.repositories ?? 0;
	const exchanged = stats?.starsExchanged ?? 0;
	const memberLabel = members === 1 ? "member" : "members";
	const repositoryLabel = repositories === 1 ? "active repository" : "active repositories";

	return (
		<>
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
				<div className="pointer-events-none absolute -top-52 -right-52 h-[620px] w-[620px] rounded-full bg-star/[0.07] blur-[120px]" />
				<div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-12 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-24">
					<div className="animate-rise">
						<div className="flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-pill border border-star/25 bg-star-soft px-2.5 py-1 text-[10px] font-medium text-star">
								<Sparkles size={10} /> Human-powered · engineering study
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-panel/60 px-2.5 py-1 text-[10px] text-muted">
								<span className="h-1.5 w-1.5 rounded-full bg-mint" /> Case study
							</span>
						</div>

						<h1 className="mt-6 max-w-[15ch] text-[44px] leading-[0.98] font-medium tracking-[-0.055em] text-ink sm:text-[56px] lg:text-[62px]">
							Stars should follow the{" "}
							<span className="relative whitespace-nowrap text-star">
								work
								<svg
									className="absolute -bottom-2 left-0 w-full text-star/40"
									height="8"
									viewBox="0 0 120 8"
									fill="none"
									aria-hidden
								>
									<path
										d="M2 5.5c28-3 58-4.5 116-2"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</span>
							.
						</h1>

						<p className="mt-6 max-w-[52ch] text-[13.5px] leading-6 text-secondary">
							Starloop is a case-study prototype for a reciprocal credit ledger. It explores how to
							make attention explicit, hard to game, and honest about platform risk without
							automating a star. No bots. No paid stars. No growth hacks.
						</p>

						<div className="mt-7 flex flex-wrap items-center gap-2.5">
							<Link href="/connect" className={buttonStyles("star", "lg")}>
								<Star size={15} className="fill-current" /> Explore the prototype
								<ArrowRight size={14} />
							</Link>
							<Link href="#queue" className={buttonStyles("outline", "lg")}>
								<Compass size={15} /> Preview the queue
							</Link>
						</div>

						<div className="mt-7 flex flex-wrap items-center gap-3">
							{hasLiveQueue ? (
								<AvatarStack
									people={preview.map((repo) => ({
										name: repo.ownerName,
										login: repo.ownerLogin,
										src: repo.ownerAvatarUrl,
									}))}
									size={25}
									max={4}
								/>
							) : (
								<span className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-star/25 bg-star-soft px-2.5 text-[10px] text-star">
									<Sparkles size={10} /> Prototype preview
								</span>
							)}
							<p className="text-[10.5px] text-muted">
								<span className="text-secondary">{formatNumber(members)}</span> {memberLabel} ·{" "}
								<span className="text-secondary">{formatNumber(exchanged)}</span> verified stars
								exchanged
							</p>
						</div>

						<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted/80">
							<span className="inline-flex items-center gap-1.5">
								<Check size={11} className="text-mint" /> Human actions only
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Check size={11} className="text-mint" /> 1 star = 1 credit
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Check size={11} className="text-mint" /> Portfolio study
							</span>
						</div>
					</div>

					{/* Product mock */}
					<div className="animate-rise relative mx-auto w-full max-w-[480px] [animation-delay:120ms]">
						<div className="absolute -inset-8 rounded-full bg-star/[0.06] blur-3xl" />
						<div className="relative rounded-panel border border-line bg-panel/95 p-3 shadow-floating backdrop-blur">
							<div className="flex items-center justify-between border-b border-line-subtle px-2 pb-2.5">
								<div className="flex items-center gap-1.5">
									<span className="h-2 w-2 rounded-full bg-line-strong" />
									<span className="h-2 w-2 rounded-full bg-line" />
									<span className="h-2 w-2 rounded-full bg-line" />
									<span className="ml-2 text-[9px] text-muted/60">starloop / discover</span>
								</div>
								<span className="inline-flex items-center gap-1 text-[9px] text-mint">
									<span className="pulse-dot h-1 w-1 rounded-full bg-mint" />{" "}
									{hasLiveQueue ? "Queue preview" : "Example queue"}
								</span>
							</div>

							<div className="mt-2 rounded-control border border-line-subtle bg-canvas/50">
								<div className="flex items-center justify-between border-b border-line-subtle px-3 py-2">
									<p className="text-[10.5px] font-medium text-ink">Worth your star</p>
									<span className="text-[9px] text-muted">
										{hasLiveQueue ? `${preview.length} of ${repositories}` : "Example"}
									</span>
								</div>
								<div className="divide-y divide-line-subtle">
									{preview.map((repo) => (
										<div key={repo.id} className="flex items-start gap-2.5 px-3 py-2.5">
											<Avatar
												src={repo.ownerAvatarUrl}
												name={repo.ownerName}
												login={repo.ownerLogin}
												size={26}
												className="mt-0.5"
											/>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1.5">
													<p className="truncate font-mono text-[10px] text-ink">{repo.fullName}</p>
													<span className="shrink-0 rounded border border-star/20 bg-star-soft px-1 py-px text-[8px] text-star">
														{repo.ownerCredits} cr
													</span>
												</div>
												<p className="mt-0.5 line-clamp-1 text-[9.5px] leading-4 text-muted">
													{repo.description}
												</p>
												<div className="mt-1 flex items-center gap-2 text-[8.5px] text-muted/70">
													<LanguageDot language={repo.language} />
													<span className="inline-flex items-center gap-0.5">
														<Star size={7} /> {formatCompact(repo.stars)}
													</span>
												</div>
											</div>
											<span className="inline-flex shrink-0 items-center gap-1 rounded-control bg-star px-2 py-1 text-[9px] font-medium text-[#241d08]">
												<Star size={8} className="fill-current" /> Star
											</span>
										</div>
									))}
								</div>
								<div className="flex items-center gap-1.5 border-t border-line-subtle px-3 py-2 text-[8.5px] text-muted">
									<Coins size={9} className="text-star" /> Each star moves one credit from the owner
									to you.
								</div>
							</div>

							<div className="mt-2 flex items-center justify-between px-2 py-1.5">
								<span className="text-[8.5px] text-muted/60">Real GitHub stars. Human hands.</span>
								<span className="inline-flex items-center gap-1 text-[8.5px] text-mint">
									<ShieldCheck size={9} /> Verified
								</span>
							</div>
						</div>

						<div className="absolute top-14 -right-3 hidden items-center gap-1.5 rounded-control border border-mint/25 bg-[oklch(22%_0.02_165)] px-2.5 py-1.5 shadow-floating sm:flex">
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-soft text-mint">
								<Check size={10} />
							</span>
							<span className="text-[9px] leading-3 text-secondary">
								Verified on GitHub
								<br />
								<span className="text-muted/70">star is still present</span>
							</span>
						</div>

						<div className="absolute bottom-12 -left-4 hidden items-center gap-1.5 rounded-control border border-star/25 bg-[oklch(22%_0.02_85)] px-2.5 py-1.5 shadow-floating sm:flex">
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-star-soft text-star">
								<Coins size={10} />
							</span>
							<span className="text-[9px] leading-3 text-secondary">
								Credit moved
								<br />
								<span className="text-mint">+1 balance</span>
							</span>
						</div>
					</div>
				</div>

				{/* Live stats */}
				<div className="relative mx-auto w-full max-w-[1180px] px-5 pb-14 sm:px-8">
					<div className="grid overflow-hidden rounded-panel border border-line bg-panel/50 sm:grid-cols-4">
						<Stat value={formatNumber(members)} label="Members in the loop" sub="Public profiles" />
						<Stat
							value={formatNumber(repositories)}
							label="Active repositories"
							sub="One per member"
						/>
						<Stat
							value={formatNumber(exchanged)}
							label="Verified stars exchanged"
							sub="Both sides real"
						/>
						<Stat value="1:1" label="Star to credit" sub="No cash value" />
					</div>
				</div>
			</section>

			{/* Why */}
			<section className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
				<div className="max-w-[620px]">
					<p className="micro text-star">A different signal</p>
					<h2 className="mt-2.5 text-[30px] leading-[1.08] font-medium tracking-[-0.04em] text-ink sm:text-[36px]">
						Attention should cost something.
					</h2>
					<p className="mt-3 text-[13px] leading-6 text-muted">
						Most star exchanges fail because the star is free. Starloop makes it reciprocal: every
						star received is paid for by a star given, and every credit is auditable.
					</p>
				</div>

				<div className="mt-8 grid gap-3 md:grid-cols-3">
					<Feature
						icon={<HeartHandshake size={16} />}
						eyebrow="Human intent"
						title="A star you can stand behind"
						body="You open the project, read it, and star it yourself. There is no button that stars for you, no extension, and no automated flow."
					/>
					<Feature
						icon={<Coins size={16} />}
						eyebrow="Credit-backed"
						title="Attention with a cost"
						body="Receiving a star spends a credit the owner earned by giving one. The daily caps stop anyone from turning the queue into a firehose."
					/>
					<Feature
						icon={<Target size={16} />}
						eyebrow="Deliberate focus"
						title="One project, not a funnel"
						body="One active public repository per member. The queue stays legible, the credit math stays simple, and nobody can spam five launches at once."
					/>
				</div>
			</section>

			{/* How it works */}
			<section id="how" className="scroll-mt-20 border-y border-line-subtle bg-sidebar/35">
				<div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-[560px]">
							<p className="micro text-star">How the loop works</p>
							<h2 className="mt-2.5 text-[30px] leading-[1.08] font-medium tracking-[-0.04em] text-ink sm:text-[36px]">
								Three steps. No black box.
							</h2>
						</div>
						<p className="max-w-[38ch] text-[11.5px] leading-5 text-muted">
							The exchange is intentionally small. Every rule is visible, server-enforced, and
							written down.
						</p>
					</div>

					<div className="mt-9 grid gap-3 lg:grid-cols-3">
						<StepCard
							number="01"
							icon={<GitFork size={15} />}
							title="Bind one repository"
							body="Choose a public project you own, with a real description and recent activity. Eligibility is checked against GitHub, not self-reported."
							footer="Public · owned by you · not a fork"
						/>
						<StepCard
							number="02"
							icon={<Star size={15} />}
							title="Give a star you mean"
							body="Open a project from the queue and star it on GitHub. The server verifies the star with your own credential, then moves one credit from the owner to you."
							footer="1 verified star = +1 credit"
						/>
						<StepCard
							number="03"
							icon={<Sparkles size={15} />}
							title="Let the loop turn"
							body="Your repository appears in the queue while you have credits. Incoming stars spend them. Daily verification keeps every credit backed by a star that still exists."
							footer="Daily caps · re-checked against GitHub"
						/>
					</div>

					<div className="mt-4 flex flex-wrap items-center gap-2 rounded-control border border-line-subtle bg-panel/40 px-3.5 py-2.5">
						<ShieldCheck size={13} className="text-mint" />
						<p className="text-[10.5px] text-muted">
							<span className="text-secondary">The rule:</span> one verified star moves exactly one
							credit, from the project owner to the giver. Stars can be withdrawn; the credit
							reverses on both sides.
						</p>
					</div>
				</div>
			</section>

			{/* Live queue */}
			<section id="queue" className="scroll-mt-20">
				<div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="micro text-star">Queue preview</p>
							<h2 className="mt-2.5 text-[30px] leading-[1.08] font-medium tracking-[-0.04em] text-ink sm:text-[36px]">
								Work worth a look.
							</h2>
							<p className="mt-2 max-w-[58ch] text-[12px] leading-5 text-muted">
								A snapshot of active projects. No ranking to buy, no featured slot. The queue is
								ordered for variety, not for whoever pays most.
							</p>
						</div>
						<Link href="/connect" className={buttonStyles("outline", "md")}>
							Open prototype <ArrowRight size={13} />
						</Link>
					</div>

					<div className="mt-7 grid gap-3 md:grid-cols-2">
						{hasLiveQueue ? (
							queue.map((repo, index) => (
								<PublicQueueCard key={repo.id} repository={repo} index={index} />
							))
						) : (
							<div className="rounded-panel border border-dashed border-line bg-panel/40 p-6 md:col-span-2">
								<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-[13px] font-medium text-ink">
											The queue is quiet right now.
										</p>
										<p className="mt-1 max-w-[58ch] text-[11px] leading-5 text-muted">
											No public project has credits to spend at this moment. Bind a project, give a
											deliberate star, and be the first turn of the loop.
										</p>
									</div>
									<Link href="/connect" className={buttonStyles("star", "md")}>
										<Sparkles size={13} /> Open prototype
									</Link>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Trust */}
			<section id="trust" className="scroll-mt-20 border-y border-line-subtle bg-sidebar/35">
				<div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-20">
					<div>
						<p className="micro text-mint">Trust & safety</p>
						<h2 className="mt-2.5 max-w-[18ch] text-[30px] leading-[1.08] font-medium tracking-[-0.04em] text-ink sm:text-[36px]">
							Built to stay human.
						</h2>
						<p className="mt-3 max-w-[52ch] text-[12px] leading-5 text-muted">
							The exchange is small on purpose. These are not marketing promises; they are
							server-enforced constraints and documented policy.
						</p>

						<div className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
							{[
								[
									"No automation",
									"No scripts, bots, or background starring. Every star is a human action.",
								],
								[
									"No paid stars",
									"Credits cannot be bought, sold, or transferred. There is no cash value.",
								],
								["One repo each", "One active public project per member. No portfolios of queues."],
								["Daily caps", "Server-enforced limits on outgoing and incoming stars."],
								[
									"Verification",
									"Stars are re-checked against GitHub. Missing stars reverse credits.",
								],
								[
									"Open audit",
									"Every credit movement has a ledger entry and a plain-language reason.",
								],
							].map(([title, body]) => (
								<div key={title} className="flex gap-2.5">
									<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-mint/20 bg-mint-soft text-mint">
										<Check size={11} />
									</span>
									<div>
										<p className="text-[11.5px] font-medium text-secondary">{title}</p>
										<p className="mt-0.5 text-[10.5px] leading-4 text-muted">{body}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div
						id="github-policy"
						className="scroll-mt-24 self-start rounded-panel border border-star/25 bg-star-soft/25 p-5"
					>
						<div className="flex items-center gap-2">
							<ShieldCheck size={15} className="text-star" />
							<p className="micro text-star">Read before joining</p>
						</div>
						<h3 className="mt-2 text-[17px] leading-tight font-medium tracking-[-0.02em] text-ink">
							GitHub policy risk disclosure
						</h3>
						<p className="mt-2 text-[11.5px] leading-5 text-secondary">
							GitHub&apos;s Acceptable Use Policies prohibit rank abuse such as automated starring,
							inauthentic interactions, and activity incentivized by rewards such as credits, gifts,
							or giveaways. A credit-for-star exchange may be viewed as an incentive even when a
							human performs the star and no money changes hands. GitHub retains full discretion and
							may remove stars, limit accounts, or change its rules.
						</p>
						<ul className="mt-3 space-y-2 text-[10.5px] leading-4 text-muted">
							<li className="flex gap-2">
								<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-star" />
								Starloop does not automate stars, pay for stars, or guarantee growth.
							</li>
							<li className="flex gap-2">
								<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-star" />
								Participation is voluntary and at your own risk. You are responsible for your GitHub
								account.
							</li>
							<li className="flex gap-2">
								<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-star" />
								We are not affiliated with, endorsed by, or operated by GitHub, Inc.
							</li>
						</ul>
						<Link
							href="/legal#github-policy"
							className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-star underline decoration-star/40 underline-offset-2 hover:decoration-star"
						>
							Read the full risk disclosure <ArrowUpRight size={11} />
						</Link>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section id="faq" className="scroll-mt-20">
				<div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
					<div>
						<p className="micro text-star">Questions</p>
						<h2 className="mt-2.5 text-[30px] leading-[1.08] font-medium tracking-[-0.04em] text-ink">
							The honest answers.
						</h2>
						<p className="mt-3 text-[11.5px] leading-5 text-muted">
							If something is missing, the legal pages go deeper. For everything else, the code is
							the source of truth.
						</p>
					</div>

					<div className="divide-y divide-line-subtle border-y border-line-subtle">
						{[
							[
								"Is this allowed by GitHub?",
								"Not clearly, and potentially not at all. GitHub's Acceptable Use Policies prohibit rank abuse such as automated starring, inauthentic interactions, and activity incentivized by rewards such as credits, gifts, or giveaways. A human performing the star does not remove that risk: the exchange itself supplies a credit for a star. GitHub retains full discretion and may remove stars, restrict accounts, or change its policies. We disclose this instead of pretending otherwise. You decide whether to participate.",
							],
							[
								"Is this buying stars?",
								"No money changes hands. Credits are a non-transferable accounting unit with no cash value. They cannot be purchased, sold, or redeemed.",
							],
							[
								"Do you automate starring?",
								"No. Starloop never runs a background job that stars repositories. You open the project and perform the star on GitHub yourself; the app records the verified action.",
							],
							[
								"What does a credit actually do?",
								"One verified star you give moves one credit from the receiving project's owner to you. One star your project receives spends one of your credits. If a star disappears, verification reverses the transfer.",
							],
							[
								"Can I withdraw a star?",
								"Yes. Withdraw it from the Credits page. GitHub removes the star and both sides of the credit transfer reverse. Repeatedly withdrawing after receiving a return star is a policy violation.",
							],
							[
								"What data do you store?",
								"Your public GitHub profile, one active repository, credit ledger, star actions, and an encrypted credential. You can export everything as JSON or delete the account at any time.",
							],
						].map(([question, answer]) => (
							<details key={question} className="group py-4">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12.5px] font-medium text-ink [&::-webkit-details-marker]:hidden">
									{question}
									<ChevronDown
										size={14}
										className="shrink-0 text-muted transition-transform group-open:rotate-180"
									/>
								</summary>
								<p className="mt-2 max-w-[68ch] pr-6 text-[11.5px] leading-5 text-muted">
									{answer}
								</p>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="mx-auto w-full max-w-[1180px] px-5 pt-2 pb-16 sm:px-8 lg:pb-24">
				<div className="relative overflow-hidden rounded-panel border border-line bg-panel px-6 py-10 text-center shadow-floating sm:px-10 sm:py-14">
					<div className="surface-grid pointer-events-none absolute inset-0 opacity-50" />
					<div className="pointer-events-none absolute -top-24 left-1/2 h-[280px] w-[480px] -translate-x-1/2 rounded-full bg-star/[0.09] blur-[90px]" />
					<div className="relative">
						<p className="micro text-star">The prototype is open</p>
						<h2 className="mx-auto mt-3 max-w-[18ch] text-[30px] leading-[1.06] font-medium tracking-[-0.045em] text-ink sm:text-[40px]">
							A small system. Deliberate constraints.
						</h2>
						<p className="mx-auto mt-3 max-w-[52ch] text-[12px] leading-5 text-muted">
							Review the architecture, the transaction model, and the policy-risk disclosure. The
							public repository is a case study, not a hosted exchange.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
							<Link href="/connect" className={buttonStyles("star", "lg")}>
								<GithubIcon size={15} /> Open prototype
							</Link>
							<Link href="/legal" className={buttonStyles("outline", "lg")}>
								<ShieldCheck size={14} /> Read the rules first
							</Link>
						</div>
						<p className="mt-4 inline-flex items-center gap-1.5 text-[9.5px] text-muted/70">
							<Users size={10} /> {formatNumber(members)} {memberLabel} ·{" "}
							{formatNumber(repositories)} {repositoryLabel}
						</p>
					</div>
				</div>
			</section>
		</>
	);
}

function Stat({ value, label, sub }: { value: string; label: string; sub: string }) {
	return (
		<div className="border-b border-line-subtle px-5 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
			<p className="numeric text-[22px] leading-none text-ink">{value}</p>
			<p className="mt-2 text-[11px] text-secondary">{label}</p>
			<p className="mt-0.5 text-[9.5px] text-muted/60">{sub}</p>
		</div>
	);
}

function Feature({
	icon,
	eyebrow,
	title,
	body,
}: {
	icon: React.ReactNode;
	eyebrow: string;
	title: string;
	body: string;
}) {
	return (
		<div className="rounded-panel border border-line bg-panel p-5 shadow-resting transition-colors hover:border-line-strong">
			<div className="flex items-center justify-between">
				<span className="flex h-9 w-9 items-center justify-center rounded-control border border-line bg-panel-raised text-star">
					{icon}
				</span>
				<span className="micro text-muted/60">{eyebrow}</span>
			</div>
			<h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em] text-ink">{title}</h3>
			<p className="mt-2 text-[11.5px] leading-5 text-muted">{body}</p>
		</div>
	);
}

function StepCard({
	number,
	icon,
	title,
	body,
	footer,
}: {
	number: string;
	icon: React.ReactNode;
	title: string;
	body: string;
	footer: string;
}) {
	return (
		<div className="group relative overflow-hidden rounded-panel border border-line bg-panel p-5 shadow-resting">
			<div className="flex items-center justify-between">
				<span className="font-mono text-[10px] text-muted/50">{number}</span>
				<span className="flex h-8 w-8 items-center justify-center rounded-control border border-line bg-panel-raised text-star">
					{icon}
				</span>
			</div>
			<h3 className="mt-5 text-[15px] font-medium tracking-[-0.02em] text-ink">{title}</h3>
			<p className="mt-2 text-[11.5px] leading-5 text-muted">{body}</p>
			<p className="mt-4 border-t border-line-subtle pt-3 text-[9.5px] text-muted/60">{footer}</p>
		</div>
	);
}

function PublicQueueCard({
	repository,
	index,
}: {
	repository: {
		id: string;
		fullName: string;
		description: string | null;
		ownerLogin: string;
		ownerName: string | null;
		ownerAvatarUrl?: string | null;
		ownerCredits: number;
		stars: number;
		language: string | null;
		topics: string;
	};
	index: number;
}) {
	const topics = parseTopics(repository.topics).slice(0, 3);

	return (
		<article className="group flex flex-col rounded-panel border border-line bg-panel p-4 shadow-resting transition-colors hover:border-line-strong">
			<div className="flex items-start gap-3">
				<Avatar
					src={repository.ownerAvatarUrl}
					name={repository.ownerName}
					login={repository.ownerLogin}
					size={34}
					ring
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="font-mono text-[9px] text-muted/40">
							{String(index + 1).padStart(2, "0")}
						</span>
						<span className="truncate font-mono text-[12px] text-ink">{repository.fullName}</span>
					</div>
					<p className="mt-0.5 truncate text-[10px] text-muted">@{repository.ownerLogin}</p>
				</div>
				<Badge tone="star">{repository.ownerCredits} credits</Badge>
			</div>
			<p className="mt-3 line-clamp-2 min-h-[36px] text-[11.5px] leading-[18px] text-secondary">
				{repository.description ?? "No description yet."}
			</p>
			<div className="mt-3 flex min-h-[20px] flex-wrap gap-1.5">
				{topics.map((topic) => (
					<span
						key={topic}
						className="rounded border border-line-subtle bg-panel-raised/60 px-1.5 py-0.5 text-[9px] text-muted"
					>
						{topic}
					</span>
				))}
			</div>
			<div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3">
				<div className="flex items-center gap-3 text-[10px] text-muted">
					<LanguageDot language={repository.language} />
					<span className="inline-flex items-center gap-1">
						<Star size={9} /> {formatCompact(repository.stars)}
					</span>
				</div>
				<Link
					href={`https://github.com/${repository.fullName}`}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-[10.5px] text-secondary transition-colors hover:text-star"
				>
					Review on GitHub <ArrowUpRight size={10} />
				</Link>
			</div>
		</article>
	);
}
