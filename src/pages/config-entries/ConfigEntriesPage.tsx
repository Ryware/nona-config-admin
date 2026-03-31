import { createSignal, Show, For, createMemo } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useToast } from "../../components/ui/toast";
import { configEntryService } from "../../services/config-entry.service";
import { projectService } from "../../services/project.service";
import { environmentService } from "../../services/environment.service";
import type { CreateConfigEntryRequest } from "../../types";

const TYPE_STYLE: Record<string, string> = {
  string:  "bg-[#161b2b] border border-primary/20 text-primary",
  number:  "bg-[#162b1b] border border-[#10B981]/20 text-[#6ee7b7]",
  boolean: "bg-[#2b2216] border border-[#F59E0B]/20 text-[#fcd34d]",
  json:    "bg-[#211b2b] border border-secondary/20 text-secondary",
};

const SCOPE_STYLE: Record<string, string> = {
  global:       "bg-[#1a1f2f] border border-outline-variant/20 text-outline",
  environment:  "bg-[#161b2b] border border-primary/20 text-primary",
};

export default function ConfigEntriesPage() {
  const { setPageTitle } = usePageTitle();
  setPageTitle("Parameters");
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedProjectSlug, setSelectedProjectSlug] = createSignal("");
  const [selectedEnvId, setSelectedEnvId] = createSignal("");
  const [activeTab, setActiveTab] = createSignal<"server" | "client">("server");
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [deleteTarget, setDeleteTarget] = createSignal<string | null>(null);

  const [cfgKey, setCfgKey] = createSignal("");
  const [cfgValue, setCfgValue] = createSignal("");
  const [cfgType, setCfgType] = createSignal<"string" | "number" | "boolean" | "json">("string");
  const [cfgScope] = createSignal<"global" | "environment">("global");

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const environmentsQuery = useQuery(() => ({
    queryKey: ["environments", selectedProjectSlug()],
    queryFn: () => environmentService.getAll(selectedProjectSlug()),
    enabled: !!selectedProjectSlug(),
  }));

  const configQuery = useQuery(() => ({
    queryKey: ["config-entries-page", selectedProjectSlug(), selectedEnvId()],
    queryFn: () => configEntryService.getAll(selectedProjectSlug(), selectedEnvId()),
    enabled: !!selectedProjectSlug() && !!selectedEnvId(),
  }));

  const createMutation = useMutation(() => ({
    mutationFn: (req: CreateConfigEntryRequest) =>
      configEntryService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries-page"] });
      setShowAddForm(false);
      setCfgKey(""); setCfgValue("");
      addToast("Parameter created", "success");
    },
    onError: () => addToast("Failed to create parameter", "error"),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      configEntryService.delete(selectedProjectSlug(), selectedEnvId(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries-page"] });
      setDeleteTarget(null);
      addToast("Parameter deleted", "success");
    },
    onError: () => addToast("Failed to delete parameter", "error"),
  }));

  const handleCreate = (e: Event) => {
    e.preventDefault();
    if (!cfgKey().trim()) return;
    createMutation.mutate({
      projectSlug: selectedProjectSlug(),
      key: cfgKey().trim(),
      value: cfgValue(),
      valueType: cfgType(),
      scope: cfgScope(),
      environmentId: cfgScope() === "environment" ? selectedEnvId() : undefined,
    });
  };

  const entries = createMemo(() => configQuery.data ?? []);

  return (
    <AppLayout>
      <div class="space-y-6">

        {/* Page header */}
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <h2 class="text-4xl font-headline font-bold text-primary tracking-tight">Parameters</h2>
            <p class="text-on-surface-variant max-w-xl leading-relaxed text-sm">
              Manage configuration parameters across projects and environments.
            </p>
          </div>
          <Show when={selectedProjectSlug() && selectedEnvId()}>
            <button
              onClick={() => setShowAddForm(!showAddForm())}
              class="flex items-center gap-2 px-6 py-3 rounded font-bold text-on-primary text-[13px] transition-all active:scale-[0.98] hover:opacity-90 w-fit border-0 cursor-pointer"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span class="material-symbols-outlined text-[18px]">{showAddForm() ? "close" : "add"}</span>
              {showAddForm() ? "Cancel" : "Add Parameter"}
            </button>
          </Show>
        </div>

        {/* Sub-navigation: Server Side / Client Side tabs + env picker */}
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Tabs */}
          <nav class="flex p-1 bg-surface-container-lowest rounded border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab("server")}
              class={`px-6 py-1.5 text-xs font-bold rounded font-headline transition-all ${
                activeTab() === "server"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Server Side
            </button>
            <button
              onClick={() => setActiveTab("client")}
              class={`px-6 py-1.5 text-xs font-bold rounded font-headline transition-all ${
                activeTab() === "client"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Client Side
            </button>
          </nav>

          {/* Project selector */}
          <div class="flex flex-col gap-1">
            <span class="text-[10px] text-outline font-bold uppercase tracking-widest">Project</span>
            <div class="relative">
              <select
                value={selectedProjectSlug()}
                onChange={(e) => { setSelectedProjectSlug(e.currentTarget.value); setSelectedEnvId(""); }}
                class="bg-[#161b2b] px-3 py-2 rounded text-[13px] font-mono text-on-surface appearance-none min-w-[160px] border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">— Select project —</option>
                <For each={projectsQuery.data ?? []}>
                  {(p) => <option value={p.urlSlug}>{p.name}</option>}
                </For>
              </select>
              <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Environment selector */}
          <Show when={selectedProjectSlug()}>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] text-outline font-bold uppercase tracking-widest">Environment</span>
              <div class="relative">
                <select
                  value={selectedEnvId()}
                  onChange={(e) => setSelectedEnvId(e.currentTarget.value)}
                  class="bg-[#161b2b] px-3 py-2 rounded text-[13px] font-mono text-on-surface appearance-none min-w-[160px] border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">— Select environment —</option>
                  <For each={environmentsQuery.data ?? []}>
                    {(env) => <option value={env.id}>{env.name}</option>}
                  </For>
                </select>
                <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </Show>
        </div>

        {/* Add form */}
        <Show when={showAddForm()}>
          <form onSubmit={handleCreate} class="bg-[#161b2b] rounded p-6 border border-outline-variant/10 grid md:grid-cols-4 gap-4">
            {[
              { label: "Config Key", value: cfgKey, setter: setCfgKey, placeholder: "API_GATEWAY_URL", mono: true },
              { label: "Value", value: cfgValue, setter: setCfgValue, placeholder: "https://…", mono: false },
            ].map((field) => (
              <div class="group">
                <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value()}
                  onInput={(e) => field.setter(e.currentTarget.value)}
                  class={`w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 px-0 transition-all text-[13px] outline-none ${field.mono ? "font-mono" : ""}`}
                />
              </div>
            ))}
            <div class="group">
              <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Type</label>
              <select value={cfgType()} onChange={(e) => setCfgType(e.currentTarget.value as any)}
                class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface py-3 px-0 transition-all font-mono text-[13px] outline-none appearance-none">
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="json">json</option>
              </select>
            </div>
            <div class="flex gap-2 items-end pt-2">
              <button type="submit" disabled={createMutation.isPending}
                class="flex-1 py-3 rounded font-bold text-on-primary text-[12px] hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer"
                style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);">
                {createMutation.isPending ? "…" : "Save"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)}
                class="flex-1 py-3 rounded font-bold text-on-surface-variant text-[12px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer">
                Discard
              </button>
            </div>
          </form>
        </Show>

        {/* Empty state */}
        <Show when={!selectedProjectSlug() || !selectedEnvId()}>
          <div class="bg-[#161b2b] rounded p-16 text-center">
            <span class="material-symbols-outlined text-5xl text-outline mb-4 block">tune</span>
            <p class="text-on-surface text-base font-headline font-bold mb-1">Select a project and environment</p>
            <p class="text-on-surface-variant text-sm">Choose a project and environment above to view its parameters.</p>
          </div>
        </Show>

        {/* The Ledger — parameter table */}
        <Show when={selectedProjectSlug() && selectedEnvId()}>
          <div class="bg-[#161b2b] rounded overflow-hidden border border-outline-variant/10">
            {/* Table header bar */}
            <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <span class="text-[10px] font-bold uppercase tracking-widest text-outline">
                {entries().length} Parameter{entries().length !== 1 ? "s" : ""}
              </span>
              <span class="text-[10px] text-outline font-mono">Configuration signed by Master Key</span>
            </div>

            <Show
              when={entries().length > 0}
              fallback={
                <div class="p-12 text-center text-on-surface-variant text-sm">
                  No parameters found for this environment
                </div>
              }
            >
              <table class="w-full text-[12px]">
                <thead>
                  <tr class="border-b border-outline-variant/10">
                    <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-outline w-[40%]">Key</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline w-[10%]">Type</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Value</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline w-[12%]">Scope</th>
                    <th class="py-3 px-4 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  <For each={entries()}>
                    {(entry) => (
                      <tr class="group border-b border-outline-variant/10 hover:bg-[#1a1f2f] transition-colors">
                        <td class="py-3 px-6">
                          <span class="font-mono text-on-surface bg-primary/10 px-2 py-0.5 rounded text-[11px]">{entry.key}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${TYPE_STYLE[entry.valueType] ?? ""}`}>
                            {entry.valueType}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <span class="font-mono text-on-surface-variant text-[11px] truncate max-w-[300px] block">{entry.value}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${SCOPE_STYLE[entry.scope] ?? ""}`}>
                            {entry.scope}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setDeleteTarget(entry.id)}
                              class="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 bg-transparent border-0 cursor-pointer"
                              title="Delete"
                            >
                              <span class="material-symbols-outlined text-[16px]">delete_outline</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>

              {/* Pagination footer */}
              <div class="flex items-center justify-between px-6 py-3 border-t border-outline-variant/10">
                <span class="text-[10px] text-outline font-mono">
                  Showing 1–{entries().length} of {entries().length} parameters
                </span>
                <span class="text-[10px] text-outline font-mono">All changes logged.</span>
              </div>
            </Show>
          </div>
        </Show>

        {/* Delete confirmation */}
        <Show when={deleteTarget()}>
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-[#161b2b] rounded p-8 max-w-sm w-full mx-4 border border-error/20 shadow-2xl">
              <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-error text-[24px]">warning</span>
                <h3 class="font-headline font-bold text-on-surface">Delete Parameter?</h3>
              </div>
              <p class="text-on-surface-variant text-sm mb-6">This action cannot be undone.</p>
              <div class="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget()!)}
                  disabled={deleteMutation.isPending}
                  class="flex-1 py-2.5 rounded font-bold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-0 cursor-pointer"
                  style="background-color: #93000a;"
                >
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                  Delete Parameter
                </button>
                <button onClick={() => setDeleteTarget(null)}
                  class="flex-1 py-2.5 rounded font-bold text-sm text-on-surface-variant bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </AppLayout>
  );
}
