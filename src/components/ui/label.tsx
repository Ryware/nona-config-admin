import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: LabelProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <label
      class={cn(
        "block text-xs font-bold uppercase tracking-widest text-outline mb-2 transition-colors",
        local.class 
      )}
      {...others}
    />
  );
}
