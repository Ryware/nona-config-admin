import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        // base
        "flex h-11 w-full rounded-xl px-3.5 text-[13.5px] font-normal text-white",
        // background & border
        "bg-[#0D1117] border border-white/10",
        // placeholder
        "placeholder:text-[#3D4E68]",
        // transition
        "transition-all duration-200",
        // focus: left accent bar + border glow
        "focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20",
        // hover
        "hover:border-white/20",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-40",
        local.class
      )}
      {...others}
    />
  );
}
