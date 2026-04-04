import { For, Show } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { projectService } from "../../services/project.service";

function getUser() {
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) return { email: "admin@nona.dev", role: "admin" };
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const email =
            payload.email ||
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
            payload.sub || "admin@nona.dev";
        const role =
            payload.role ||
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            payload.Role || "admin";
        return { email, role };
    } catch {
        return { email: "admin@nona.dev", role: "admin" };
    }
}

interface NavItemDef { path: string; label: string; icon: string; }

const topNavItems: NavItemDef[] = [
    { path: "/users", label: "Team", icon: "group" },
    { path: "/audit-logs", label: "Audit Logs", icon: "history" },
];

export const Sidebar = () => {
    const location = useLocation();
    const user = getUser();
    const initials = user.email.slice(0, 2).toUpperCase();
    const projectsQuery = useQuery(() => ({
        queryKey: ["projects"],
        queryFn: () => projectService.getAll(),
        staleTime: 30_000,
    }));

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <aside class="h-screen w-64 fixed left-0 top-0 bg-[#080d1d] border-r border-[#161b2b] flex flex-col py-6 z-50">

            {/* Brand */}
            <div class="px-6 mb-10">
                <A href="/projects" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded shrink-0 flex items-center justify-center"
                        style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%); box-shadow: 0 0 12px rgba(164,201,255,0.2);">
                        <span class="material-symbols-outlined text-on-primary text-[18px]"
                            style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
                            settings_input_component
                        </span>
                    </div>
                    <div>
                        <h1 class="text-[17px] text-start font-bold text-primary leading-none font-headline tracking-tight">Nona Config</h1>
                        <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium mt-0.5">Admin Console</p>
                    </div>
                </A>
            </div>


            {/* Projects section */}
            <div class="px-4 space-y-0.5">
                <A
                    href="/projects"
                    class={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium font-headline tracking-tight transition-all ${isActive("/projects")
                        ? "text-primary bg-[#161b2b] border-l-2 border-primary"
                        : "text-slate-500 hover:bg-[#161b2b] hover:text-slate-300 border-l-2 border-transparent"
                        }`}
                >
                    <span class="material-symbols-outlined text-[20px] shrink-0">folder</span>
                    Projects
                </A>

                <Show when={!projectsQuery.isLoading} fallback={
                    <p class="px-3 py-2 text-[12px] text-slate-600">Loading…</p>
                }>
                    <Show when={(projectsQuery.data ?? []).length > 0} fallback={
                        <p class="px-3 py-2 text-[12px] text-slate-600">No projects yet</p>
                    }>
                        <nav class="space-y-0.5">
                            <For each={projectsQuery.data}>
                                {(project) => (
                                    <A
                                        href={`/projects/${project.urlSlug}`}
                                        class={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium font-headline tracking-tight transition-all truncate ${isActive(`/projects/${project.urlSlug}`)
                                            ? "text-primary bg-[#161b2b] border-l-2 border-primary"
                                            : "text-slate-500 hover:bg-[#161b2b] hover:text-slate-300 border-l-2 border-transparent"
                                            }`}
                                    >
                                        <span class="material-symbols-outlined text-[16px] shrink-0">chevron_right</span>
                                        <span class="truncate">{project.name}</span>
                                    </A>
                                )}
                            </For>
                        </nav>
                    </Show>
                </Show>
            </div>

            {/* Top nav items */}
            <nav class="px-4 space-y-0.5">
                <For each={topNavItems}>
                    {(item) => (
                        <A
                            href={item.path}
                            class={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium font-headline tracking-tight transition-all ${isActive(item.path)
                                ? "text-primary bg-[#161b2b] border-l-2 border-primary"
                                : "text-slate-500 hover:bg-[#161b2b] hover:text-slate-300 border-l-2 border-transparent"
                                }`}
                        >
                            <span class="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                            {item.label}
                        </A>
                    )}
                </For>
            </nav>



            {/* Bottom: user card */}
            <div class="px-4 mt-auto pt-4 border-t border-[#161b2b]">
                <div class="p-3 rounded bg-[#161b2b] flex items-center gap-3 border border-white/5">
                    <div class="w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[12px]"
                        style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%); color: #00315d;">
                        {initials}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-[12px] font-semibold text-on-surface truncate leading-tight">{user.email}</p>
                        <p class="text-[10px] text-slate-500 capitalize mt-0.5">{user.role}</p>
                    </div>
                    <button
                        onClick={() => authService.logout()}
                        title="Sign out"
                        class="shrink-0 text-slate-500 hover:text-error transition-colors bg-transparent border-0 cursor-pointer p-1"
                    >
                        <span class="material-symbols-outlined text-[18px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
