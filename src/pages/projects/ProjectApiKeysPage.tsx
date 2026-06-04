import { createSignal, Show, For, createMemo } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { projectService } from "../../services/project.service";
import { environmentService } from "../../services/environment.service";
import { useToast } from "../../components/ui/toast";
import { FormField } from "../../components/auth/FormField";
import { Select } from "../../components/ui/select";
import type { ApiKey, CreateApiKeyRequest, Environment } from "../../types";

const SCOPE_STYLE: Record<string, string> = {
  all: "bg-[#1a1f2f] border border-outline-variant/20 text-outline",
  client: "bg-[#161b2b] border border-primary/20 text-primary",
  server: "bg-[#162b1b] border border-[#10B981]/20 text-[#6ee7b7]",
};

const MASK_LENGTH = 48;
const VISIBLE_KEY_SUFFIX_LENGTH = 8;

const maskApiKey = (key: string) => {
  if (!key) return "*".repeat(VISIBLE_KEY_SUFFIX_LENGTH);
  return `${"*".repeat(MASK_LENGTH)}${key.slice(-VISIBLE_KEY_SUFFIX_LENGTH)}`;
};

export default function ProjectApiKeysPage() {
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const project = createMemo(() =>
    projectsQuery.data?.find((p) => p.urlSlug === params.slug)
  );

  const projectId = createMemo(() => project()?.name ?? "");

  const environmentsQuery = useQuery(() => ({
    queryKey: ["environments", project()?.urlSlug],
    queryFn: () => environmentService.getAll(projectId()),
    enabled: !!project(),
  }));

  const apiKeysQuery = useQuery(() => ({
    queryKey: ["api-keys", project()?.urlSlug],
    queryFn: () => projectService.getApiKeys(projectId()),
    enabled: !!project(),
  }));

  const [showApiKeyForm, setShowApiKeyForm] = createSignal(false);
  const [apiKeyName, setApiKeyName] = createSignal("");
  const [apiKeyEnvironment, setApiKeyEnvironment] = createSignal("");
  const [apiKeyScope, setApiKeyScope] = createSignal<"client" | "server" | "all">("client");
  const [visibleApiKeyIds, setVisibleApiKeyIds] = createSignal<Set<number>>(new Set());

  const isApiKeyVisible = (apiKeyId: number) => visibleApiKeyIds().has(apiKeyId);

  const toggleApiKeyVisibility = (apiKeyId: number) => {
    setVisibleApiKeyIds((current) => {
      const next = new Set(current);
      if (next.has(apiKeyId)) {
        next.delete(apiKeyId);
      } else {
        next.add(apiKeyId);
      }
      return next;
    });
  };

  const displayApiKey = (apiKey: ApiKey) =>
    isApiKeyVisible(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key);

  const createApiKeyMutation = useMutation(() => ({
    mutationFn: (req: CreateApiKeyRequest) => projectService.createApiKey(projectId(), req),
    onSuccess: (created) => {
      queryClient.setQueryData<ApiKey[]>(["api-keys", project()?.urlSlug], (current) => [
        ...(current ?? []),
        created,
      ]);
      setShowApiKeyForm(false);
      setApiKeyName("");
      setApiKeyEnvironment("");
      setApiKeyScope("client");
      addToast("API key generated", "success");
    },
    onError: () => addToast("Failed to generate API key", "error"),
  }));

  const deleteApiKeyMutation = useMutation(() => ({
    mutationFn: (apiKeyId: number) => projectService.deleteApiKey(projectId(), apiKeyId),
    onSuccess: (_, apiKeyId) => {
      queryClient.setQueryData<ApiKey[]>(["api-keys", project()?.urlSlug], (current) =>
        (current ?? []).filter((key) => key.id !== apiKeyId)
      );
      setVisibleApiKeyIds((current) => {
        const next = new Set(current);
        next.delete(apiKeyId);
        return next;
      });
      addToast("API key deleted", "success");
    },
    onError: () => addToast("Failed to delete API key", "error"),
  }));

  const copyApiKey = async (key: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(key);
    addToast("API key copied", "success");
  };

  return (
    <AppLayout>
      <div class="space-y-8">
        <Show when={project()} fallback={
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <h2 class="text-4xl text-start font-headline font-bold text-primary tracking-tight">API Keys</h2>
              <p class="text-on-surface-variant text-start max-w-xl leading-relaxed text-sm">
                Select a project to manage its API keys.
              </p>
            </div>
          </div>
        }>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
              <A
                href={`/projects/${project()!.urlSlug}`}
                class="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Project
              </A>
              <h2 class="text-4xl text-start font-headline font-bold text-primary tracking-tight">
                {project()!.name} API Keys
              </h2>
              <p class="text-on-surface-variant text-start max-w-xl leading-relaxed text-sm">
                Manage project-wide and environment-scoped credentials.
              </p>
            </div>
            <button
              onClick={() => setShowApiKeyForm(!showApiKeyForm())}
              class="w-fit flex items-center gap-2 px-6 py-3 rounded text-[13px] font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all active:scale-[0.98] border-0 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">{showApiKeyForm() ? "close" : "add"}</span>
              {showApiKeyForm() ? "Cancel" : "Generate API Key"}
            </button>
          </div>
        </Show>

        <Show when={showApiKeyForm()}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!apiKeyName().trim() || !project()) return;
              createApiKeyMutation.mutate({
                name: apiKeyName().trim(),
                environment: apiKeyEnvironment() || null,
                scope: apiKeyScope(),
              });
            }}
            class="bg-[#161b2b] rounded p-6 border border-outline-variant/10 grid md:grid-cols-4 gap-4"
          >
            <div class="group">
              <FormField
                id="api-key-name"
                label="Name"
                type="text"
                placeholder="web-client"
                value={apiKeyName()}
                onInput={(e) => setApiKeyName(e.currentTarget.value)}
                required
              />
            </div>
            <div class="group">
              <label for="api-key-environment" class="block text-[12px] font-medium text-start text-[#94A3B8] mb-1.5 tracking-wide">ENVIRONMENT</label>
              <Select
                id="api-key-environment"
                value={apiKeyEnvironment()}
                onChange={(e) => setApiKeyEnvironment(e.currentTarget.value)}
              >
                <option value="">Project-wide</option>
                <For each={environmentsQuery.data ?? []}>
                  {(env: Environment) => <option value={env.name}>{env.name}</option>}
                </For>
              </Select>
            </div>
            <div class="group">
              <label for="api-key-scope" class="block text-[12px] font-medium text-start text-[#94A3B8] mb-1.5 tracking-wide">SCOPE</label>
              <Select
                id="api-key-scope"
                value={apiKeyScope()}
                onChange={(e) => setApiKeyScope(e.currentTarget.value as "client" | "server" | "all")}
              >
                <option value="client">client</option>
                <option value="server">server</option>
                <option value="all">all</option>
              </Select>
            </div>
            <div class="flex gap-2 items-end">
              <button
                type="submit"
                disabled={createApiKeyMutation.isPending}
                class="flex-1 py-2.5 rounded font-bold text-on-primary text-[12px] hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer whitespace-nowrap"
                style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
              >
                {createApiKeyMutation.isPending ? "..." : "Generate"}
              </button>
              <button
                type="button"
                onClick={() => setShowApiKeyForm(false)}
                class="flex-1 py-2.5 rounded font-bold text-on-surface-variant text-[12px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Show>

        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">API Keys</p>

          <Show when={!apiKeysQuery.isLoading && (apiKeysQuery.data?.length ?? 0) === 0}>
            <div class="bg-[#161b2b] rounded p-8 text-center text-on-surface-variant text-sm">No API keys yet</div>
          </Show>

          <Show when={(apiKeysQuery.data?.length ?? 0) > 0}>
            <div class="overflow-x-auto">
              <table class="w-full text-[12px]">
                <thead>
                  <tr class="border-b border-outline-variant/15">
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Name</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Key</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Environment</th>
                    <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Scope</th>
                    <th class="py-3 px-4 w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  <For each={apiKeysQuery.data ?? []}>
                    {(apiKey) => (
                      <tr class="group border-b border-outline-variant/10 hover:bg-[#161b2b] transition-colors">
                        <td class="py-3 px-4">
                          <span class="font-bold text-on-surface">{apiKey.name}</span>
                        </td>
                        <td class="py-3 px-4 min-w-[320px]">
                          <span class="font-mono text-on-surface-variant break-all">{displayApiKey(apiKey)}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class="font-mono text-on-surface-variant">{apiKey.environment || "Project-wide"}</span>
                        </td>
                        <td class="py-3 px-4">
                          <span class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${SCOPE_STYLE[apiKey.scope] ?? ""}`}>
                            {apiKey.scope}
                          </span>
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex justify-end gap-2">
                            <button
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                              class="text-outline hover:text-primary bg-transparent border-0 cursor-pointer"
                              title={`${isApiKeyVisible(apiKey.id) ? "Hide" : "Show"} API key ${apiKey.name}`}
                            >
                              <span class="material-symbols-outlined text-[16px]">
                                {isApiKeyVisible(apiKey.id) ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                            <button
                              onClick={() => copyApiKey(apiKey.key)}
                              class="text-outline hover:text-primary bg-transparent border-0 cursor-pointer"
                              title={`Copy API key ${apiKey.name}`}
                            >
                              <span class="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                            <button
                              onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                              class="text-outline hover:text-error bg-transparent border-0 cursor-pointer"
                              title={`Delete API key ${apiKey.name}`}
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
            </div>
          </Show>
        </div>
      </div>
    </AppLayout>
  );
}
