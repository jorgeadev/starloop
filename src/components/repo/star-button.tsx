"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GithubIcon } from "@/components/github-icon";
import { Button, buttonStyles } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type StarButtonProps = {
	repositoryId: string;
	repoFullName: string;
	ownerLogin: string;
	demo?: boolean;
	size?: "sm" | "md";
	variant?: "star" | "outline" | "quiet";
	label?: string;
	className?: string;
	disabled?: boolean;
};

export function StarButton({
	repositoryId,
	repoFullName,
	ownerLogin,
	demo = false,
	size = "sm",
	variant = "star",
	label = "Give star",
	className,
	disabled = false,
}: StarButtonProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	async function confirm() {
		setLoading(true);
		try {
			await apiRequest("/api/exchange/star", {
				method: "POST",
				body: JSON.stringify({ repositoryId }),
			});
			setDone(true);
			setOpen(false);
			toast.success(
				demo
					? `Demo star recorded for ${repoFullName}.`
					: `Starred ${repoFullName}. One credit added.`,
				{
					description: demo
						? "Nothing was sent to GitHub in demo mode."
						: `@${ownerLogin} spent one credit. The loop turns.`,
				},
			);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError
					? error.message
					: "The star could not be recorded. Try again.",
			);
		} finally {
			setLoading(false);
		}
	}

	if (done) {
		return (
			<span
				className={cn(
					"inline-flex h-8 items-center gap-1.5 rounded-control border border-mint/25 bg-mint-soft px-2.5 text-[11.5px] font-medium text-mint",
					className,
				)}
			>
				<Check size={13} /> Credited
			</span>
		);
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={buttonStyles(variant, size, className)}
				>
					<Star size={13} className={variant === "star" ? "fill-current" : undefined} />
					{label}
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="animate-fade fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]" />
				<Dialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-panel border border-line bg-panel shadow-floating focus:outline-none">
					<div className="flex items-start justify-between gap-4 border-b border-line-subtle px-5 py-4">
						<div>
							<Dialog.Title className="text-[15px] font-medium tracking-[-0.02em] text-ink">
								Give a real star
							</Dialog.Title>
							<Dialog.Description className="mt-1 text-[12px] leading-5 text-muted">
								This opens no automated window. It records one deliberate action.
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<button
								type="button"
								aria-label="Close"
								className="rounded-md p-1.5 text-muted transition-colors hover:bg-panel-raised hover:text-ink"
							>
								<X size={16} />
							</button>
						</Dialog.Close>
					</div>

					<div className="space-y-4 px-5 py-5">
						<div className="rounded-control border border-line-subtle bg-canvas/40 p-3.5">
							<p className="micro text-muted">Repository</p>
							<p className="mt-1.5 font-mono text-[12.5px] text-ink">{repoFullName}</p>
						</div>

						<div className="grid grid-cols-2 gap-2.5">
							<div className="rounded-control border border-line-subtle bg-panel-raised/60 p-3">
								<p className="micro text-muted">You</p>
								<p className="mt-1 text-[13px] font-medium text-mint">+1 credit</p>
								<p className="mt-0.5 text-[11px] text-muted">Earned for a verified star.</p>
							</div>
							<div className="rounded-control border border-line-subtle bg-panel-raised/60 p-3">
								<p className="micro text-muted">@{ownerLogin}</p>
								<p className="mt-1 text-[13px] font-medium text-star">−1 credit</p>
								<p className="mt-0.5 text-[11px] text-muted">Spent to receive the star.</p>
							</div>
						</div>

						<p className="text-[11.5px] leading-5 text-muted">
							{demo
								? "Demo mode simulates the GitHub request. No star is sent and no token is used."
								: "GitHub will record a star from your connected account. You can withdraw it later from Credits; the credit transfer reverses."}
						</p>

						<div className="flex justify-end gap-2 pt-1">
							<Dialog.Close asChild>
								<Button variant="ghost" size="md">
									Not now
								</Button>
							</Dialog.Close>
							<Button variant="star" size="md" onClick={confirm} disabled={loading}>
								{loading ? (
									<Loader2 size={14} className="animate-spin" />
								) : (
									<GithubIcon size={14} />
								)}
								{loading ? "Starring…" : "Star on GitHub"}
							</Button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
