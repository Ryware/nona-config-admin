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
    <div class="w-full max-w-md overflow-hidden rounded shadow-2xl">
      <div class="flex flex-col justify-center p-8 lg:p-12 bg-[#0e1323]">
        <div class="w-full mx-auto">

          {/* Brand Header */}
          <div class="flex flex-col items-center gap-4 mb-10 text-center">
            <div
              class="w-12 h-12 rounded flex items-center justify-center"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span class="material-symbols-outlined text-on-primary font-bold"
                    style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">terminal</span>
            </div>
            <span class="font-headline font-bold text-3xl tracking-tighter text-primary">Nona Config</span>
          </div>

          {/* Title */}
          <header class="mb-8 text-center">
            <h2 class="font-headline text-2xl font-bold text-on-surface tracking-tight mb-2">{props.title}</h2>
            <Show when={props.description}>
              <p class="text-on-surface-variant text-sm">{props.description}</p>
            </Show>
          </header>

          {/* Error */}
          <Show when={props.error}>
            <div class="mb-6 p-3 text-sm text-error bg-error-container/20 border border-error/20 rounded flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">error</span>
              {props.error}
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

      {/* Status Footer */}
      <div class="px-8 py-4 bg-[#080d1d] border-t border-outline-variant/10">
        <div class="flex items-center justify-between text-[10px] uppercase tracking-widest text-outline font-mono">
          <span>Status: 200 OK</span>
          <span>System ID: NC-990-2</span>
        </div>
      </div>
    </div>
  );
};

