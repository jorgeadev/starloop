import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
	const updated = new Date("2026-10-22T00:00:00.000Z");

	return [
		{
			url: absoluteUrl("/"),
			lastModified: updated,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: absoluteUrl("/legal"),
			lastModified: updated,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: absoluteUrl("/terms"),
			lastModified: updated,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: absoluteUrl("/privacy"),
			lastModified: updated,
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: absoluteUrl("/acceptable-use"),
			lastModified: updated,
			changeFrequency: "yearly",
			priority: 0.5,
		},
	];
}
