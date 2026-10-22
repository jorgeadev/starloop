import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const compact = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

const full = new Intl.NumberFormat("en-US");

export function formatCompact(value: number): string {
	return compact.format(value);
}

export function formatNumber(value: number): string {
	return full.format(value);
}

export function formatDate(value: number | Date, options?: Intl.DateTimeFormatOptions): string {
	const date = typeof value === "number" ? new Date(value) : value;
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		...options,
	}).format(date);
}

export function formatDateTime(value: number | Date): string {
	const date = typeof value === "number" ? new Date(value) : value;
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatRelativeTime(value: number | Date, now = Date.now()): string {
	const date = typeof value === "number" ? value : value.getTime();
	const diff = date - now;
	const absolute = Math.abs(diff);
	const minute = 60_000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30 * day;
	const year = 365 * day;

	if (absolute < minute) return "just now";
	if (absolute < hour) return relative.format(Math.round(diff / minute), "minute");
	if (absolute < day) return relative.format(Math.round(diff / hour), "hour");
	if (absolute < week) return relative.format(Math.round(diff / day), "day");
	if (absolute < month) return relative.format(Math.round(diff / week), "week");
	if (absolute < year) return relative.format(Math.round(diff / month), "month");
	return relative.format(Math.round(diff / year), "year");
}

export function initials(name: string | null | undefined, fallback = "SL"): string {
	if (!name) return fallback;
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return fallback;
	if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
	return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
}

const gradients = [
	["#8a7cff", "#4f7cff"],
	["#f59e8b", "#d96a6a"],
	["#6ed3a5", "#3c9b79"],
	["#e9c46a", "#c98a3c"],
	["#7dc4e8", "#4d84c4"],
	["#d8a5e8", "#9a63c4"],
	["#f2a8c4", "#cf6d93"],
	["#a7c957", "#6f9c3e"],
];

export function gradientFor(input: string): [string, string] {
	let hash = 0;
	for (let index = 0; index < input.length; index += 1) {
		hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
	}
	return gradients[hash % gradients.length]! as [string, string];
}

export function parseTopics(value: string | null): string[] {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value) as unknown;
		return Array.isArray(parsed)
			? parsed.filter((item): item is string => typeof item === "string")
			: [];
	} catch {
		return [];
	}
}

export function startOfUtcDay(date = new Date()): number {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function daysAgo(date: number, now = Date.now()): number {
	return Math.floor((now - date) / 86_400_000);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return count === 1 ? singular : plural;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function truncate(value: string, length: number): string {
	if (value.length <= length) return value;
	return `${value.slice(0, length - 1).trimEnd()}…`;
}

export function absoluteUrl(path = "/"): string {
	const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
	return new URL(path, base).toString();
}
