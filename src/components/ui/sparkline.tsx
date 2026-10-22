import { cn } from "@/lib/utils";

export function Sparkline({
	values,
	width = 86,
	height = 26,
	tone = "star",
	className,
}: {
	values: number[];
	width?: number;
	height?: number;
	tone?: "star" | "mint" | "sky" | "muted";
	className?: string;
}) {
	const data = values.length > 1 ? values : [0, ...values, 0];
	const max = Math.max(...data, 1);
	const min = Math.min(...data, 0);
	const span = max - min || 1;
	const step = width / (data.length - 1);
	const points = data.map((value, index) => {
		const x = index * step;
		const y = height - 3 - ((value - min) / span) * (height - 6);
		return [x, y] as const;
	});
	const line = points
		.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
		.join(" ");
	const area = `${line} L${width},${height} L0,${height} Z`;
	const color =
		tone === "mint"
			? "var(--mint)"
			: tone === "sky"
				? "var(--sky)"
				: tone === "muted"
					? "var(--ink-muted)"
					: "var(--star)";
	const id = `spark-${tone}-${values.join("-").slice(0, 24)}`;

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill="none"
			aria-hidden
			className={cn("overflow-visible", className)}
		>
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={color} stopOpacity="0.24" />
					<stop offset="100%" stopColor={color} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={area} fill={`url(#${id})`} />
			<path
				d={line}
				stroke={color}
				strokeWidth="1.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{points.length > 0 ? (
				<circle
					cx={points[points.length - 1]![0]}
					cy={points[points.length - 1]![1]}
					r="1.8"
					fill={color}
				/>
			) : null}
		</svg>
	);
}
