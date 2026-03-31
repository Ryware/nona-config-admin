import { createContext, useContext, type ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>();

export const ToastProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<{ toasts: Toast[] }>({ toasts: [] });

  const addToast = (message: string, type: ToastType = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setState("toasts", (toasts) => [...toasts, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id: string) => {
    setState("toasts", (toasts) => toasts.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {props.children}
      <ToastContainer toasts={state.toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-[#1a2f20] border border-[#10B981]/30 text-[#6ee7b7]",
  error:   "bg-[#2f1a1a] border border-error/30 text-error",
  warning: "bg-[#2f2a1a] border border-[#F59E0B]/30 text-[#fcd34d]",
  info:    "bg-surface-container-high border border-primary/20 text-primary",
};

const toastIcons: Record<ToastType, string> = {
  success: "check_circle",
  error:   "error",
  warning: "warning",
  info:    "info",
};

const ToastContainer: ParentComponent<{ toasts: Toast[]; removeToast: (id: string) => void }> = (props) => {
  return (
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {props.toasts.map((toast) => (
        <div
          class={`flex items-center gap-3 rounded px-4 py-3 shadow-xl max-w-sm ${toastStyles[toast.type]}`}
        >
          <span class="material-symbols-outlined text-[18px] shrink-0">{toastIcons[toast.type]}</span>
          <span class="text-[13px] flex-1">{toast.message}</span>
          <button
            onClick={() => props.removeToast(toast.id)}
            class="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
