import { For, Show, createMemo } from "solid-js";
import type { ConfigEntry } from "../../types";
import { MIcon } from "../../shared/ui/icons";

interface ProjectParamsTableProps {
  isLoading: boolean;
  projectId: string;
  activeEnvName: string;
  filteredConfig: ConfigEntry[];
  onSelectEntry: (entry: ConfigEntry) => void;
  onDeleteEntry: (key: string) => void;
  copiedKey: string | null;
  onCopyValue: (key: string, value: string) => void;
  getParamMeta: (proj: string, env: string, key: string) => { displayName: string; description: string };
  search: string;
}

const TYPE_STYLE: Record<string, string> = {
  string: "bg-primary/10 border border-primary/20 text-primary",
  number: "bg-secondary/10 border border-secondary/20 text-secondary",
  boolean: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  json: "bg-purple-500/10 border border-purple-500/20 text-purple-400",
};

const SCOPE_STYLE: Record<string, string> = {
  all: "bg-surface-container-high/80 border border-outline-variant/15 text-outline",
  client: "bg-primary/10 border border-primary/20 text-primary",
  server: "bg-secondary/10 border border-secondary/20 text-secondary",
};

export function ProjectParamsTable(props: ProjectParamsTableProps) {
  return (
    <div class="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-[12px]">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-outline-variant/15 bg-surface-container-lowest/50">
              <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Parameter</th>
              <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Value</th>
              <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Type</th>
              <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Scope</th>
              <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em] text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/10">
            <Show when={props.isLoading}>
              <For each={[1, 2, 3]}>
                {() => (
                  <tr>
                    <td class="py-4 px-6">
                      <div class="skeleton h-4 w-40 rounded" />
                    </td>
                    <td class="py-4 px-6">
                      <div class="skeleton h-4 w-32 rounded" />
                    </td>
                    <td class="py-4 px-6">
                      <div class="skeleton h-5 w-14 rounded-full" />
                    </td>
                    <td class="py-4 px-6">
                      <div class="skeleton h-5 w-14 rounded-full" />
                    </td>
                    <td class="py-4 px-6" />
                  </tr>
                )}
              </For>
            </Show>
            <Show when={!props.isLoading}>
              <For each={props.filteredConfig}>
                {(entry) => {
                  const meta = createMemo(() =>
                    props.getParamMeta(props.projectId, props.activeEnvName, entry.key)
                  );
                  return (
                    <tr
                      onClick={() => props.onSelectEntry(entry)}
                      class="group hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                    >
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-1.5">
                          <div class="flex flex-col gap-0.5">
                            <span class="font-bold text-[13.5px] text-on-surface">
                              {meta().displayName}
                            </span>
                            <span class="font-mono text-outline text-[10px] tracking-tight">
                              {entry.key}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span class="font-mono text-on-surface-variant truncate max-w-[180px] block">
                            {entry.value}
                          </span>
                          <button
                            onClick={() => void props.onCopyValue(entry.key, entry.value)}
                            title="Copy value"
                            class="opacity-0 group-hover:opacity-100 transition-all text-outline hover:text-primary bg-transparent border-0 cursor-pointer p-1 rounded hover:bg-primary/10 flex items-center justify-center shrink-0"
                          >
                            <MIcon
                              name={props.copiedKey === entry.key ? "check" : "content_copy"}
                              class="text-[14px]"
                            />
                          </button>
                        </div>
                      </td>
                      <td class="py-4 px-6 font-mono">
                        <span
                          class={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            TYPE_STYLE[entry.contentType] ?? ""
                          }`}
                        >
                          {entry.contentType}
                        </span>
                      </td>
                      <td class="py-4 px-6 font-mono">
                        <span
                          class={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            SCOPE_STYLE[entry.scope] ?? ""
                          }`}
                        >
                          {entry.scope}
                        </span>
                      </td>
                      <td class="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => props.onDeleteEntry(entry.key)}
                          class="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error bg-transparent border-0 cursor-pointer p-1.5 rounded-lg hover:bg-error/10"
                          title={`Delete parameter ${entry.key}`}
                          aria-label={`Delete parameter ${entry.key}`}
                        >
                          <MIcon name="delete_outline" class="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </Show>
            <Show
              when={
                !props.isLoading && props.search && props.filteredConfig.length === 0
              }
            >
              <tr>
                <td colspan="5" class="py-10 text-center text-on-surface-variant text-sm">
                  No parameters match "
                  <span class="text-on-surface font-medium">{props.search}</span>"
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
