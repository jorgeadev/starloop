"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Download, Loader2, LogOut, ShieldAlert, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export function DataActions({ isDemo, login }: { isDemo: boolean; login: string }) {
	const router = useRouter();
	const [revoking, setRevoking] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [confirmation, setConfirmation] = useState("");
	const [deleting, setDeleting] = useState(false);

	async function revokeSessions() {
		setRevoking(true);
		try {
			await apiRequest("/api/account/sessions", { method: "DELETE", body: "{}" });
			toast.success("Other sessions signed out");
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not sign out the other sessions.",
			);
		} finally {
			setRevoking(false);
		}
	}

	async function deleteAccount() {
		setDeleting(true);
		try {
			await apiRequest("/api/account", {
				method: "DELETE",
				body: JSON.stringify({ confirmation: "delete my account" }),
			});
			router.push("/");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not delete the account.",
			);
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-3">
				<div>
					<p className="text-[12px] font-medium text-ink">Export your data</p>
					<p className="mt-0.5 text-[10.5px] text-muted">
						Account, repositories, stars, credits, and activity as JSON.
					</p>
				</div>
				<a
					href="/api/account"
					className="inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-panel px-2.5 text-[11.5px] text-secondary transition-colors hover:border-line-strong hover:text-ink"
				>
					<Download size={12} /> Download JSON
				</a>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-3">
				<div>
					<p className="text-[12px] font-medium text-ink">Other sessions</p>
					<p className="mt-0.5 text-[10.5px] text-muted">Sign out every browser except this one.</p>
				</div>
				<Button variant="outline" size="sm" onClick={revokeSessions} disabled={revoking}>
					{revoking ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
					{revoking ? "Signing out…" : "Sign out others"}
				</Button>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-[12px] font-medium text-ink">
						{isDemo ? "Exit the demo" : "Delete account"}
					</p>
					<p className="mt-0.5 max-w-[54ch] text-[10.5px] leading-4 text-muted">
						{isDemo
							? "Ends this demo session. The seeded workspace stays for other visitors."
							: "Permanently removes your Starloop account, repository links, credits, and activity. Stars already on GitHub stay until you remove them."}
					</p>
				</div>
				<Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
					<Trash2 size={12} />
					{isDemo ? "Exit demo" : "Delete account"}
				</Button>
			</div>

			<Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="animate-fade fixed inset-0 z-50 bg-black/65 backdrop-blur-[3px]" />
					<Dialog.Content className="animate-rise fixed top-1/2 left-1/2 z-50 w-[min(92vw,450px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-panel p-5 shadow-floating focus:outline-none">
						<div className="flex items-start justify-between gap-3">
							<div>
								<Dialog.Title className="text-[15px] font-medium text-ink">
									{isDemo ? "Exit the demo?" : "Delete this account?"}
								</Dialog.Title>
								<Dialog.Description className="mt-1.5 text-[12px] leading-5 text-muted">
									{isDemo
										? "You will be signed out. No demo data is removed."
										: "This cannot be undone. Your Starloop data is deleted. GitHub stars you gave are not automatically removed."}
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

						{!isDemo ? (
							<div className="mt-4">
								<label htmlFor="delete-confirmation" className="micro text-muted">
									Type “delete my account” to confirm
								</label>
								<input
									id="delete-confirmation"
									value={confirmation}
									onChange={(event) => setConfirmation(event.target.value)}
									autoComplete="off"
									className="mt-2 h-9 w-full rounded-control border border-line bg-canvas/50 px-2.5 font-mono text-[12px] text-ink focus:border-rose focus:outline-none"
								/>
							</div>
						) : null}

						<div className="mt-4 flex items-start gap-2 rounded-control border border-rose/20 bg-rose-soft/50 p-2.5">
							<ShieldAlert size={13} className="mt-0.5 shrink-0 text-rose" />
							<p className="text-[10px] leading-4 text-secondary">
								{isDemo
									? "Demo data is regenerated from the seed. Nothing is tied to a real GitHub account."
									: `Signed in as @${login}. Credits have no cash value and cannot be refunded.`}
							</p>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<Dialog.Close asChild>
								<Button variant="ghost" size="md">
									Cancel
								</Button>
							</Dialog.Close>
							<Button
								variant="danger"
								size="md"
								onClick={deleteAccount}
								disabled={deleting || (!isDemo && confirmation !== "delete my account")}
							>
								{deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
								{isDemo ? "Sign out" : deleting ? "Deleting…" : "Delete account"}
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
