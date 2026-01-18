import { type JSX, type ParentComponent } from "solid-js";
import { cn } from "../../lib/utils";

export const Card: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div
      class={cn("rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl text-[#E5E7EB] shadow-2xl", props.class)}
      {...props}
    />
  );
};

export const CardHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("flex flex-col items-center space-y-3 p-8 pb-6", props.class)} {...props} />;
};

export const CardTitle: ParentComponent<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  return (
    <h3
      class={cn("font-semibold leading-none tracking-tight text-2xl text-white", props.class)}
      {...props}
    />
  );
};

export const CardDescription: ParentComponent<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  return <p class={cn("text-sm text-[#93A4BF]", props.class)} {...props} />;
};

export const CardContent: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("px-8 pb-6", props.class)} {...props} />;
};

export const CardFooter: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("flex items-center px-8 pb-8", props.class)} {...props} />;
};
