import Link from "next/link";
import { GithubIcon } from "@/components/github-icon";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";

const productLinks = [
	{ href: "/#how", label: "How it works" },
	{ href: "/#queue", label: "Queue preview" },
	{ href: "/#trust", label: "Trust & safety" },
	{ href: "/#faq", label: "FAQ" },
];

const trustLinks = [
	{ href: "/legal", label: "Trust center" },
	{ href: "/acceptable-use", label: "Acceptable use" },
	{ href: "/terms", label: "Terms" },
	{ href: "/privacy", label: "Privacy" },
];

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession();

	return (
		<div className="relative flex min-h-dvh flex-col">
			<header className="sticky top-0 z-40 border-b border-line-subtle/70 bg-canvas/75 backdrop-blur-xl">
				<div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8">
					<Logo size={27} />
					<nav className="hidden items-center gap-5 md:flex">
						{productLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-[11.5px] text-muted transition-colors hover:text-ink"
							>
								{link.label}
							</Link>
						))}
					</nav>
					<div className="ml-auto flex items-center gap-2">
						{session ? (
							<Link
								href="/dashboard"
								className="inline-flex h-8 items-center gap-1.5 rounded-control bg-ink px-3 text-[11.5px] font-medium text-canvas transition-colors hover:bg-white"
							>
								Open workspace
							</Link>
						) : (
							<>
								<Link
									href="/connect"
									className="hidden h-8 items-center rounded-control px-2.5 text-[11.5px] text-secondary transition-colors hover:text-ink sm:inline-flex"
								>
									Prototype
								</Link>
								<Link
									href="/connect"
									className="inline-flex h-8 items-center gap-1.5 rounded-control bg-ink px-3 text-[11.5px] font-medium text-canvas transition-colors hover:bg-white"
								>
									Open prototype
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1">{children}</main>

			<footer className="border-t border-line-subtle bg-sidebar/50">
				<div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
					<div>
						<Logo size={26} />
						<p className="mt-3 max-w-[34ch] text-[11px] leading-5 text-muted">
							A human-powered exchange for developers who want their work discovered by people, not
							algorithms.
						</p>
						<p className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-muted/70">
							<span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
							Exchange operational
						</p>
					</div>

					<FooterColumn
						title="Product"
						links={[
							{ href: "/connect", label: "Open prototype" },
							{ href: "/#how", label: "How it works" },
							{ href: "/#queue", label: "Queue preview" },
							{ href: "/#faq", label: "Questions" },
						]}
					/>
					<FooterColumn title="Trust" links={trustLinks} />
					<div>
						<p className="micro text-muted/80">Elsewhere</p>
						<ul className="mt-3 space-y-2 text-[11px]">
							<li>
								<a
									href="https://github.com"
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
								>
									<GithubIcon size={11} /> GitHub
								</a>
							</li>
							<li>
								<a
									href="https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies"
									target="_blank"
									rel="noreferrer"
									className="text-muted transition-colors hover:text-ink"
								>
									GitHub policy
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="border-t border-line-subtle">
					<div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-2 px-5 py-4 text-[9.5px] text-muted/60 sm:px-8">
						<p>
							© {new Date().getFullYear()} {APP_NAME}. Independent project. Not affiliated with
							GitHub, Inc.
						</p>
						<p className="max-w-[58ch] text-right">
							Reciprocal starring may conflict with GitHub policy. Read the{" "}
							<Link href="/legal#github-policy" className="text-muted hover:text-secondary">
								risk disclosure
							</Link>
							.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FooterColumn({
	title,
	links,
}: {
	title: string;
	links: Array<{ href: string; label: string }>;
}) {
	return (
		<div>
			<p className="micro text-muted/80">{title}</p>
			<ul className="mt-3 space-y-2 text-[11px]">
				{links.map((link) => (
					<li key={link.href}>
						<Link href={link.href} className="text-muted transition-colors hover:text-ink">
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
