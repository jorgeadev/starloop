import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(absoluteUrl("/")),
	title: {
		default: `${APP_NAME} — ${APP_TAGLINE}`,
		template: `%s · ${APP_NAME}`,
	},
	description: APP_DESCRIPTION,
	applicationName: APP_NAME,
	openGraph: {
		type: "website",
		url: absoluteUrl("/"),
		siteName: APP_NAME,
		title: `${APP_NAME} — ${APP_TAGLINE}`,
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: `${APP_NAME} — ${APP_TAGLINE}`,
		description: APP_DESCRIPTION,
	},
	icons: {
		icon: "/icon.svg",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#18191b",
	colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			data-theme="dark"
			className={`${GeistSans.variable} ${GeistMono.variable}`}
			suppressHydrationWarning
		>
			<body>
				{children}
				<Toaster
					theme="dark"
					position="top-center"
					offset={{ top: 72 }}
					mobileOffset={{ top: 64 }}
					closeButton
					gap={8}
					toastOptions={{
						closeButtonAriaLabel: "Close notification",
						style: {
							background: "var(--panel-raised)",
							border: "1px solid var(--line)",
							color: "var(--ink)",
							fontSize: "13px",
							borderRadius: "10px",
						},
					}}
				/>
			</body>
		</html>
	);
}
