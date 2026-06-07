import { type JSX, Show } from "solid-js";
import type { AuditEntry } from "../types";
import { formatTimestamp, timeAgo } from "../utils";
import { MIcon } from "../../../shared/ui/icons";

interface AuditLogDrawerProps {
  entry: AuditEntry | null;
  onClose: () => void;
}

type ActionKind = "create" | "update" | "delete" | "system";

function getKind(action: string): ActionKind {
  if (action.includes("Created") || action.includes("Invited")) return "create";
  if (action.includes("Updated") || action.includes("changed")) return "update";
  if (action.includes("Deleted") || action.includes("Deleted Key"))
    return "delete";
  return "system";
}

const KIND = {
  create: { icon: "add_circle", iconColor: "text-success", label: "Created" },
  update: {
    icon: "edit",
    iconColor: "text-primary-container",
    label: "Updated",
  },
  delete: { icon: "delete", iconColor: "text-error", label: "Deleted" },
  system: { icon: "settings", iconColor: "text-outline", label: "System" },
};

function MetaRow(props: { label: string; children: JSX.Element; mono?: boolean }) {
  return (
    <div class="flex items-start justify-between gap-4 py-2.5 border-b border-outline-variant/8 last:border-0">
      <span class="text-[12px] text-outline/70 shrink-0">{props.label}</span>
      <span
        class={`text-[12.5px] text-right text-on-surface font-medium ${props.mono ? "font-mono" : ""}`}
      >
        {props.children}
      </span>
    </div>
  );
}

export function AuditLogDrawer(props: AuditLogDrawerProps) {
  return (
    <Show when={props.entry}>
      {(() => {
        const entry = props.entry!;
        const kind = getKind(entry.action);
        const ks = KIND[kind];
        const isUpdate = entry.actionCode === "UPDATE_ENTRY";
        const isCreate = entry.actionCode === "CREATE_ENTRY";
        const isDelete = entry.actionCode === "DELETE_ENTRY";
        const isParamAction = isUpdate || isCreate || isDelete;

        const valueChanged = isUpdate && entry.oldValue !== entry.newValue;
        const nameChanged =
          isUpdate &&
          entry.oldDisplayName !== undefined &&
          entry.oldDisplayName !== entry.displayName;
        const descChanged =
          isUpdate &&
          entry.oldDescription !== undefined &&
          entry.oldDescription !== entry.description;

        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => props.onClose()}
              class="fixed inset-0 bg-black/70 backdrop-blur-sm z-200 transition-opacity mb-0"
            />

            {/* Drawer */}
            <div class="fixed top-0 right-0 h-screen w-full max-w-115 bg-surface-container-lowest border-l border-outline-variant/15 z-201 flex flex-col">
              {/* Header */}
              <div class="px-5 pt-5 pb-4 border-b border-outline-variant/15 flex items-start justify-between gap-3 shrink-0">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-surface-container-high">
                    <MIcon
                      name={ks.icon}
                      class={`text-[16px] ${ks.iconColor}`}
                    />
                  </div>
                  <div>
                    <h3 class="text-[14px] font-headline font-semibold text-on-surface leading-tight">
                      {entry.action}
                    </h3>
                    <p class="text-[11px] text-outline font-mono mt-0.5">
                      {entry.sysId} · {timeAgo(entry.time)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => props.onClose()}
                  class="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface bg-transparent border-0 cursor-pointer rounded-lg hover:bg-surface-container-high transition-colors shrink-0"
                  aria-label="Close details"
                >
                  <MIcon name="close" class="text-[18px]" />
                </button>
              </div>

              {/* Scrollable body */}
              <div class="flex-1 overflow-y-auto">
                {/* Parameter identity */}
                <div class="px-5 pt-4 pb-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <code
                        class={`font-mono text-[14px] font-semibold ${isDelete ? "text-error/70 line-through" : "text-on-surface"}`}
                      >
                        {entry.target}
                      </code>
                      <Show
                        when={
                          entry.displayName &&
                          entry.displayName !== entry.target
                        }
                      >
                        <div class="text-[12px] text-outline mt-0.5">
                          {entry.displayName}
                        </div>
                      </Show>
                    </div>
                    <div class="flex flex-col items-end gap-1 shrink-0">
                      <span
                        class={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${entry.envStyle}`}
                      >
                        {entry.env === "Global Scope" ? "System" : entry.env}
                      </span>
                      <Show when={entry.project}>
                        <span class="text-[10px] font-mono text-outline/50">
                          {entry.project}
                        </span>
                      </Show>
                    </div>
                  </div>
                  <Show when={entry.description}>
                    <p class="text-[12px] text-outline/70 italic leading-relaxed mt-2">
                      {entry.description}
                    </p>
                  </Show>
                </div>

                {/* Changes section */}
                <Show when={isParamAction}>
                  <div class="border-t border-outline-variant/10 mx-5" />
                  <div class="px-5 pt-4 pb-5 space-y-4">
                    <span class="text-[12px] font-semibold text-on-surface-variant block">
                      Changes
                    </span>

                    {/* UPDATE diffs */}
                    <Show when={isUpdate}>
                      <div class="space-y-3">
                        <Show when={valueChanged}>
                          <div class="space-y-1.5">
                            <span class="text-[11px] text-outline/60 block">
                              Value
                            </span>
                            <div class="bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant/10">
                              <span class="text-[10px] text-outline/40 block mb-1">
                                Before
                              </span>
                              <code class="font-mono text-[12px] text-error/70 break-all">
                                {entry.oldValue || "(empty)"}
                              </code>
                            </div>
                            <div class="bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant/10">
                              <span class="text-[10px] text-outline/40 block mb-1">
                                After
                              </span>
                              <code class="font-mono text-[12px] text-on-surface break-all">
                                {entry.newValue || "(empty)"}
                              </code>
                            </div>
                          </div>
                        </Show>

                        <Show when={nameChanged}>
                          <div class="space-y-1.5">
                            <span class="text-[11px] text-outline/60 block">
                              Name
                            </span>
                            <div class="flex items-baseline gap-2 text-[12.5px]">
                              <span class="text-error/70 line-through">
                                {entry.oldDisplayName || "—"}
                              </span>
                              <span class="text-outline/30">→</span>
                              <span class="text-on-surface">
                                {entry.displayName || "—"}
                              </span>
                            </div>
                          </div>
                        </Show>

                        <Show when={descChanged}>
                          <div class="space-y-1.5">
                            <span class="text-[11px] text-outline/60 block">
                              Description
                            </span>
                            <div class="flex items-baseline gap-2 text-[12px]">
                              <span class="text-error/70 italic line-through">
                                {entry.oldDescription || "—"}
                              </span>
                              <span class="text-outline/30">→</span>
                              <span class="text-on-surface italic">
                                {entry.description || "—"}
                              </span>
                            </div>
                          </div>
                        </Show>

                        <Show
                          when={!valueChanged && !nameChanged && !descChanged}
                        >
                          <p class="text-[12px] text-outline/50 italic">
                            Detailed diff not available for this record.
                          </p>
                        </Show>
                      </div>
                    </Show>

                    {/* CREATE: initial value */}
                    <Show when={isCreate}>
                      <div class="space-y-1.5">
                        <span class="text-[11px] text-outline/60 block">
                          Initial value
                        </span>
                        <div class="bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant/10">
                          <code class="font-mono text-[12px] text-success break-all">
                            {entry.newValue || "(empty)"}
                          </code>
                        </div>
                      </div>
                    </Show>

                    {/* DELETE: last known value */}
                    <Show when={isDelete}>
                      <div class="space-y-1.5">
                        <span class="text-[11px] text-outline/60 block">
                          Deleted value
                        </span>
                        <div class="bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant/10">
                          <code class="font-mono text-[12px] text-error/70 line-through break-all">
                            {entry.oldValue || "(empty)"}
                          </code>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* Technical metadata */}
                <div class="border-t border-outline-variant/10 mx-5" />
                <div class="px-5 pt-4 pb-6">
                  <span class="text-[12px] font-semibold text-on-surface-variant block mb-3">
                    Technical metadata
                  </span>
                  <div class="divide-y divide-outline-variant/8">
                    <MetaRow label="Actor">{entry.actor}</MetaRow>
                    <MetaRow label="Timestamp">
                      {formatTimestamp(entry.time)}
                    </MetaRow>
                    <MetaRow label="System ID" mono>
                      {entry.sysId}
                    </MetaRow>
                    <Show when={entry.ipAddress}>
                      <MetaRow label="IP Address" mono>
                        {entry.ipAddress}
                      </MetaRow>
                    </Show>
                    <Show when={entry.contentType}>
                      <MetaRow label="Content Type">
                        <span class="font-mono text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                          {entry.contentType}
                        </span>
                      </MetaRow>
                    </Show>
                    <Show when={entry.scope}>
                      <MetaRow label="Access Scope">
                        <span class="font-mono text-[11px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                          {entry.scope}
                        </span>
                      </MetaRow>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div class="px-5 py-4 border-t border-outline-variant/15 shrink-0">
                <button
                  type="button"
                  onClick={props.onClose}
                  class="w-full py-2.5 rounded-lg text-[13px] font-medium text-on-surface-variant hover:text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-colors border-0 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        );
      })()}
    </Show>
  );
}
