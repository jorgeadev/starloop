import { cn } from "@/lib/utils";

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
	compact = false,
}: {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
	compact?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-panel border border-dashed border-line px-6 text-center",
				compact ? "py-8" : "py-14",
				className,
			)}
		>
			{icon ? (
				<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel-raised text-muted">
					{icon}
				</div>
			) : null}
			<h3 className="text-[13.5px] font-medium text-ink">{title}</h3>
			{description ? (
				<p className="mt-1.5 max-w-[42ch] text-[12px] leading-5 text-muted">{description}</p>
			) : null}
			{action ? <div className="mt-4">{action}</div> : null}
		</div>
	);
}
