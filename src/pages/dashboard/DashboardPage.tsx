import { Title } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { AppLayout } from "../../widgets/app-shell/AppLayout";
import { MIcon } from "../../shared/ui/icons";
import { QueryErrorBanner } from "../../shared/ui/QueryGuard";
import { apiClient } from "../../shared/api/client";
import type { DashboardCounts } from "../../types";

function fetchDashboardCounts(): Promise<DashboardCounts> {
  return apiClient.get<DashboardCounts>("/admin/dashboard/counts");
}

interface StatCardProps {
  label: string;
  icon: string;
  value: number | undefined;
  isLoading: boolean;
}

function StatCard(props: StatCardProps) {
  return (
    <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-medium tracking-[0.05em] text-on-surface-variant uppercase">
          {props.label}
        </span>
        <span class="material-symbols-outlined text-primary text-[20px]">
          {props.icon}
        </span>
      </div>
      <div class="text-[36px] font-headline font-bold text-on-surface leading-none">
        <Show when={!props.isLoading} fallback={
          <div class="h-9 w-16 rounded-lg bg-surface-container-highest animate-pulse" />
        }>
          {props.value?.toLocaleString() ?? "—"}
        </Show>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const countsQuery = useQuery(() => ({
    queryKey: ["dashboard-counts"],
    queryFn: fetchDashboardCounts,
    staleTime: 30_000,
  }));

  return (
    <AppLayout>
      <Title>Dashboard | Nona Config Admin</Title>
      <div class="space-y-6">
        <div class="space-y-1.5">
          <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
            Dashboard
          </h2>
          <p class="text-[12.5px] text-on-surface-variant">
            System overview at a glance
          </p>
        </div>

        <Show when={countsQuery.isError}>
          <QueryErrorBanner
            message="Failed to load dashboard stats."
            onRetry={() => countsQuery.refetch()}
          />
        </Show>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Projects"
            icon="folder"
            value={countsQuery.data?.projects}
            isLoading={countsQuery.isLoading}
          />
          <StatCard
            label="Config Entries"
            icon="settings"
            value={countsQuery.data?.configEntries}
            isLoading={countsQuery.isLoading}
          />
          <StatCard
            label="Team Members"
            icon="group"
            value={countsQuery.data?.users}
            isLoading={countsQuery.isLoading}
          />
        </div>

        {/* Quick Actions */}
        <div class="space-y-3">
          <h3 class="text-[14px] font-headline font-bold text-on-surface/90">
            Quick Actions
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/projects"
              class="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 hover:bg-surface-container-high hover:border-primary/30 transition-all group cursor-pointer text-current no-underline"
            >
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <MIcon name="folder" class="text-[20px]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-headline font-semibold text-on-surface text-[14px] group-hover:text-primary transition-colors">
                  Manage Projects
                </div>
                <div class="text-[11px] text-outline mt-0.5">
                  Configure environments and parameters
                </div>
              </div>
              <MIcon name="chevron_right" class="text-outline text-lg group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="/user"
              class="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 hover:bg-surface-container-high hover:border-primary/30 transition-all group cursor-pointer text-current no-underline"
            >
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <MIcon name="person_add" class="text-[20px]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-headline font-semibold text-on-surface text-[14px] group-hover:text-primary transition-colors">
                  Invite Team Member
                </div>
                <div class="text-[11px] text-outline mt-0.5">
                  Add new collaborators to your team
                </div>
              </div>
              <MIcon name="chevron_right" class="text-outline text-lg group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="/audit-logs"
              class="flex items-center gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 hover:bg-surface-container-high hover:border-primary/30 transition-all group cursor-pointer text-current no-underline"
            >
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <MIcon name="manage_history" class="text-[20px]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-headline font-semibold text-on-surface text-[14px] group-hover:text-primary transition-colors">
                  Security Audit Logs
                </div>
                <div class="text-[11px] text-outline mt-0.5">
                  Audit changes and user activities
                </div>
              </div>
              <MIcon name="chevron_right" class="text-outline text-lg group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
