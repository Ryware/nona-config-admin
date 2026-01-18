import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-white/20 focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 hover:border-white/20",
        local.class
      )}
      {...others}
    />
  );
}
