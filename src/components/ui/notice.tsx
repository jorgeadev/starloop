import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "danger" | "success";

const tones: Record<Tone, { box: string; icon: string }> = {
	info: { box: "border-sky/20 bg-sky-soft/60", icon: "text-sky" },
	warning: { box: "border-star/25 bg-star-soft/60", icon: "text-star" },
	danger: { box: "border-rose/25 bg-rose-soft/60", icon: "text-rose" },
	success: { box: "border-mint/20 bg-mint-soft/60", icon: "text-mint" },
};

const icons = {
	info: Info,
	warning: AlertTriangle,
	danger: ShieldAlert,
	success: CheckCircle2,
};

export function Notice({
	tone = "info",
	title,
	children,
	action,
	className,
}: {
	tone?: Tone;
	title: React.ReactNode;
	children?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}) {
	const Icon = icons[tone];
	return (
		<div
			className={cn(
				"flex items-start gap-3 rounded-panel border px-3.5 py-3",
				tones[tone].box,
				className,
			)}
		>
			<Icon size={15} className={cn("mt-0.5 shrink-0", tones[tone].icon)} />
			<div className="min-w-0 flex-1">
				<p className="text-[12.5px] leading-5 font-medium text-ink">{title}</p>
				{children ? (
					<div className="mt-0.5 text-[11.5px] leading-5 text-secondary">{children}</div>
				) : null}
			</div>
			{action ? <div className="shrink-0 self-center">{action}</div> : null}
		</div>
	);
}
