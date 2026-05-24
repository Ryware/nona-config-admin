import { type Component, Show } from "solid-js";

interface AuthCardProps {
  title: string;
  description?: string;
  children: any;
  footer?: any;
  error?: string;
}

export const AuthCard: Component<AuthCardProps> = (props) => {
  return (
    <div class="w-full max-w-[420px] overflow-hidden rounded-2xl border border-outline-variant/15 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-surface-container-low animate-fade-in">
      <div class="flex flex-col justify-center p-8 md:p-10">
        <div class="w-full mx-auto">

          {/* Brand Header */}
          <div class="flex flex-col items-center gap-3 mb-8 text-center">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              <span class="material-symbols-outlined text-lg font-bold"
                    style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">terminal</span>
            </div>
            <span class="font-headline font-bold text-xl tracking-tight text-on-surface">Nona Config</span>
          </div>

          {/* Title */}
          <header class="mb-8 text-center">
            <h2 class="font-headline text-xl font-bold text-on-surface tracking-tight mb-2">{props.title}</h2>
            <Show when={props.description}>
              <p class="text-on-surface-variant text-xs leading-relaxed">{props.description}</p>
            </Show>
          </header>

          {/* Error */}
          <Show when={props.error}>
            <div class="mb-6 p-3 text-xs text-error bg-error-container/10 border border-error/25 rounded-lg flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span class="font-medium">{props.error}</span>
            </div>
          </Show>

          {/* Body */}
          {props.children}

          {/* Footer */}
          <Show when={props.footer}>
            <div class="mt-6">
              {props.footer}
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

