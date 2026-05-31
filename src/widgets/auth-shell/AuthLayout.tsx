import { type ParentComponent } from "solid-js";

export const AuthLayout: ParentComponent = (props) => {
  return (
    <div class="relative min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden">
      {/* Ambient background glow orbs */}
      <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary-container/5 blur-[150px] pointer-events-none" />
      
      <div class="relative z-10 w-full flex flex-col items-center justify-center">
        {props.children}
      </div>
    </div>
  );
};

