"use client";

import {
	ArrowRight,
	Check,
	ChevronDown,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	Lock,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GithubIcon } from "@/components/github-icon";
import { Button } from "@/components/ui/button";
import { apiRequest, ClientApiError, postJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
	oauth_expired: "That sign-in link expired before GitHub returned. Please start again.",
	oauth_denied: "GitHub sign-in was cancelled. Nothing was connected.",
	access_denied: "GitHub sign-in was cancelled. Nothing was connected.",
	oauth_state: "The sign-in state did not match. Start the GitHub flow again.",
	oauth_exchange: "GitHub did not return an access token. Try a personal access token instead.",
	oauth_failed: "GitHub sign-in could not be completed. Try again or use a token.",
	oauth_unconfigured: "GitHub OAuth is not configured on this deployment. Use a token instead.",
	oauth_not_configured: "GitHub OAuth is not configured on this deployment. Use a token instead.",
	suspended: "This account is suspended. Contact the operator if you believe this is a mistake.",
	account: "That sign-in could not be matched to an account.",
	account_mismatch:
		"That GitHub account does not match the one you are signed in as. Sign out before switching accounts.",
};

export function ConnectForm({
	oauthEnabled,
	demoEnabled,
	next,
	manage,
	currentLogin,
	currentKind,
	initialError,
}: {
	oauthEnabled: boolean;
	demoEnabled: boolean;
	next: string;
	manage: boolean;
	currentLogin?: string | null;
	currentKind?: string | null;
	initialError?: string | null;
}) {
	const router = useRouter();
	const [method, setMethod] = useState<"oauth" | "token">(oauthEnabled ? "oauth" : "token");
	const [token, setToken] = useState("");
	const [showToken, setShowToken] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [loading, setLoading] = useState<"token" | "demo" | null>(null);
	const [error, setError] = useState<string | null>(
		initialError ? (errorMessages[initialError] ?? "Sign-in could not be completed.") : null,
	);

	const tokenKind = token.startsWith("github_pat_")
		? "Fine-grained token"
		: token.startsWith("ghp_")
			? "Classic token"
			: token.startsWith("gho_")
				? "OAuth token"
				: null;

	async function submitToken(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setLoading("token");
		try {
			const result = await postJson<{ redirect?: string; login?: string }>("/api/auth/token", {
				token: token.trim(),
			});
			toast.success(
				manage ? `Credential replaced for @${result.login ?? "your account"}` : "GitHub connected",
			);
			router.push(result.redirect ?? next);
			router.refresh();
		} catch (caught) {
			const message =
				caught instanceof ClientApiError
					? caught.message
					: "That token could not be validated. Please try again.";
			setError(message);
		} finally {
			setLoading(null);
		}
	}

	async function demoLogin() {
		setError(null);
		setLoading("demo");
		try {
			const result = await apiRequest<{ redirect?: string }>("/api/auth/demo", {
				method: "POST",
				body: "{}",
			});
			toast.success("Demo workspace ready", {
				description: "Stars are simulated. Nothing is sent to GitHub.",
			});
			router.push(result.redirect ?? "/dashboard");
			router.refresh();
		} catch (caught) {
			setError(caught instanceof ClientApiError ? caught.message : "Demo login is unavailable.");
		} finally {
			setLoading(null);
		}
	}

	return (
		<div className="w-full max-w-[880px] overflow-hidden rounded-panel border border-line bg-panel/90 shadow-floating backdrop-blur-xl lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
			<div className="relative hidden flex-col justify-between overflow-hidden border-r border-line-subtle bg-sidebar/70 p-7 lg:flex">
				<div className="surface-grid pointer-events-none absolute inset-0 opacity-50" />
				<div className="relative">
					<span className="inline-flex items-center gap-1.5 rounded-pill border border-star/25 bg-star-soft px-2.5 py-1 text-[10px] font-medium text-star">
						<Sparkles size={10} /> A reciprocal star exchange
					</span>
					<h2 className="mt-5 text-[24px] leading-[1.15] font-medium tracking-[-0.04em] text-ink">
						Star the work.
						<br />
						Earn the attention.
					</h2>
					<p className="mt-3 max-w-[34ch] text-[12px] leading-5 text-muted">
						Every credit comes from a real star you gave. Every star you receive is a deliberate act
						by another developer.
					</p>

					<ul className="mt-6 space-y-2.5">
						{[
							"Human-only. No bots or automation.",
							"One active public repository per member.",
							"Daily caps, verification, and a public audit trail.",
							"Credits have no cash value and cannot be bought.",
						].map((line) => (
							<li key={line} className="flex items-start gap-2 text-[11.5px] text-secondary">
								<Check size={12} className="mt-0.5 shrink-0 text-mint" />
								{line}
							</li>
						))}
					</ul>
				</div>

				<div className="relative mt-8 rounded-control border border-line-subtle bg-canvas/40 p-3.5">
					<div className="flex items-center justify-between">
						<p className="micro text-muted">The loop</p>
						<span className="text-[9px] text-muted/60">1 credit / star</span>
					</div>
					<div className="mt-3 flex items-center gap-2">
						<div className="flex flex-1 flex-col items-center rounded border border-star/20 bg-star-soft px-2 py-2 text-center">
							<span className="text-[10px] text-star">You give</span>
							<span className="numeric mt-0.5 text-[13px] text-ink">+1</span>
						</div>
						<ArrowRight size={12} className="shrink-0 text-muted" />
						<div className="flex flex-1 flex-col items-center rounded border border-mint/20 bg-mint-soft px-2 py-2 text-center">
							<span className="text-[10px] text-mint">They receive</span>
							<span className="numeric mt-0.5 text-[13px] text-ink">−1</span>
						</div>
						<ArrowRight size={12} className="shrink-0 text-muted" />
						<div className="flex flex-1 flex-col items-center rounded border border-line bg-panel-raised px-2 py-2 text-center">
							<span className="text-[10px] text-muted">You receive</span>
							<span className="numeric mt-0.5 text-[13px] text-ink">+1 star</span>
						</div>
					</div>
				</div>
			</div>

			<div className="p-5 sm:p-7">
				<div>
					<p className="micro text-star">{manage ? "Credential" : "Get started"}</p>
					<h1 className="mt-2 text-[21px] leading-tight font-medium tracking-[-0.035em] text-ink">
						{manage
							? `Replace access for @${currentLogin ?? "your account"}`
							: "Open the Starloop prototype"}
					</h1>
					<p className="mt-1.5 text-[11.5px] leading-5 text-muted">
						{manage
							? `You are currently using ${currentKind ?? "a GitHub credential"}. Replacing it signs you in with the same account and swaps the stored token.`
							: "GitHub is the only identity provider. We never see your password, and your credential is encrypted at rest."}
					</p>
				</div>

				{error ? (
					<div
						role="alert"
						className="mt-4 rounded-control border border-rose/30 bg-rose-soft/60 px-3 py-2.5 text-[11.5px] leading-5 text-rose"
					>
						{error}
					</div>
				) : null}

				<div className="mt-5 grid grid-cols-2 gap-1 rounded-control border border-line-subtle bg-canvas/40 p-1">
					<button
						type="button"
						onClick={() => setMethod("oauth")}
						className={cn(
							"flex items-center justify-center gap-1.5 rounded-[6px] px-2 py-1.5 text-[11.5px] transition-colors",
							method === "oauth"
								? "bg-panel-raised font-medium text-ink"
								: "text-muted hover:text-secondary",
						)}
					>
						<GithubIcon size={12} /> GitHub OAuth
					</button>
					<button
						type="button"
						onClick={() => setMethod("token")}
						className={cn(
							"flex items-center justify-center gap-1.5 rounded-[6px] px-2 py-1.5 text-[11.5px] transition-colors",
							method === "token"
								? "bg-panel-raised font-medium text-ink"
								: "text-muted hover:text-secondary",
						)}
					>
						<KeyRound size={12} /> Access token
					</button>
				</div>

				{method === "oauth" ? (
					<div className="mt-4">
						{oauthEnabled ? (
							<a
								href={`/api/auth/github?next=${encodeURIComponent(next)}`}
								className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-ink text-[13px] font-medium text-canvas transition-colors hover:bg-white"
							>
								<GithubIcon size={16} />
								Continue with GitHub
							</a>
						) : (
							<div className="rounded-control border border-star/25 bg-star-soft/50 p-3 text-[11.5px] leading-5 text-secondary">
								GitHub OAuth is not configured on this deployment. Use a classic or fine-grained
								personal access token below instead.
							</div>
						)}
						<p className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-muted/80">
							<ShieldCheck size={12} className="mt-0.5 shrink-0 text-mint" />
							OAuth requests the minimum public scopes. You can revoke the grant from GitHub at any
							time.
						</p>
					</div>
				) : (
					<form onSubmit={submitToken} className="mt-4 space-y-3">
						<div>
							<label htmlFor="token" className="text-[11px] font-medium text-ink">
								Personal access token
							</label>
							<div className="relative mt-1.5">
								<input
									id="token"
									name="token"
									type={showToken ? "text" : "password"}
									value={token}
									onChange={(event) => setToken(event.target.value)}
									placeholder={tokenKind ?? "ghp_… or github_pat_…"}
									autoComplete="off"
									spellCheck={false}
									className="h-10 w-full rounded-control border border-line bg-canvas/60 px-3 pr-10 font-mono text-[12px] text-ink placeholder:font-sans placeholder:text-muted/50 focus:border-line-strong focus:outline-none"
								/>
								<button
									type="button"
									onClick={() => setShowToken((value) => !value)}
									aria-label={showToken ? "Hide token" : "Show token"}
									className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
								>
									{showToken ? <EyeOff size={14} /> : <Eye size={14} />}
								</button>
							</div>
							<div className="mt-1.5 flex items-center justify-between gap-2">
								<p className="text-[10px] text-muted/70">
									{tokenKind ?? "Starts with ghp_, github_pat_, or gho_"}
								</p>
								<button
									type="button"
									onClick={() => setShowHelp((value) => !value)}
									className="inline-flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-secondary"
								>
									Which token? <ChevronDown size={10} />
								</button>
							</div>
						</div>

						{showHelp ? (
							<div className="animate-fade space-y-2.5 rounded-control border border-line-subtle bg-canvas/40 p-3">
								<div>
									<p className="text-[11px] font-medium text-secondary">
										Fine-grained token (recommended)
									</p>
									<ol className="mt-1 list-decimal space-y-1 pl-4 text-[10px] leading-4 text-muted">
										<li>GitHub → Settings → Developer settings → Personal access tokens.</li>
										<li>Repository access: public repositories (or select your project).</li>
										<li>
											Account permissions → <span className="text-secondary">Starring</span>: Read
											and write.
										</li>
										<li>
											Repository permissions → <span className="text-secondary">Metadata</span>:
											Read-only (needed to list your repositories).
										</li>
										<li>Set a short expiration. You can replace it here later.</li>
									</ol>
								</div>
								<div className="border-t border-line-subtle pt-2">
									<p className="text-[11px] font-medium text-secondary">Classic token</p>
									<p className="mt-1 text-[10px] leading-4 text-muted">
										Create one with the <code className="text-secondary">public_repo</code> scope.
										Add <code className="text-secondary">read:user</code> for profile data. Do not
										grant private repository access.
									</p>
								</div>
							</div>
						) : null}

						<Button
							type="submit"
							variant="star"
							size="lg"
							className="w-full"
							disabled={loading !== null || token.trim().length < 20}
						>
							{loading === "token" ? (
								<Loader2 size={15} className="animate-spin" />
							) : (
								<Lock size={14} />
							)}
							{loading === "token"
								? "Validating with GitHub…"
								: manage
									? "Replace credential"
									: "Connect and continue"}
						</Button>
					</form>
				)}

				{demoEnabled ? (
					<>
						<div className="my-4 flex items-center gap-3">
							<span className="h-px flex-1 bg-line-subtle" />
							<span className="text-[9.5px] tracking-[0.12em] text-muted/60 uppercase">
								or look around
							</span>
							<span className="h-px flex-1 bg-line-subtle" />
						</div>
						<Button
							variant="outline"
							size="lg"
							className="w-full"
							onClick={demoLogin}
							disabled={loading !== null}
						>
							{loading === "demo" ? (
								<Loader2 size={15} className="animate-spin" />
							) : (
								<Sparkles size={14} className="text-star" />
							)}
							{loading === "demo" ? "Opening demo…" : "Explore the demo workspace"}
						</Button>
						<p className="mt-2 text-center text-[9.5px] text-muted/60">
							Simulated stars, seeded data, no GitHub account needed.
						</p>
					</>
				) : null}

				<p className="mt-5 border-t border-line-subtle pt-3 text-[9.5px] leading-4 text-muted/70">
					By continuing you agree to the{" "}
					<Link href="/terms" className="text-secondary underline underline-offset-2">
						terms
					</Link>
					,{" "}
					<Link href="/privacy" className="text-secondary underline underline-offset-2">
						privacy policy
					</Link>{" "}
					and{" "}
					<Link href="/acceptable-use" className="text-secondary underline underline-offset-2">
						acceptable use rules
					</Link>
					, including the GitHub policy risk disclosure. Participation is voluntary.
				</p>
			</div>
		</div>
	);
}
