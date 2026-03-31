import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <input
      class={cn(
        "flex w-full px-0 py-3 text-[13px] font-mono text-on-surface",
        "bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30",
        "placeholder:text-outline/40",
        "transition-all duration-200",
        "focus:outline-none focus:border-b-primary focus:ring-0",
        "hover:border-b-outline",
        "disabled:cursor-not-allowed disabled:opacity-40",
        local.class
      )}
      {...others}
    />
  );
}

