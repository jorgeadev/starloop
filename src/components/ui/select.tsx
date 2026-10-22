"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
	value: string;
	label: string;
};

export function Select({
	id,
	value,
	onValueChange,
	options,
	placeholder = "Select an option",
	ariaLabel,
	disabled = false,
	className,
}: {
	id?: string;
	value: string;
	onValueChange: (value: string) => void;
	options: readonly SelectOption[];
	placeholder?: string;
	ariaLabel?: string;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectPrimitive.Trigger
				id={id}
				aria-label={ariaLabel}
				className={cn(
					"group flex h-9 w-full items-center justify-between gap-2 rounded-control border border-line bg-canvas/50 px-2.5 text-left text-[12px] text-ink transition-colors",
					"hover:border-line-strong hover:bg-panel/60 focus:border-line-strong focus:outline-none",
					"disabled:cursor-not-allowed disabled:opacity-45 data-[placeholder]:text-muted/60",
					className,
				)}
			>
				<SelectPrimitive.Value placeholder={placeholder} />
				<SelectPrimitive.Icon asChild>
					<ChevronDown
						size={13}
						className="shrink-0 text-muted transition-transform duration-150 group-data-[state=open]:rotate-180"
					/>
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={6}
					className="z-[60] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-control border border-line bg-panel-raised shadow-floating"
				>
					<SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted">
						<ChevronDown size={11} className="rotate-180" />
					</SelectPrimitive.ScrollUpButton>
					<SelectPrimitive.Viewport className="p-1">
						{options.map((option) => (
							<SelectPrimitive.Item
								key={option.value}
								value={option.value}
								className={cn(
									"relative flex h-8 cursor-pointer items-center rounded-[6px] pr-8 pl-2.5 text-[11.5px] text-secondary outline-none select-none",
									"data-[highlighted]:bg-panel-muted data-[highlighted]:text-ink",
									"data-[state=checked]:text-ink",
								)}
							>
								<SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
								<SelectPrimitive.ItemIndicator className="absolute right-2.5 flex items-center justify-center text-star">
									<Check size={12} />
								</SelectPrimitive.ItemIndicator>
							</SelectPrimitive.Item>
						))}
					</SelectPrimitive.Viewport>
					<SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted">
						<ChevronDown size={11} />
					</SelectPrimitive.ScrollDownButton>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
