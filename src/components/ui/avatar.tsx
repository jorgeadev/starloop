import Image from "next/image";
import { cn, gradientFor, initials } from "@/lib/utils";

export function Avatar({
	src,
	name,
	login,
	size = 32,
	className,
	ring = false,
}: {
	src?: string | null;
	name?: string | null;
	login?: string | null;
	size?: number;
	className?: string;
	ring?: boolean;
}) {
	const label = name ?? login ?? "Starloop";
	const [from, to] = gradientFor(label);
	const dimension = { width: size, height: size };

	if (src) {
		return (
			<Image
				src={src}
				alt={login ? `@${login}` : label}
				{...dimension}
				className={cn(
					"shrink-0 rounded-full bg-panel-raised object-cover",
					ring && "ring-1 ring-line",
					className,
				)}
				sizes={`${size}px`}
			/>
		);
	}

	return (
		<span
			aria-hidden
			style={{
				...dimension,
				backgroundImage: `linear-gradient(145deg, ${from}, ${to})`,
				fontSize: Math.max(9, Math.round(size * 0.32)),
			}}
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.02em] text-[#17130c] ring-1 ring-white/10",
				className,
			)}
		>
			{initials(label)}
		</span>
	);
}

export function AvatarStack({
	people,
	size = 24,
	max = 4,
	className,
}: {
	people: Array<{ name?: string | null; login?: string | null; src?: string | null }>;
	size?: number;
	max?: number;
	className?: string;
}) {
	const shown = people.slice(0, max);
	const overflow = people.length - shown.length;
	return (
		<div className={cn("flex items-center", className)}>
			{shown.map((person, index) => (
				<span
					key={`${person.login ?? person.name ?? "person"}-${index}`}
					className="rounded-full ring-2 ring-panel"
					style={{ marginLeft: index === 0 ? 0 : -7 }}
				>
					<Avatar src={person.src} name={person.name} login={person.login} size={size} />
				</span>
			))}
			{overflow > 0 ? (
				<span
					className="inline-flex items-center justify-center rounded-full bg-panel-muted text-[10px] font-medium text-secondary ring-2 ring-panel"
					style={{ width: size, height: size, marginLeft: -7 }}
				>
					+{overflow}
				</span>
			) : null}
		</div>
	);
}
