import { GitFork, ArrowUpRight, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageDot } from "@/components/ui/language-dot";
import { StarButton } from "@/components/repo/star-button";
import type { QueueRepository } from "@/lib/db/queries";
import { formatCompact, parseTopics } from "@/lib/utils";

export function RepoCard({
	repository,
	demo,
	index,
}: {
	repository: QueueRepository;
	demo: boolean;
	index?: number;
}) {
	const topics = parseTopics(repository.topics).slice(0, 3);

	return (
		<article className="group flex flex-col rounded-panel border border-line bg-panel p-4 shadow-resting transition-colors hover:border-line-strong">
			<div className="flex items-start gap-3">
				<Avatar
					src={repository.ownerAvatarUrl}
					name={repository.ownerName}
					login={repository.ownerLogin}
					size={34}
					ring
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						{typeof index === "number" ? (
							<span className="font-mono text-[9.5px] text-muted/50">
								{String(index + 1).padStart(2, "0")}
							</span>
						) : null}
						<a
							href={`https://github.com/${repository.fullName}`}
							target="_blank"
							rel="noreferrer"
							className="inline-flex min-w-0 items-center gap-1 truncate font-mono text-[12.5px] text-ink transition-colors hover:text-star"
						>
							<span className="truncate">{repository.fullName}</span>
							<ArrowUpRight
								size={11}
								className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
							/>
						</a>
					</div>
					<p className="mt-0.5 truncate text-[10.5px] text-muted">
						{repository.ownerName ? `${repository.ownerName} · ` : ""}@{repository.ownerLogin}
					</p>
				</div>
				<Badge tone="star" className="shrink-0">
					{repository.ownerCredits} credits
				</Badge>
			</div>

			<p className="mt-3 line-clamp-3 min-h-[54px] text-[12px] leading-[18px] text-secondary">
				{repository.description ?? "No description yet."}
			</p>

			<div className="mt-2.5 flex flex-wrap gap-1.5">
				{topics.length > 0 ? (
					topics.map((topic) => (
						<span
							key={topic}
							className="rounded border border-line-subtle bg-panel-raised/60 px-1.5 py-0.5 text-[9.5px] text-muted"
						>
							{topic}
						</span>
					))
				) : (
					<span className="text-[10px] text-muted/50">No topics</span>
				)}
			</div>

			<div className="mt-4 flex items-center justify-between gap-2 border-t border-line-subtle pt-3">
				<div className="flex items-center gap-3 text-[10.5px] text-muted">
					<LanguageDot language={repository.language} />
					<span className="inline-flex items-center gap-1">
						<Star size={10} /> {formatCompact(repository.stars)}
					</span>
					<span className="inline-flex items-center gap-1">
						<GitFork size={10} /> {formatCompact(repository.forks)}
					</span>
				</div>
				<StarButton
					repositoryId={repository.id}
					repoFullName={repository.fullName}
					ownerLogin={repository.ownerLogin}
					demo={demo}
				/>
			</div>
		</article>
	);
}
