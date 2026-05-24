import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createMemo, createSignal, Show } from "solid-js";
import { AppLayout } from "../../components/layout/AppLayout";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { Input } from "../../components/ui/input";
import { MIcon } from "../../components/ui/icons";
import { useToast } from "../../components/ui/toast";
import { projectService } from "../../services/project.service";
import type { Project } from "../../types";
import { ProjectCreateForm } from "./components/ProjectCreateForm";
import { ProjectGrid } from "./components/ProjectGrid";
import { ProjectsStats } from "./components/ProjectsStats";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showCreate, setShowCreate] = createSignal(false);
  const [deleteTarget, setDeleteTarget] = createSignal<Project | null>(null);
  const [search, setSearch] = createSignal("");

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

  const allProjects = () => projectsQuery.data ?? [];
  const filteredProjects = createMemo(() => {
    const q = search().toLowerCase().trim();
    if (!q) return allProjects();
    return allProjects().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.urlSlug.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  });

  return (
    <AppLayout>
      <Title>Projects | Nona Config Admin</Title>
      <div class="space-y-6">
        {/* Page header */}
        <div class="flex items-start sm:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
              Projects
            </h2>
            <ProjectsStats
              isSuccess={projectsQuery.isSuccess}
              projects={allProjects()}
              filteredCount={filteredProjects().length}
            />
          </div>
          <button
            onClick={() => setShowCreate(!showCreate())}
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary text-[13px] transition-all active:scale-[0.98] hover:brightness-105 shrink-0 cursor-pointer border-0"
          >
            <MIcon name={showCreate() ? "close" : "add"} class="text-[17px]" />
            {showCreate() ? "Cancel" : "New Project"}
          </button>
        </div>

        {/* Search bar */}
        <Show when={projectsQuery.isSuccess && allProjects().length > 0}>
          <div class="relative max-w-sm">
            <MIcon
              name="search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search projects…"
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
            />
          </div>
        </Show>

        {/* Create form */}
        <Show when={showCreate()}>
          <ProjectCreateForm
            onCancel={() => setShowCreate(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </Show>

        {/* Project grid */}
        <ProjectGrid
          isLoading={projectsQuery.isLoading}
          isSuccess={projectsQuery.isSuccess}
          projects={allProjects()}
          filteredProjects={filteredProjects()}
          search={search()}
          onNavigate={(slug) => navigate(`/projects/${slug}`)}
          onDeleteTarget={setDeleteTarget}
          onCreateClick={() => setShowCreate(true)}
        />

        {/* Delete confirmation modal */}
        <ConfirmDialog
          open={deleteTarget() !== null}
          title="Delete Project?"
          message={
            <span>
              This will permanently delete{" "}
              <span class="font-mono text-primary font-bold">
                {deleteTarget()?.name}
              </span>{" "}
              and all its configuration data.
            </span>
          }
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget()!.name)}
          onCancel={() => setDeleteTarget(null)}
          variant="danger"
        />
      </div>
    </AppLayout>
  );
}
