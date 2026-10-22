import {
	ArrowLeft,
	ArrowRight,
	Compass,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { RepoCard } from "@/components/repo/repo-card";
import { VerifyButton } from "@/components/repo/verify-button";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { getConnection } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { getActiveRepository, getQueue, getQueueFacets } from "@/lib/db/queries";
import { MAX_INBOUND_PER_REPO_PER_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Discover" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

type SearchParams = {
	q?: string;
	lang?: string;
	sort?: string;
	page?: string;
};

export default async function DiscoverPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const user = await requireUser();
	const params = await searchParams;
	const query = (params.q ?? "").trim().slice(0, 80);
	const language = (params.lang ?? "").trim().slice(0, 40);
	const sort =
		params.sort === "newest" || params.sort === "top" || params.sort === "credits"
			? params.sort
			: "for-you";
	const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

	const [queue, facets, connection, activeRepository] = await Promise.all([
		getQueue({
			userId: user.id,
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
			language: language || undefined,
			search: query || undefined,
			sort,
		}),
		getQueueFacets(),
		getConnection(user.id),
		getActiveRepository(user.id),
	]);

	const demo = user.isDemo && process.env.DEMO_MODE === "true";
	const totalPages = Math.max(1, Math.ceil(queue.total / PAGE_SIZE));

	function href(next: Partial<SearchParams>) {
		const merged = {
			q: query,
			lang: language,
			sort,
			page: String(page),
			...next,
		};
		const search = new URLSearchParams();
		if (merged.q) search.set("q", merged.q);
		if (merged.lang) search.set("lang", merged.lang);
		if (merged.sort && merged.sort !== "for-you") search.set("sort", merged.sort);
		if (merged.page && merged.page !== "1") search.set("page", merged.page);
		const suffix = search.toString();
		return suffix ? `/discover?${suffix}` : "/discover";
	}

	const sortOptions = [
		{ value: "for-you", label: "For you" },
		{ value: "newest", label: "Newest" },
		{ value: "top", label: "Most stars" },
		{ value: "credits", label: "Most credits" },
	];

	const needsAttention = !user.isDemo && !connection;

	return (
		<div className="space-y-5">
			<PageHeader
				eyebrow="Discover"
				title="Find work worth a star."
				description="Every project here is bound by a member, public, and funded by credits. Give a star because the work deserves it — the credit is a side effect, not the point."
				actions={
					<>
						<VerifyButton />
						<Link href="/repositories" className={buttonStyles("outline", "md")}>
							Your repository
						</Link>
					</>
				}
			/>

			{needsAttention ? (
				<Notice
					tone="warning"
					title="Connect GitHub before giving a star"
					action={
						<Link href="/connect?manage=1" className={buttonStyles("star", "sm")}>
							Connect
						</Link>
					}
				>
					You can browse the queue now. A classic or fine-grained token is needed to record a real
					star.
				</Notice>
			) : null}

			<Panel className="overflow-hidden">
				<div className="flex flex-col gap-3 border-b border-line-subtle p-3 sm:flex-row sm:items-center">
					<form action="/discover" className="relative min-w-0 flex-1">
						<Search
							size={14}
							className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
						/>
						<input
							type="search"
							name="q"
							defaultValue={query}
							placeholder="Search repositories, descriptions, owners…"
							className="h-9 w-full rounded-control border border-line-subtle bg-canvas/50 pr-3 pl-9 text-[12.5px] text-ink placeholder:text-muted/60 focus:border-line-strong focus:outline-none"
						/>
						{language ? <input type="hidden" name="lang" value={language} /> : null}
						{sort !== "for-you" ? <input type="hidden" name="sort" value={sort} /> : null}
					</form>
					<div className="flex items-center gap-1 overflow-x-auto">
						<SlidersHorizontal size={13} className="mr-1 hidden shrink-0 text-muted sm:block" />
						{sortOptions.map((option) => (
							<Link
								key={option.value}
								href={href({ sort: option.value, page: "1" })}
								className={cn(
									"shrink-0 rounded-control px-2.5 py-1.5 text-[11.5px] transition-colors",
									sort === option.value
										? "bg-panel-raised font-medium text-ink"
										: "text-muted hover:bg-panel-raised/60 hover:text-secondary",
								)}
							>
								{option.label}
							</Link>
						))}
					</div>
				</div>

				<div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2">
					<Link
						href={href({ lang: "", page: "1" })}
						className={cn(
							"shrink-0 rounded-pill border px-2.5 py-1 text-[10.5px] transition-colors",
							!language
								? "border-star/30 bg-star-soft text-star"
								: "border-line-subtle text-muted hover:border-line hover:text-secondary",
						)}
					>
						All languages
					</Link>
					{facets.slice(0, 10).map((facet) => (
						<Link
							key={facet}
							href={href({ lang: facet, page: "1" })}
							className={cn(
								"shrink-0 rounded-pill border px-2.5 py-1 text-[10.5px] transition-colors",
								language === facet
									? "border-star/30 bg-star-soft text-star"
									: "border-line-subtle text-muted hover:border-line hover:text-secondary",
							)}
						>
							{facet}
						</Link>
					))}
				</div>
			</Panel>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
				<div className="min-w-0 space-y-4">
					<div className="flex items-center justify-between gap-3">
						<p className="text-[11px] text-muted">
							<span className="numeric text-secondary">{queue.total}</span>{" "}
							{queue.total === 1 ? "repository" : "repositories"}
							{language ? ` in ${language}` : ""}
							{query ? ` matching “${query}”` : ""}
						</p>
						<p className="text-[10.5px] text-muted/70">
							Page {page} of {totalPages}
						</p>
					</div>

					{queue.items.length > 0 ? (
						<div className="grid gap-3 md:grid-cols-2">
							{queue.items.map((repository, index) => (
								<RepoCard
									key={repository.id}
									repository={repository}
									demo={demo}
									index={(page - 1) * PAGE_SIZE + index}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={<Compass size={17} />}
							title={query || language ? "No projects match those filters" : "The queue is empty"}
							description={
								query || language
									? "Try a broader search or clear the language filter."
									: "Every funded project has been starred or is waiting for its owner to top up credits."
							}
							action={
								query || language ? (
									<Link href="/discover" className={buttonStyles("outline", "sm")}>
										Clear filters
									</Link>
								) : (
									<Link href="/repositories" className={buttonStyles("primary", "sm")}>
										Add your repository
									</Link>
								)
							}
						/>
					)}

					{totalPages > 1 ? (
						<div className="flex items-center justify-between border-t border-line-subtle pt-4">
							<Link
								href={href({ page: String(Math.max(1, page - 1)) })}
								aria-disabled={page <= 1}
								className={cn(
									buttonStyles("outline", "sm"),
									page <= 1 && "pointer-events-none opacity-40",
								)}
							>
								<ArrowLeft size={13} /> Previous
							</Link>
							<div className="flex items-center gap-1">
								{Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
									const target =
										totalPages <= 5
											? index + 1
											: Math.min(totalPages, Math.max(1, page - 2) + index);
									return (
										<Link
											key={target}
											href={href({ page: String(target) })}
											className={cn(
												"flex h-7 w-7 items-center justify-center rounded-control text-[11px] transition-colors",
												target === page
													? "bg-panel-raised font-medium text-ink"
													: "text-muted hover:bg-panel-raised/60 hover:text-secondary",
											)}
										>
											{target}
										</Link>
									);
								})}
							</div>
							<Link
								href={href({ page: String(Math.min(totalPages, page + 1)) })}
								aria-disabled={page >= totalPages}
								className={cn(
									buttonStyles("outline", "sm"),
									page >= totalPages && "pointer-events-none opacity-40",
								)}
							>
								Next <ArrowRight size={13} />
							</Link>
						</div>
					) : null}
				</div>

				<aside className="space-y-4">
					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<Sparkles size={13} className="text-star" />
							<h2 className="text-[12.5px] font-medium text-ink">How the queue works</h2>
						</div>
						<ol className="mt-3 space-y-3">
							{[
								["Read the project", "Open GitHub. Judge the work, not the credit."],
								["Give one star", "A real star from your account. You earn 1 credit."],
								[
									"The loop turns",
									`The owner spends 1 credit. Max ${MAX_INBOUND_PER_REPO_PER_DAY} incoming stars per project per day.`,
								],
							].map(([title, detail], index) => (
								<li key={title} className="flex gap-2.5">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-panel-raised font-mono text-[9.5px] text-secondary">
										{index + 1}
									</span>
									<div>
										<p className="text-[11.5px] font-medium text-secondary">{title}</p>
										<p className="mt-0.5 text-[10.5px] leading-4 text-muted">{detail}</p>
									</div>
								</li>
							))}
						</ol>
					</Panel>

					<Panel className="p-4">
						<div className="flex items-center gap-2">
							<ShieldCheck size={13} className="text-mint" />
							<h2 className="text-[12.5px] font-medium text-ink">Today&apos;s guardrails</h2>
						</div>
						<dl className="mt-3 space-y-2 text-[11px]">
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Your daily cap</dt>
								<dd className="numeric text-secondary">{user.dailyStarLimit} stars</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Per-project cap</dt>
								<dd className="numeric text-secondary">{MAX_INBOUND_PER_REPO_PER_DAY}/day</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Credit per star</dt>
								<dd className="numeric text-secondary">1 credit</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted">Automation</dt>
								<dd className="text-secondary">None</dd>
							</div>
						</dl>
						<p className="mt-3 border-t border-line-subtle pt-3 text-[10px] leading-4 text-muted/80">
							Stars cannot be bought, sold, or transferred. Credits have no cash value.
						</p>
					</Panel>

					{!activeRepository ? (
						<Notice
							tone="info"
							title="No repository bound"
							action={
								<Link href="/repositories" className={buttonStyles("quiet", "sm")}>
									Bind
								</Link>
							}
						>
							Your own project cannot receive stars until one is active.
						</Notice>
					) : null}
				</aside>
			</div>
		</div>
	);
}
