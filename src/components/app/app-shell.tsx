"use client";

import { ChevronDown, Download, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { GithubIcon } from "@/components/github-icon";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "./logout-button";
import { accountNav, workspaceNav } from "./nav";
import { cn } from "@/lib/utils";

export type ShellUser = {
	id: string;
	login: string;
	name: string | null;
	avatarUrl: string | null;
	credits: number;
	isDemo: boolean;
};

export type ShellConnection = {
	label: string;
	needsReauth: boolean;
} | null;

function NavItem({
	href,
	label,
	icon: Icon,
	active,
	badge,
	onNavigate,
}: {
	href: string;
	label: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	active: boolean;
	badge?: number;
	onNavigate?: () => void;
}) {
	return (
		<Link
			href={href}
			onClick={onNavigate}
			className={cn(
				"group flex h-8 items-center gap-2.5 rounded-control px-2.5 text-[12.5px] transition-colors",
				active
					? "bg-panel-raised font-medium text-ink"
					: "text-secondary hover:bg-panel/70 hover:text-ink",
			)}
		>
			<Icon
				size={15}
				className={cn(
					"transition-colors",
					active ? "text-star" : "text-muted group-hover:text-secondary",
				)}
			/>
			<span className="flex-1">{label}</span>
			{badge && badge > 0 ? (
				<span className="flex h-4.25 min-w-4.25 items-center justify-center rounded-pill bg-star-soft px-1 text-[9.5px] font-medium text-star">
					{badge}
				</span>
			) : null}
			{active ? <span className="h-1 w-1 rounded-full bg-star" /> : null}
		</Link>
	);
}

function SidebarContent({
	user,
	connection,
	attentionCount,
	onNavigate,
}: {
	user: ShellUser;
	connection: ShellConnection;
	attentionCount: number;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();

	return (
		<div className="flex h-full flex-col">
			<div className="flex h-14 shrink-0 items-center border-b border-line-subtle px-4">
				<Logo size={26} />
			</div>

			<div className="px-3 pt-4">
				<div className="flex items-center gap-2.5 rounded-control border border-line-subtle bg-panel/60 p-2">
					<Avatar src={user.avatarUrl} name={user.name} login={user.login} size={30} />
					<div className="min-w-0 flex-1">
						<p className="truncate text-[12px] leading-4 font-medium text-ink">
							{user.name ?? user.login}
						</p>
						<p className="truncate text-[10.5px] leading-4 text-muted">@{user.login}</p>
					</div>
					{user.isDemo ? (
						<span className="rounded border border-star/25 bg-star-soft px-1.5 py-0.5 text-[9px] font-medium tracking-[0.08em] text-star uppercase">
							Demo
						</span>
					) : (
						<ChevronDown size={13} className="text-muted" />
					)}
				</div>
			</div>

			<nav className="mt-5 flex-1 overflow-y-auto px-2.5 pb-4">
				<p className="micro mb-2 px-2.5 text-muted/80">Workspace</p>
				<div className="space-y-0.5">
					{workspaceNav.map((item) => (
						<NavItem
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							active={
								item.href === "/dashboard"
									? pathname === "/dashboard"
									: pathname.startsWith(item.href)
							}
							badge={item.href === "/dashboard" ? attentionCount : undefined}
							onNavigate={onNavigate}
						/>
					))}
				</div>

				<p className="micro mt-6 mb-2 px-2.5 text-muted/80">Account</p>
				<div className="space-y-0.5">
					{accountNav.map((item) => (
						<NavItem
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							active={pathname.startsWith(item.href)}
							onNavigate={onNavigate}
						/>
					))}
				</div>
			</nav>

			<div className="shrink-0 px-3 pb-4">
				<div className="rounded-control border border-line-subtle bg-panel/50 p-3">
					<div className="flex items-center justify-between gap-2">
						<p className="micro text-muted">GitHub</p>
						<span
							className={cn(
								"h-1.5 w-1.5 rounded-full",
								connection && !connection.needsReauth ? "bg-mint" : "bg-star",
								connection && !connection.needsReauth && "pulse-dot",
							)}
						/>
					</div>
					<p className="mt-1.5 text-[11px] leading-4 text-secondary">
						{connection
							? connection.needsReauth
								? "Reconnect needed"
								: connection.label
							: "Not connected"}
					</p>
					<Link
						href="/settings"
						onClick={onNavigate}
						className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-muted transition-colors hover:text-ink"
					>
						<Settings size={11} /> Manage connection
					</Link>
				</div>

				<div className="mt-3 px-1">
					<p className="text-[10px] leading-4 text-muted/80">Human-only. No bots, no paid stars.</p>
					<div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted/70">
						<Link href="/legal" onClick={onNavigate} className="hover:text-secondary">
							Rules
						</Link>
						<a
							href="https://github.com"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 hover:text-secondary"
						>
							<GithubIcon size={10} /> GitHub
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

export function AppShell({
	user,
	connection,
	attentionCount = 0,
	children,
}: {
	user: ShellUser;
	connection: ShellConnection;
	attentionCount?: number;
	children: React.ReactNode;
}) {
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!mobileOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [mobileOpen]);

	return (
		<div className="min-h-dvh lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
			<aside className="sticky top-0 hidden h-dvh border-r border-line-subtle bg-sidebar/80 backdrop-blur-xl lg:block">
				<SidebarContent user={user} connection={connection} attentionCount={attentionCount} />
			</aside>

			{mobileOpen ? (
				<div className="fixed inset-0 z-50 lg:hidden">
					<button
						type="button"
						aria-label="Close navigation"
						onClick={() => setMobileOpen(false)}
						className="animate-fade absolute inset-0 bg-black/65 backdrop-blur-sm"
					/>
					<aside className="animate-rise absolute inset-y-0 left-0 w-[264px] border-r border-line bg-sidebar shadow-floating">
						<SidebarContent
							user={user}
							connection={connection}
							attentionCount={attentionCount}
							onNavigate={() => setMobileOpen(false)}
						/>
					</aside>
				</div>
			) : null}

			<div className="flex min-h-dvh min-w-0 flex-col">
				<Topbar user={user} connection={connection} onMenu={() => setMobileOpen(true)} />
				<main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-7">
					{children}
				</main>
				<footer className="border-t border-line-subtle px-4 py-4 sm:px-6 lg:px-8">
					<div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 text-[10px] text-muted/70">
						<p>Starloop · A human-powered star exchange. Not affiliated with GitHub, Inc.</p>
						<div className="flex items-center gap-4">
							<Link href="/terms" className="hover:text-secondary">
								Terms
							</Link>
							<Link href="/privacy" className="hover:text-secondary">
								Privacy
							</Link>
							<Link href="/acceptable-use" className="hover:text-secondary">
								Acceptable use
							</Link>
							<Link
								href="/settings"
								className="inline-flex items-center gap-1 hover:text-secondary"
							>
								<ShieldCheck size={10} /> Safety
							</Link>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}

function Topbar({
	user,
	connection,
	onMenu,
}: {
	user: ShellUser;
	connection: ShellConnection;
	onMenu: () => void;
}) {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const title =
		Object.entries({
			"/dashboard": "Overview",
			"/discover": "Discover",
			"/repositories": "Repositories",
			"/credits": "Credits",
			"/activity": "Activity",
			"/settings": "Settings",
			"/legal": "Trust & safety",
		}).find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Workspace";

	return (
		<header className="sticky top-0 z-30 border-b border-line-subtle bg-canvas/80 backdrop-blur-xl">
			<div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
				<button
					type="button"
					onClick={onMenu}
					aria-label="Open navigation"
					className="rounded-control p-2 text-muted transition-colors hover:bg-panel-raised hover:text-ink lg:hidden"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
						<path
							d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
							stroke="currentColor"
							strokeWidth="1.3"
							strokeLinecap="round"
						/>
					</svg>
				</button>

				<div className="flex min-w-0 items-center gap-2 text-[11.5px]">
					<span className="hidden text-muted sm:inline">Workspace</span>
					<span className="hidden text-muted/40 sm:inline">/</span>
					<span className="truncate font-medium text-ink">{title}</span>
					{user.isDemo ? (
						<span className="ml-1 rounded border border-star/25 bg-star-soft px-1.5 py-0.5 text-[9px] font-medium tracking-[0.08em] text-star uppercase">
							Demo
						</span>
					) : null}
				</div>

				<div className="ml-auto flex items-center gap-2">
					<Link
						href="/discover"
						className="hidden h-8 items-center gap-2 rounded-control border border-line-subtle bg-panel/60 px-2.5 text-[11.5px] text-muted transition-colors hover:border-line hover:text-secondary sm:flex"
					>
						<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
							<circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.3" />
							<path
								d="m10.4 10.4 3 3"
								stroke="currentColor"
								strokeWidth="1.3"
								strokeLinecap="round"
							/>
						</svg>
						Find projects
						<kbd className="ml-1 rounded border border-line bg-panel-raised px-1 py-px font-mono text-[9px] text-muted">
							/
						</kbd>
					</Link>

					<Link
						href="/credits"
						className="inline-flex h-8 items-center gap-1.5 rounded-control border border-star/20 bg-star-soft px-2.5 text-[11.5px] font-medium text-star transition-colors hover:border-star/40"
						title="Credit balance"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-star" />
						<span className="numeric">{user.credits}</span>
					</Link>

					<div className="relative">
						<button
							type="button"
							onClick={() => setMenuOpen((value) => !value)}
							aria-expanded={menuOpen}
							aria-label="Account menu"
							className="flex items-center gap-2 rounded-control border border-transparent p-0.5 transition-colors hover:border-line"
						>
							<Avatar src={user.avatarUrl} name={user.name} login={user.login} size={28} />
							<ChevronDown size={12} className="hidden text-muted sm:block" />
						</button>

						{menuOpen ? (
							<>
								<button
									type="button"
									aria-label="Close account menu"
									onClick={() => setMenuOpen(false)}
									className="fixed inset-0 z-40 cursor-default"
								/>
								<div className="animate-rise absolute top-10 right-0 z-50 w-56 overflow-hidden rounded-panel border border-line bg-panel shadow-floating">
									<div className="border-b border-line-subtle px-3 py-2.5">
										<p className="truncate text-[12px] font-medium text-ink">
											{user.name ?? user.login}
										</p>
										<p className="truncate text-[10.5px] text-muted">@{user.login}</p>
									</div>
									<div className="p-1.5">
										<Link
											href="/settings"
											onClick={() => setMenuOpen(false)}
											className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-secondary transition-colors hover:bg-panel-raised hover:text-ink"
										>
											<Settings size={14} /> Settings
										</Link>
										<a
											href="/api/account"
											className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-secondary transition-colors hover:bg-panel-raised hover:text-ink"
										>
											<Download size={14} /> Export data
										</a>
										<Link
											href="/legal"
											onClick={() => setMenuOpen(false)}
											className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-secondary transition-colors hover:bg-panel-raised hover:text-ink"
										>
											<ShieldCheck size={14} /> Trust & safety
										</Link>
									</div>
									<div className="border-t border-line-subtle p-1.5">
										<LogoutButton />
									</div>
									<div className="border-t border-line-subtle px-3 py-2 text-[9.5px] text-muted/70">
										{connection
											? connection.needsReauth
												? "GitHub needs reconnecting"
												: connection.label
											: "No GitHub connection"}
									</div>
								</div>
							</>
						) : null}
					</div>
				</div>
			</div>
		</header>
	);
}
