import { splitProps, type ValidComponent } from "solid-js";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded cursor-pointer text-[13px] font-bold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:     "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_4px_20px_rgba(164,201,255,0.15)] hover:opacity-90",
        success:     "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/20 hover:opacity-90",
        destructive: "bg-error text-on-error hover:opacity-90 shadow-lg",
        outline:     "border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        secondary:   "bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface",
        ghost:       "text-outline hover:bg-surface-container-low hover:text-on-surface",
        link:        "text-primary underline-offset-4 hover:underline p-0 h-auto",
        google:      "bg-white text-gray-900 hover:bg-gray-100 shadow-md",
      },
      size: {
        default: "h-11 px-6",
        sm:      "h-8 px-3 text-[11px] rounded",
        lg:      "h-12 px-8 text-[14px]",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  VariantProps<typeof buttonVariants>
>;

export function Button<T extends ValidComponent = "button">(
  props: ButtonProps<T>
) {
  const [local, others] = splitProps(props as ButtonProps, ["variant", "size", "class"]);
  return (
    <button
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  );
}
