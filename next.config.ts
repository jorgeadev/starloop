import type { NextConfig } from "next";

const securityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
];

const nextConfig: NextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	serverExternalPackages: ["postgres"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24,
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "cmdk"],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
