import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        "flex w-full h-11 pl-10 pr-3.5 rounded-xl text-[13px] text-on-surface",
        "bg-surface-container-lowest border border-outline-variant/20",
        "placeholder:text-outline/60",
        "transition-all duration-200",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "hover:border-outline-variant/30",
        "disabled:cursor-not-allowed disabled:opacity-40",
        local.class,
      )}
      {...others}
    />
  );
}
