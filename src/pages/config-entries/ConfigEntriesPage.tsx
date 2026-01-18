import { createSignal, Show, For, createMemo } from "solid-js";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { configEntryService } from "../../services/config-entry.service";
import { projectService } from "../../services/project.service";
import { environmentService } from "../../services/environment.service";
import { useToast } from "../../components/ui/toast";
import type { CreateConfigEntryRequest } from "../../types";

export default function ConfigEntriesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string>("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = createSignal<string>("");
  const [key, setKey] = createSignal("");
  const [value, setValue] = createSignal("");
  const [valueType, setValueType] = createSignal<"string" | "number" | "boolean" | "json">("string");
  const [scope, setScope] = createSignal<"global" | "environment">("global");

  // Queries
  const projectsQuery = createQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const environmentsQuery = createQuery(() => ({
    queryKey: ["environments", selectedProjectId()],
    queryFn: () => environmentService.getAll(selectedProjectId()),
    enabled: !!selectedProjectId(),
  }));

  const configEntriesQuery = createQuery(() => ({
    queryKey: ["config-entries", selectedProjectId(), selectedEnvironmentId()],
    queryFn: () => configEntryService.getAll(selectedProjectId(), selectedEnvironmentId()),
  }));

  const createConfigMutation = createMutation(() => ({
    mutationFn: (data: CreateConfigEntryRequest) => configEntryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      setShowCreateForm(false);
      resetForm();
      addToast("Config entry created successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to create config entry", "error");
    },
  }));

  const deleteConfigMutation = createMutation(() => ({
    mutationFn: (id: string) => configEntryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      addToast("Config entry deleted successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to delete config entry", "error");
    },
  }));

  const resetForm = () => {
    setKey("");
    setValue("");
    setValueType("string");
    setScope("global");
    setSelectedEnvironmentId("");
  };
  const handleCreate = (e: Event) => {
    e.preventDefault();
    
    if (!selectedProjectId()) {
      addToast("Please select a project", "error");
      return;
    }

    createConfigMutation.mutate({
      projectId: selectedProjectId(),
      environmentId: scope() === "environment" ? selectedEnvironmentId() : undefined,
      key: key(),
      value: value(),
      valueType: valueType(),
      scope: scope(),
    });
  };

  const filteredEntries = createMemo(() => {
    const entries = configEntriesQuery.data || [];
    if (!selectedProjectId()) return entries;
    
    return entries.filter((entry) => {
      const projectMatch = entry.projectId === selectedProjectId();
      const envMatch = selectedEnvironmentId() 
        ? entry.environmentId === selectedEnvironmentId() 
        : true;
      return projectMatch && envMatch;
    });
  });

  return (
    <AppLayout>
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Configuration Entries</h2>
            <p class="text-gray-500">Manage configuration key-value pairs</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm())}>
            {showCreateForm() ? "Cancel" : "Create Entry"}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent class="pt-6">
            <div class="grid gap-4 md:grid-cols-2">
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
              <div class="space-y-2">
                <Label>Filter by Environment</Label>
                <select
                  class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                  value={selectedEnvironmentId()}
                  onChange={(e) => setSelectedEnvironmentId(e.currentTarget.value)}
                  disabled={!selectedProjectId()}
                >
                  <option value="">All Environments</option>
                  <For each={environmentsQuery.data}>
                    {(env) => <option value={env.id}>{env.name}</option>}
                  </For>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Form */}
        <Show when={showCreateForm()}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Config Entry</CardTitle>
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
                  <Label for="scope">Scope *</Label>
                  <select
                    id="scope"
                    class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                    value={scope()}
                    onChange={(e) => setScope(e.currentTarget.value as "global" | "environment")}
                    required
                  >
                    <option value="global">Global</option>
                    <option value="environment">Environment-specific</option>
                  </select>
                </div>

                <Show when={scope() === "environment"}>
                  <div class="space-y-2">
                    <Label for="environment">Environment *</Label>
                    <select
                      id="environment"
                      class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                      value={selectedEnvironmentId()}
                      onChange={(e) => setSelectedEnvironmentId(e.currentTarget.value)}
                      required={scope() === "environment"}
                      disabled={!selectedProjectId()}
                    >
                      <option value="">Select an environment</option>
                      <For each={environmentsQuery.data}>
                        {(env) => <option value={env.id}>{env.name}</option>}
                      </For>
                    </select>
                  </div>
                </Show>

                <div class="space-y-2">
                  <Label for="key">Key *</Label>
                  <Input
                    id="key"
                    type="text"
                    placeholder="e.g., API_URL"
                    value={key()}
                    onInput={(e) => setKey(e.currentTarget.value)}
                    required
                  />
                </div>

                <div class="space-y-2">
                  <Label for="valueType">Value Type *</Label>
                  <select
                    id="valueType"
                    class="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                    value={valueType()}
                    onChange={(e) => setValueType(e.currentTarget.value as any)}
                    required
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <Label for="value">Value *</Label>
                  <Input
                    id="value"
                    type="text"
                    placeholder={valueType() === "json" ? '{"key": "value"}' : "Enter value"}
                    value={value()}
                    onInput={(e) => setValue(e.currentTarget.value)}
                    required
                  />
                </div>                <Button type="submit" disabled={createConfigMutation.isPending}>
                  {createConfigMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Show>

        {/* Config Entries Table */}
        <Show
          when={!configEntriesQuery.isLoading}
          fallback={<div class="text-center py-8">Loading config entries...</div>}
        >
          <Show
            when={filteredEntries().length > 0}
            fallback={
              <Card>
                <CardContent class="py-8">
                  <p class="text-center text-gray-500">
                    No config entries yet. Create your first entry to get started!
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardContent class="p-0">
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Key
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Value
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Scope
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <For each={filteredEntries()}>
                        {(entry) => (
                          <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {entry.key}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                              {entry.value}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {entry.valueType}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                class={`px-2 py-1 text-xs rounded-full ${
                                  entry.scope === "global"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {entry.scope}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button
                                size="sm"
                                variant="destructive"                                onClick={() => {
                                  if (confirm(`Delete config entry "${entry.key}"?`)) {
                                    deleteConfigMutation.mutate(entry.id);
                                  }
                                }}
                                disabled={deleteConfigMutation.isPending}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Show>
        </Show>
      </div>
    </AppLayout>
  );
}
