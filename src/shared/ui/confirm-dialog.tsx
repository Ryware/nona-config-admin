import type { JSXElement } from "solid-js";
import { Show, onCleanup, onMount } from "solid-js";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | JSXElement;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT = {
  danger: {
    icon: "warning",
    iconClass: "text-error",
    bannerClass: "bg-error-container/10 border-error/25",
    titleClass: "text-error",
    btnClass: "bg-error text-on-error hover:brightness-105 shadow-md",
  },
  warning: {
    icon: "warning",
    iconClass: "text-amber-400",
    bannerClass: "bg-amber-500/10 border-amber-500/25",
    titleClass: "text-amber-400",
    btnClass: "bg-amber-500 text-white hover:brightness-105 shadow-md",
  },
  info: {
    icon: "info",
    iconClass: "text-primary",
    bannerClass: "bg-primary/10 border-primary/25",
    titleClass: "text-primary",
    btnClass: "bg-primary text-on-primary hover:brightness-105 shadow-md",
  },
} as const;

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const v = () => VARIANT[props.variant ?? "danger"];

  const handleKey = (e: KeyboardEvent) => {
    if (!props.open) return;
    if (e.key === "Escape") props.onCancel();
    if (e.key === "Enter" && !props.isLoading) props.onConfirm();
  };

  onMount(() => document.addEventListener("keydown", handleKey));
  onCleanup(() => document.removeEventListener("keydown", handleKey));

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onCancel();
        }}
      >
        <div class="bg-surface-container-low rounded-2xl p-8 max-w-sm w-full mx-4 border border-outline-variant/15 shadow-2xl animate-palette-in">
          {/* Banner */}
          <div
            class={`flex items-center gap-3 border rounded-lg p-3 mb-6 ${v().bannerClass}`}
          >
            <span
              class={`material-symbols-outlined text-[20px] ${v().iconClass}`}
            >
              {v().icon}
            </span>
            <h3
              id="confirm-dialog-title"
              class={`text-[13px] font-semibold ${v().titleClass}`}
            >
              {props.title}
            </h3>
          </div>

          {/* Message */}
          <div class="text-on-surface-variant text-sm leading-relaxed mb-6">
            {props.message}
          </div>

          {/* Actions */}
          <div class="flex gap-3">
            <button
              onClick={props.onConfirm}
              disabled={props.isLoading}
              class={`flex-1 py-2.5 rounded-lg font-semibold text-[13px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-0 ${v().btnClass}`}
            >
              <Show when={props.isLoading}>
                <span class="material-symbols-outlined text-[14px] animate-spin">
                  progress_activity
                </span>
              </Show>
              {props.isLoading
                ? "Please wait…"
                : (props.confirmLabel ?? "Confirm")}
            </button>
            <button
              onClick={props.onCancel}
              disabled={props.isLoading}
              class="flex-1 py-2.5 rounded-lg font-semibold text-on-surface-variant text-[13px] bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer border-0 disabled:opacity-50"
            >
              {props.cancelLabel ?? "Cancel"}
            </button>
          </div>

          {/* Keyboard hint */}
          <p class="mt-4 text-center text-[10px] text-outline">
            Press{" "}
            <kbd class="bg-surface-container-high border border-outline-variant/20 rounded px-1 font-bold">
              Enter
            </kbd>{" "}
            to confirm &nbsp;·&nbsp;
            <kbd class="bg-surface-container-high border border-outline-variant/20 rounded px-1 font-bold">
              Esc
            </kbd>{" "}
            to cancel
          </p>
        </div>
      </div>
    </Show>
  );
};
