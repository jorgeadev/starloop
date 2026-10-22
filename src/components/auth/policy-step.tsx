"use client";

import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const rules = [
	"Give stars because the project deserves them, not because a credit is attached.",
	"No bots, scripts, automation, paid incentives, or purchased stars.",
	"One active public repository per member, owned by you.",
	"Respect the daily caps and the verification checks.",
	"Report spam instead of gaming the queue.",
	"Understand that reciprocal starring may conflict with GitHub policy.",
];

export function PolicyStep({
	destination,
	policyVersion,
}: {
	destination: string;
	policyVersion: string;
}) {
	const router = useRouter();
	const [accepted, setAccepted] = useState(false);
	const [loading, setLoading] = useState(false);

	async function submit() {
		setLoading(true);
		try {
			await apiRequest("/api/policy/accept", {
				method: "POST",
				body: JSON.stringify({ accept: true }),
			});
			toast.success("Rules accepted", {
				description: "Your workspace is ready. One repository and the loop begins.",
			});
			router.push(destination);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not save your acceptance.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4">
			<ul className="space-y-2">
				{rules.map((rule) => (
					<li key={rule} className="flex items-start gap-2 text-[11.5px] leading-5 text-secondary">
						<Check size={12} className="mt-1 shrink-0 text-mint" />
						{rule}
					</li>
				))}
			</ul>

			<div
				className="flex cursor-pointer items-start gap-2.5 rounded-control border border-line-subtle bg-canvas/30 p-3 transition-colors hover:border-line"
				onClick={(event) => {
					if ((event.target as HTMLElement).closest("a")) return;
					setAccepted((value) => !value);
				}}
			>
				<button
					type="button"
					role="checkbox"
					aria-checked={accepted}
					aria-labelledby="policy-consent"
					onClick={(event) => {
						event.stopPropagation();
						setAccepted((value) => !value);
					}}
					className={cn(
						"mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150",
						"focus-visible:ring-2 focus-visible:ring-star/40 focus-visible:outline-none",
						accepted
							? "border-star bg-star text-[#241d08] shadow-[0_0_0_3px_var(--star-soft)]"
							: "border-line-strong bg-canvas/60 text-transparent hover:border-star/60",
					)}
				>
					<Check size={11} strokeWidth={3} aria-hidden="true" />
				</button>
				<span id="policy-consent" className="text-[11px] leading-5 text-secondary">
					I have read the{" "}
					<a href="/acceptable-use" className="text-ink underline underline-offset-2">
						acceptable use rules
					</a>
					,{" "}
					<a href="/terms" className="text-ink underline underline-offset-2">
						terms
					</a>
					, and the{" "}
					<a href="/legal#github-policy" className="text-ink underline underline-offset-2">
						GitHub policy risk disclosure
					</a>
					. I understand participation is voluntary and at my own risk.
				</span>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="inline-flex items-center gap-1.5 text-[10px] text-muted">
					<ShieldCheck size={11} className="text-mint" /> Policy version {policyVersion}
				</p>
				<Button variant="star" size="md" onClick={submit} disabled={!accepted || loading}>
					{loading ? <Loader2 size={14} className="animate-spin" /> : null}
					{loading ? "Saving…" : "Accept and continue"}
				</Button>
			</div>
		</div>
	);
}
