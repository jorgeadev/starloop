"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { KeyRound, Loader2, Unplug, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonStyles } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export function ConnectionActions({
	isDemo,
	needsReauth,
}: {
	isDemo: boolean;
	needsReauth: boolean;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function disconnect() {
		setLoading(true);
		try {
			await apiRequest("/api/settings/connection", {
				method: "DELETE",
				body: "{}",
			});
			setOpen(false);
			toast.success("GitHub connection removed");
			router.refresh();
		} catch (error) {
			toast.error(error instanceof ClientApiError ? error.message : "Could not disconnect GitHub.");
		} finally {
			setLoading(false);
		}
	}

	if (isDemo) {
		return (
			<span className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-panel-raised px-2.5 text-[11px] text-muted">
				<KeyRound size={12} /> Simulated connection
			</span>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Link
				href="/connect?manage=1"
				className={buttonStyles(needsReauth ? "star" : "outline", "sm")}
			>
				<KeyRound size={12} />
				{needsReauth ? "Reconnect" : "Replace credential"}
			</Link>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild>
					<Button variant="ghost" size="sm" className="text-muted hover:text-rose">
						<Unplug size={12} /> Disconnect
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="animate-fade fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]" />
					<Dialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-panel p-5 shadow-floating focus:outline-none">
						<div className="flex items-start justify-between gap-3">
							<div>
								<Dialog.Title className="text-[15px] font-medium text-ink">
									Disconnect GitHub?
								</Dialog.Title>
								<Dialog.Description className="mt-1.5 text-[12px] leading-5 text-muted">
									The encrypted token is deleted. Your repository, credits, and history stay. You
									will not be able to give or verify stars until you reconnect.
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
						<div className="mt-5 flex justify-end gap-2">
							<Dialog.Close asChild>
								<Button variant="ghost" size="md">
									Keep connected
								</Button>
							</Dialog.Close>
							<Button variant="danger" size="md" onClick={disconnect} disabled={loading}>
								{loading ? <Loader2 size={14} className="animate-spin" /> : <Unplug size={14} />}
								{loading ? "Disconnecting…" : "Disconnect"}
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
