import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { legalDocuments, LEGAL_LAST_UPDATED, OPERATOR_CONTACT } from "@/lib/legal";

export function LegalShell({
	title,
	subtitle,
	current,
	children,
}: {
	title: string;
	subtitle: string;
	current: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 lg:py-14">
			<div className="max-w-[760px]">
				<nav className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted">
					<Link href="/legal" className="transition-colors hover:text-secondary">
						Trust center
					</Link>
					<span className="text-muted/40">/</span>
					<span className="text-secondary">{title}</span>
				</nav>
				<h1 className="mt-4 text-[30px] leading-[1.06] font-medium tracking-[-0.045em] text-ink sm:text-[38px]">
					{title}
				</h1>
				<p className="mt-3 max-w-[66ch] text-[12.5px] leading-6 text-muted">{subtitle}</p>
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9.5px] text-muted/70">
					<span>Last updated {LEGAL_LAST_UPDATED}</span>
					<span className="h-1 w-1 rounded-full bg-line-strong" />
					<span>Version 1.0 · Template</span>
					<span className="h-1 w-1 rounded-full bg-line-strong" />
					<span className="text-star/80">Operator placeholders must be completed</span>
				</div>
			</div>

			<div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_230px]">
				<article className="legal-prose min-w-0">{children}</article>

				<aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
					<div className="rounded-panel border border-line-subtle bg-panel/50 p-3.5">
						<p className="micro text-muted/80">Documents</p>
						<ul className="mt-2.5 space-y-1">
							{legalDocuments.map((document) => (
								<li key={document.href}>
									<Link
										href={document.href}
										className={
											document.label === current
												? "block rounded px-1.5 py-1 text-[10.5px] font-medium text-ink"
												: "block rounded px-1.5 py-1 text-[10.5px] text-muted transition-colors hover:text-secondary"
										}
									>
										{document.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="rounded-panel border border-star/25 bg-star-soft/25 p-3.5">
						<div className="flex items-center gap-1.5">
							<ShieldCheck size={12} className="text-star" />
							<p className="micro text-star">GitHub policy</p>
						</div>
						<p className="mt-2 text-[10px] leading-4 text-muted">
							Reciprocal starring may be treated as artificial promotion by GitHub.
						</p>
						<Link
							href="/legal#github-policy"
							className="mt-2 inline-flex items-center gap-1 text-[10px] text-star hover:underline"
						>
							Risk disclosure <ArrowUpRight size={9} />
						</Link>
					</div>

					<div className="rounded-panel border border-line-subtle bg-panel/50 p-3.5">
						<p className="micro text-muted/80">Contact</p>
						<p className="mt-2 text-[10px] leading-4 text-muted">
							Legal and privacy requests:
							<br />
							<span className="text-secondary">{OPERATOR_CONTACT}</span>
						</p>
						<p className="mt-2 text-[9px] leading-4 text-muted/60">
							Replace placeholder details before launch.
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
