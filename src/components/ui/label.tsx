import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/utils";

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label(props: LabelProps) {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <label
      class={cn(
        "block align-text-start text-[12px] font-medium text-[#94A3B8] mb-1.5 tracking-wide",
        local.class 
      )}
      {...others}
    />
  );
}
