import { type ParentComponent } from "solid-js";
import { Sidebar } from "./Sidebar";

export const AppLayout: ParentComponent = (props) => {
  return (
    <div class="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      {/* ── Main Area ── */}
      <div class="flex-1 flex flex-col min-w-0 ml-64">

        {/* Top bar */}
        <header class="sticky top-0 z-40 w-full bg-[#0e1323]/90 backdrop-blur-xl border-b border-white/5 flex justify-between items-center h-16 px-8 shrink-0">
          <div></div>

          <div class="flex items-center gap-6">

            {/* Bell */}
            <a class="hover:text-on-surface transition-colors flex items-center gap-1" href="https://www.nonaconfig.com/support" target="_blank">
              <span class="material-symbols-outlined text-[14px]">contact_support</span>
              Support
            </a>
            <a class="hover:text-on-surface transition-colors flex items-center gap-1" href="https://www.nonaconfig.com/docs" target="_blank">
              <span class="material-symbols-outlined text-[14px]">terminal</span>
              API Docs
            </a>
          </div>
        </header>

        {/* Page content */}
        <main class="flex-1 overflow-auto p-8">
          {props.children}
        </main>
      </div>
    </div>
  );
};
