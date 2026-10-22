import { AppShell } from "@/components/app/app-shell";
import { getConnection, connectionKindLabel } from "@/lib/auth/connections";
import { requireUser } from "@/lib/auth/session";
import { buildAttentionItems } from "@/lib/attention";
import { getActiveRepository, getDashboardStats } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
	const user = await requireUser();
	const [connection, activeRepository, stats] = await Promise.all([
		getConnection(user.id),
		getActiveRepository(user.id),
		getDashboardStats(user.id),
	]);

	const attention = buildAttentionItems({
		user,
		connection,
		activeRepository,
		verificationDue: stats.verificationDue,
	});

	const connectionInfo = user.isDemo
		? { label: "Demo workspace", needsReauth: false }
		: connection
			? {
					label: connectionKindLabel(connection.kind),
					needsReauth: connection.needsReauth,
				}
			: null;

	return (
		<AppShell
			user={{
				id: user.id,
				login: user.login,
				name: user.name,
				avatarUrl: user.avatarUrl,
				credits: user.credits,
				isDemo: user.isDemo,
			}}
			connection={connectionInfo}
			attentionCount={attention.length}
		>
			{children}
		</AppShell>
	);
}
