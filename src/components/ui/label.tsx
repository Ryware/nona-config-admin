import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: LabelProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <label
      class={cn(
        "text-xs font-medium leading-none text-white/60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only",
        local.class
      )}
      {...others}
    />
  );
}
