import {
	Activity as ActivityIcon,
	Flag,
	FolderGit2,
	Scale,
	ShieldCheck,
	Sparkles,
	Star,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { ActivityRow } from "@/lib/db/queries";
import { cn, formatRelativeTime } from "@/lib/utils";

const typeStyles: Record<
	string,
	{ icon: React.ComponentType<{ size?: number; className?: string }>; tone: string; ring: string }
> = {
	star_given: { icon: Star, tone: "text-star", ring: "border-star/25 bg-star-soft" },
	star_received: {
		icon: Sparkles,
		tone: "text-mint",
		ring: "border-mint/25 bg-mint-soft",
	},
	verification: {
		icon: ShieldCheck,
		tone: "text-sky",
		ring: "border-sky/25 bg-sky-soft",
	},
	repo_bound: {
		icon: FolderGit2,
		tone: "text-secondary",
		ring: "border-line bg-panel-raised",
	},
	welcome: {
		icon: Sparkles,
		tone: "text-star",
		ring: "border-star/25 bg-star-soft",
	},
	policy: { icon: Scale, tone: "text-secondary", ring: "border-line bg-panel-raised" },
	report: { icon: Flag, tone: "text-rose", ring: "border-rose/25 bg-rose-soft" },
	credit_earned: { icon: Star, tone: "text-star", ring: "border-star/25 bg-star-soft" },
	credit_spent: { icon: Star, tone: "text-mint", ring: "border-mint/25 bg-mint-soft" },
};

export function ActivityList({
	items,
	compact = false,
}: {
	items: ActivityRow[];
	compact?: boolean;
}) {
	if (items.length === 0) {
		return (
			<p className="px-4 py-8 text-center text-[12px] text-muted">
				No activity yet. Your first star starts the trail.
			</p>
		);
	}

	return (
		<ul className="divide-y divide-line-subtle">
			{items.map((item) => {
				const style = typeStyles[item.type] ?? {
					icon: ActivityIcon,
					tone: "text-muted",
					ring: "border-line bg-panel-raised",
				};
				const Icon = style.icon;
				return (
					<li
						key={item.id}
						className={cn(
							"flex gap-3 px-4 transition-colors hover:bg-panel-raised/30",
							compact ? "py-2.5" : "py-3.5",
						)}
					>
						<div className="relative mt-0.5 shrink-0">
							{compact ? (
								<div
									className={cn(
										"flex h-7 w-7 items-center justify-center rounded-full border",
										style.ring,
									)}
								>
									<Icon size={12} className={style.tone} />
								</div>
							) : (
								<Avatar
									src={item.actorAvatarUrl}
									name={item.actorName}
									login={item.actorLogin}
									size={30}
								/>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-start justify-between gap-3">
								<p className="text-[12px] leading-5 font-medium text-ink">{item.title}</p>
								<span className="shrink-0 text-[10px] text-muted">
									{formatRelativeTime(item.createdAt)}
								</span>
							</div>
							{item.detail ? (
								<p className="mt-0.5 line-clamp-2 text-[11px] leading-[17px] text-muted">
									{item.detail}
								</p>
							) : null}
							{item.repoFullName ? (
								<p className="mt-1 truncate font-mono text-[9.5px] text-muted/60">
									{item.repoFullName}
								</p>
							) : null}
						</div>
					</li>
				);
			})}
		</ul>
	);
}
