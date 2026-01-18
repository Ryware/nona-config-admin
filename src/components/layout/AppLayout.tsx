import { type ParentComponent } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";

export const AppLayout: ParentComponent = (props) => {
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 justify-between items-center">
            <div class="flex items-center gap-8">
              <A href="/dashboard" class="flex items-center">
                <h1 class="text-xl font-bold text-gray-900">Nona Config</h1>
              </A>
              <nav class="hidden md:flex space-x-1">
                <A
                  href="/dashboard"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </A>
                <A
                  href="/projects"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/projects')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Projects
                </A>
                <A
                  href="/config-entries"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/config-entries')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Config Entries
                </A>
                <A
                  href="/environments"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/environments')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Environments
                </A>
                <A
                  href="/users"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/users')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Users
                </A>
              </nav>
            </div>
            <div>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {props.children}
      </main>
    </div>
  );
};
