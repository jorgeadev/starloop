"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Check, ChevronDown, GitFork, Loader2, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { cn, formatCompact, formatDate, parseTopics } from "@/lib/utils";
import { SyncButton } from "@/components/repo/sync-button";

export type RepoView = {
	id: string;
	fullName: string;
	name: string;
	owner: string;
	description: string | null;
	stars: number;
	forks: number;
	language: string | null;
	topics: string;
	avatarUrl: string | null;
	isActive: boolean;
	status: string;
	boundAt: number;
	syncedAt: number | null;
};

type RepositoryOption = {
	githubId: number;
	fullName: string;
	name: string;
	description: string | null;
	stars: number;
	language: string | null;
	isPrivate: boolean;
	isFork: boolean;
	isArchived: boolean;
	pushedAt: number | null;
	eligible: boolean;
	reason: string | null;
};

export function RepositoryManager({
	repositories,
	active,
	canManage,
	isDemo,
	connectionLabel,
}: {
	repositories: RepoView[];
	active: RepoView | null;
	canManage: boolean;
	isDemo: boolean;
	connectionLabel: string | null;
}) {
	const router = useRouter();
	const [changing, setChanging] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [removing, setRemoving] = useState(false);

	async function remove() {
		setRemoving(true);
		try {
			await apiRequest("/api/repositories/deactivate", {
				method: "POST",
				body: "{}",
			});
			toast.success("Repository removed from the exchange", {
				description: "Credits, stars given, and history are unchanged.",
			});
			setConfirmOpen(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not remove the repository.",
			);
		} finally {
			setRemoving(false);
		}
	}

	return (
		<div className="space-y-4">
			<Panel>
				<PanelHeader
					title="Active repository"
					description="The only project that can receive stars for you."
					action={
						active ? (
							<Badge tone={active.status === "active" ? "mint" : "neutral"} dot>
								{active.status === "active" ? "In the queue" : active.status}
							</Badge>
						) : null
					}
				/>
				{active ? (
					<>
						<div className="p-4 sm:p-5">
							<div className="flex items-start gap-3">
								<Avatar
									src={active.avatarUrl}
									name={active.owner}
									login={active.owner}
									size={44}
									ring
								/>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<a
											href={`https://github.com/${active.fullName}`}
											target="_blank"
											rel="noreferrer"
											className="truncate font-mono text-[13.5px] text-ink transition-colors hover:text-star"
										>
											{active.fullName}
										</a>
										<ArrowUpRight size={12} className="shrink-0 text-muted" />
									</div>
									<p className="mt-1.5 text-[12.5px] leading-5 text-secondary">
										{active.description ?? "No description yet."}
									</p>
									<div className="mt-2 flex flex-wrap gap-1.5">
										{parseTopics(active.topics)
											.slice(0, 4)
											.map((topic) => (
												<span
													key={topic}
													className="rounded border border-line-subtle bg-panel-raised/60 px-1.5 py-0.5 text-[9.5px] text-muted"
												>
													{topic}
												</span>
											))}
									</div>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
								<Stat label="Stars" value={formatCompact(active.stars)} icon={<Star size={11} />} />
								<Stat
									label="Forks"
									value={formatCompact(active.forks)}
									icon={<GitFork size={11} />}
								/>
								<Stat label="Bound" value={formatDate(active.boundAt)} />
								<Stat
									label="Synced"
									value={active.syncedAt ? formatDate(active.syncedAt) : "Never"}
								/>
							</div>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-subtle px-4 py-3 sm:px-5">
							<div className="flex items-center gap-1.5">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setChanging((value) => !value)}
									disabled={!canManage}
								>
									{changing ? <X size={13} /> : <ChevronDown size={13} />}
									{changing ? "Close picker" : "Change repository"}
								</Button>
								<SyncButton demo={isDemo} />
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setConfirmOpen(true)}
								disabled={!canManage}
								className="text-muted hover:text-rose"
							>
								Remove from exchange
							</Button>
						</div>
					</>
				) : (
					<div className="p-4 sm:p-5">
						<EmptyState
							icon={<GitFork size={17} />}
							title="No active repository"
							description="Bind one public project you own. The queue will send stars to it while you give stars to others."
							action={
								canManage ? (
									<Button variant="primary" size="sm" onClick={() => setChanging(true)}>
										Choose a repository
									</Button>
								) : (
									<Link href="/connect?manage=1" className={buttonStyles("primary", "sm")}>
										Connect GitHub
									</Link>
								)
							}
							compact
						/>
					</div>
				)}
			</Panel>

			{!canManage ? (
				<Notice
					tone={isDemo ? "info" : "warning"}
					title={isDemo ? "Demo repository is fixed" : "GitHub is not connected"}
				>
					{isDemo
						? "Connect a real GitHub account to bind your own project. The demo keeps mayachen/atlas active."
						: "Connect a classic or fine-grained token before choosing a repository. The token is only used for GitHub actions you initiate."}
				</Notice>
			) : null}

			{changing || (!active && canManage) ? (
				<RepositoryPicker
					canManage={canManage}
					activeFullName={active?.fullName ?? null}
					connectionLabel={connectionLabel}
					onClose={active ? () => setChanging(false) : undefined}
				/>
			) : null}

			{repositories.length > 0 ? (
				<Panel>
					<PanelHeader
						title="Bound repositories"
						description="One is active; the rest are kept for history."
					/>
					<ul className="divide-y divide-line-subtle">
						{repositories.map((repository) => (
							<li
								key={repository.id}
								className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel-raised/30"
							>
								<Avatar
									src={repository.avatarUrl}
									name={repository.owner}
									login={repository.owner}
									size={28}
								/>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<a
											href={`https://github.com/${repository.fullName}`}
											target="_blank"
											rel="noreferrer"
											className="truncate font-mono text-[11.5px] text-ink hover:text-star"
										>
											{repository.fullName}
										</a>
										{repository.isActive ? (
											<Badge tone="mint" dot>
												Active
											</Badge>
										) : null}
									</div>
									<p className="mt-0.5 truncate text-[10.5px] text-muted">
										{repository.description ?? "No description"}
									</p>
								</div>
								<div className="hidden shrink-0 items-center gap-3 text-[10.5px] text-muted sm:flex">
									<span className="inline-flex items-center gap-1">
										<Star size={10} /> {formatCompact(repository.stars)}
									</span>
									<Badge tone="neutral">{repository.status}</Badge>
								</div>
							</li>
						))}
					</ul>
				</Panel>
			) : null}

			<Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="animate-fade fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]" />
					<Dialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-panel p-5 shadow-floating focus:outline-none">
						<Dialog.Title className="text-[15px] font-medium text-ink">
							Remove from the exchange?
						</Dialog.Title>
						<Dialog.Description className="mt-2 text-[12px] leading-5 text-muted">
							{active?.fullName} will stop appearing in the queue. Your credits, given stars, and
							reputation stay exactly as they are. You can bind it again later.
						</Dialog.Description>
						<div className="mt-5 flex justify-end gap-2">
							<Dialog.Close asChild>
								<Button variant="ghost" size="md">
									Cancel
								</Button>
							</Dialog.Close>
							<Button variant="danger" size="md" onClick={remove} disabled={removing}>
								{removing ? <Loader2 size={14} className="animate-spin" /> : null}
								{removing ? "Removing…" : "Remove repository"}
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
	return (
		<div className="rounded-control border border-line-subtle bg-canvas/30 px-3 py-2.5">
			<p className="micro flex items-center gap-1 text-muted">
				{icon} {label}
			</p>
			<p className="mt-1 truncate text-[12px] text-secondary">{value}</p>
		</div>
	);
}

function RepositoryPicker({
	canManage,
	activeFullName,
	connectionLabel,
	onClose,
}: {
	canManage: boolean;
	activeFullName: string | null;
	connectionLabel: string | null;
	onClose?: () => void;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(canManage);
	const [options, setOptions] = useState<RepositoryOption[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [binding, setBinding] = useState<string | null>(null);

	useEffect(() => {
		if (!canManage) return;
		let cancelled = false;
		async function load() {
			try {
				const result = await apiRequest<{ repositories: RepositoryOption[] }>(
					"/api/github/repositories",
				);
				if (!cancelled) setOptions(result.repositories);
			} catch (caught) {
				if (!cancelled) {
					setError(
						caught instanceof ClientApiError
							? caught.message
							: "Could not load your repositories from GitHub.",
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		void load();
		return () => {
			cancelled = true;
		};
	}, [canManage]);

	const filtered = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return options;
		return options.filter(
			(option) =>
				option.fullName.toLowerCase().includes(term) ||
				(option.description ?? "").toLowerCase().includes(term),
		);
	}, [options, query]);

	async function bind(option: RepositoryOption) {
		setBinding(option.fullName);
		try {
			await apiRequest("/api/repositories/bind", {
				method: "POST",
				body: JSON.stringify({ fullName: option.fullName }),
			});
			toast.success(`${option.fullName} is now your active repository`);
			onClose?.();
			router.refresh();
		} catch (caught) {
			toast.error(
				caught instanceof ClientApiError ? caught.message : "Could not bind that repository.",
			);
		} finally {
			setBinding(null);
		}
	}

	return (
		<Panel>
			<PanelHeader
				title="Choose a repository"
				description={
					connectionLabel
						? `Listing repositories available to ${connectionLabel}.`
						: "Repositories you own, ordered by recent activity."
				}
				action={
					onClose ? (
						<Button variant="ghost" size="icon" onClick={onClose} aria-label="Close picker">
							<X size={14} />
						</Button>
					) : null
				}
			/>
			<div className="border-b border-line-subtle p-3">
				<div className="relative">
					<Search
						size={13}
						className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Filter by name or description…"
						className="h-9 w-full rounded-control border border-line-subtle bg-canvas/50 pr-3 pl-9 text-[12px] text-ink placeholder:text-muted/60 focus:border-line-strong focus:outline-none"
					/>
				</div>
			</div>

			<div className="max-h-[420px] overflow-y-auto">
				{loading ? (
					<div className="space-y-2 p-3">
						{[0, 1, 2].map((index) => (
							<div key={index} className="shimmer h-14 rounded-control opacity-60" />
						))}
					</div>
				) : error ? (
					<div className="p-4">
						<Notice tone="danger" title="Could not list repositories">
							{error}
						</Notice>
					</div>
				) : filtered.length === 0 ? (
					<div className="p-4">
						<EmptyState
							icon={<GitFork size={16} />}
							title={options.length === 0 ? "No repositories found" : "No matches"}
							description={
								options.length === 0
									? "Make sure your token can read repository metadata and that you own at least one public repository."
									: "Try a different name or clear the filter."
							}
							compact
						/>
					</div>
				) : (
					<ul className="divide-y divide-line-subtle">
						{filtered.map((option) => {
							const isActive = option.fullName === activeFullName;
							const disabled = !option.eligible || isActive || binding !== null;
							return (
								<li
									key={option.githubId}
									className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-panel-raised/30"
								>
									<Avatar
										name={option.fullName.split("/")[0]}
										login={option.fullName.split("/")[0]}
										size={28}
										className="mt-0.5"
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="truncate font-mono text-[11.5px] text-ink">
												{option.fullName}
											</span>
											{isActive ? <Badge tone="mint">Active</Badge> : null}
											{option.isPrivate ? <Badge tone="neutral">Private</Badge> : null}
										</div>
										<p className="mt-0.5 line-clamp-2 text-[10.5px] leading-4 text-muted">
											{option.description ?? "No description"}
										</p>
										{!option.eligible && option.reason ? (
											<p className="mt-1 text-[10px] leading-4 text-star/80">{option.reason}</p>
										) : (
											<p className="mt-1 flex items-center gap-2 text-[10px] text-muted/70">
												<span className="inline-flex items-center gap-1">
													<Star size={9} /> {formatCompact(option.stars)}
												</span>
												{option.language ? <span>{option.language}</span> : null}
												{option.eligible ? (
													<span className="inline-flex items-center gap-1 text-mint">
														<Check size={9} /> Eligible
													</span>
												) : null}
											</p>
										)}
									</div>
									<Button
										variant={option.eligible && !isActive ? "star" : "quiet"}
										size="sm"
										disabled={disabled}
										onClick={() => bind(option)}
										className={cn("shrink-0", isActive && "opacity-60")}
									>
										{binding === option.fullName ? (
											<Loader2 size={12} className="animate-spin" />
										) : null}
										{isActive ? "Active" : binding === option.fullName ? "Binding…" : "Bind"}
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</div>
			<div className="border-t border-line-subtle px-4 py-2.5 text-[10px] leading-4 text-muted/80">
				Only public, non-fork repositories you own, with a description and recent activity, are
				eligible. One active repository per member.
			</div>
		</Panel>
	);
}
