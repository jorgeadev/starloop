import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			fill="none"
			aria-hidden
			className={className}
		>
			<path
				d="M27.2 16a11.2 11.2 0 1 1-4.9-9.2"
				stroke="var(--star)"
				strokeWidth="1.7"
				strokeLinecap="round"
			/>
			<path
				d="M23.1 4.2l1.15 2.35 2.6.34-1.9 1.8.5 2.57-2.35-1.25-2.3 1.25.5-2.57-1.92-1.8 2.6-.34z"
				fill="var(--star)"
			/>
			<circle cx="16" cy="16" r="2.1" fill="var(--ink)" />
		</svg>
	);
}

export function Logo({
	href = "/",
	size = 28,
	wordmark = true,
	className,
}: {
	href?: string;
	size?: number;
	wordmark?: boolean;
	className?: string;
}) {
	return (
		<Link
			href={href}
			aria-label="Starloop home"
			className={cn("inline-flex items-center gap-2.5", className)}
		>
			<LogoMark size={size} />
			{wordmark ? (
				<span className="flex items-baseline gap-[3px] text-[16px] font-semibold tracking-[-0.04em] text-ink">
					starloop
					<span className="mb-[2px] h-[4px] w-[4px] rounded-full bg-star" />
				</span>
			) : null}
		</Link>
	);
}
