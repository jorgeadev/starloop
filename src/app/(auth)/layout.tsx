import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-dvh flex-col overflow-hidden">
			<div className="surface-grid pointer-events-none absolute inset-0 opacity-60" />
			<div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-star/5 blur-[120px]" />
			<header className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8">
				<Logo />
				<Link
					href="/"
					className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-ink"
				>
					<ArrowLeft size={13} /> Back to home
				</Link>
			</header>
			<main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-2 pb-12 sm:px-6">
				{children}
			</main>
			<footer className="relative z-10 border-t border-line-subtle px-5 py-4 sm:px-8">
				<div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 text-[10px] text-muted/70">
					<p>Starloop · Human-powered star exchange · Not affiliated with GitHub, Inc.</p>
					<div className="flex items-center gap-4">
						<Link href="/terms" className="hover:text-secondary">
							Terms
						</Link>
						<Link href="/privacy" className="hover:text-secondary">
							Privacy
						</Link>
						<Link href="/acceptable-use" className="hover:text-secondary">
							Acceptable use
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
