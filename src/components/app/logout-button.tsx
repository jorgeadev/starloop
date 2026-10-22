"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/client-api";

export function LogoutButton({ className }: { className?: string }) {
	const router = useRouter();

	async function logout() {
		try {
			await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
			router.push("/");
			router.refresh();
		} catch {
			toast.error("Could not sign out. Try again.");
		}
	}

	return (
		<button
			type="button"
			onClick={logout}
			className={
				className ??
				"group flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-[12.5px] text-rose/85 transition-colors hover:bg-rose-soft/60 hover:text-rose"
			}
		>
			<LogOut size={14} className="text-rose/70 transition-colors group-hover:text-rose" />
			Sign out
		</button>
	);
}

export function UserChip({
	name,
	login,
	avatarUrl,
	size = 28,
}: {
	name: string | null;
	login: string;
	avatarUrl: string | null;
	size?: number;
}) {
	return (
		<span className="flex items-center gap-2">
			<Avatar src={avatarUrl} name={name} login={login} size={size} ring />
			<span className="hidden min-w-0 sm:block">
				<span className="block truncate text-[12px] leading-4 font-medium text-ink">
					{name ?? login}
				</span>
				<span className="block truncate text-[10.5px] leading-4 text-muted">@{login}</span>
			</span>
		</span>
	);
}
