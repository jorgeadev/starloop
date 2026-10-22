import {
	Activity,
	Coins,
	Compass,
	FolderGit2,
	LayoutDashboard,
	Settings,
	ShieldCheck,
} from "lucide-react";

export const workspaceNav = [
	{ href: "/dashboard", label: "Overview", icon: LayoutDashboard },
	{ href: "/discover", label: "Discover", icon: Compass },
	{ href: "/repositories", label: "Repositories", icon: FolderGit2 },
	{ href: "/credits", label: "Credits", icon: Coins },
	{ href: "/activity", label: "Activity", icon: Activity },
] as const;

export const accountNav = [
	{ href: "/settings", label: "Settings", icon: Settings },
	{ href: "/legal", label: "Trust & safety", icon: ShieldCheck },
] as const;

export const pageTitles: Record<string, string> = {
	"/dashboard": "Overview",
	"/discover": "Discover",
	"/repositories": "Repositories",
	"/credits": "Credits",
	"/activity": "Activity",
	"/settings": "Settings",
	"/welcome": "Get started",
	"/connect": "Connect GitHub",
	"/legal": "Trust & safety",
	"/terms": "Terms",
	"/privacy": "Privacy",
	"/acceptable-use": "Acceptable use",
};
