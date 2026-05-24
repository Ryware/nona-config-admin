import { createSignal, createEffect, Show, For } from "solid-js";
import type { JSX } from "solid-js";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { VisualJsonEditor } from "../../../components/ui/visual-json-editor";
import { MIcon } from "../../../components/ui/icons";

export interface ParamRevision {
  timestamp: string;
  project: string;
  environment: string;
  key: string;
  value: string;
  actor: string;
  displayName?: string;
  description?: string;
}

interface ProjectParamEditDrawerProps {
  entry: any; // ConfigEntry | null
  activeEnvName: string;
  initialDisplayName: string;
  initialDescription: string;
  onClose: () => void;
  onSaveSettings: (data: { value: string; displayName: string; description: string }) => void;
  isSaving: boolean;
  historyRevisions: ParamRevision[];
  onRestoreRevision: (revision: ParamRevision) => void;
}

interface FieldRowProps {
  label: string;
  value: string | undefined;
  changed: boolean;
  initial: boolean;
  mono?: boolean;
}

function FieldRow(props: FieldRowProps): JSX.Element {
  return (
    <div class="flex items-start gap-3 py-1">
      <span class="text-[11px] font-medium text-outline w-24 shrink-0 pt-px leading-snug">
        {props.label}
      </span>
      <span
        class={`text-[12px] flex-1 leading-relaxed min-w-0 break-all ${props.mono ? "font-mono" : ""} ${
          props.changed ? "text-on-surface" : "text-on-surface-variant/50"
        }`}
      >
        {props.value ? props.value : <span class="italic text-outline/40">–</span>}
      </span>
      <Show when={props.changed}>
        <span
          class={`text-[9px] font-medium shrink-0 px-1.5 py-0.5 rounded-full mt-0.5 ${
            props.initial
              ? "bg-secondary/10 text-secondary"
              : "bg-primary/10 text-primary"
          }`}
        >
          {props.initial ? "initial" : "changed"}
        </span>
      </Show>
    </div>
  );
}

function fmtRevDate(timestamp: string): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

export function ProjectParamEditDrawer(props: ProjectParamEditDrawerProps) {
  const [activeDrawerTab, setActiveDrawerTab] = createSignal<"settings" | "history">("settings");
  const [editVal, setEditVal] = createSignal("");
  const [editDisplayName, setEditDisplayName] = createSignal("");
  const [editDescription, setEditDescription] = createSignal("");

  createEffect(() => {
    const entry = props.entry;
    if (entry) {
      setEditVal(entry.value);
      setEditDisplayName(props.initialDisplayName);
      setEditDescription(props.initialDescription);
    }
  });

  const isProd = () => props.activeEnvName.toLowerCase() === "production";

  const isValidJson = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const isEditInvalid = () => {
    const entry = props.entry;
    if (entry && entry.contentType === "json") {
      return !isValidJson(editVal());
    }
    return false;
  };

  const handleSave = () => {
    props.onSaveSettings({
      value: editVal().trim(),
      displayName: editDisplayName().trim(),
      description: editDescription().trim(),
    });
  };

  return (
    <Show when={props.entry}>
      {(() => {
        const entry = props.entry!;

        return (
          <>
            {/* Backdrop */}
            <div
              onClick={props.onClose}
              class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Drawer Panel */}
            <div class="fixed top-0 right-0 h-screen w-full max-w-md bg-surface-container-low border-l border-outline-variant/15 rounded-l-2xl p-6 z-50 shadow-2xl flex flex-col animate-in">

              {/* Header */}
              <div class="flex items-center justify-between pb-4 border-b border-outline-variant/15 mb-4">
                <div>
                  <h3 class="text-base font-headline font-bold text-on-surface">Edit Parameter</h3>
                  <p class="text-[11px] font-mono text-outline mt-0.5">{entry.key}</p>
                </div>
                <button
                  onClick={props.onClose}
                  class="text-outline hover:text-on-surface bg-transparent border-0 cursor-pointer p-1.5 rounded-lg hover:bg-surface-container-high/60 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <MIcon name="close" />
                </button>
              </div>

              {/* Tabs */}
              <div class="flex gap-1 bg-surface-container/60 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("settings")}
                  class={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all border-0 cursor-pointer ${
                    activeDrawerTab() === "settings"
                      ? "bg-primary text-on-primary"
                      : "text-outline hover:text-on-surface bg-transparent"
                  }`}
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("history")}
                  class={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all border-0 cursor-pointer ${
                    activeDrawerTab() === "history"
                      ? "bg-primary text-on-primary"
                      : "text-outline hover:text-on-surface bg-transparent"
                  }`}
                >
                  History ({props.historyRevisions.length})
                </button>
              </div>

              {/* Scrollable content */}
              <div class="flex-1 overflow-y-auto pr-1 pl-1">

                {/* ── Settings tab ─────────────────────────────── */}
                <Show when={activeDrawerTab() === "settings"}>
                  <div class="space-y-5">

                    {/* Environment */}
                    <div class="flex items-center justify-between py-1">
                      <span class="text-[11px] font-medium text-outline tracking-[0.05em]">
                        Environment
                      </span>
                      <span class="text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {props.activeEnvName}
                      </span>
                    </div>

                    {/* Friendly name */}
                    <div class="space-y-2">
                      <label class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
                        Friendly name
                      </label>
                      <Input
                        type="text"
                        value={editDisplayName()}
                        onInput={(e) => setEditDisplayName(e.currentTarget.value)}
                        placeholder="Friendly name"
                        leftIcon="label"
                      />
                    </div>

                    {/* Description */}
                    <div class="space-y-2">
                      <label class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
                        Description
                      </label>
                      <textarea
                        value={editDescription()}
                        onInput={(e) => setEditDescription(e.currentTarget.value)}
                        rows={3}
                        class="w-full resize-none bg-surface-container-lowest border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-[13px] text-on-surface placeholder:text-outline/60 transition-all outline-none hover:border-outline-variant/30"
                        placeholder="Describe what this setting controls..."
                      />
                    </div>

                    {/* Datatype */}
                    <div class="space-y-2">
                      <label class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
                        Datatype
                      </label>
                      <div class="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary bg-primary/5 border border-primary/15 px-3 py-1.5 rounded-lg">
                        <MIcon name="data_object" class="text-[14px]" />
                        {entry.contentType}
                      </div>
                    </div>

                    {/* Value */}
                    <div class="space-y-2">
                      <label class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
                        Value
                      </label>
                      <Show when={entry.contentType === "boolean"}>
                        <Select
                          value={editVal()}
                          onChange={(val) => setEditVal(val)}
                          options={[
                            { value: "true", label: "True / Active" },
                            { value: "false", label: "False / Inactive" },
                          ]}
                        />
                      </Show>
                      <Show when={entry.contentType === "number"}>
                        <Input
                          type="number"
                          value={editVal()}
                          onInput={(e) => setEditVal(e.currentTarget.value)}
                          leftIcon="pin"
                        />
                      </Show>
                      <Show when={entry.contentType === "json"}>
                        <VisualJsonEditor
                          id="config-entry-edit-value"
                          value={editVal()}
                          onChange={setEditVal}
                        />
                      </Show>
                      <Show when={entry.contentType === "string"}>
                        <Input
                          type="text"
                          value={editVal()}
                          onInput={(e) => setEditVal(e.currentTarget.value)}
                          leftIcon="text_fields"
                        />
                      </Show>
                    </div>

                    {/* Production warning */}
                    <Show when={isProd()}>
                      <div class="p-4 rounded-xl border border-error/25 bg-error/5 flex items-start gap-3">
                        <MIcon name="warning" class="text-error text-[18px] shrink-0 mt-0.5" />
                        <div>
                          <p class="text-[12px] font-semibold text-error mb-1">Production environment</p>
                          <p class="text-[11px] text-on-surface-variant leading-relaxed">
                            Changes apply immediately to live servers.
                          </p>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* ── History tab ───────────────────────────────── */}
                <Show when={activeDrawerTab() === "history"}>
                  <div>
                    <p class="text-[11px] font-medium text-outline tracking-[0.05em] mb-5">
                      Revision timeline
                    </p>
                    <Show
                      when={props.historyRevisions.length > 0}
                      fallback={
                        <div class="text-center py-12 text-[12px] text-outline">
                          No revision history.
                        </div>
                      }
                    >
                      <div class="relative pl-5 border-l border-outline-variant/20 space-y-7">
                        <For each={props.historyRevisions}>
                          {(rev, index) => {
                            const getChanges = () => {
                              const prev = props.historyRevisions[index() + 1];
                              if (!prev) {
                                return {
                                  isInitial: true,
                                  value: true,
                                  displayName: !!rev.displayName,
                                  description: !!rev.description,
                                };
                              }
                              return {
                                isInitial: false,
                                value: rev.value !== prev.value,
                                displayName: rev.displayName !== prev.displayName,
                                description: rev.description !== prev.description,
                              };
                            };

                            const changes = getChanges();

                            return (
                              <div class="relative">
                                {/* Timeline dot */}
                                <div class="absolute -left-6.25 top-1.5 w-2 h-2 rounded-full bg-primary/70 ring-2 ring-surface-container-low" />

                                {/* Actor + timestamp */}
                                <div class="flex items-baseline justify-between mb-3 gap-2">
                                  <span class="text-[13px] font-medium text-on-surface truncate">
                                    {rev.actor}
                                  </span>
                                  <span class="text-[10px] font-mono text-outline shrink-0">
                                    {fmtRevDate(rev.timestamp)}
                                  </span>
                                </div>

                                {/* Field rows */}
                                <div class="space-y-0 divide-y divide-outline-variant/8">
                                  <Show when={rev.displayName !== undefined}>
                                    <FieldRow
                                      label="Friendly name"
                                      value={rev.displayName}
                                      changed={changes.displayName}
                                      initial={changes.isInitial}
                                    />
                                  </Show>
                                  <Show when={rev.description !== undefined}>
                                    <FieldRow
                                      label="Description"
                                      value={rev.description}
                                      changed={changes.description}
                                      initial={changes.isInitial}
                                    />
                                  </Show>
                                  <FieldRow
                                    label="Value"
                                    value={rev.value}
                                    changed={changes.value}
                                    initial={changes.isInitial}
                                    mono
                                  />
                                </div>

                                {/* Restore action */}
                                <div class="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => props.onRestoreRevision(rev)}
                                    class="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 px-0"
                                  >
                                    <MIcon name="history" class="text-[14px]" />
                                    Restore this revision
                                  </button>
                                </div>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>

              {/* Footer */}
              <Show
                when={activeDrawerTab() === "settings"}
                fallback={
                  <div class="pt-4 border-t border-outline-variant/15 mt-4">
                    <button
                      type="button"
                      onClick={props.onClose}
                      class="w-full py-2.5 rounded-xl text-[13px] font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-colors border-0 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                }
              >
                <div class="pt-4 border-t border-outline-variant/15 flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={props.onClose}
                    class="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-colors border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={props.isSaving || isEditInvalid()}
                    class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-primary text-on-primary hover:brightness-110 transition-all disabled:opacity-40 border-0 cursor-pointer"
                  >
                    {props.isSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </Show>
            </div>
          </>
        );
      })()}
    </Show>
  );
}
