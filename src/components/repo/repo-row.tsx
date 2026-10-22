import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageDot } from "@/components/ui/language-dot";
import { StarButton } from "@/components/repo/star-button";
import type { QueueRepository } from "@/lib/db/queries";
import { formatCompact, parseTopics } from "@/lib/utils";

export function RepoRow({
	repository,
	demo,
	compact = false,
}: {
	repository: QueueRepository;
	demo: boolean;
	compact?: boolean;
}) {
	const topics = parseTopics(repository.topics).slice(0, 2);

	return (
		<div className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-panel-raised/35">
			<Avatar
				src={repository.ownerAvatarUrl}
				name={repository.ownerName}
				login={repository.ownerLogin}
				size={compact ? 28 : 32}
				className="mt-0.5"
			/>
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<a
						href={`https://github.com/${repository.fullName}`}
						target="_blank"
						rel="noreferrer"
						className="truncate font-mono text-[12px] text-ink transition-colors hover:text-star"
					>
						{repository.fullName}
					</a>
					<Badge tone="star" className="shrink-0">
						{repository.ownerCredits} cr
					</Badge>
				</div>
				<p className="mt-1 line-clamp-2 text-[11.5px] leading-[18px] text-muted">
					{repository.description ?? "No description yet."}
				</p>
				<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
					<LanguageDot language={repository.language} />
					<span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
						<Star size={10} /> {formatCompact(repository.stars)}
					</span>
					{topics.map((topic) => (
						<span key={topic} className="text-[10px] text-muted/60">
							#{topic}
						</span>
					))}
				</div>
			</div>
			<div className="flex shrink-0 items-start pt-0.5">
				<StarButton
					repositoryId={repository.id}
					repoFullName={repository.fullName}
					ownerLogin={repository.ownerLogin}
					demo={demo}
					size="sm"
					label={compact ? "Star" : "Give star"}
				/>
			</div>
		</div>
	);
}

export function RepoRowLink({ repository }: { repository: QueueRepository }) {
	return (
		<Link
			href={`https://github.com/${repository.fullName}`}
			target="_blank"
			rel="noreferrer"
			className="block truncate font-mono text-[12px] text-ink hover:text-star"
		>
			{repository.fullName}
		</Link>
	);
}
