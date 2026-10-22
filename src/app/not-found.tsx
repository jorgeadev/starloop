import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";

export const metadata = {
	title: "Page not found",
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
			<div className="surface-grid pointer-events-none absolute inset-0 opacity-50" />
			<div className="pointer-events-none absolute -top-32 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-star/5 blur-[100px]" />
			<div className="relative flex w-full max-w-[440px] flex-col items-center text-center">
				<Logo size={30} href="/" />
				<p className="mt-10 font-mono text-[11px] tracking-[0.18em] text-star">404</p>
				<h1 className="mt-3 text-[28px] leading-tight font-medium tracking-[-0.04em] text-ink">
					This page is not in the loop.
				</h1>
				<p className="mt-2 max-w-[38ch] text-[12px] leading-5 text-muted">
					The link may be old, the repository may have left the queue, or the address was mistyped.
					The exchange is still running.
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
					<Link href="/" className={buttonStyles("primary", "md")}>
						<ArrowLeft size={13} /> Back home
					</Link>
					<Link href="/discover" className={buttonStyles("outline", "md")}>
						<Compass size={13} /> Open discover
					</Link>
				</div>
				<p className="mt-8 text-[9.5px] text-muted/60">
					Human-powered star exchange · Not affiliated with GitHub, Inc.
				</p>
			</div>
		</div>
	);
}
