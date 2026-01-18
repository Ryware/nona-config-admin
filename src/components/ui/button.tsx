import { splitProps, type ValidComponent } from "solid-js";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90 active:scale-[0.98]",
        success: "bg-[#34D399] text-black hover:bg-[#10B981] active:scale-[0.98]",
        destructive: "bg-[#EF4444] text-white hover:bg-red-600",
        outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
        secondary: "border border-white/10 bg-transparent text-white/80 hover:bg-white/5",
        ghost: "text-white/60 hover:bg-white/5 hover:text-white",
        link: "text-white/80 underline-offset-4 hover:underline hover:text-white",
        google: "bg-white text-gray-900 hover:bg-gray-100 active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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
