import { For, Show } from "solid-js";
import { MIcon } from "../../../components/ui/icons";
import type { AuditEntry } from "../types";
import { formatTimestamp, timeAgo } from "../utils";

interface AuditLogsTableProps {
  isLoading: boolean;
  filteredEntries: AuditEntry[];
  pageEntries: AuditEntry[];
  page: number;
  totalPages: number;
  pageSize: number;
  onSelectEntry: (entry: AuditEntry) => void;
  onChangePage: (page: number) => void;
}

type ActionKind = "create" | "update" | "delete" | "system";

function getActionKind(action: string): ActionKind {
  if (action.includes("Created") || action.includes("Invited")) return "create";
  if (action.includes("Updated") || action.includes("changed")) return "update";
  if (action.includes("Deleted") || action.includes("Deleted Key"))
    return "delete";
  return "system";
}

const KIND_STYLES: Record<
  ActionKind,
  {
    icon: string;
    iconColor: string;
    badge: string;
    label: string;
  }
> = {
  create: {
    icon: "add_circle",
    iconColor: "text-success",
    badge: "bg-success/10 text-success",
    label: "Created",
  },
  update: {
    icon: "edit",
    iconColor: "text-primary-container",
    badge: "bg-primary/8 text-primary-container",
    label: "Updated",
  },
  delete: {
    icon: "delete",
    iconColor: "text-error",
    badge: "bg-error/8 text-error",
    label: "Deleted",
  },
  system: {
    icon: "settings",
    iconColor: "text-outline",
    badge: "bg-surface-container-highest text-outline",
    label: "System",
  },
};

function truncate(str: string | undefined, max = 28): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function AuditLogsTable(props: AuditLogsTableProps) {
  return (
    <div class="space-y-4">
      {/* Table wrapper */}
      <div class="border border-outline-variant/15 rounded-xl overflow-hidden bg-surface-container-low">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-outline-variant/15 bg-surface-container-lowest/50">
                <th class="py-3 pl-5 pr-4 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Activity</th>
                <th class="py-3 px-4 text-[11px] font-medium text-outline uppercase tracking-[0.05em] text-center w-32">Context</th>
                <th class="py-3 pl-4 pr-5 text-[11px] font-medium text-outline uppercase tracking-[0.05em] text-right w-44">When</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10" data-testid="audit-log-list">

              {/* Loading state */}
              <Show when={props.isLoading}>
                <tr>
                  <td colspan="3" class="py-16 text-center text-on-surface-variant text-[13px]">
                    <MIcon
                      name="hourglass_empty"
                      class="text-[32px] text-outline/40 block mx-auto mb-3 animate-spin"
                    />
                    Loading activity logs…
                  </td>
                </tr>
              </Show>

              {/* Empty state */}
              <Show when={!props.isLoading && props.filteredEntries.length === 0}>
                <tr>
                  <td colspan="3" class="py-16 text-center">
                    <MIcon
                      name="search_off"
                      class="text-[40px] text-outline/30 block mx-auto mb-3"
                    />
                    <p class="text-on-surface-variant text-[13px]">No activity recorded yet.</p>
                    <p class="text-outline text-[12px] mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              </Show>

              {/* Rows */}
              <Show when={!props.isLoading}>
                <For each={props.pageEntries}>
                  {(entry) => {
                    const kind = getActionKind(entry.action);
                    const ks = KIND_STYLES[kind];
                    const isParamAction = [
                      "Created Parameter",
                      "Updated Parameter",
                      "Deleted Parameter",
                      "Deleted Key",
                    ].includes(entry.action);
                    const isUpdate = entry.action === "Updated Parameter";
                    const isCreate = entry.action === "Created Parameter";
                    const isDelete =
                      entry.action === "Deleted Parameter" ||
                      entry.action === "Deleted Key";

                    return (
                      <tr
                        onClick={() => props.onSelectEntry(entry)}
                        class="group hover:bg-surface-container-high/20 transition-colors cursor-pointer"
                      >
                        {/* ── Activity cell ── */}
                        <td class="py-4 pl-5 pr-4 align-top">
                          <div class="flex items-start gap-3 min-w-0">
                            <div class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-surface-container-high">
                              <MIcon name={ks.icon} class={`text-[14px] ${ks.iconColor}`} />
                            </div>
                            <div class="min-w-0 flex-1">
                              {/* Row 1: actor + verb badge + key */}
                              <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[13px] font-semibold text-on-surface shrink-0">
                                  {entry.actor}
                                </span>
                                <span class={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${ks.badge}`}>
                                  {ks.label}
                                </span>
                                <code
                                  class={`font-mono text-[11px] px-1.5 py-0.5 rounded border truncate max-w-[180px] ${
                                    isDelete
                                      ? "bg-surface-container-high border-outline-variant/20 text-outline/60 line-through"
                                      : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant"
                                  }`}
                                  title={entry.target}
                                >
                                  {entry.target}
                                </code>
                              </div>

                              {/* Row 2: display name + description */}
                              <Show when={entry.displayName && entry.displayName !== entry.target}>
                                <div class="mt-0.5 flex items-center gap-1.5">
                                  <span class="text-[11.5px] text-outline truncate">{entry.displayName}</span>
                                  <Show when={entry.description}>
                                    <span class="text-outline/30 shrink-0">·</span>
                                    <span class="text-[11px] text-outline/50 italic truncate max-w-[220px]">
                                      {entry.description}
                                    </span>
                                  </Show>
                                </div>
                              </Show>

                              {/* Diff section */}
                              <Show when={isParamAction}>
                                <div class="mt-2 space-y-1">
                                  <Show when={isUpdate}>
                                    {(() => {
                                      const valueChanged = entry.oldValue !== entry.newValue;
                                      const nameChanged = entry.oldDisplayName !== undefined && entry.oldDisplayName !== entry.displayName;
                                      const descChanged = entry.oldDescription !== undefined && entry.oldDescription !== entry.description;
                                      const hasAnyDiff = valueChanged || nameChanged || descChanged;
                                      return (
                                        <>
                                          <Show when={valueChanged}>
                                            <div class="flex items-baseline gap-2">
                                              <span class="text-[9.5px] font-medium text-outline/40 w-10 shrink-0 uppercase tracking-wide">value</span>
                                              <div class="flex items-baseline gap-1.5 flex-wrap">
                                                <Show when={entry.oldValue !== undefined && entry.oldValue !== ""}>
                                                  <code class="font-mono text-[10.5px] text-error/70 line-through" title={entry.oldValue}>{truncate(entry.oldValue)}</code>
                                                </Show>
                                                <span class="text-outline/30 text-[10px]">→</span>
                                                <Show when={entry.newValue !== undefined}>
                                                  <code class="font-mono text-[10.5px] text-on-surface" title={entry.newValue}>{truncate(entry.newValue)}</code>
                                                </Show>
                                              </div>
                                            </div>
                                          </Show>
                                          <Show when={nameChanged}>
                                            <div class="flex items-baseline gap-2">
                                              <span class="text-[9.5px] font-medium text-outline/40 w-10 shrink-0 uppercase tracking-wide">name</span>
                                              <div class="flex items-baseline gap-1.5 flex-wrap">
                                                <span class="text-[10.5px] text-error/70 line-through" title={entry.oldDisplayName}>{truncate(entry.oldDisplayName)}</span>
                                                <span class="text-outline/30 text-[10px]">→</span>
                                                <span class="text-[10.5px] text-on-surface" title={entry.displayName}>{truncate(entry.displayName)}</span>
                                              </div>
                                            </div>
                                          </Show>
                                          <Show when={descChanged}>
                                            <div class="flex items-baseline gap-2">
                                              <span class="text-[9.5px] font-medium text-outline/40 w-10 shrink-0 uppercase tracking-wide">desc</span>
                                              <div class="flex items-baseline gap-1.5 flex-wrap">
                                                <span class="text-[10.5px] text-error/70 italic line-through" title={entry.oldDescription}>{truncate(entry.oldDescription, 22)}</span>
                                                <span class="text-outline/30 text-[10px]">→</span>
                                                <span class="text-[10.5px] text-on-surface italic" title={entry.description}>{truncate(entry.description, 22)}</span>
                                              </div>
                                            </div>
                                          </Show>
                                          <Show when={!hasAnyDiff}>
                                            <span class="text-[10.5px] text-outline/40 italic">settings updated</span>
                                          </Show>
                                        </>
                                      );
                                    })()}
                                  </Show>
                                  <Show when={isCreate && entry.newValue}>
                                    <div class="flex items-baseline gap-2">
                                      <span class="text-[9.5px] font-medium text-outline/40 w-10 shrink-0 uppercase tracking-wide">value</span>
                                      <code class="font-mono text-[10.5px] text-success" title={entry.newValue}>{truncate(entry.newValue, 36)}</code>
                                    </div>
                                  </Show>
                                  <Show when={isDelete && entry.oldValue}>
                                    <div class="flex items-baseline gap-2">
                                      <span class="text-[9.5px] font-medium text-outline/40 w-10 shrink-0 uppercase tracking-wide">value</span>
                                      <code class="font-mono text-[10.5px] text-error/70 line-through" title={entry.oldValue}>{truncate(entry.oldValue, 36)}</code>
                                    </div>
                                  </Show>
                                </div>
                              </Show>

                              {/* System/Project actions */}
                              <Show when={!isParamAction && entry.action !== "Invited User"}>
                                <p class="mt-0.5 text-[11.5px] text-outline/70">
                                  {entry.action === "Created Project" && "New project created"}
                                  {entry.action === "Updated Project" && "Project settings modified"}
                                  {!["Created Project", "Updated Project"].includes(entry.action) && entry.action}
                                </p>
                              </Show>
                              <Show when={entry.action === "Invited User"}>
                                <p class="mt-0.5 text-[11.5px] text-secondary/80">Joined as team member</p>
                              </Show>
                            </div>
                          </div>
                        </td>

                        {/* ── Context cell ── */}
                        <td class="py-4 px-4 align-top w-32">
                          <div class="flex flex-col items-center gap-1.5">
                            <span class={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${entry.envStyle}`}>
                              {entry.env === "Global Scope" ? "System" : entry.env}
                            </span>
                            <Show when={entry.project}>
                              <span class="text-[10px] font-mono text-outline/50 truncate max-w-[96px] text-center" title={entry.project}>
                                {entry.project}
                              </span>
                            </Show>
                          </div>
                        </td>

                        {/* ── When cell ── */}
                        <td class="py-4 pl-4 pr-5 align-top w-44 text-right">
                          <div class="text-[12.5px] font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                            {timeAgo(entry.time)}
                          </div>
                          <div class="text-[10.5px] text-outline font-mono mt-0.5 truncate" title={`Audit Record System ID: ${entry.sysId}`}>
                            {formatTimestamp(entry.time)}
                          </div>
                          <div class="text-[9.5px] font-mono text-outline/40 mt-0.5 tracking-wide">
                            {entry.sysId}
                          </div>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </Show>

            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Show when={props.filteredEntries.length > 0}>
        <div class="flex items-center justify-between">
          <p class="text-[12px] text-outline">
            <span class="font-medium text-on-surface-variant">
              {props.filteredEntries.length === 0
                ? 0
                : props.page * props.pageSize + 1}
              –
              {Math.min(
                (props.page + 1) * props.pageSize,
                props.filteredEntries.length,
              )}
            </span>
            {" "}of {props.filteredEntries.length}
          </p>
          <div class="flex items-center gap-1.5">
            <button
              onClick={() => props.onChangePage(props.page - 1)}
              disabled={props.page === 0}
              aria-label="Previous Page"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:text-on-surface hover:border-outline-variant/40 hover:bg-surface-container-high/30 disabled:opacity-30 transition-all cursor-pointer bg-transparent"
            >
              <MIcon name="chevron_left" class="text-sm" />
            </button>
            <For
              each={Array.from(
                { length: Math.min(props.totalPages, 5) },
                (_, i) => i,
              )}
            >
              {(i) => (
                <button
                  onClick={() => props.onChangePage(i)}
                  class={`h-8 min-w-8 px-2.5 flex items-center justify-center rounded-lg text-[12px] font-medium border transition-all cursor-pointer ${
                    props.page === i
                      ? "bg-surface-container-high text-on-surface border-outline-variant/30"
                      : "border-transparent text-outline hover:text-on-surface hover:bg-surface-container-high/30"
                  }`}
                >
                  {i + 1}
                </button>
              )}
            </For>
            <Show when={props.totalPages > 5}>
              <span class="text-outline mx-0.5 text-[12px]">…</span>
              <button
                onClick={() => props.onChangePage(props.totalPages - 1)}
                class={`h-8 min-w-8 px-2.5 flex items-center justify-center rounded-lg text-[12px] font-medium border transition-all cursor-pointer ${
                  props.page === props.totalPages - 1
                    ? "bg-surface-container-high text-on-surface border-outline-variant/30"
                    : "border-transparent text-outline hover:text-on-surface hover:bg-surface-container-high/30"
                }`}
              >
                {props.totalPages}
              </button>
            </Show>
            <button
              onClick={() => props.onChangePage(props.page + 1)}
              disabled={props.page >= props.totalPages - 1}
              aria-label="Next Page"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:text-on-surface hover:border-outline-variant/40 hover:bg-surface-container-high/30 disabled:opacity-30 transition-all cursor-pointer bg-transparent"
            >
              <MIcon name="chevron_right" class="text-sm" />
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}