export default function WorkspaceLoading() {
	return (
		<div className="animate-fade">
			<div className="flex flex-col gap-4 border-b border-line-subtle pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<div className="h-2.5 w-20 animate-pulse rounded bg-panel-muted" />
					<div className="h-7 w-56 animate-pulse rounded bg-panel-raised" />
					<div className="h-3 w-80 max-w-full animate-pulse rounded bg-panel" />
				</div>
				<div className="h-9 w-28 animate-pulse rounded-control bg-panel-raised" />
			</div>
			<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						key={index}
						className="h-[104px] animate-pulse rounded-panel border border-line-subtle bg-panel/60"
						style={{ animationDelay: `${index * 80}ms` }}
					/>
				))}
			</div>
			<div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_1fr]">
				<div className="h-[320px] animate-pulse rounded-panel border border-line-subtle bg-panel/60" />
				<div className="h-[320px] animate-pulse rounded-panel border border-line-subtle bg-panel/40" />
			</div>
		</div>
	);
}
