import { createSignal, Show, For } from "solid-js";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { environmentService } from "../../services/environment.service";
import { projectService } from "../../services/project.service";
import { useToast } from "../../components/ui/toast";
import type { CreateEnvironmentRequest } from "../../types";

export default function EnvironmentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string>("");
  const [name, setName] = createSignal("");

  const projectsQuery = createQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));
  const environmentsQuery = createQuery(() => ({
    queryKey: ["environments", selectedProjectId()],
    queryFn: () => environmentService.getAll(selectedProjectId()),
  }));

  const createEnvironmentMutation = createMutation(() => ({
    mutationFn: (data: CreateEnvironmentRequest) => environmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      setShowCreateForm(false);
      setName("");
      addToast("Environment created successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to create environment", "error");
    },
  }));

  const deleteEnvironmentMutation = createMutation(() => ({
    mutationFn: (id: string) => environmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      addToast("Environment deleted successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to delete environment", "error");
    },
  }));
  const handleCreate = (e: Event) => {
    e.preventDefault();
    
    if (!selectedProjectId()) {
      addToast("Please select a project", "error");
      return;
    }

    createEnvironmentMutation.mutate({
      projectId: selectedProjectId(),
      name: name(),
    });
  };

  return (
    <AppLayout>
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Environments</h2>
            <p class="text-gray-500">Manage project environments (dev, staging, production, etc.)</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm())}>
            {showCreateForm() ? "Cancel" : "Create Environment"}
          </Button>
        </div>

        {/* Filter by Project */}
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <Label>Filter by Project</Label>
              <select
                class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                value={selectedProjectId()}
                onChange={(e) => setSelectedProjectId(e.currentTarget.value)}
              >
                <option value="">All Projects</option>
                <For each={projectsQuery.data}>
                  {(project) => <option value={project.id}>{project.name}</option>}
                </For>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Create Form */}
        <Show when={showCreateForm()}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} class="space-y-4">
                <div class="space-y-2">
                  <Label for="project">Project *</Label>
                  <select
                    id="project"
                    class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                    value={selectedProjectId()}
                    onChange={(e) => setSelectedProjectId(e.currentTarget.value)}
                    required
                  >
                    <option value="">Select a project</option>
                    <For each={projectsQuery.data}>
                      {(project) => <option value={project.id}>{project.name}</option>}
                    </For>
                  </select>
                </div>
                <div class="space-y-2">
                  <Label for="name">Environment Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Development, Staging, Production"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    required
                  />
                </div>                <Button type="submit" disabled={createEnvironmentMutation.isPending}>
                  {createEnvironmentMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Show>

        {/* Environments Table */}
        <Show
          when={!environmentsQuery.isLoading}
          fallback={<div class="text-center py-8">Loading environments...</div>}
        >
          <Show
            when={environmentsQuery.data && environmentsQuery.data.length > 0}
            fallback={
              <Card>
                <CardContent class="py-8">
                  <p class="text-center text-gray-500">
                    No environments yet. Create your first environment to get started!
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardContent class="p-0">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <For each={environmentsQuery.data}>
                      {(environment) => {
                        const project = () => projectsQuery.data?.find(p => p.id === environment.projectId);
                        return (
                          <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {environment.name}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {project()?.name || "Unknown"}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(environment.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button
                                size="sm"
                                variant="destructive"                              onClick={() => {
                                if (confirm(`Delete environment "${environment.name}"?`)) {
                                  deleteEnvironmentMutation.mutate(environment.id);
                                }
                              }}
                              disabled={deleteEnvironmentMutation.isPending}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      }}
                    </For>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </Show>
        </Show>
      </div>
    </AppLayout>
  );
}
