import { type ParentComponent, For, type JSX, createSignal, Show, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { authService } from "../../services/auth.service";
import { usePageTitle } from "../../contexts/PageTitleContext";
import {
  IconGrid, IconFolder, IconUsers, IconSliders,
  IconLogout, IconSearch, IconBell,
  IconUserCircle, IconSettings, IconHelpCircle, IconChevronRight,
} from "../ui/icons";

// Decode JWT payload to extract user info (email, role)
function getUser() {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return { email: "user@nona.dev", role: "admin" };
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const email =
      payload.email ||
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      payload.sub ||
      "user@nona.dev";
    const role =
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.Role ||
      "admin";
    return { email, role };
  } catch {
    return { email: "user@nona.dev", role: "admin" };
  }
}

// ── Account Menu Dropdown ──────────────────────────────────────────────────
function AccountMenu(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let wrapperRef: HTMLDivElement | undefined;

  const user = getUser();
  const initials = user.email.slice(0, 2).toUpperCase();

  const handleOutsideClick = (e: MouseEvent) => {
    if (wrapperRef && !wrapperRef.contains(e.target as Node)) {
      setOpen(false);
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  };

  const toggle = () => {
    setOpen((v) => {
      if (!v) {
        setTimeout(() => document.addEventListener("mousedown", handleOutsideClick), 0);
      } else {
        document.removeEventListener("mousedown", handleOutsideClick);
      }
      return !v;
    });
  };

  onCleanup(() => document.removeEventListener("mousedown", handleOutsideClick));

  const menuItems = [
    { icon: IconUserCircle, label: "Profile Settings" },
    { icon: IconSettings,   label: "Preferences"      },
    { icon: IconHelpCircle, label: "Help & Support"   },
  ];

  return (
    <div class="relative" ref={wrapperRef}>
      {/* Trigger – avatar button */}
      <button
        onClick={toggle}
        class="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-[13px]
               text-white border-0 cursor-pointer select-none transition-opacity hover:opacity-90"
        style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);"
      >
        {initials}
      </button>

      {/* Dropdown card */}
      <Show when={open()}>
        <div
          class="absolute right-0 top-[calc(100%+10px)] w-65 rounded-2xl z-50 overflow-hidden animate-fade-in"
          style="background: #0E1225; border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 24px 64px rgba(0,0,0,0.6);"
        >
          {/* Profile header */}
          <div class="px-5 pt-5 pb-4 flex flex-col items-center text-center border-b border-white/[0.07]">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white mb-3"
              style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);"
            >
              {initials}
            </div>
            <p class="text-[14px] font-semibold text-white leading-tight">{user.email}</p>
            <span
              class="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
              style="background: rgba(99,102,241,0.18); color: #818CF8;"
            >
              {user.role}
            </span>
          </div>

          {/* Menu items */}
          <div class="p-2">
            <For each={menuItems}>
              {(item) => (
                <button
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px]
                         text-[#94A3B8] hover:bg-white/5 hover:text-white transition-colors
                         text-left border-0 cursor-pointer bg-transparent group"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-[#4B5E82] group-hover:text-[#818CF8] transition-colors">
                      {item.icon()}
                    </span>
                    {item.label}
                  </div>
                  <span class="text-[#2D3A52] group-hover:text-[#4B5E82] transition-colors">
                    <IconChevronRight />
                  </span>
                </button>
              )}
            </For>
          </div>

          {/* Sign out */}
          <div class="px-2 pb-2">
            <div class="border-t border-white/[0.07] my-1" />
            <button
              onClick={() => authService.logout()}
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                     text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors
                     text-left border-0 cursor-pointer bg-transparent"
            >
              <IconLogout />
              Sign Out
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}

interface NavItemDef { path: string; label: string; icon: () => JSX.Element; }
interface NavGroup    { group: string; items: NavItemDef[]; }

export const AppLayout: ParentComponent = (props) => {
  const location  = useLocation();
  const { pageTitle } = usePageTitle();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navGroups: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { path: "/dashboard",     label: "Dashboard",  icon: IconGrid    },
      ],
    },
    {
      group: "Management",
      items: [
        { path: "/projects",      label: "Projects",   icon: IconFolder  },
        { path: "/users",         label: "Users",      icon: IconUsers   },
        { path: "/config-entries",label: "Parameters", icon: IconSliders },
      ],
    },
  ];

  return (
    <div class="flex min-h-screen bg-[#0B0F1E]">

      {/* ── Sidebar ── */}
      <aside class="w-58 shrink-0 flex flex-col bg-[#0E1225] border-r border-white/6">

        {/* Brand */}
        <div class="h-16 flex items-center px-5 border-b border-white/6">
          <A href="/dashboard" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                 style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);">
              <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
                <path d="M16 46V18L34 46V18" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="36" cy="34" r="7" fill="rgba(255,255,255,0.85)"/>
              </svg>
            </div>
            <span class="font-semibold text-white text-[13px] tracking-wide">Nona Admin</span>
          </A>
        </div>

        {/* Navigation */}
        <nav class="flex-1 px-3 py-5 overflow-y-auto space-y-5">
          <For each={navGroups}>
            {(group) => (
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 text-[#3B4A6B]">
                  {group.group}
                </p>
                <div class="space-y-0.5">
                  <For each={group.items}>
                    {(item) => (
                      <A
                        href={item.path}
                        class={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                          isActive(item.path)
                            ? "bg-[#6366F1]/12 text-[#818CF8]"
                            : "text-[#4B5E82] hover:bg-white/5 hover:text-[#8B9DC3]"
                        }`}
                      >
                        <span class="shrink-0">{item.icon()}</span>
                        {item.label}
                      </A>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </nav>

        {/* Sidebar bottom – compact user card */}
        <div class="p-3 border-t border-white/6">
          {(() => {
            const user = getUser();
            const initials = user.email.slice(0, 2).toUpperCase();
            return (
              <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl
                          hover:bg-white/5 transition-colors cursor-default">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0"
                  style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);"
                >
                  {initials}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-medium text-[#8B9DC3] truncate leading-tight">{user.email}</p>
                  <p class="text-[10px] text-[#3B4A6B] capitalize mt-0.5">{user.role}</p>
                </div>
                <button
                  onClick={() => authService.logout()}
                  title="Sign out"
                  class="shrink-0 p-1 rounded-lg text-[#3B4A6B] hover:text-red-400
                         hover:bg-red-500/10 transition-colors border-0 cursor-pointer bg-transparent"
                >
                  <IconLogout />
                </button>
              </div>
            );
          })()}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div class="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header class="h-16 flex items-center justify-between px-6 shrink-0 bg-[#0E1225] border-b border-white/6">
          <h1 class="text-[15px] font-semibold text-white">{pageTitle()}</h1>

          <div class="flex items-center gap-2">
            {/* Search pill */}
            <button class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]
                           bg-white/4 text-[#4B5E82] border border-white/7 cursor-pointer
                           hover:bg-white/[0.07] transition-colors">
              <IconSearch />
              <span>Search…</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#6B7FA3]">⌘K</span>
            </button>

            {/* Bell */}
            <button class="h-9 w-9 flex items-center justify-center rounded-lg relative
                           bg-transparent border-0 cursor-pointer text-[#4B5E82]
                           hover:bg-white/5 hover:text-[#8B9DC3] transition-colors">
              <IconBell />
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6366F1]" />
            </button>

            {/* Account menu */}
            <AccountMenu />
          </div>
        </header>

        {/* Page content */}
        <main class="flex-1 overflow-auto p-6">
          {props.children}
        </main>
      </div>
    </div>
  );
};
