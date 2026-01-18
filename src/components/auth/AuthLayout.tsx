import { type ParentComponent } from "solid-js";

export const AuthLayout: ParentComponent = (props) => {
  return (
    <div class="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Starfield effect */}
      <div class="absolute inset-0 opacity-50">
        <div class="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '10%', left: '20%' }}></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '20%', left: '80%', 'animation-delay': '0.5s' }}></div>
        <div class="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '30%', left: '40%', 'animation-delay': '1s' }}></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '50%', left: '10%', 'animation-delay': '1.5s' }}></div>
        <div class="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '60%', left: '90%', 'animation-delay': '2s' }}></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '70%', left: '60%', 'animation-delay': '0.3s' }}></div>
        <div class="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '80%', left: '30%', 'animation-delay': '1.2s' }}></div>
        <div class="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '15%', left: '50%', 'animation-delay': '0.8s' }}></div>
        <div class="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '90%', left: '70%', 'animation-delay': '1.8s' }}></div>
      </div>
      
      <div class="w-full max-w-md relative z-10">
        {props.children}
      </div>
    </div>
  );
};
