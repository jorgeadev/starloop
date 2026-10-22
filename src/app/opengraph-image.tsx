import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: "#17181a",
				backgroundImage:
					"radial-gradient(circle at 78% 8%, rgba(241,207,92,0.16), transparent 48%), radial-gradient(circle at 10% 92%, rgba(110,180,160,0.10), transparent 45%)",
				padding: "72px 76px",
				color: "#f4f4f2",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
				<div
					style={{
						width: 56,
						height: 56,
						borderRadius: 16,
						border: "1px solid #343538",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
						<path
							d="M27.2 16a11.2 11.2 0 1 1-4.9-9.2"
							stroke="#f1cf5c"
							strokeWidth="1.9"
							strokeLinecap="round"
						/>
						<path
							d="M23.1 4.2l1.15 2.35 2.6.34-1.9 1.8.5 2.57-2.35-1.25-2.3 1.25.5-2.57-1.92-1.8 2.6-.34z"
							fill="#f1cf5c"
						/>
						<circle cx="16" cy="16" r="2.1" fill="#f4f4f2" />
					</svg>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>starloop</span>
					<span
						style={{
							fontSize: 11,
							letterSpacing: "0.18em",
							textTransform: "uppercase",
							color: "#8d8e92",
							marginTop: 2,
						}}
					>
						Human-powered star exchange
					</span>
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
				<div
					style={{
						display: "flex",
						fontSize: 70,
						fontWeight: 500,
						lineHeight: 1.02,
						letterSpacing: "-0.045em",
					}}
				>
					Stars should follow
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 70,
						fontWeight: 500,
						lineHeight: 1.02,
						letterSpacing: "-0.045em",
						color: "#f1cf5c",
					}}
				>
					the work.
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 22,
						lineHeight: 1.5,
						color: "#a7a8ac",
						marginTop: 24,
						maxWidth: 720,
					}}
				>
					Give a real star. Earn one credit. Bring deliberate attention to your own public project.
					No bots, no paid stars, no growth hacks.
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: "1px solid #2c2d30",
					paddingTop: 26,
					fontSize: 15,
					color: "#8d8e92",
				}}
			>
				<span>1 verified star = 1 credit · One repository per member</span>
				<span style={{ color: "#f1cf5c" }}>starloop</span>
			</div>
		</div>,
		size,
	);
}
