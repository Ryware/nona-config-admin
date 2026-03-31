import { createSignal, For, Show } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useToast } from "../../components/ui/toast";
import { environmentService } from "../../services/environment.service";
import { projectService } from "../../services/project.service";
import type { Environment } from "../../types";

export default function EnvironmentsPage() {
  const { setPageTitle } = usePageTitle();
  setPageTitle("Environments");

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedSlug, setSelectedSlug] = createSignal("");
  const [showCreate, setShowCreate] = createSignal(false);
  const [newName, setNewName] = createSignal("");
  const [deleteTarget, setDeleteTarget] = createSignal<Environment | null>(null);

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const environmentsQuery = useQuery(() => ({
    queryKey: ["environments", selectedSlug()],
    queryFn: () => environmentService.getAll(selectedSlug()),
    enabled: !!selectedSlug(),
  }));

  const createMutation = useMutation(() => ({
    mutationFn: () =>
      environmentService.create({ projectSlug: selectedSlug(), name: newName() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      setShowCreate(false);
      setNewName("");
      addToast("Environment created", "success");
    },
    onError: (err: Error) => addToast(err.message || "Failed to create environment", "error"),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (id: string) => environmentService.delete(selectedSlug(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      setDeleteTarget(null);
      addToast("Environment deleted", "success");
    },
    onError: () => addToast("Failed to delete environment", "error"),
  }));

  const handleCreate = (e: Event) => {
    e.preventDefault();
    if (!selectedSlug()) { addToast("Please select a project", "error"); return; }
    if (!newName().trim()) { addToast("Environment name is required", "error"); return; }
    createMutation.mutate();
  };

  const SLOT_COLORS = [
    "border-primary/50",
    "border-blue-400/50",
    "border-violet-400/50",
    "border-emerald-400/50",
    "border-amber-400/50",
    "border-rose-400/50",
  ];

  return (
    <AppLayout>
      <div class="space-y-8">

        {/* Header */}
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <h2 class="text-4xl font-headline font-bold text-primary tracking-tight">Environments</h2>
            <p class="text-on-surface-variant text-sm max-w-xl">
              Manage deployment environments (dev, staging, production, etc.) for each project.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate())}
            class="flex items-center gap-2 px-6 py-3 rounded font-bold text-on-primary text-[13px] hover:opacity-90 transition-all active:scale-[0.98] w-fit border-0 cursor-pointer"
            style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
          >
            <span class="material-symbols-outlined text-[18px]">{showCreate() ? "close" : "add_circle"}</span>
            {showCreate() ? "Cancel" : "New Environment"}
          </button>
        </div>

        {/* Project filter */}
        <div class="bg-[#161b2b] rounded p-5 border border-outline-variant/10 flex flex-col sm:flex-row sm:items-center gap-4">
          <label class="text-xs font-bold uppercase tracking-widest text-outline whitespace-nowrap shrink-0">
            Filter by project
          </label>
          <select
            value={selectedSlug()}
            onChange={(e) => setSelectedSlug(e.currentTarget.value)}
            class="flex-1 bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:border-b-primary text-on-surface py-2 px-0 outline-none font-mono text-[13px] cursor-pointer"
          >
            <option value="">— Select project —</option>
            <For each={projectsQuery.data ?? []}>
              {(p) => <option value={p.urlSlug}>{p.name}</option>}
            </For>
          </select>
        </div>

        {/* Create form */}
        <Show when={showCreate()}>
          <div class="bg-[#161b2b] rounded p-6 border border-outline-variant/10">
            <h3 class="text-xs font-bold uppercase tracking-widest text-outline mb-6">New Environment</h3>
            <form onSubmit={handleCreate} class="grid md:grid-cols-3 gap-6 items-end">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Project</label>
                <select
                  value={selectedSlug()}
                  onChange={(e) => setSelectedSlug(e.currentTarget.value)}
                  required
                  class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:border-b-primary text-on-surface py-3 px-0 outline-none font-mono text-[13px]"
                >
                  <option value="">Select project…</option>
                  <For each={projectsQuery.data ?? []}>
                    {(p) => <option value={p.urlSlug}>{p.name}</option>}
                  </For>
                </select>
              </div>
              <div class="group">
                <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                  Environment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. production, staging"
                  value={newName()}
                  onInput={(e) => setNewName(e.currentTarget.value)}
                  required
                  autofocus
                  class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 px-0 transition-all font-mono text-[13px] outline-none"
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  class="flex-1 py-3 rounded font-bold text-on-primary text-[13px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-0 cursor-pointer"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
                >
                  <span class="material-symbols-outlined text-[18px]">check</span>
                  {createMutation.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </Show>

        {/* Environments table */}
        <div class="bg-[#161b2b] rounded overflow-hidden border border-outline-variant/10">
          <div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
            <span class="text-sm font-headline font-bold text-on-surface">Environments</span>
            <span class="text-[10px] text-outline font-mono uppercase tracking-widest">
              {environmentsQuery.data?.length ?? 0} total
            </span>
          </div>

          <Show when={environmentsQuery.isLoading}>
            <div class="p-8 text-center text-outline text-sm">Loading…</div>
          </Show>

          <Show when={!environmentsQuery.isLoading && (environmentsQuery.data?.length ?? 0) === 0}>
            <div class="p-12 text-center">
              <span class="material-symbols-outlined text-outline text-[40px] mb-3 block">deployed_code</span>
              <p class="text-on-surface-variant text-sm mb-1">No environments yet</p>
              <p class="text-outline text-[11px]">Create your first environment to begin deploying configuration.</p>
            </div>
          </Show>

          <Show when={(environmentsQuery.data?.length ?? 0) > 0}>
            <table class="w-full text-[12px]">
              <thead>
                <tr class="border-b border-outline-variant/10">
                  <th class="text-left py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-outline">Environment</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Project</th>
                  <th class="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-outline">Created</th>
                  <th class="py-3 px-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                <For each={environmentsQuery.data ?? []}>
                  {(env: Environment, index) => (
                    <tr class="group border-b border-outline-variant/10 hover:bg-[#1a1f2f] transition-colors">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <span class={`w-1.5 rounded-full self-stretch ${SLOT_COLORS[index() % SLOT_COLORS.length]}`}></span>
                          <span class="font-mono font-semibold text-on-surface text-[13px]">{env.name}</span>
                        </div>
                      </td>
                      <td class="py-4 px-4">
                        <span class="text-on-surface-variant text-[11px]">
                          {projectsQuery.data?.find((p) => p.urlSlug === selectedSlug() || p.id === env.projectId)?.name ?? selectedSlug()}
                        </span>
                      </td>
                      <td class="py-4 px-4 text-on-surface-variant font-mono text-[11px]">
                        {new Date(env.createdAt).toLocaleDateString()}
                      </td>
                      <td class="py-4 px-4">
                        <div class="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDeleteTarget(env)}
                            class="p-1.5 rounded text-outline hover:text-error hover:bg-error-container/20 bg-transparent border-0 cursor-pointer"
                            title="Delete"
                          >
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </div>

        {/* Delete confirmation */}
        <Show when={deleteTarget()}>
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-[#161b2b] rounded p-8 max-w-sm w-full mx-4 border border-error/20 shadow-2xl">
              <div class="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded p-3 mb-6">
                <span class="material-symbols-outlined text-error text-[20px]">warning</span>
                <span class="text-xs font-bold uppercase tracking-widest text-error">Destructive Action</span>
              </div>
              <h3 class="font-headline font-bold text-on-surface mb-2">Delete Environment</h3>
              <p class="text-on-surface-variant text-sm mb-2">
                Delete <span class="font-mono font-semibold text-on-surface">{deleteTarget()?.name}</span>?
              </p>
              <p class="text-[11px] text-outline mb-6">All configuration entries in this environment will be permanently removed.</p>
              <div class="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget()!.id)}
                  disabled={deleteMutation.isPending}
                  class="flex-1 py-2.5 rounded font-bold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer"
                  style="background-color: #93000a;"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
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
