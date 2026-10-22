import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "star" | "mint" | "rose" | "sky";

const tones: Record<BadgeTone, string> = {
	neutral: "border-line bg-panel-raised text-secondary",
	star: "border-star/25 bg-star-soft text-star",
	mint: "border-mint/25 bg-mint-soft text-mint",
	rose: "border-rose/25 bg-rose-soft text-rose",
	sky: "border-sky/25 bg-sky-soft text-sky",
};

export function Badge({
	children,
	tone = "neutral",
	dot = false,
	className,
}: {
	children: React.ReactNode;
	tone?: BadgeTone;
	dot?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-[10.5px] leading-4 font-medium tracking-[0.01em] whitespace-nowrap",
				tones[tone],
				className,
			)}
		>
			{dot ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" /> : null}
			{children}
		</span>
	);
}
