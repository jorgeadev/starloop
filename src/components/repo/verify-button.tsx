"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type VerificationResponse = {
	checked: number;
	revoked: number;
	stillStarred: number;
	errors: number;
	demo?: boolean;
};

export function VerifyButton({
	variant = "outline",
	size = "sm",
	label = "Verify stars",
	className,
}: {
	variant?: ButtonVariant;
	size?: ButtonSize;
	label?: string;
	className?: string;
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function verify() {
		setLoading(true);
		try {
			const result = await apiRequest<VerificationResponse>("/api/exchange/verify", {
				method: "POST",
				body: "{}",
			});
			if (result.checked === 0) {
				toast.message("Nothing to verify yet", {
					description: "Give a star first. Verification checks the stars you gave.",
				});
			} else if (result.revoked > 0) {
				toast.warning(`${result.revoked} star${result.revoked === 1 ? "" : "s"} reversed`, {
					description: "GitHub no longer showed those stars, so the credits were returned.",
				});
			} else {
				toast.success(`${result.checked} star${result.checked === 1 ? "" : "s"} still present`, {
					description:
						result.errors > 0
							? `${result.errors} could not be checked. Try again later.`
							: result.demo
								? "Demo verification simulated."
								: "Your credits stay backed by real stars.",
				});
			}
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Verification could not run. Try again.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Button
			variant={variant}
			size={size}
			onClick={verify}
			disabled={loading}
			className={cn(className)}
		>
			{loading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
			{loading ? "Checking…" : label}
		</Button>
	);
}
