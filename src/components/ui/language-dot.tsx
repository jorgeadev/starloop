import { LANGUAGE_COLORS } from "@/lib/constants";

export function LanguageDot({ language }: { language: string | null | undefined }) {
	if (!language) return null;
	const color = LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other;
	return (
		<span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
			<span
				className="h-[7px] w-[7px] rounded-full"
				style={{ backgroundColor: color }}
				aria-hidden
			/>
			{language}
		</span>
	);
}
