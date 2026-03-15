import { onMount, For, Show, type JSX } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { dashboardService } from "../../services/dashboard.service";
import { projectService } from "../../services/project.service";
import { IconFolder, IconUsers, IconSliders } from "../../components/ui/icons";

// ── Sub-components ─────────────────────────────────────────────────────────
function StatCard(props: {
  label: string;
  value: string | number;
  icon: JSX.Element;
  iconBg: string;
  trend?: string;
}) {
  return (
    <div class="rounded-xl p-5 flex flex-col gap-5 bg-[#111827] border border-white/[0.07]">
      <div class="flex items-start justify-between">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
          style={`background: ${props.iconBg}`}>
          {props.icon}
        </div>
        <Show when={props.trend}>
          <span class="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            {props.trend}
          </span>
        </Show>
      </div>
      <div>
        <div class="text-3xl font-bold text-white tracking-tight">{props.value}</div>
        <div class="text-[13px] text-[#64748B] mt-1">{props.label}</div>
      </div>
    </div>
  );
}

const PROJECT_COLORS = [
  { bg: "rgba(99,102,241,0.18)", text: "#818CF8" },
  { bg: "rgba(16,185,129,0.18)", text: "#34D399" },
  { bg: "rgba(245,158,11,0.18)", text: "#FCD34D" },
  { bg: "rgba(239,68,68,0.18)", text: "#F87171" },
  { bg: "rgba(139,92,246,0.18)", text: "#A78BFA" },
  { bg: "rgba(59,130,246,0.18)", text: "#60A5FA" },
] as const;

function ProjectCard(props: {
  name: string;
  description?: string;
  createdAt: string;
  colorIndex: number;
}) {
  const c = PROJECT_COLORS[props.colorIndex % PROJECT_COLORS.length];
  const initials = props.name.slice(0, 2).toUpperCase();
  return (
    <div class="rounded-xl p-4 bg-[#111827] border border-white/[0.07] flex flex-col gap-3
                hover:bg-white/3 transition-colors">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={`background: ${c.bg}; color: ${c.text}`}>
          {initials}
        </div>
        <div class="min-w-0">
          <h3 class="font-semibold text-white text-[14px] truncate">{props.name}</h3>
          <p class="text-[12px] text-[#64748B] truncate">{props.description || "No description"}</p>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-[#475569]">
          {new Date(props.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <A href="/projects" class="text-[12px] font-medium text-[#818CF8] hover:text-[#A5B4FC]
                                   px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors">
          View →
        </A>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { setPageTitle } = usePageTitle();

  onMount(() => setPageTitle("Dashboard"));

  const dashboardQuery = useQuery(() => ({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.counts(),
  }));

  const projectQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <AppLayout>
      <div class="space-y-7 max-w-7xl animate-fade-in">

        {/* Page heading */}
        <div>
          <h2 class="text-xl font-semibold text-white">Overview</h2>
          <p class="text-[13px] text-[#64748B] mt-1">{today}</p>
        </div>

        {/* ── Stat cards ── */}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Projects"
            value={dashboardQuery.isLoading ? "—" : (dashboardQuery.data?.projects ?? 0)}
            icon={<IconFolder />}
            iconBg="rgba(99,102,241,0.15)"
          />
          <StatCard
            label="Total Users"
            value={dashboardQuery.isLoading ? "—" : (dashboardQuery.data?.users ?? 0)}
            icon={<IconUsers />}
            iconBg="rgba(16,185,129,0.15)"
          />
          <StatCard
            label="Config Entries"
            value={dashboardQuery.isLoading ? "—" : (dashboardQuery.data?.configEntries ?? 0)}
            icon={<IconSliders />}
            iconBg="rgba(245,158,11,0.15)"
          />
        </div>

        {/* ── Recent projects ── */}
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-white">Recent Projects</h3>
            <A href="/projects" class="text-[13px] font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors">
              View all →
            </A>
          </div>

          <Show
            when={!dashboardQuery.isLoading}
            fallback={
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={[1, 2, 3]}>
                  {() => <div class="h-24 rounded-xl bg-[#111827] border border-white/[0.07] animate-pulse" />}
                </For>
              </div>
            }
          >
            <Show
              when={projectQuery.data && projectQuery.data.length > 0}
              fallback={
                <div class="rounded-xl p-10 text-center bg-[#111827] border border-dashed border-white/10">
                  <div class="flex justify-center mb-3 text-[#3B4A6B]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p class="font-semibold text-white mb-1">No projects yet</p>
                  <p class="text-[13px] text-[#64748B] mb-5">Create your first project to get started</p>
                  <A href="/projects"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium
                            text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-colors">
                    Create Project
                  </A>
                </div>
              }
            >
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={projectQuery.data?.slice(0, 6)}>
                  {(project, i) => (
                    <ProjectCard
                      name={project.name}
                      description={project.description}
                      createdAt={project.createdAt}
                      colorIndex={i()}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </AppLayout>
  );
}
