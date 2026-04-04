import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        "flex w-full h-11 px-3.5 rounded-xl text-[13.5px] text-white",
        "bg-[#0D1117] border border-white/10",
        "placeholder:text-[#3D4E68]",
        "transition-all duration-200",
        "focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20",
        "hover:border-white/20",
        "disabled:cursor-not-allowed disabled:opacity-40",
        local.class
      )}
      {...others}
    />
  );
}

