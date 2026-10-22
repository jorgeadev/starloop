import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${APP_NAME} — ${APP_TAGLINE}`,
		short_name: APP_NAME,
		description: APP_DESCRIPTION,
		start_url: "/dashboard",
		display: "standalone",
		background_color: "#17181a",
		theme_color: "#18191b",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "any",
			},
		],
	};
}
