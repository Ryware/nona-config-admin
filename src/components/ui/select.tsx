import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select(props: SelectProps) {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class="relative w-full">
      <select
        class={cn(
          "w-full px-0 py-3 pr-8 text-[13px] font-mono text-on-surface appearance-none",
          "bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30",
          "transition-all duration-200",
          "focus:outline-none focus:border-b-primary focus:ring-0",
          "hover:border-b-outline",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "[&>option]:bg-[#1a1f2f] [&>option]:text-on-surface",
          local.class
        )}
        {...others}
      >
        {local.children}
      </select>
      <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-outline">
        <span class="material-symbols-outlined text-[16px]">expand_more</span>
      </div>
    </div>
  );
}

