import { createSignal, Show, For, onMount } from "solid-js";
import { useQueryClient, useMutation, useQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { projectService } from "../../services/project.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import type { CreateProjectRequest } from "../../types";

export default function ProjectsPage() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { setPageTitle } = usePageTitle();
    
    // Set page title on mount
    onMount(() => {
        setPageTitle("Projects");
    });
    
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
        createProjectMutation.mutate({
            name: name(),
            description: description(),
        });
    };

    return (
        <AppLayout>
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Projects</h2>
                        <p class="mt-1 text-gray-600">Manage your configuration projects</p>
                    </div>
                    <Button onClick={() => setShowCreateForm(!showCreateForm())}>
                        {showCreateForm() ? "Cancel" : "+ Create Project"}
                    </Button>
                </div>

                <Show when={showCreateForm()}>
                    <Card class="border-primary-200">
                        <CardHeader>
                            <CardTitle>Create New Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} class="space-y-4">
                                <div class="space-y-2">
                                    <Label for="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter project name"
                                        value={name()}
                                        onInput={(e) => setName(e.currentTarget.value)}
                                        required
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        placeholder="Enter project description"
                                        value={description()}
                                        onInput={(e) => setDescription(e.currentTarget.value)}
                                    />
                                </div>
                                <div class="flex gap-2">
                                    <Button type="submit" disabled={createProjectMutation.isPending}>
                                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Show>

                <Show
                    when={!projectsQuery.isLoading}
                >
                    <Show
                        when={projectsQuery.data && projectsQuery.data.length > 0}
                        fallback={
                            <Card class="border-dashed">
                                <CardContent class="py-12">
                                    <div class="text-center">
                                        <p class="text-gray-600 mb-4">
                                            No projects yet. Create your first project to get started!
                                        </p>
                                        <Button onClick={() => setShowCreateForm(true)}>
                                            + Create Your First Project
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <For each={projectsQuery.data}>
                                {(project) => (
                                    <Card class="transition-all hover:shadow-md">
                                        <CardHeader>
                                            <CardTitle class="text-lg">{project.name}</CardTitle>
                                            {project.description && (
                                                <p class="text-sm text-gray-600 mt-1">{project.description}</p>
                                            )}
                                        </CardHeader>
                                        <CardContent class="space-y-3">
                                            <div class="text-xs text-gray-500">
                                                Created {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                            <div class="flex gap-2 pt-2">
                                                <A href={`/projects/${project.id}`} class="flex-1">
                                                    <Button size="sm" variant="outline" class="w-full">
                                                        View Details
                                                    </Button>
                                                </A>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                                                            deleteProjectMutation.mutate(project.id);
                                                        }
                                                    }}
                                                    disabled={deleteProjectMutation.isPending}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </For>
                        </div>
                    </Show>
                </Show>
            </div>
        </AppLayout>
    );
}
