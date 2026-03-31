import { useQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { dashboardService } from "../../services/dashboard.service";
import { projectService } from "../../services/project.service";

const PROJECT_ICONS = ["hub", "database", "language", "storage", "cloud", "api"];

export default function DashboardPage() {
  const { setPageTitle } = usePageTitle();
  setPageTitle("Dashboard");

  const countsQuery = useQuery(() => ({
    queryKey: ["dashboard-counts"],
    queryFn: () => dashboardService.counts(),
  }));

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const stats = [
    {
      label: "Total Projects",
      icon: "folder_open",
      value: () => countsQuery.data?.projects ?? "—",
      sub: "active modules",
    },
    {
      label: "Config Entries",
      icon: "tune",
      value: () => countsQuery.data?.configEntries ?? "—",
      sub: "parameters tracked",
    },
    {
      label: "Team Members",
      icon: "group",
      value: () => countsQuery.data?.users ?? "—",
      sub: "collaborators",
    },
  ];

  return (
    <AppLayout>
      <div class="space-y-10">

        {/* Page header */}
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <h2 class="text-4xl font-headline font-bold text-primary tracking-tight">Overview</h2>
            <p class="text-on-surface-variant max-w-xl leading-relaxed text-sm">
              Monitor your configuration system at a glance. Track projects, parameters, and team activity.
            </p>
          </div>
          <A
            href="/projects"
            class="flex items-center gap-2 px-6 py-3 rounded font-bold text-on-primary text-[13px] transition-all active:scale-[0.98] hover:opacity-90 w-fit"
            style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
          >
            <span class="material-symbols-outlined text-[18px]">folder_open</span>
            View Projects
          </A>
        </div>

        {/* Stats row */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <For each={stats}>
            {(stat) => (
              <div class="bg-[#161b2b] p-6 rounded relative overflow-hidden">
                <div class="absolute top-4 right-4 opacity-10">
                  <span class="material-symbols-outlined text-5xl text-primary">{stat.icon}</span>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-outline mb-3">{stat.label}</p>
                <p class="text-4xl font-headline font-bold text-primary mb-1">
                  {countsQuery.isLoading ? (
                    <span class="text-2xl text-outline">Loading…</span>
                  ) : (
                    stat.value()
                  )}
                </p>
                <p class="text-xs text-on-surface-variant">{stat.sub}</p>
              </div>
            )}
          </For>
        </div>

        {/* Recent Projects */}
        <div>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-headline font-bold text-on-surface tracking-tight">Recent Projects</h3>
            <A href="/projects" class="text-xs text-primary hover:text-primary-fixed transition-colors flex items-center gap-1">
              View all
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </A>
          </div>

          <Show
            when={(projectsQuery.data?.length ?? 0) > 0}
            fallback={
              <div class="bg-[#161b2b] rounded p-12 text-center">
                <span class="material-symbols-outlined text-5xl text-outline mb-4 block">folder_open</span>
                <p class="text-on-surface-variant text-sm mb-4">No projects yet</p>
                <A
                  href="/projects"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-on-primary text-[13px] hover:opacity-90 transition-all"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
                >
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  Create Project
                </A>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={(projectsQuery.data ?? []).slice(0, 6)}>
                {(project, i) => (
                  <A
                    href={`/projects/${project.urlSlug}`}
                    class="group bg-[#161b2b] p-6 rounded relative overflow-hidden transition-all hover:bg-[#1a1f2f] border-l-2"
                    style={i() === 0 ? "border-left-color: #a4c9ff;" : "border-left-color: rgba(96,165,250,0.4);"}
                  >
                    <div class="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <span class="material-symbols-outlined text-5xl text-primary">
                        {PROJECT_ICONS[i() % PROJECT_ICONS.length]}
                      </span>
                    </div>
                    <div class="relative z-10">
                      <h4 class="text-base font-headline font-bold text-on-surface mb-2 truncate">{project.name}</h4>
                      <p class="text-on-surface-variant text-xs leading-relaxed line-clamp-2 mb-4">
                        {project.description || "No description"}
                      </p>
                      <div class="flex items-center gap-2 text-outline">
                        <span class="material-symbols-outlined text-[14px]">schedule</span>
                        <span class="text-[11px]">{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Status footer bar */}
        <div class="flex items-center justify-between py-3 px-4 bg-[#080d1d] rounded text-[10px] uppercase tracking-widest text-outline font-mono border border-outline-variant/10">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse-dot"></span>
            System Ready
          </div>
          <span>Active Projects: {countsQuery.data?.projects ?? "—"}</span>
          <span>Last Sync: {new Date().toLocaleTimeString()} UTC</span>
        </div>
      </div>
    </AppLayout>
  );
}
