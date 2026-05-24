import { Title } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { AppLayout } from "../../components/layout/AppLayout";
import { MIcon } from "../../components/ui/icons";
import { apiClient } from "../../services/api-client";
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
          <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px]">
            <MIcon name="error" class="text-[18px]" />
            Failed to load dashboard stats.
          </div>
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
      </div>
    </AppLayout>
  );
}
