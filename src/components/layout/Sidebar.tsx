import { A, useLocation } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { For, Show } from "solid-js";
import { authService } from "../../services/auth.service";
import { projectService } from "../../services/project.service";

function getUser(): { email: string; role: string } {
  try {
    const raw =
      localStorage.getItem("auth_session") ||
      sessionStorage.getItem("auth_session");
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.email) return { email: s.email, role: s.role ?? "admin" };
    }
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) return { email: "", role: "" };

    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      const email =
        payload.email ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] ||
        payload.sub ||
        "";
      const role =
        payload.role ||
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload.Role ||
        "admin";
      return { email, role };
    }
    return { email: "", role: "" };
  } catch {
    return { email: "", role: "" };
  }
}

interface NavItemDef {
  path: string;
  label: string;
  icon: string;
}

const topNavItems: NavItemDef[] = [
  { path: "/users", label: "Team", icon: "group" },
  { path: "/audit-logs", label: "Audit Logs", icon: "history" },
];

export const Sidebar = (props: {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const location = useLocation();
  const user = getUser();
  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "A";

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
    staleTime: 30_000,
  }));

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const w = () => (props.collapsed ? "w-16" : "w-64");

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <Show when={props.isOpen}>
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => props.onClose()}
        />
      </Show>

      <aside
        class={`h-screen ${w()} fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/15 flex flex-col py-5 z-50 sidebar-transition lg:translate-x-0 ${
          props.isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div class={`mb-6 ${props.collapsed ? "px-3" : "px-5"}`}>
          <A
            href="/projects"
            onClick={() => props.onClose()}
            class="flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary-container shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span
                class="material-symbols-outlined text-on-primary text-[18px]"
                style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
              >
                settings_input_component
              </span>
            </div>
            <Show when={!props.collapsed}>
              <div>
                <h1 class="text-[15px] font-bold text-on-surface leading-none font-headline tracking-tight">
                  Nona Config
                </h1>
                <p class="text-[9px] text-outline uppercase tracking-[0.2em] font-medium mt-0.5">
                  Admin Console
                </p>
              </div>
            </Show>
          </A>
        </div>

        {/* Projects section */}
        <div class={`space-y-0.5 ${props.collapsed ? "px-2" : "px-3"}`}>
          <Show when={!props.collapsed}>
            <div class="px-3 py-1 text-[10px] font-medium text-outline/60 tracking-[0.05em]">
              Navigation
            </div>
          </Show>
          <A
            href="/projects"
            onClick={() => props.onClose()}
            title={props.collapsed ? "Projects" : undefined}
            class={`flex items-center gap-3 rounded-lg text-[13px] transition-all ${
              props.collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
            } ${
              isActive("/projects")
                ? "text-primary-container bg-surface-container-high font-semibold"
                : "text-on-surface-variant font-medium hover:bg-surface-container-high/40 hover:text-on-surface"
            }`}
          >
            <span
              class="material-symbols-outlined text-[20px] shrink-0"
              style={isActive("/projects") ? "font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : ""}
            >
              folder
            </span>
            <Show when={!props.collapsed}>Projects</Show>
          </A>

          <Show when={!props.collapsed}>
            <Show
              when={!projectsQuery.isLoading}
              fallback={
                <p class="px-3 py-2 text-[12px] text-outline/50 animate-pulse">
                  Loading…
                </p>
              }
            >
              <Show when={(projectsQuery.data ?? []).length > 0}>
                <nav class="space-y-0.5 pl-3 border-l border-outline-variant/10 ml-5 mt-1">
                  <For each={projectsQuery.data}>
                    {(project) => (
                      <A
                        href={`/projects/${project.urlSlug}`}
                        onClick={() => props.onClose()}
                        class={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all truncate ${
                          isActive(`/projects/${project.urlSlug}`)
                            ? "text-primary-container font-semibold bg-surface-container-high/60"
                            : "text-outline hover:text-on-surface hover:bg-surface-container-high/20"
                        }`}
                      >
                        <span class="truncate">{project.name}</span>
                      </A>
                    )}
                  </For>
                </nav>
              </Show>
            </Show>
          </Show>
        </div>

        {/* Top nav items */}
        <nav class={`space-y-0.5 mt-4 ${props.collapsed ? "px-2" : "px-3"}`}>
          <Show when={!props.collapsed}>
            <div class="px-3 py-1 text-[10px] font-medium text-outline/60 tracking-[0.05em]">
              Management
            </div>
          </Show>
          <For each={topNavItems}>
            {(item) => (
              <A
                href={item.path}
                onClick={() => props.onClose()}
                title={props.collapsed ? item.label : undefined}
                class={`flex items-center gap-3 rounded-lg text-[13px] transition-all ${
                  props.collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2"
                } ${
                  isActive(item.path)
                    ? "text-primary-container bg-surface-container-high font-semibold"
                    : "text-on-surface-variant font-medium hover:bg-surface-container-high/40 hover:text-on-surface"
                }`}
              >
                <span
                  class="material-symbols-outlined text-[20px] shrink-0"
                  style={isActive(item.path) ? "font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : ""}
                >
                  {item.icon}
                </span>
                <Show when={!props.collapsed}>{item.label}</Show>
              </A>
            )}
          </For>
        </nav>

        {/* Bottom: collapse toggle + user card */}
        <div
          class={`mt-auto pt-4 border-t border-outline-variant/15 space-y-2 ${props.collapsed ? "px-2" : "px-3"}`}
        >
          {/* Logout button — visible when collapsed (no user card to hold it) */}
          <Show when={props.collapsed}>
            <button
              onClick={() => authService.logout()}
              title="Sign out"
              aria-label="Sign out"
              class="flex w-full items-center justify-center rounded-lg p-2.5 text-outline hover:text-error hover:bg-error/8 transition-all bg-transparent border-0 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </Show>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={props.onToggleCollapse}
            title={props.collapsed ? "Expand sidebar" : "Collapse sidebar"}
            class={`hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium text-outline hover:text-on-surface hover:bg-surface-container-high/40 transition-all bg-transparent border-0 cursor-pointer ${
              props.collapsed ? "justify-center" : ""
            }`}
          >
            <span
              class="material-symbols-outlined text-[18px] transition-transform duration-300"
              style={props.collapsed ? "transform: rotate(180deg)" : ""}
            >
              left_panel_close
            </span>
            <Show when={!props.collapsed}>
              <span>Collapse</span>
            </Show>
          </button>

          {/* User card */}
          <Show when={authService.isAuthenticated()}>
            <div
              class={`rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center gap-3 shadow-sm hover:border-outline-variant/35 transition-all ${
                props.collapsed ? "p-2 justify-center" : "p-3"
              }`}
            >
              <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-[12px] bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm">
                {initials}
              </div>
              <Show when={!props.collapsed}>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-bold text-on-surface truncate leading-tight">
                    {user.email || "Console User"}
                  </p>
                  <p class="text-[10px] text-outline tracking-[0.05em] mt-0.5">
                    {user.role || "admin"}
                  </p>
                </div>
                <button
                  onClick={() => authService.logout()}
                  title="Sign out"
                  aria-label="Sign out"
                  class="shrink-0 text-outline hover:text-error transition-colors bg-transparent border-0 cursor-pointer p-1"
                >
                  <span class="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                </button>
              </Show>
            </div>
          </Show>
        </div>
      </aside>
    </>
  );
};
