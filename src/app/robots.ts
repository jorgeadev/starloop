import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/legal", "/terms", "/privacy", "/acceptable-use"],
				disallow: [
					"/api/",
					"/dashboard",
					"/discover",
					"/repositories",
					"/credits",
					"/activity",
					"/settings",
					"/welcome",
					"/connect",
				],
			},
		],
		sitemap: absoluteUrl("/sitemap.xml"),
		host: new URL(absoluteUrl("/")).host,
	};
}
