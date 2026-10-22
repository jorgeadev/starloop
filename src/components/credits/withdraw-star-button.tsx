"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Undo2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonStyles } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export function WithdrawStarButton({
	starId,
	repoFullName,
	demo = false,
}: {
	starId: string;
	repoFullName: string;
	demo?: boolean;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function withdraw() {
		setLoading(true);
		try {
			await apiRequest("/api/exchange/unstar", {
				method: "POST",
				body: JSON.stringify({ starId }),
			});
			setOpen(false);
			toast.success(`Star withdrawn from ${repoFullName}`, {
				description: "One credit was reversed. The owner was refunded.",
			});
			router.refresh();
		} catch (error) {
			toast.error(error instanceof ClientApiError ? error.message : "Could not withdraw the star.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button type="button" className={buttonStyles("ghost", "sm", "text-muted hover:text-rose")}>
					<Undo2 size={12} /> Withdraw
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="animate-fade fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]" />
				<Dialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-panel p-5 shadow-floating focus:outline-none">
					<div className="flex items-start justify-between gap-3">
						<div>
							<Dialog.Title className="text-[15px] font-medium text-ink">
								Withdraw this star?
							</Dialog.Title>
							<Dialog.Description className="mt-1.5 text-[12px] leading-5 text-muted">
								{demo
									? "Demo mode simulates the removal. The credit transfer still reverses in the demo ledger."
									: "GitHub will remove the star from your account. Both sides of the credit transfer reverse."}
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<button
								type="button"
								aria-label="Close"
								className="rounded-md p-1.5 text-muted hover:bg-panel-raised hover:text-ink"
							>
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>
					<div className="mt-4 rounded-control border border-line-subtle bg-canvas/40 px-3 py-2.5">
						<p className="micro text-muted">Repository</p>
						<p className="mt-1 font-mono text-[12px] text-ink">{repoFullName}</p>
					</div>
					<div className="mt-5 flex justify-end gap-2">
						<Dialog.Close asChild>
							<Button variant="ghost" size="md">
								Keep star
							</Button>
						</Dialog.Close>
						<Button variant="danger" size="md" onClick={withdraw} disabled={loading}>
							{loading ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
							{loading ? "Withdrawing…" : "Withdraw star"}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
