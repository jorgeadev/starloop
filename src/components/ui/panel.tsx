import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("rounded-panel border border-line bg-panel shadow-resting", className)}
			{...props}
		/>
	);
}

export function PanelHeader({
	title,
	description,
	action,
	className,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-start justify-between gap-4 border-b border-line-subtle px-4 py-3.5 sm:px-5",
				className,
			)}
		>
			<div className="min-w-0">
				<h2 className="text-[13.5px] font-medium tracking-[-0.01em] text-ink">{title}</h2>
				{description ? (
					<p className="mt-0.5 text-[12px] leading-5 text-muted">{description}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

export function Divider({ className }: { className?: string }) {
	return <div className={cn("h-px w-full bg-line-subtle", className)} />;
}

export function KeyValue({
	label,
	value,
	className,
}: {
	label: React.ReactNode;
	value: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex items-baseline justify-between gap-6", className)}>
			<span className="text-[12px] text-muted">{label}</span>
			<span className="text-right text-[12.5px] text-secondary">{value}</span>
		</div>
	);
}
