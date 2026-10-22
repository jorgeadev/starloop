import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "star" | "outline" | "ghost" | "danger" | "quiet";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
	"inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors transition-shadow disabled:opacity-45 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
	primary: "bg-ink text-canvas hover:bg-white shadow-resting active:translate-y-px",
	star: "bg-star text-[#241d08] hover:brightness-105 shadow-[0_8px_24px_-12px_var(--star)] active:translate-y-px",
	outline: "border border-line bg-panel text-ink hover:border-line-strong hover:bg-panel-raised",
	ghost: "text-secondary hover:bg-panel-raised hover:text-ink",
	danger: "border border-rose/35 bg-rose-soft text-rose hover:border-rose/60 hover:bg-rose/15",
	quiet: "bg-panel-raised text-secondary hover:bg-panel-muted hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-[12px]",
	md: "h-9 px-3.5 text-[13px]",
	lg: "h-11 px-5 text-[13.5px]",
	icon: "h-8 w-8",
};

export function buttonStyles(
	variant: ButtonVariant = "outline",
	size: ButtonSize = "md",
	className?: string,
) {
	return cn(base, variants[variant], sizes[size], className);
}

export function Button({
	variant = "outline",
	size = "md",
	className,
	type = "button",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
}) {
	return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}
