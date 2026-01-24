import { type ParentComponent, For } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";
import { Logo } from "../ui/logo";
import { usePageTitle } from "../../contexts/PageTitleContext";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export const AppLayout: ParentComponent = (props) => {
  const location = useLocation();
  const { pageTitle } = usePageTitle();

  const handleLogout = () => {
    authService.logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  const navItems: NavItem[] = [
    { path: "/config-entries", label: "Parameters", icon: "⚙️" },
    { path: "/projects", label: "Projects", icon: "📁" },
    { path: "/users", label: "Users", icon: "👥" },
  ];

  return (
    <div class="flex min-h-screen bg-[#070A13]">
      {/* Sidebar */}
      <aside class="w-56 bg-[#0F1424] border-r border-white/10 flex flex-col">
        {/* Logo/Brand */}
        <div class="h-16 flex items-center px-6 border-b border-white/10">          <A href="/dashboard" class="flex items-center gap-2">
              <Logo class="h-8 w-8 mt-4"/>
            <span class="text-white font-semibold">Nona Config</span>
          </A>
        </div>

        {/* Navigation */}
        <nav class="flex-1 px-3 py-4">
          <div class="space-y-1">
            <For each={navItems}>
              {(item) => (
                <A
                  href={item.path}
                  class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  <span class="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </A>
              )}
            </For>
          </div>
        </nav>

        {/* User Section */}
        <div class="p-4 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            class="w-full justify-start text-text-secondary hover:text-text-primary"
          >
            <span class="mr-2">🚪</span>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div class="flex-1 flex flex-col">        {/* Top Bar */}
        <header class="h-16 bg-[#0F1424] border-b border-white/10 flex items-center px-6">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-4">
              <span class="text-text-secondary text-sm">{pageTitle()}</span>
          
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main class="flex-1 overflow-auto">
          {props.children}
        </main>
      </div>
    </div>
  );
};
