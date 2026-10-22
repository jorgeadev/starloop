"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { DAILY_LIMIT_OPTIONS } from "@/lib/constants";

export function ExchangeSettings({
	dailyStarLimit,
	pausePromotion,
	isDemo,
}: {
	dailyStarLimit: number;
	pausePromotion: boolean;
	isDemo: boolean;
}) {
	const router = useRouter();
	const [limit, setLimit] = useState(dailyStarLimit);
	const [paused, setPaused] = useState(pausePromotion);
	const [loading, setLoading] = useState(false);
	const dirty = limit !== dailyStarLimit || paused !== pausePromotion;

	const limitOptions: SelectOption[] = DAILY_LIMIT_OPTIONS.map((option) => ({
		value: String(option),
		label: `${option} stars per day`,
	}));
	if (!DAILY_LIMIT_OPTIONS.includes(limit as (typeof DAILY_LIMIT_OPTIONS)[number])) {
		limitOptions.push({ value: String(limit), label: `${limit} stars per day` });
	}

	async function save() {
		setLoading(true);
		try {
			await apiRequest("/api/settings", {
				method: "POST",
				body: JSON.stringify({
					dailyStarLimit: limit,
					pausePromotion: paused,
				}),
			});
			toast.success("Exchange preferences saved");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof ClientApiError ? error.message : "Could not save your preferences.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4">
			<div>
				<label htmlFor="daily-limit" className="text-[12px] font-medium text-ink">
					Daily star cap
				</label>
				<p className="mt-0.5 text-[10.5px] leading-4 text-muted">
					How many stars you are willing to give in one UTC day. Incoming stars are capped
					separately per project.
				</p>
				<Select
					id="daily-limit"
					value={String(limit)}
					onValueChange={(value) => setLimit(Number(value))}
					options={limitOptions}
					ariaLabel="Daily star cap"
					className="mt-2 max-w-[190px]"
				/>
			</div>

			<div className="flex items-start justify-between gap-4 border-t border-line-subtle pt-4">
				<div>
					<p className="text-[12px] font-medium text-ink">Pause promotion</p>
					<p className="mt-0.5 max-w-[56ch] text-[10.5px] leading-4 text-muted">
						Hide your active repository from the queue. Incoming stars already scheduled can still
						arrive and spend credits.
					</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={paused}
					aria-label="Pause promotion"
					onClick={() => setPaused((value) => !value)}
					className={
						paused
							? "relative h-5 w-9 shrink-0 rounded-pill border border-star/40 bg-star/80 transition-colors"
							: "relative h-5 w-9 shrink-0 rounded-pill border border-line-strong bg-panel-muted transition-colors"
					}
				>
					<span
						className={
							paused
								? "absolute top-[2px] left-[18px] h-3.5 w-3.5 rounded-full bg-[#241d08] transition-transform"
								: "absolute top-[2px] left-[2px] h-3.5 w-3.5 rounded-full bg-secondary transition-transform"
						}
					/>
				</button>
			</div>

			<div className="flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
				<p className="text-[10px] leading-4 text-muted/80">
					{isDemo
						? "Demo preferences apply to the seeded workspace only."
						: "Changes apply immediately. Caps are enforced by the server."}
				</p>
				<Button variant="primary" size="sm" onClick={save} disabled={!dirty || loading}>
					{loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
					{loading ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</div>
	);
}
