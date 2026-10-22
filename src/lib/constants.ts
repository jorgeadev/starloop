export const APP_NAME = "Starloop";
export const APP_TAGLINE = "Stars should follow the work.";
export const APP_DESCRIPTION =
	"An engineering case study in reciprocal credit accounting, GitHub OAuth, and deliberate product constraints. Not a hosted star exchange.";

export const POLICY_VERSION = process.env.POLICY_VERSION ?? "2026-10-22";
export const STARTER_CREDITS = 3;
export const DEFAULT_DAILY_STAR_LIMIT = Number(process.env.MAX_DAILY_STARS ?? 5);
export const MAX_DAILY_STAR_LIMIT = 20;
export const MAX_INBOUND_PER_REPO_PER_DAY = Number(process.env.MAX_INBOUND_PER_REPO_PER_DAY ?? 8);
export const SESSION_TTL_MS = 30 * 86_400_000;
export const OAUTH_STATE_TTL_MS = 10 * 60_000;

export const GITHUB_OAUTH_SCOPES =
	process.env.GITHUB_OAUTH_SCOPES?.trim() || "read:user user:email public_repo";

export const DAILY_LIMIT_OPTIONS = [3, 5, 10, 20] as const;

export const REPORT_REASONS = [
	{ value: "spam", label: "Spam or misleading repository" },
	{ value: "inactive", label: "Abandoned or non-functional project" },
	{ value: "policy", label: "Policy or terms violation" },
	{ value: "other", label: "Something else" },
] as const;

export const CREDIT_REASON_LABELS: Record<string, string> = {
	welcome_grant: "Welcome credits",
	founding_grant: "Founding member grant",
	star_given: "Star given",
	star_received: "Star received",
	star_reversed: "Star removed",
	star_refunded: "Star refunded",
	adjustment: "Adjustment",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
	welcome: "Workspace",
	repo_bound: "Repository",
	star_given: "Star given",
	star_received: "Star received",
	credit_earned: "Credits",
	credit_spent: "Credits",
	verification: "Verification",
	policy: "Policy",
	report: "Trust & safety",
};

export const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: "#3178c6",
	JavaScript: "#f1e05a",
	Python: "#3572A5",
	Rust: "#dea584",
	Go: "#00ADD8",
	Svelte: "#ff3e00",
	Elixir: "#6e4a7e",
	Swift: "#F05138",
	Java: "#b07219",
	"C++": "#f34b7d",
	Ruby: "#701516",
	PHP: "#4F5D95",
	CSS: "#563d7c",
	HTML: "#e34c26",
	Shell: "#89e051",
	Other: "#8b949e",
};

export const APP_ROUTES = {
	dashboard: "/dashboard",
	discover: "/discover",
	repositories: "/repositories",
	credits: "/credits",
	activity: "/activity",
	settings: "/settings",
	connect: "/connect",
	welcome: "/welcome",
} as const;
