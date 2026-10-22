import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectForm } from "@/components/auth/connect-form";
import { buttonStyles } from "@/components/ui/button";
import { connectionKindLabel, getConnection } from "@/lib/auth/connections";
import { sanitizeReturnTo, oauthConfigured } from "@/lib/auth/oauth";
import { getSession } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";
import { OPERATOR_CONTACT } from "@/lib/legal";

export const metadata = { title: "Connect GitHub" };
export const dynamic = "force-dynamic";

export default async function ConnectPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string; error?: string; manage?: string }>;
}) {
	const params = await searchParams;
	const manage = params.manage === "1";
	const session = await getSession();

	if (session?.user.status === "suspended") {
		return (
			<div className="w-full max-w-[520px] rounded-panel border border-rose/25 bg-panel/90 p-6 text-center shadow-floating backdrop-blur-xl">
				<span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-rose/25 bg-rose-soft text-rose">
					<ShieldAlert size={17} />
				</span>
				<h1 className="mt-4 text-[20px] font-medium tracking-[-0.03em] text-ink">
					This account is suspended.
				</h1>
				<p className="mt-2 text-[11.5px] leading-5 text-muted">
					The exchange has restricted this account. Stars already recorded remain in the ledger, but
					you cannot give, receive, or reconnect GitHub while the suspension is active.
				</p>
				<p className="mt-3 text-[11px] leading-5 text-secondary">
					Appeals and questions: <span className="text-ink">{OPERATOR_CONTACT}</span>
				</p>
				<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
					<Link href="/legal" className={buttonStyles("outline", "sm")}>
						Read the rules
					</Link>
					<Link href="/" className={buttonStyles("ghost", "sm")}>
						Back home
					</Link>
				</div>
			</div>
		);
	}

	if (session && !manage) {
		redirect(session.user.policyAcceptedAt ? "/dashboard" : "/welcome");
	}

	const connection = session ? await getConnection(session.user.id) : null;
	const next = sanitizeReturnTo(params.next ?? (manage ? "/settings" : "/dashboard"));

	return (
		<div className="flex w-full flex-col items-center gap-5">
			<ConnectForm
				oauthEnabled={oauthConfigured()}
				demoEnabled={process.env.DEMO_MODE === "true"}
				next={next}
				manage={manage && Boolean(session)}
				currentLogin={session?.user.login ?? null}
				currentKind={connection ? connectionKindLabel(connection.kind) : null}
				initialError={params.error ?? null}
			/>
			<p className="max-w-[560px] text-center text-[10px] leading-4 text-muted/70">
				{APP_NAME} is an independent project. GitHub is a trademark of GitHub, Inc. We are not
				affiliated with or endorsed by GitHub. Reciprocal starring may conflict with GitHub&apos;s
				policies — read the{" "}
				<a
					href="/legal#github-policy"
					className="text-secondary underline decoration-line-strong underline-offset-2 hover:decoration-star"
				>
					risk disclosure
				</a>{" "}
				before running it.
			</p>
		</div>
	);
}
