import { useLocation } from "@solidjs/router";
import { type ParentComponent, createEffect, createSignal, Show } from "solid-js";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import { CommandPalette } from "./CommandPalette";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const getInitialCollapsed = (): boolean => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
  } catch {}
  return false;
};

export const AppLayout: ParentComponent = (props) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const [collapsed, setCollapsed] = createSignal(getInitialCollapsed());
  const [showPalette, setShowPalette] = createSignal(false);

  const sidebarWidth = () => (collapsed() ? "lg:ml-16" : "lg:ml-64");

  const toggleCollapse = () => {
    const next = !collapsed();
    setCollapsed(next);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("sidebar_collapsed", String(next));
      }
    } catch {}
  };

  // Close mobile sidebar on navigation
  createEffect(() => {
    location.pathname;
    setIsSidebarOpen(false);
  });

  // Setup Keyboard Shortcuts
  useKeyboardShortcut("k", () => setShowPalette((v) => !v), { metaOrCtrl: true });
  useKeyboardShortcut("Escape", () => {
    if (showPalette()) {
      setShowPalette(false);
    }
  }, { metaOrCtrl: false });

  return (
    <div class="flex min-h-screen bg-background overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen()}
        onClose={() => setIsSidebarOpen(false)}
        collapsed={collapsed()}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Area */}
      <div
        class={`flex-1 flex flex-col min-w-0 ml-0 ${sidebarWidth()} transition-[margin-left] duration-300`}
      >
        <Header
          isSidebarOpen={isSidebarOpen()}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen())}
          onSearchClick={() => setShowPalette(true)}
        />

        {/* Page content */}
        <main class="flex-1 overflow-auto p-6 md:p-8">{props.children}</main>
      </div>

      {/* Command Palette */}
      <Show when={showPalette()}>
        <CommandPalette onClose={() => setShowPalette(false)} />
      </Show>
    </div>
  );
};
