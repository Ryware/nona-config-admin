import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select(props: SelectProps) {
  const [local, others] = splitProps(props, ["class", "children"]);
  return (
    <div class="relative w-full">
      <select
        class={cn(
          // base
          "w-full h-11 rounded-xl pl-3.5 pr-10 text-[13.5px] font-normal text-white appearance-none",
          // background & border
          "bg-[#0D1117] border border-white/10",
          // transition
          "transition-all duration-200",
          // focus
          "focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20",
          // hover
          "hover:border-white/20",
          // disabled
          "disabled:cursor-not-allowed disabled:opacity-40",
          // option bg
          "[&>option]:bg-[#0D1117] [&>option]:text-white",
          local.class
        )}
        {...others}
      >
        {local.children}
      </select>
      {/* Custom chevron */}
      <div class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3D4E68]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
