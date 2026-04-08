import { createSignal, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { useToast } from "../../components/ui/toast";
import { projectService } from "../../services/project.service";
import { FormField } from "../../components/auth/FormField";
import { Title } from "@solidjs/meta";
import type { Project } from "../../types";

const PROJECT_ICONS = ["hub", "database", "language", "storage", "cloud", "api"];
const PROJECT_NAME_PATTERN = /^[a-zA-Z0-9-]+$/;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showCreate, setShowCreate] = createSignal(false);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [createError, setCreateError] = createSignal("");
  const [deleteTarget, setDeleteTarget] = createSignal<Project | null>(null);

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const createMutation = useMutation(() => ({
    mutationFn: (data: { name: string; description?: string }) =>
      projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setName("");
      setDescription("");
      setCreateError("");
      addToast("Project created", "success");
    },
    onError: () => addToast("Failed to create project", "error"),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (projectName: string) => projectService.delete(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteTarget(null);
      addToast("Project deleted", "success");
    },
    onError: () => addToast("Failed to delete project", "error"),
  }));

  const handleCreate = (e: Event) => {
    e.preventDefault();

    const trimmedName = name().trim();
    if (!trimmedName) {
      setCreateError("Project name is required.");
      return;
    }

    if (!PROJECT_NAME_PATTERN.test(trimmedName)) {
      setCreateError("Use only letters, numbers, and hyphens.");
      return;
    }

    setCreateError("");
    createMutation.mutate({ name: trimmedName, description: description().trim() || undefined });
  };

  return (
    <AppLayout>
      <Title>Projects | Nona Config Admin</Title>
      <div class="space-y-10">

        {/* Page header */}
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <h2 class="text-4xl text-start font-headline font-bold text-primary tracking-tight">Projects</h2>
            <p class="text-on-surface-variant text-start max-w-xl leading-relaxed text-sm">
              Manage and organize your configuration projects across environments and deployments.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate())}
            class="flex items-center gap-2 px-6 py-3 rounded font-bold text-on-primary text-[13px] transition-all active:scale-[0.98] hover:opacity-90 w-fit cursor-pointer"
            style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
          >
            <span class="material-symbols-outlined text-[18px]">{showCreate() ? "close" : "add"}</span>
            {showCreate() ? "Cancel" : "Create New Project"}
          </button>
        </div>

        {/* Create form */}
        <Show when={showCreate()}>
          <div class="bg-[#161b2b] rounded p-6 border border-outline-variant/10">
            <h3 class="text-sm font-headline font-bold text-on-surface uppercase tracking-widest mb-6">New Project</h3>
            <form onSubmit={handleCreate} class="grid md:grid-cols-2 gap-6">
              <div>
                <FormField
                  id="project-name"
                  label="Project Name *"
                  type="text"
                  placeholder="my-project"
                  value={name()}
                  onInput={(e) => {
                    setName(e.currentTarget.value);
                    if (createError()) setCreateError("");
                  }}
                  required
                />
                <p class="mt-2 text-[11px] text-outline">Use letters, numbers, and hyphens only.</p>
                <Show when={createError()}>
                  <p class="mt-2 text-[11px] font-bold text-error">{createError()}</p>
                </Show>
              </div>
              <FormField
                id="project-description"
                label="Description"
                type="text"
                placeholder="Optional description"
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
              />
              <div class="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  class="px-6 py-2.5 rounded font-bold text-on-primary text-[13px] transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
                >
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  {createMutation.isPending ? "Creating…" : "Create Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  class="px-6 py-2.5 rounded font-bold text-on-surface-variant text-[13px] bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Show>

        {/* Project grid */}
        <Show
          when={projectsQuery.isSuccess && (projectsQuery.data?.length ?? 0) > 0}
          fallback={
            <Show when={projectsQuery.isSuccess}>
              <div class="bg-[#161b2b] rounded p-16 text-center">
                <span class="material-symbols-outlined text-5xl text-outline mb-4 block">folder_open</span>
                <p class="text-on-surface text-base font-headline font-bold mb-1">No projects yet</p>
                <p class="text-on-surface-variant text-sm mb-6">Create your first project to start managing configuration.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  class="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-on-primary text-[13px] hover:opacity-90 transition-all cursor-pointer"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
                >
                  <span class="material-symbols-outlined text-[18px]">add</span>
                  Create Project
                </button>
              </div>
            </Show>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={projectsQuery.data ?? []}>
              {(project, i) => (
                <div
                  class="group bg-[#161b2b] rounded relative overflow-hidden transition-all hover:bg-[#1a1f2f] border-l-2 cursor-pointer"
                  style={i() === 0 ? "border-left-color: #a4c9ff;" : "border-left-color: rgba(96,165,250,0.4);"}
                  onClick={() => navigate(`/projects/${project.urlSlug}`)}
                >
                  {/* Watermark icon */}
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                    <span class="material-symbols-outlined text-6xl text-primary">
                      {PROJECT_ICONS[i() % PROJECT_ICONS.length]}
                    </span>
                  </div>

                  <div class="relative z-10 p-6 flex flex-col h-full">
                    <div class="flex items-start justify-between mb-4">
                      <h3 class="text-base font-headline font-bold text-on-surface leading-tight">{project.name}</h3>

                    </div>

                    <p class="text-on-surface-variant text-xs leading-relaxed flex-1 mb-4 line-clamp-3">
                      {project.description || "No description"}
                    </p>

                    <div class="flex items-center justify-between pt-4 border-t border-outline-variant/15">
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-primary-container text-[14px]">settings_ethernet</span>
                        <span class="text-[11px] font-mono text-on-surface-variant">{project.urlSlug}</span>
                      </div>
                      <div class="flex gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                          class="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 bg-transparent border-0 cursor-pointer ml-2 shrink-0"
                          title={`Delete project ${project.name}`}
                        >
                          <span class="material-symbols-outlined text-[18px]">delete_outline</span>
                        </button>
                        <div class="flex items-center gap-1.5 text-outline">
                          <span class="material-symbols-outlined text-[13px]">schedule</span>
                          <span class="text-[11px]">{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>

            {/* Add new placeholder */}
            <button
              onClick={() => setShowCreate(true)}
              class="bg-transparent border-2 border-dashed border-outline-variant/30 rounded p-6 flex flex-col items-center justify-center gap-3 text-outline hover:border-primary/40 hover:text-primary transition-all cursor-pointer min-h-[180px]"
            >
              <span class="material-symbols-outlined text-4xl">add_circle_outline</span>
              <span class="text-xs font-bold uppercase tracking-widest">New Project</span>
            </button>
          </div>
        </Show>

        {/* Delete confirmation modal */}
        <Show when={deleteTarget()}>
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-[#161b2b] rounded p-8 max-w-sm w-full mx-4 border border-outline-variant/20 shadow-2xl">
              <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-error text-[24px]">warning</span>
                <h3 class="font-headline font-bold text-on-surface">Delete Project?</h3>
              </div>
              <p class="text-on-surface-variant text-sm mb-6">
                This will permanently delete <span class="font-mono text-primary">{deleteTarget()!.name}</span> and all its configuration data.
              </p>
              <div class="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget()!.name)}
                  disabled={deleteMutation.isPending}
                  class="flex-1 py-2.5 rounded font-bold bg-red-500 text-on-error text-[13px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span class="text-white">
                    <span class="material-symbols-outlined text-[16px] text-white">delete</span>
                    {deleteMutation.isPending ? "Deleting…" : "Delete"}
                  </span>
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  class="flex-1 py-2.5 rounded font-bold text-on-surface-variant text-[13px] bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer"
                >
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
