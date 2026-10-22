"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export function SyncButton({
	demo = false,
	variant = "ghost",
	size = "sm",
	label = "Sync",
	className,
}: {
	demo?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
	label?: string;
	className?: string;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function sync() {
		setLoading(true);
		try {
			await apiRequest("/api/repositories/sync", { method: "POST", body: "{}" });
			toast.success("Repository data synced from GitHub.");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not sync the repository.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Button
			variant={variant}
			size={size}
			onClick={sync}
			disabled={loading || demo}
			className={className}
			title={demo ? "Sync is disabled in demo mode" : undefined}
		>
			{loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
			{loading ? "Syncing…" : label}
		</Button>
	);
}
