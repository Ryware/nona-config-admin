import { createSignal, Show, For, createMemo, createEffect, onMount } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { projectService } from "../../services/project.service";
import { environmentService } from "../../services/environment.service";
import { configEntryService } from "../../services/config-entry.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import type { CreateEnvironmentRequest, CreateConfigEntryRequest, Environment } from "../../types";

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

export default function ProjectPage() {
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { setPageTitle } = usePageTitle();

  onMount(() => setPageTitle("Project"));

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const project = createMemo(() =>
    projectsQuery.data?.find((p) => p.urlSlug === params.slug)
  );

  createEffect(() => {
    if (project()) setPageTitle(project()!.name);
  });

  const environmentsQuery = useQuery(() => ({
    queryKey: ["environments", project()?.urlSlug],
    queryFn: () => environmentService.getAll(project()!.urlSlug),
    enabled: !!project(),
  }));

  const [activeEnvId, setActiveEnvId] = createSignal<string>("");

  const configQuery = useQuery(() => ({
    queryKey: ["config-entries", project()?.urlSlug, activeEnvId()],
    queryFn: () => configEntryService.getAll(project()!.urlSlug, activeEnvId()),
    enabled: !!project() && !!activeEnvId(),
  }));

  // ── Create env ─────────────────────────────────────────────────────────────
  const [showEnvForm, setShowEnvForm] = createSignal(false);
  const [envName, setEnvName] = createSignal("");

  const createEnvMutation = useMutation(() => ({
    mutationFn: (req: CreateEnvironmentRequest) => environmentService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      setShowEnvForm(false);
      setEnvName("");
      addToast("Environment created", "success");
    },
    onError: () => addToast("Failed to create environment", "error"),
  }));

  const deleteEnvMutation = useMutation(() => ({
    mutationFn: ({ slug, envId }: { slug: string; envId: string }) =>
      environmentService.delete(slug, envId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      addToast("Environment deleted", "success");
    },
    onError: () => addToast("Failed to delete environment", "error"),
  }));

  // ── Create config entry ────────────────────────────────────────────────────
  const [showConfigForm, setShowConfigForm] = createSignal(false);
  const [cfgKey, setCfgKey] = createSignal("");
  const [cfgValue, setCfgValue] = createSignal("");
  const [cfgType, setCfgType] = createSignal<"string"|"number"|"boolean"|"json">("string");
  const [cfgScope] = createSignal<"global"|"environment">("global");

  const createConfigMutation = useMutation(() => ({
    mutationFn: (req: CreateConfigEntryRequest) =>
      configEntryService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      setShowConfigForm(false);
      setCfgKey(""); setCfgValue("");
      addToast("Parameter created", "success");
    },
    onError: () => addToast("Failed to create parameter", "error"),
  }));

  const deleteConfigMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      configEntryService.delete(project()!.urlSlug, activeEnvId(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      addToast("Parameter deleted", "success");
    },
    onError: () => addToast("Failed to delete parameter", "error"),
  }));

  return (
    <AppLayout>
      <div class="space-y-8">

        {/* Breadcrumb */}
        <div class="flex items-center gap-2 text-xs text-outline uppercase tracking-widest font-mono">
          <A href="/projects" class="hover:text-primary transition-colors">Projects</A>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-on-surface">{params.slug.toUpperCase()}</span>
        </div>

        {/* Header */}
        <Show when={project()} fallback={
          <div class="text-center py-20 text-outline">
            <span class="material-symbols-outlined text-5xl block mb-3">folder_open</span>
            <p>Project not found</p>
          </div>
        }>
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 class="text-3xl font-headline font-bold text-primary tracking-tight">{project()!.name}</h2>
              <p class="text-on-surface-variant text-sm mt-1">{project()!.description || "No description"}</p>
            </div>
            <div class="flex gap-3">
              <button
                onClick={() => setShowEnvForm(!showEnvForm())}
                class="flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all border-0 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">add</span>
                Add Environment
              </button>
              <button
                onClick={() => setShowConfigForm(!showConfigForm())}
                class="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-on-primary transition-all active:scale-[0.98] hover:opacity-90 border-0 cursor-pointer"
                style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
              >
                <span class="material-symbols-outlined text-[16px]">add</span>
                Add Parameter
              </button>
            </div>
          </div>
        </Show>

        {/* Environments */}
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Environments</p>
          <Show
            when={(environmentsQuery.data?.length ?? 0) > 0}
            fallback={<span class="text-on-surface-variant text-sm">No environments yet</span>}
          >
            <div class="flex flex-wrap gap-2">
              <For each={environmentsQuery.data ?? []}>
                {(env: Environment) => (
                  <div
                    class={`group flex items-center gap-2 px-3 py-1.5 rounded text-[12px] font-mono cursor-pointer transition-all ${
                      activeEnvId() === env.id
                        ? "border-l-2 border-primary bg-[#161b2b] text-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-[#161b2b] hover:text-on-surface"
                    }`}
                    onClick={() => setActiveEnvId(activeEnvId() === env.id ? "" : env.id)}
                  >
                    <span>{env.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEnvMutation.mutate({ slug: project()!.urlSlug, envId: env.id });
                      }}
                      class="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error bg-transparent border-0 cursor-pointer p-0 ml-1"
                    >
                      <span class="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Create env form */}
        <Show when={showEnvForm()}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!envName().trim() || !project()) return;
              createEnvMutation.mutate({ projectSlug: project()!.urlSlug, name: envName().trim() });
            }}
            class="bg-[#161b2b] rounded p-6 border border-outline-variant/10 flex flex-col sm:flex-row gap-4 items-start"
          >
            <div class="group flex-1">
              <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                Environment Name
              </label>
              <input
                type="text"
                placeholder="production"
                value={envName()}
                onInput={(e) => setEnvName(e.currentTarget.value)}
                required
                autofocus
                class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 px-0 transition-all font-mono text-[13px] outline-none"
              />
            </div>
            <div class="flex gap-2 pt-6">
              <button
                type="submit"
                disabled={createEnvMutation.isPending}
                class="px-4 py-2.5 rounded font-bold text-on-primary text-[12px] hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer"
                style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
              >
                {createEnvMutation.isPending ? "Creating…" : "Create"}
              </button>
              <button type="button" onClick={() => setShowEnvForm(false)}
                class="px-4 py-2.5 rounded font-bold text-on-surface-variant text-[12px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </Show>

        {/* Config entries table */}
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            Parameters
            {activeEnvId() && (
              <span class="ml-2 text-primary">
                — {environmentsQuery.data?.find((e: Environment) => e.id === activeEnvId())?.name}
              </span>
            )}
          </p>

          <Show when={!activeEnvId()}>
            <div class="bg-[#161b2b] rounded p-8 text-center text-on-surface-variant text-sm">
              Select an environment above to view its parameters
            </div>
          </Show>

          <Show when={activeEnvId() && showConfigForm()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cfgKey().trim()) return;
                createConfigMutation.mutate({
                  projectSlug: project()!.urlSlug,
                  key: cfgKey().trim(),
                  value: cfgValue().trim(),
                  valueType: cfgType(),
                  scope: cfgScope(),
                  environmentId: cfgScope() === "environment" ? activeEnvId() : undefined,
                });
              }}
              class="bg-[#161b2b] rounded p-6 border border-outline-variant/10 mb-4 grid md:grid-cols-4 gap-4"
            >
              {[
                { label: "Key", value: cfgKey, setter: setCfgKey, placeholder: "CONFIG_KEY", type: "text" },
                { label: "Value", value: cfgValue, setter: setCfgValue, placeholder: "value", type: "text" },
              ].map((field) => (
                <div class="group">
                  <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value()}
                    onInput={(e) => field.setter(e.currentTarget.value)}
                    class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 px-0 transition-all font-mono text-[13px] outline-none"
                  />
                </div>
              ))}
              <div class="group">
                <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Type</label>
                <select
                  value={cfgType()}
                  onChange={(e) => setCfgType(e.currentTarget.value as any)}
                  class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface py-3 px-0 transition-all font-mono text-[13px] outline-none appearance-none"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                </select>
              </div>
              <div class="flex gap-2 items-end">
                <button
                  type="submit"
                  disabled={createConfigMutation.isPending}
                  class="flex-1 py-2.5 rounded font-bold text-on-primary text-[12px] hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer whitespace-nowrap"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
                >
                  {createConfigMutation.isPending ? "…" : "Add"}
                </button>
                <button type="button" onClick={() => setShowConfigForm(false)}
                  class="flex-1 py-2.5 rounded font-bold text-on-surface-variant text-[12px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer">Cancel</button>
              </div>
            </form>
          </Show>

          <Show when={activeEnvId() && (configQuery.data?.length ?? 0) > 0}>
            <div class="overflow-x-auto">
              <table class="w-full text-[12px]">
                <thead>
                  <tr class="border-b border-outline-variant/15">
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Key</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Value</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Type</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Scope</th>
                    <th class="py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  <For each={configQuery.data ?? []}>
                    {(entry) => (
                      <tr class="group border-b border-outline-variant/10 hover:bg-[#161b2b] transition-colors">
                        <td class="py-3 px-4">
                          <span class="font-mono text-on-surface bg-primary/10 px-2 py-0.5 rounded text-[11px]">{entry.key}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class="font-mono text-on-surface-variant truncate max-w-[200px] block">{entry.value}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_STYLE[entry.valueType] ?? ""}`}>
                            {entry.valueType}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${SCOPE_STYLE[entry.scope] ?? ""}`}>
                            {entry.scope}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <button
                            onClick={() => deleteConfigMutation.mutate(entry.id)}
                            class="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error bg-transparent border-0 cursor-pointer"
                          >
                            <span class="material-symbols-outlined text-[16px]">delete_outline</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>

          <Show when={activeEnvId() && !configQuery.isLoading && (configQuery.data?.length ?? 0) === 0}>
            <div class="bg-[#161b2b] rounded p-8 text-center text-on-surface-variant text-sm">No parameters yet for this environment</div>
          </Show>
        </div>
      </div>
    </AppLayout>
  );
}
