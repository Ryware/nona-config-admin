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
    const toast: Toast = { id, message, type, duration };

    setState("toasts", (toasts) => [...toasts, toast]);

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
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const ToastContainer: ParentComponent<{ toasts: Toast[]; removeToast: (id: string) => void }> = (
  props
) => {
  return (
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {props.toasts.map((toast) => (
        <div
          class={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center justify-between gap-4 min-w-[300px] animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : toast.type === "warning"
              ? "bg-yellow-600"
              : "bg-blue-600"
          }`}
        >
          <span class="text-sm">{toast.message}</span>
          <button
            onClick={() => props.removeToast(toast.id)}
            class="text-white hover:text-gray-200 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
