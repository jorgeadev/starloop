import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/ui/sparkline";

export function KpiCard({
	label,
	value,
	unit,
	hint,
	icon,
	tone = "neutral",
	values,
	className,
	footer,
}: {
	label: string;
	value: React.ReactNode;
	unit?: string;
	hint: React.ReactNode;
	icon: React.ReactNode;
	tone?: "neutral" | "star" | "mint" | "sky";
	values?: number[];
	className?: string;
	footer?: React.ReactNode;
}) {
	const iconTone =
		tone === "star"
			? "border-star/20 bg-star-soft text-star"
			: tone === "mint"
				? "border-mint/20 bg-mint-soft text-mint"
				: tone === "sky"
					? "border-sky/20 bg-sky-soft text-sky"
					: "border-line bg-panel-raised text-muted";

	return (
		<div className={cn("rounded-panel border border-line bg-panel p-4 shadow-resting", className)}>
			<div className="flex items-start justify-between gap-3">
				<p className="micro text-muted">{label}</p>
				<span
					className={cn("flex h-7 w-7 items-center justify-center rounded-full border", iconTone)}
				>
					{icon}
				</span>
			</div>
			<div className="mt-3 flex items-baseline gap-1.5">
				<span className="numeric text-[27px] leading-none font-medium tracking-[-0.04em] text-ink">
					{value}
				</span>
				{unit ? <span className="text-[11px] text-muted">{unit}</span> : null}
			</div>
			<div className="mt-3 flex items-end justify-between gap-2">
				<div className="text-[10.5px] leading-4 text-muted">{hint}</div>
				{values && values.length > 1 ? (
					<Sparkline
						values={values}
						tone={tone === "neutral" ? "muted" : tone}
						width={74}
						height={24}
					/>
				) : null}
			</div>
			{footer}
		</div>
	);
}
