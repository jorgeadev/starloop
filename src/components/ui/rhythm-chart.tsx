import { cn } from "@/lib/utils";

type Day = { label: string; given: number; received: number };

export function RhythmChart({ days, className }: { days: Day[]; className?: string }) {
	const max = Math.max(...days.flatMap((day) => [day.given, day.received]), 1);

	return (
		<div className={cn("w-full", className)}>
			<div className="flex items-center gap-4 pb-3">
				<span className="flex items-center gap-1.5 text-[10.5px] text-muted">
					<span className="h-1.5 w-1.5 rounded-sm bg-star" /> Given
				</span>
				<span className="flex items-center gap-1.5 text-[10.5px] text-muted">
					<span className="h-1.5 w-1.5 rounded-sm bg-mint" /> Received
				</span>
			</div>
			<div className="flex h-[104px] items-end gap-2 sm:gap-3">
				{days.map((day) => (
					<div key={day.label} className="group flex h-full flex-1 flex-col justify-end">
						<div className="flex h-full items-end justify-center gap-[3px]">
							<div
								className="w-full max-w-[9px] rounded-t-[2px] bg-star/80 transition-colors group-hover:bg-star"
								style={{ height: `${Math.max(3, (day.given / max) * 100)}%` }}
								title={`${day.given} given`}
							/>
							<div
								className="w-full max-w-[9px] rounded-t-[2px] bg-mint/70 transition-colors group-hover:bg-mint"
								style={{ height: `${Math.max(3, (day.received / max) * 100)}%` }}
								title={`${day.received} received`}
							/>
						</div>
						<p className="mt-2 text-center text-[10px] text-muted">{day.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}
