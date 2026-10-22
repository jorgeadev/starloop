import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { AttentionItem } from "@/lib/attention";

export function AttentionStrip({ items }: { items: AttentionItem[] }) {
	if (items.length === 0) return null;
	const visible = items.slice(0, 2);

	return (
		<div className="overflow-hidden rounded-panel border border-star/20 bg-star-soft/25">
			<div className="flex items-center gap-2 border-b border-star/15 px-4 py-2">
				<span className="h-1.5 w-1.5 rounded-full bg-star" />
				<p className="micro text-star">Needs attention</p>
				<span className="ml-auto text-[10px] text-muted">
					{items.length} {items.length === 1 ? "item" : "items"}
				</span>
			</div>
			<div className="divide-y divide-star/10">
				{visible.map((item) => (
					<Link
						key={item.id}
						href={item.href}
						className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-star-soft/30"
					>
						<div className="min-w-0 flex-1">
							<p className="text-[12px] font-medium text-ink">{item.title}</p>
							<p className="mt-0.5 truncate text-[11px] text-muted">{item.detail}</p>
						</div>
						<span className="flex shrink-0 items-center gap-1 text-[11px] text-star">
							{item.action}
							<ChevronRight
								size={12}
								className="transition-transform group-hover:translate-x-0.5"
							/>
						</span>
					</Link>
				))}
			</div>
			{items.length > visible.length ? (
				<Link
					href="/settings"
					className="flex items-center justify-between border-t border-star/10 px-4 py-2 text-[10.5px] text-muted transition-colors hover:text-secondary"
				>
					<span>{items.length - visible.length} more in workspace settings</span>
					<ArrowRight size={11} />
				</Link>
			) : null}
		</div>
	);
}
