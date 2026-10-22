"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Unhandled application error", error);
	}, [error]);

	return (
		<div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
			<div className="surface-grid pointer-events-none absolute inset-0 opacity-50" />
			<div className="relative flex w-full max-w-[460px] flex-col items-center text-center">
				<Logo size={30} href="/" />
				<span className="mt-10 flex h-10 w-10 items-center justify-center rounded-full border border-rose/25 bg-rose-soft text-rose">
					<AlertTriangle size={17} />
				</span>
				<h1 className="mt-4 text-[26px] leading-tight font-medium tracking-[-0.04em] text-ink">
					Something broke on our side.
				</h1>
				<p className="mt-2 max-w-[42ch] text-[12px] leading-5 text-muted">
					The exchange hit an unexpected error. Nothing was changed unless the action had already
					completed. Try again, or return to the dashboard.
				</p>
				{error.digest ? (
					<p className="mt-3 rounded border border-line-subtle bg-panel px-2 py-1 font-mono text-[9.5px] text-muted/70">
						Reference: {error.digest}
					</p>
				) : null}
				<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
					<button type="button" onClick={reset} className={buttonStyles("primary", "md")}>
						<RefreshCw size={13} /> Try again
					</button>
					<Link href="/dashboard" className={buttonStyles("outline", "md")}>
						Back to dashboard
					</Link>
				</div>
				<p className="mt-8 text-[9.5px] text-muted/60">
					If this keeps happening, include the reference in a report to the operator.
				</p>
			</div>
		</div>
	);
}
