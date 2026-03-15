import { type JSX, type ParentComponent } from "solid-js";
import { cn } from "../../lib/utils";

export const Card: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div
      class={cn("rounded-xl border bg-[#111827] text-[#F1F5F9]", props.class)}
      style="border-color: rgba(255,255,255,0.07);"
      {...props}
    />
  );
};

export const CardHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("flex flex-col space-y-1.5 p-5", props.class)} {...props} />;
};

export const CardTitle: ParentComponent<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  return (
    <h3
      class={cn("font-semibold leading-none tracking-tight text-white text-base", props.class)}
      {...props}
    />
  );
};

export const CardDescription: ParentComponent<JSX.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  return <p class={cn("text-[13px] text-[#94A3B8]", props.class)} {...props} />;
};

export const CardContent: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("p-5 pt-0", props.class)} {...props} />;
};

export const CardFooter: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div class={cn("flex items-center p-5 pt-0", props.class)} {...props} />;
};
