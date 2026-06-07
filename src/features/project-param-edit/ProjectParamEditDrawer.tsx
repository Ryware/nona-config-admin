import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { ParamRevision } from "../../entities/project/api/metadata.service";
import { MIcon } from "../../shared/ui/icons";
import { Input } from "../../shared/ui/input";
import { Select } from "../../shared/ui/select";
import { VisualJsonEditor } from "../../shared/ui/visual-json-editor";
import type { ConfigEntry } from "../../types";

export type { ParamRevision };

interface ProjectParamEditDrawerProps {
  entry: ConfigEntry | null;
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
      <span class="text-outline w-24 shrink-0 pt-px text-[11px] leading-snug font-medium">
        {props.label}
      </span>
      <span
        class={`min-w-0 flex-1 text-[12px] leading-relaxed break-all ${props.mono ? "font-mono" : ""} ${
          props.changed ? "text-on-surface" : "text-on-surface-variant/50"
        }`}
      >
        {props.value ? props.value : <span class="text-outline/40 italic">–</span>}
      </span>
      <Show when={props.changed}>
        <span
          class={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
            props.initial ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
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
      description: editDescription().trim()
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
              onClick={() => props.onClose()}
              class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Drawer Panel */}
            <div
              data-testid="parameter-edit-drawer"
              class="bg-surface-container-low border-outline-variant/15 animate-in fixed top-0 right-0 z-50 flex h-screen w-full max-w-md flex-col rounded-l-2xl border-l p-6 shadow-2xl"
            >
              {/* Header */}
              <div class="border-outline-variant/15 mb-4 flex items-center justify-between border-b pb-4">
                <div>
                  <h3
                    data-testid="parameter-edit-heading"
                    class="font-headline text-on-surface text-base font-bold"
                  >
                    Edit Parameter
                  </h3>
                  <p class="text-outline mt-0.5 font-mono text-[11px]">{entry.key}</p>
                </div>
                <button
                  onClick={() => props.onClose()}
                  class="text-outline hover:text-on-surface hover:bg-surface-container-high/60 flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1.5 transition-colors"
                  aria-label="Close"
                >
                  <MIcon name="close" />
                </button>
              </div>

              {/* Tabs */}
              <div class="bg-surface-container/60 mb-5 flex gap-1 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("settings")}
                  class={`flex-1 cursor-pointer rounded-lg border-0 py-1.5 text-[12px] font-medium transition-all ${
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
                  class={`flex-1 cursor-pointer rounded-lg border-0 py-1.5 text-[12px] font-medium transition-all ${
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
                      <span class="text-outline text-[11px] font-medium tracking-[0.05em]">
                        Environment
                      </span>
                      <span class="bg-primary/10 text-primary border-primary/20 rounded-full border px-2.5 py-0.5 font-mono text-[11px]">
                        {props.activeEnvName}
                      </span>
                    </div>

                    {/* Friendly name */}
                    <div class="space-y-2">
                      <label class="text-on-surface-variant block text-[11px] font-medium tracking-[0.05em]">
                        Friendly name
                      </label>
                      <Input
                        type="text"
                        value={editDisplayName()}
                        onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                          setEditDisplayName(e.currentTarget.value)
                        }
                        placeholder="Friendly name"
                        leftIcon="label"
                        data-testid="parameter-edit-display-name-input"
                      />
                    </div>

                    {/* Description */}
                    <div class="space-y-2">
                      <label class="text-on-surface-variant block text-[11px] font-medium tracking-[0.05em]">
                        Description
                      </label>
                      <textarea
                        value={editDescription()}
                        onInput={(e: InputEvent & { currentTarget: HTMLTextAreaElement }) =>
                          setEditDescription(e.currentTarget.value)
                        }
                        rows={3}
                        maxLength={500}
                        class="bg-surface-container-lowest border-outline-variant/20 focus:border-primary focus:ring-primary/20 text-on-surface placeholder:text-outline/60 hover:border-outline-variant/30 w-full resize-none rounded-xl border px-4 py-2.5 text-[13px] transition-all outline-none focus:ring-2"
                        placeholder="Describe what this setting controls..."
                        data-testid="parameter-edit-description-input"
                      />
                    </div>

                    {/* Datatype */}
                    <div class="space-y-2">
                      <label class="text-on-surface-variant block text-[11px] font-medium tracking-[0.05em]">
                        Datatype
                      </label>
                      <div class="text-primary bg-primary/5 border-primary/15 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px]">
                        <MIcon name="data_object" class="text-[14px]" />
                        {entry.contentType}
                      </div>
                    </div>

                    {/* Value */}
                    <div class="space-y-2">
                      <label class="text-on-surface-variant block text-[11px] font-medium tracking-[0.05em]">
                        Value
                      </label>
                      <Show when={entry.contentType === "boolean"}>
                        <Select
                          value={editVal()}
                          onChange={val => setEditVal(val)}
                          options={[
                            { value: "true", label: "True / Active" },
                            { value: "false", label: "False / Inactive" }
                          ]}
                        />
                      </Show>
                      <Show when={entry.contentType === "number"}>
                        <Input
                          type="number"
                          value={editVal()}
                          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                            setEditVal(e.currentTarget.value)
                          }
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
                          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                            setEditVal(e.currentTarget.value)
                          }
                          leftIcon="text_fields"
                          data-testid="parameter-edit-value-input"
                        />
                      </Show>
                    </div>

                    {/* Production warning */}
                    <Show when={isProd()}>
                      <div class="border-error/25 bg-error/5 flex items-start gap-3 rounded-xl border p-4">
                        <MIcon name="warning" class="text-error mt-0.5 shrink-0 text-[18px]" />
                        <div>
                          <p class="text-error mb-1 text-[12px] font-semibold">
                            Production environment
                          </p>
                          <p class="text-on-surface-variant text-[11px] leading-relaxed">
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
                    <p class="text-outline mb-5 text-[11px] font-medium tracking-[0.05em]">
                      Revision timeline
                    </p>
                    <Show
                      when={props.historyRevisions.length > 0}
                      fallback={
                        <div class="text-outline py-12 text-center text-[12px]">
                          No revision history.
                        </div>
                      }
                    >
                      <div class="border-outline-variant/20 relative space-y-7 border-l pl-5">
                        <For each={props.historyRevisions}>
                          {(rev, index) => {
                            const changes = createMemo(() => {
                              const prev = props.historyRevisions[index() + 1];
                              return prev
                                ? {
                                    isInitial: false,
                                    value: rev.value !== prev.value,
                                    displayName: rev.displayName !== prev.displayName,
                                    description: rev.description !== prev.description
                                  }
                                : {
                                    isInitial: true,
                                    value: true,
                                    displayName: !!rev.displayName,
                                    description: !!rev.description
                                  };
                            });

                            return (
                              <div class="relative">
                                {/* Timeline dot */}
                                <div class="bg-primary/70 ring-surface-container-low absolute top-1.5 -left-6.25 h-2 w-2 rounded-full ring-2" />

                                {/* Actor + timestamp */}
                                <div class="mb-3 flex items-baseline justify-between gap-2">
                                  <span class="text-on-surface truncate text-[13px] font-medium">
                                    {rev.actor}
                                  </span>
                                  <span class="text-outline shrink-0 font-mono text-[10px]">
                                    {fmtRevDate(rev.timestamp)}
                                  </span>
                                </div>

                                {/* Field rows */}
                                <div class="divide-outline-variant/8 space-y-0 divide-y">
                                  <Show when={rev.displayName !== undefined}>
                                    <FieldRow
                                      label="Friendly name"
                                      value={rev.displayName}
                                      changed={changes().displayName}
                                      initial={changes().isInitial}
                                    />
                                  </Show>
                                  <Show when={rev.description !== undefined}>
                                    <FieldRow
                                      label="Description"
                                      value={rev.description}
                                      changed={changes().description}
                                      initial={changes().isInitial}
                                    />
                                  </Show>
                                  <FieldRow
                                    label="Value"
                                    value={rev.value}
                                    changed={changes().value}
                                    initial={changes().isInitial}
                                    mono
                                  />
                                </div>

                                {/* Restore action */}
                                <div class="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => props.onRestoreRevision(rev)}
                                    class="text-primary hover:text-primary-container flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 text-[12px] font-medium transition-colors"
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
                  <div class="border-outline-variant/15 mt-4 border-t pt-4">
                    <button
                      type="button"
                      onClick={() => props.onClose()}
                      class="text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest w-full cursor-pointer rounded-xl border-0 py-2.5 text-[13px] font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                }
              >
                <div class="border-outline-variant/15 mt-4 flex gap-3 border-t pt-4">
                  <button
                    data-testid="parameter-edit-cancel-button"
                    type="button"
                    onClick={() => props.onClose()}
                    class="text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest flex-1 cursor-pointer rounded-xl border-0 py-2.5 text-[13px] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="parameter-edit-save-button"
                    type="button"
                    onClick={handleSave}
                    disabled={props.isSaving || isEditInvalid()}
                    class="bg-primary text-on-primary flex-1 cursor-pointer rounded-xl border-0 py-2.5 text-[13px] font-semibold transition-all hover:brightness-110 disabled:opacity-40"
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
