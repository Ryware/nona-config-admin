import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createMemo, createSignal, Show } from "solid-js";
import { AppLayout } from "../../widgets/app-shell/AppLayout";
import { ConfirmDialog } from "../../shared/ui/confirm-dialog";
import { Input } from "../../shared/ui/input";
import { MIcon } from "../../shared/ui/icons";
import { useToast } from "../../shared/ui/toast";
import { projectService } from "../../entities/project/api/project.service";
import { projectKeys } from "../../entities/project/queries/keys";
import type { Project } from "../../types";
import { MSG } from "../../shared/lib/messages";
import { QueryErrorBanner } from "../../shared/ui/QueryGuard";
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
    queryKey: projectKeys.list(),
    queryFn: () => projectService.getAll(),
  }));

  const createMutation = useMutation(() => ({
    mutationFn: (data: { name: string; description?: string }) =>
      projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      setShowCreate(false);
      addToast(MSG.PROJECT_CREATED, "success");
    },
    onError: () => addToast(MSG.PROJECT_CREATE_FAILED, "error"),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (projectName: string) => projectService.delete(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      setDeleteTarget(null);
      addToast(MSG.PROJECT_DELETED, "success");
    },
    onError: () => addToast(MSG.PROJECT_DELETE_FAILED, "error"),
  }));

  const allProjects = () => projectsQuery.status === 'success' ? projectsQuery.data ?? [] : [];
  const filteredProjects = createMemo(() => {
    const q = search().toLowerCase().trim();
    if (!q) return allProjects();
    return allProjects().filter(
      (p: Project) =>
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

        {/* Error banner */}
        <Show when={projectsQuery.isError}>
          <QueryErrorBanner
            message="Failed to load projects."
            onRetry={() => projectsQuery.refetch()}
          />
        </Show>

        {/* Search bar */}
        <Show when={projectsQuery.isSuccess && allProjects().length > 0}>
          <div class="max-w-sm">
            <Input
              type="text"
              placeholder="Search projects…"
              value={search()}
              onInput={(e: any) => setSearch(e.currentTarget.value)}
              leftIcon="search"
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
