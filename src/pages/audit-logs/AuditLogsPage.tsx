import { createMemo, createSignal, For, Show } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { projectService } from "../../services/project.service";
import { userService } from "../../services/user.service";

interface AuditEntry {
  id: string;
  time: Date;
  actor: string;
  actorIconColor: string;
  actorTextColor: string;
  actorIsSystem: boolean;
  action: string;
  actionStyle: string;
  target: string;
  targetMono: boolean;
  targetDeleted: boolean;
  env: string;
  envStyle: string;
  sysId: string;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (hrs < 48) return "Yesterday";
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    ", " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ACTION_STYLE: Record<string, string> = {
  "Created Project": "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30",
  "Updated Project": "bg-secondary-container/30 text-secondary border border-secondary/20",
  "Invited User":    "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30",
  "Deleted Key":     "bg-error-container/20 text-error border border-error/20",
  "Auto-Scaling":    "bg-primary-container/20 text-primary border border-primary/20",
};

const ENV_STYLE: Record<string, string> = {
  "Production":   "text-on-primary bg-primary",
  "Staging":      "text-on-secondary-container bg-secondary-container",
  "Global Scope": "text-outline-variant border border-outline-variant",
};

const ACTOR_ICON_COLORS = [
  { bg: "bg-primary/10",   text: "text-primary"   },
  { bg: "bg-secondary/10", text: "text-secondary" },
  { bg: "bg-error/10",     text: "text-error"     },
  { bg: "bg-surface-bright", text: "text-primary" },
];
function actorStyle(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return ACTOR_ICON_COLORS[Math.abs(h) % ACTOR_ICON_COLORS.length];
}

const PAGE_SIZE = 25;

export default function AuditLogsPage() {
  const { setPageTitle } = usePageTitle();
  setPageTitle("Activity Feed");

  const [search, setSearch] = createSignal("");
  const [filterAction, setFilterAction] = createSignal("all");
  const [filterEnv, setFilterEnv] = createSignal("all");
  const [viewMode, setViewMode] = createSignal<"list" | "grid">("list");
  const [page, setPage] = createSignal(0);

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const usersQuery = useQuery(() => ({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  }));

  const allEntries = createMemo<AuditEntry[]>(() => {
    const list: AuditEntry[] = [];

    for (const p of projectsQuery.data ?? []) {
      const created = new Date(p.createdAt);
      const updated = new Date(p.updatedAt);
      const s = actorStyle("Admin");
      list.push({
        id: "p-c-" + p.id,
        time: created,
        actor: "Admin",
        actorIconColor: s.bg,
        actorTextColor: s.text,
        actorIsSystem: false,
        action: "Created Project",
        actionStyle: ACTION_STYLE["Created Project"],
        target: p.name,
        targetMono: false,
        targetDeleted: false,
        env: "Global Scope",
        envStyle: ENV_STYLE["Global Scope"],
        sysId: "SYS-" //+ p.id.slice(0, 4).toUpperCase(),
      });
      if (updated.getTime() - created.getTime() > 5000) {
        list.push({
          id: "p-u-" + p.id,
          time: updated,
          actor: "Admin",
          actorIconColor: s.bg,
          actorTextColor: s.text,
          actorIsSystem: false,
          action: "Updated Project",
          actionStyle: ACTION_STYLE["Updated Project"],
          target: p.name,
          targetMono: false,
          targetDeleted: false,
          env: "Global Scope",
          envStyle: ENV_STYLE["Global Scope"],
          sysId: "SYS-" + p.id.slice(0, 4).toUpperCase(),
        });
      }
    }

    for (const u of usersQuery.data ?? []) {
      const s = actorStyle("Admin");
      list.push({
        id: "u-i-" + u.id,
        time: new Date(u.createdAt),
        actor: "Admin",
        actorIconColor: s.bg,
        actorTextColor: s.text,
        actorIsSystem: false,
        action: "Invited User",
        actionStyle: ACTION_STYLE["Invited User"],
        target: u.email,
        targetMono: false,
        targetDeleted: false,
        env: "Global Scope",
        envStyle: ENV_STYLE["Global Scope"],
        sysId: "USR-" //+ u.id.slice(0, 4).toUpperCase(),
      });
    }

    return list.sort((a, b) => b.time.getTime() - a.time.getTime());
  });

  const filtered = createMemo(() => {
    let entries = allEntries();
    if (filterAction() !== "all") entries = entries.filter((e) => e.action === filterAction());
    if (filterEnv() !== "all")    entries = entries.filter((e) => e.env === filterEnv());
    if (search().trim()) {
      const q = search().toLowerCase();
      entries = entries.filter(
        (e) => e.actor.toLowerCase().includes(q) || e.target.toLowerCase().includes(q)
      );
    }
    return entries;
  });

  const totalPages = createMemo(() => Math.max(1, Math.ceil(filtered().length / PAGE_SIZE)));
  const pageEntries = createMemo(() =>
    filtered().slice(page() * PAGE_SIZE, (page() + 1) * PAGE_SIZE)
  );
  const uniqueActions = createMemo(() => [...new Set(allEntries().map((e) => e.action))]);
  const isLoading = () => projectsQuery.isLoading || usersQuery.isLoading;

  const changePage = (n: number) => {
    if (n >= 0 && n < totalPages()) setPage(n);
  };

  const clearFilters = () => {
    setFilterAction("all");
    setFilterEnv("all");
    setSearch("");
    setPage(0);
  };

  return (
    <AppLayout>
      <div class="flex flex-col h-full -m-8 overflow-hidden">

        {/* Sub-header: breadcrumb + search + export (mirrors stitch TopAppBar) */}
        <header class="h-16 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface-container-low/50 backdrop-blur-md shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-on-surface-variant text-sm font-medium">Logs</span>
            <span class="material-symbols-outlined text-sm text-outline">chevron_right</span>
            <h2 class="font-headline text-on-surface text-lg font-medium tracking-tight">Activity Feed</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                type="text"
                placeholder="Filter audit trail..."
                value={search()}
                onInput={(e) => { setSearch(e.currentTarget.value); setPage(0); }}
                class="bg-surface-container-highest border-none border-b-2 border-outline-variant text-sm pl-10 pr-4 py-2 w-64 focus:ring-0 focus:border-primary transition-all rounded-t-sm placeholder:text-outline/50 text-on-surface outline-none"
              />
            </div>
            <button
              class="flex items-center gap-2 px-5 py-2 text-on-primary font-bold text-xs uppercase tracking-widest rounded-sm hover:opacity-90 active:scale-95 transition-all border-0 cursor-pointer shadow-lg"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span class="material-symbols-outlined text-sm">download</span>
              Export Logs
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <section class="px-8 py-3 flex items-center gap-4 bg-surface-container-low border-b border-outline-variant/10 shrink-0">
          <span class="text-[10px] font-mono text-outline uppercase tracking-wider shrink-0">Filters:</span>
          <div class="flex gap-2">
            {/* Action Type filter */}
            <div class="relative">
              <select
                value={filterAction()}
                onChange={(e) => { setFilterAction(e.currentTarget.value); setPage(0); }}
                class="appearance-none pl-3 pr-7 py-1.5 bg-surface-container-highest rounded-sm border border-outline-variant/30 text-xs text-on-surface-variant hover:text-primary transition-colors outline-none cursor-pointer"
              >
                <option value="all">Action Type</option>
                <For each={uniqueActions()}>{(a) => <option value={a}>{a}</option>}</For>
              </select>
              <span class="material-symbols-outlined text-xs text-outline absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">keyboard_arrow_down</span>
            </div>
            {/* Environment filter */}
            <div class="relative">
              <select
                value={filterEnv()}
                onChange={(e) => { setFilterEnv(e.currentTarget.value); setPage(0); }}
                class="appearance-none pl-3 pr-7 py-1.5 bg-surface-container-highest rounded-sm border border-outline-variant/30 text-xs text-on-surface-variant hover:text-primary transition-colors outline-none cursor-pointer"
              >
                <option value="all">Environment</option>
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Global Scope">Global Scope</option>
              </select>
              <span class="material-symbols-outlined text-xs text-outline absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">keyboard_arrow_down</span>
            </div>
          </div>
          <button
            onClick={clearFilters}
            class="text-xs text-primary font-medium px-2 py-1 hover:bg-primary/10 rounded-sm transition-colors bg-transparent border-0 cursor-pointer"
          >
            Clear
          </button>

          {/* View toggle — right side */}
          <div class="ml-auto flex items-center gap-3">
            <span class="text-[10px] font-mono text-outline uppercase tracking-wider">View:</span>
            <div class="flex rounded-sm overflow-hidden border border-outline-variant/30">
              <button
                onClick={() => setViewMode("list")}
                class={`p-1.5 transition-colors border-0 cursor-pointer ${viewMode() === "list" ? "bg-surface-container-high text-primary" : "bg-surface-container-lowest text-outline"}`}
              >
                <span class="material-symbols-outlined text-sm">format_list_bulleted</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                class={`p-1.5 transition-colors border-0 cursor-pointer ${viewMode() === "grid" ? "bg-surface-container-high text-primary" : "bg-surface-container-lowest text-outline"}`}
              >
                <span class="material-symbols-outlined text-sm">grid_view</span>
              </button>
            </div>
          </div>
        </section>

        {/* Ledger Table */}
        <section class="flex-1 overflow-auto px-8 pb-8 pt-4">
          <div class="border border-outline-variant/10 rounded-sm overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container-lowest border-b border-outline-variant/20">
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Actor</th>
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Action Type</th>
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Target</th>
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest text-center">Environment</th>
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Timestamp</th>
                  <th class="px-6 py-4 text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Audit ID / IP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/5">
                <Show when={isLoading()}>
                  <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-slate-500 text-sm">
                      Loading activity…
                    </td>
                  </tr>
                </Show>
                <Show when={!isLoading() && filtered().length === 0}>
                  <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-slate-500 text-sm">
                      No activity recorded yet.
                    </td>
                  </tr>
                </Show>
                <For each={pageEntries()}>
                  {(entry, i) => (
                    <tr
                      class="transition-colors group"
                      style={{ "background-color": i() % 2 === 1 ? "#080d1d" : "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#34394a")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i() % 2 === 1 ? "#080d1d" : "transparent")}
                    >
                      {/* Actor */}
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${entry.actorIconColor}`}>
                            <span class={`material-symbols-outlined text-xs ${entry.actorTextColor}`}>
                              {entry.actorIsSystem ? "bolt" : "person"}
                            </span>
                          </div>
                          <span class={`text-sm font-medium ${entry.actorIsSystem ? "text-primary" : "text-on-surface"}`}>
                            {entry.actor}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td class="px-6 py-4">
                        <span class={`text-xs px-2 py-1 rounded-sm font-medium ${entry.actionStyle}`}>
                          {entry.action}
                        </span>
                      </td>

                      {/* Target */}
                      <td class="px-6 py-4">
                        <Show
                          when={entry.targetMono}
                          fallback={
                            <span class={`text-sm ${entry.targetDeleted ? "text-on-surface-variant italic opacity-60" : "text-on-surface"}`}>
                              {entry.target}
                            </span>
                          }
                        >
                          <code class={`font-mono text-xs px-1.5 py-0.5 rounded ${entry.targetDeleted ? "text-error bg-error/5 line-through opacity-50" : "text-primary bg-primary/5"}`}>
                            {entry.target}
                          </code>
                        </Show>
                      </td>

                      {/* Environment */}
                      <td class="px-6 py-4 text-center">
                        <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${entry.envStyle}`}>
                          {entry.env === "Global Scope" ? "N/A" : entry.env}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td class="px-6 py-4">
                        <div class="text-xs text-on-surface-variant font-mono">{timeAgo(entry.time)}</div>
                        <div class="text-[10px] text-slate-500 font-mono">{formatTimestamp(entry.time)}</div>
                      </td>

                      {/* Audit ID */}
                      <td class="px-6 py-4 text-xs font-mono text-outline group-hover:text-primary transition-colors">
                        {entry.sysId}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div class="mt-6 flex items-center justify-between">
            <p class="text-[10px] font-mono text-outline uppercase tracking-wider">
              Showing{" "}
              <span class="text-on-surface font-bold">
                {filtered().length === 0 ? 0 : page() * PAGE_SIZE + 1}–{Math.min((page() + 1) * PAGE_SIZE, filtered().length)}
              </span>{" "}
              of {filtered().length} entries
            </p>
            <div class="flex items-center gap-2">
              <button
                onClick={() => changePage(page() - 1)}
                disabled={page() === 0}
                class="w-8 h-8 flex items-center justify-center rounded-sm bg-surface-container-high border border-outline-variant/30 text-outline hover:text-primary disabled:opacity-30 transition-colors bg-transparent border-0 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <For each={Array.from({ length: Math.min(totalPages(), 3) }, (_, i) => i)}>
                {(i) => (
                  <button
                    onClick={() => changePage(i)}
                    class={`h-8 px-3 flex items-center justify-center rounded-sm text-xs font-bold border transition-colors cursor-pointer ${
                      page() === i
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-surface-container-high border-outline-variant/30 text-outline hover:text-primary"
                    }`}
                  >
                    {i + 1}
                  </button>
                )}
              </For>
              <Show when={totalPages() > 3}>
                <span class="text-outline mx-1">…</span>
              </Show>
              <button
                onClick={() => changePage(page() + 1)}
                disabled={page() >= totalPages() - 1}
                class="w-8 h-8 flex items-center justify-center rounded-sm bg-surface-container-high border border-outline-variant/30 text-outline hover:text-primary disabled:opacity-30 transition-colors bg-transparent border-0 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
