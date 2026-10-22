import { cn } from "@/lib/utils";

export function PageHeader({
	eyebrow,
	title,
	description,
	actions,
	className,
}: {
	eyebrow?: string;
	title: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	className?: string;
}) {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 border-b border-line-subtle pb-5 sm:flex-row sm:items-end sm:justify-between",
				className,
			)}
		>
			<div className="min-w-0">
				{eyebrow ? <p className="micro text-star/90">{eyebrow}</p> : null}
				<h1 className="mt-2 text-[23px] leading-[1.15] font-medium tracking-[-0.035em] text-ink sm:text-[26px]">
					{title}
				</h1>
				{description ? (
					<p className="mt-2 max-w-[62ch] text-[12.5px] leading-5 text-muted">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
		</header>
	);
}

export function SectionHeading({
	title,
	description,
	action,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex items-end justify-between gap-4">
			<div>
				<h2 className="text-[15px] font-medium tracking-[-0.02em] text-ink">{title}</h2>
				{description ? <p className="mt-1 text-[12px] text-muted">{description}</p> : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
