import { createSignal, Show, For, onMount } from "solid-js";
import { useQueryClient, useMutation, useQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { projectService } from "../../services/project.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import type { CreateProjectRequest } from "../../types";

const PROJECT_COLORS = [
  { bg: "rgba(99,102,241,0.18)",  text: "#818CF8"  },
  { bg: "rgba(16,185,129,0.18)",  text: "#34D399"  },
  { bg: "rgba(245,158,11,0.18)",  text: "#FCD34D"  },
  { bg: "rgba(239,68,68,0.18)",   text: "#F87171"  },
  { bg: "rgba(139,92,246,0.18)",  text: "#A78BFA"  },
  { bg: "rgba(59,130,246,0.18)",  text: "#60A5FA"  },
] as const;

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { setPageTitle } = usePageTitle();

    onMount(() => setPageTitle("Projects"));

    const [showCreateForm, setShowCreateForm] = createSignal(false);
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");

    const projectsQuery = useQuery(() => ({
        queryKey: ["projects"],
        queryFn: () => projectService.getAll(),
    }));

    const createProjectMutation = useMutation(() => ({
        mutationFn: (data: CreateProjectRequest) => projectService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setShowCreateForm(false);
            setName("");
            setDescription("");
            addToast("Project created successfully!", "success");
        },
        onError: (error: Error) => {
            addToast(error.message || "Failed to create project", "error");
        },
    }));

    const deleteProjectMutation = useMutation(() => ({
        mutationFn: (id: string) => projectService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            addToast("Project deleted successfully!", "success");
        },
        onError: (error: Error) => {
            addToast(error.message || "Failed to delete project", "error");
        },
    }));

    const handleCreate = (e: Event) => {
        e.preventDefault();
        createProjectMutation.mutate({ name: name(), description: description() });
    };

    return (
        <AppLayout>
            <div class="space-y-6 max-w-7xl animate-fade-in">

                {/* ── Page header ── */}
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-semibold text-white">Projects</h2>
                        <p class="text-[13px] text-[#64748B] mt-1">
                            {projectsQuery.data?.length ?? 0} project{projectsQuery.data?.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm())}
                        class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
                               text-white cursor-pointer border-0 transition-colors"
                        style="background: #6366F1;"
                        onMouseOver={(e) => (e.currentTarget.style.background = "#4F46E5")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#6366F1")}
                    >
                        <span class="text-lg leading-none">+</span>
                        {showCreateForm() ? "Cancel" : "New Project"}
                    </button>
                </div>

                {/* ── Create form ── */}
                <Show when={showCreateForm()}>
                    <div class="rounded-xl p-6 bg-[#111827] border border-white/[0.07]">
                        <h3 class="font-semibold text-white mb-5">Create New Project</h3>
                        <form onSubmit={handleCreate} class="space-y-4">
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label for="name" class="text-[13px] text-[#94A3B8]">Project Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g. My App"
                                        value={name()}
                                        onInput={(e) => setName(e.currentTarget.value)}
                                        required
                                    />
                                </div>
                                <div class="space-y-1.5">
                                    <Label for="description" class="text-[13px] text-[#94A3B8]">Description</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        placeholder="Optional description"
                                        value={description()}
                                        onInput={(e) => setDescription(e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                            <div class="flex gap-2 pt-1">
                                <Button type="submit" disabled={createProjectMutation.isPending}>
                                    {createProjectMutation.isPending ? "Creating…" : "Create Project"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Show>

                {/* ── Project grid ── */}
                <Show when={!projectsQuery.isLoading}>
                    <Show
                        when={projectsQuery.data && projectsQuery.data.length > 0}
                        fallback={
                            <div class="rounded-xl p-14 text-center bg-[#111827] border border-dashed border-white/10">
                                <div class="text-5xl mb-4">📁</div>
                                <p class="font-semibold text-white mb-1">No projects yet</p>
                                <p class="text-[13px] text-[#64748B] mb-5">Create your first project to get started</p>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    class="px-4 py-2 rounded-lg text-[13px] font-semibold text-white
                                           bg-[#6366F1] hover:bg-[#4F46E5] transition-colors border-0 cursor-pointer"
                                >
                                    + Create Project
                                </button>
                            </div>
                        }
                    >
                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <For each={projectsQuery.data}>
                                {(project, i) => {
                                    const c = PROJECT_COLORS[i() % PROJECT_COLORS.length];
                                    return (
                                        <div class="rounded-xl bg-[#111827] border border-white/[0.07]
                                                    hover:bg-white/3 transition-colors flex flex-col">
                                            {/* Card header strip */}
                                            <div class="h-1.5 rounded-t-xl" style={`background: ${c.text}`} />

                                            <div class="p-5 flex flex-col gap-4 flex-1">
                                                {/* Project identity */}
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center
                                                                text-sm font-bold shrink-0"
                                                         style={`background: ${c.bg}; color: ${c.text}`}>
                                                        {project.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div class="min-w-0">
                                                        <h3 class="font-semibold text-white truncate">{project.name}</h3>
                                                        <p class="text-[12px] text-[#64748B] truncate mt-0.5">
                                                            {project.description || "No description"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div class="flex items-center gap-2">
                                                    <span class="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                          style={`background: ${c.bg}; color: ${c.text}`}>
                                                        Active
                                                    </span>
                                                    <span class="text-[11px] text-[#475569]">
                                                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric",
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div class="flex gap-2 pt-1 border-t border-white/6">
                                                    <A href={`/projects/${project.id}`} class="flex-1">
                                                        <button class="w-full h-8 rounded-lg text-[12px] font-medium
                                                                       bg-white/5 text-[#94A3B8] hover:bg-white/10
                                                                       hover:text-white transition-colors border-0 cursor-pointer">
                                                            View Details
                                                        </button>
                                                    </A>
                                                    <button
                                                        class="h-8 px-3 rounded-lg text-[12px] font-medium
                                                               bg-red-500/10 text-red-400 hover:bg-red-500/20
                                                               transition-colors border-0 cursor-pointer"
                                                        onClick={() => {
                                                            if (confirm(`Delete "${project.name}"?`)) {
                                                                deleteProjectMutation.mutate(project.id);
                                                            }
                                                        }}
                                                        disabled={deleteProjectMutation.isPending}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </For>
                        </div>
                    </Show>
                </Show>

            </div>
        </AppLayout>
    );
}
