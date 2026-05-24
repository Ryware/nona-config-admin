import { Title } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import { createMemo, createSignal } from "solid-js";
import { AppLayout } from "../../components/layout/AppLayout";
import { projectService } from "../../services/project.service";
import { userService } from "../../services/user.service";

import { AuditLogDrawer } from "./components/AuditLogDrawer";
import { AuditLogsFilters } from "./components/AuditLogsFilters";
import { AuditLogsHeader } from "./components/AuditLogsHeader";
import { AuditLogsTable } from "./components/AuditLogsTable";
import type { AuditEntry, AuditLogEntry } from "./types";
import { ACTION_STYLE, actorStyle, ENV_STYLE } from "./utils";

const PAGE_SIZE = 25;

export default function AuditLogsPage() {
  const [search, setSearch] = createSignal("");
  const [filterAction, setFilterAction] = createSignal("all");
  const [filterEnv, setFilterEnv] = createSignal("all");
  const [dateFrom, setDateFrom] = createSignal("");
  const [dateTo, setDateTo] = createSignal("");
  const [page, setPage] = createSignal(0);
  const [selectedEntry, setSelectedEntry] = createSignal<AuditEntry | null>(
    null,
  );

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

    // Process Project actions
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
        sysId: "SYS-" + String(p.id ?? "").slice(0, 4).toUpperCase(),
        actionCode: "CREATE_PROJECT",
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
          sysId: "SYS-" + String(p.id ?? "").slice(0, 4).toUpperCase(),
          actionCode: "UPDATE_PROJECT",
        });
      }
    }

    // Process User Invitation actions
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
        sysId: "USR-" + String(u.id ?? "").slice(0, 4).toUpperCase(),
        actionCode: "INVITE_USER",
      });
    }

    // Process stored parameter changes from LocalStorage
    try {
      const raw = localStorage.getItem("nonaconfig_audit_logs");
      if (raw) {
        const storedLogs: AuditLogEntry[] = JSON.parse(raw);
        for (const item of storedLogs) {
          const s = actorStyle(item.actor);
          let actionLabel = "Updated Parameter";
          if (item.actionCode === "CREATE_ENTRY")
            actionLabel = "Created Parameter";
          else if (item.actionCode === "DELETE_ENTRY")
            actionLabel = "Deleted Parameter";

          const capEnv =
            item.environment.charAt(0).toUpperCase() +
            item.environment.slice(1);

          list.push({
            id: item.id,
            time: new Date(item.time),
            actor: item.actor,
            actorIconColor: s.bg,
            actorTextColor: s.text,
            actorIsSystem: false,
            action: actionLabel,
            actionStyle:
              ACTION_STYLE[actionLabel] || ACTION_STYLE["Updated Parameter"],
            target: item.key,
            targetMono: true,
            targetDeleted: item.actionCode === "DELETE_ENTRY",
            env: capEnv,
            envStyle: ENV_STYLE[capEnv] || ENV_STYLE["Global Scope"],
            sysId: item.sysId,
            actionCode: item.actionCode,
            ipAddress: item.ipAddress,
            oldValue: item.oldValue,
            newValue: item.newValue,
            contentType: item.contentType,
            scope: item.scope,
            key: item.key,
            project: item.project,
            displayName: item.displayName,
            description: item.description,
            oldDisplayName: item.oldDisplayName,
            oldDescription: item.oldDescription,
          });
        }
      }
    } catch (e) {
      console.error("Failed to parse stored audit logs", e);
    }

    return list.sort((a, b) => b.time.getTime() - a.time.getTime());
  });

  const filtered = createMemo(() => {
    let entries = allEntries();
    if (filterAction() !== "all")
      entries = entries.filter((e) => e.action === filterAction());
    if (filterEnv() !== "all")
      entries = entries.filter((e) => e.env === filterEnv());

    if (dateFrom()) {
      const from = new Date(dateFrom()).getTime();
      if (!isNaN(from)) {
        entries = entries.filter((e) => e.time.getTime() >= from);
      }
    }
    if (dateTo()) {
      const to = new Date(dateTo()).getTime() + 86_400_000; // inclusive end of day
      if (!isNaN(to)) {
        entries = entries.filter((e) => e.time.getTime() <= to);
      }
    }
    if (search().trim()) {
      const q = search().toLowerCase();
      entries = entries.filter(
        (e) =>
          e.actor.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          (e.displayName ?? "").toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q) ||
          (e.project ?? "").toLowerCase().includes(q),
      );
    }
    return entries;
  });

  const totalPages = createMemo(() =>
    Math.max(1, Math.ceil(filtered().length / PAGE_SIZE)),
  );
  const pageEntries = createMemo(() =>
    filtered().slice(page() * PAGE_SIZE, (page() + 1) * PAGE_SIZE),
  );
  const uniqueActions = createMemo(() => [
    ...new Set(allEntries().map((e) => e.action)),
  ]);
  const uniqueEnvs = createMemo(() => [
    ...new Set(allEntries().map((e) => e.env)),
  ]);
  const isLoading = () => projectsQuery.isLoading || usersQuery.isLoading;

  const changePage = (n: number) => {
    if (n >= 0 && n < totalPages()) setPage(n);
  };

  const clearFilters = () => {
    setFilterAction("all");
    setFilterEnv("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  const exportLogs = (format: "csv" | "json") => {
    const entries = filtered();
    if (format === "json") {
      const json = JSON.stringify(
        entries.map((e) => ({
          id: e.id,
          time: e.time.toISOString(),
          actor: e.actor,
          action: e.action,
          target: e.target,
          environment: e.env,
          sysId: e.sysId,
          ipAddress: e.ipAddress,
          oldValue: e.oldValue,
          newValue: e.newValue,
        })),
        null,
        2,
      );
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const header = "Time,Actor,Action,Target,Environment,SysID,IP\n";
      const rows = entries.map(
        (e) =>
          `"${e.time.toISOString()}","${e.actor}","${e.action}","${e.target}","${e.env}","${e.sysId}","${e.ipAddress ?? ""}"`,
      );
      const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AppLayout>
      <Title>Audit Logs | Nona Config Admin</Title>
      <div class="space-y-8">
        <AuditLogsHeader onExport={exportLogs} />

        <AuditLogsFilters
          search={search()}
          setSearch={(v) => {
            setSearch(v);
            setPage(0);
          }}
          filterAction={filterAction()}
          setFilterAction={(v) => {
            setFilterAction(v);
            setPage(0);
          }}
          filterEnv={filterEnv()}
          setFilterEnv={(v) => {
            setFilterEnv(v);
            setPage(0);
          }}
          dateFrom={dateFrom()}
          setDateFrom={(v) => {
            setDateFrom(v);
            setPage(0);
          }}
          dateTo={dateTo()}
          setDateTo={(v) => {
            setDateTo(v);
            setPage(0);
          }}
          uniqueActions={uniqueActions()}
          uniqueEnvs={uniqueEnvs()}
          clearAllFilters={clearFilters}
        />

        <AuditLogsTable
          isLoading={isLoading()}
          filteredEntries={filtered()}
          pageEntries={pageEntries()}
          page={page()}
          totalPages={totalPages()}
          pageSize={PAGE_SIZE}
          onSelectEntry={setSelectedEntry}
          onChangePage={changePage}
        />

        <AuditLogDrawer
          entry={selectedEntry()}
          onClose={() => setSelectedEntry(null)}
        />
      </div>
    </AppLayout>
  );
}
