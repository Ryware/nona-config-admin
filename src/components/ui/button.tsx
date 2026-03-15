import { splitProps, type ValidComponent } from "solid-js";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl cursor-pointer text-[13.5px] font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:     "bg-[#6366F1] text-white hover:bg-[#4F46E5] active:scale-[0.97] shadow-lg shadow-[#6366F1]/20",
        success:     "bg-[#10B981] text-white hover:bg-[#059669] active:scale-[0.97] shadow-lg shadow-[#10B981]/20",
        destructive: "bg-[#EF4444] text-white hover:bg-red-600 active:scale-[0.97]",
        outline:     "border border-white/12 bg-white/4 text-[#94A3B8] hover:bg-white/8 hover:text-white hover:border-white/20",
        secondary:   "border border-white/10 bg-transparent text-[#94A3B8] hover:bg-white/5 hover:text-white",
        ghost:       "text-[#64748B] hover:bg-white/5 hover:text-white",
        link:        "text-[#818CF8] underline-offset-4 hover:underline p-0 h-auto",
        google:      "bg-white text-gray-900 hover:bg-gray-100 active:scale-[0.97] shadow-md",
      },
      size: {
        default: "h-11 px-5",
        sm:      "h-8 px-3 text-[12px] rounded-lg",
        lg:      "h-12 px-7 text-[15px]",
        icon:    "h-9 w-9 rounded-lg",
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
