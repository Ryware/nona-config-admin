import { createSignal, Show, For, createMemo, onMount } from "solid-js";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { configEntryService } from "../../services/config-entry.service";
import { projectService } from "../../services/project.service";
import { environmentService } from "../../services/environment.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import type { CreateConfigEntryRequest } from "../../types";

export default function ConfigEntriesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { setPageTitle } = usePageTitle();
  
  // Set page title on mount
  onMount(() => {
    setPageTitle("Parameters");
  });
  
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
      <div class="bg-[#070A13]">
        {/* Page Header */}
        <div class="px-6 py-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-text-primary">Parameters</h1>
            </div>
            <div class="flex items-center gap-3">
              <Button variant="outline" class="text-text-secondary">
                <span class="mr-2">📋</span>
                Filter
              </Button>
              <Button onClick={() => setShowCreateForm(!showCreateForm())}>
                <span class="mr-2">+</span>
                Add parameter
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="parameters" class="flex-1">
          <div class="px-6 border-b border-white/10">
            <TabsList>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="personalization">Personalization</TabsTrigger>
            </TabsList>
          </div>

          {/* Parameters Tab Content */}
          <TabsContent value="parameters" class="p-6">
            <div class="space-y-4">
              {/* Project/Environment Filters */}
              <div class="flex gap-4">
                <div class="w-64">
                  <select
                    class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={selectedProjectId()}
                    onChange={(e) => setSelectedProjectId(e.currentTarget.value)}
                  >
                    <option value="">All Projects</option>
                    <For each={projectsQuery.data}>
                      {(project) => <option value={project.id}>{project.name}</option>}
                    </For>
                  </select>
                </div>
                <div class="w-64">
                  <select
                    class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
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

              {/* Create Form */}
              <Show when={showCreateForm()}>
                <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 class="text-lg font-semibold text-text-primary mb-4">Create New Parameter</h3>
                  <form onSubmit={handleCreate} class="space-y-4">
                    <div class="grid gap-4 md:grid-cols-2">
                      <div class="space-y-2">
                        <Label for="project" class="text-text-secondary">Project *</Label>
                        <select
                          id="project"
                          class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm"
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
                        <Label for="scope" class="text-text-secondary">Scope *</Label>
                        <select
                          id="scope"
                          class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm"
                          value={scope()}
                          onChange={(e) => setScope(e.currentTarget.value as "global" | "environment")}
                          required
                        >
                          <option value="global">Global</option>
                          <option value="environment">Environment-specific</option>
                        </select>
                      </div>
                    </div>

                    <Show when={scope() === "environment"}>
                      <div class="space-y-2">
                        <Label for="environment" class="text-text-secondary">Environment *</Label>
                        <select
                          id="environment"
                          class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm"
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

                    <div class="grid gap-4 md:grid-cols-2">
                      <div class="space-y-2">
                        <Label for="key" class="text-text-secondary">Key *</Label>
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
                        <Label for="valueType" class="text-text-secondary">Value Type *</Label>
                        <select
                          id="valueType"
                          class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm"
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
                    </div>

                    <div class="space-y-2">
                      <Label for="value" class="text-text-secondary">Value *</Label>
                      <Input
                        id="value"
                        type="text"
                        placeholder={valueType() === "json" ? '{"key": "value"}' : "Enter value"}
                        value={value()}
                        onInput={(e) => setValue(e.currentTarget.value)}
                        required
                      />
                    </div>

                    <div class="flex gap-3">
                      <Button type="submit" disabled={createConfigMutation.isPending}>
                        {createConfigMutation.isPending ? "Creating..." : "Create Parameter"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </Show>

              {/* Parameters Table */}
              <Show
                when={!configEntriesQuery.isLoading}
                fallback={<div class="text-center py-12 text-text-secondary">Loading parameters...</div>}
              >
                <Show
                  when={filteredEntries().length > 0}
                  fallback={
                    <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
                      <p class="text-text-secondary">
                        No parameters yet. Create your first parameter to get started!
                      </p>
                    </div>
                  }
                >
                  <div class="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <table class="w-full">
                      <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            <input type="checkbox" class="rounded" />
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Name
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Value
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Type
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Scope
                          </th>
                          <th class="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/10">
                        <For each={filteredEntries()}>
                          {(entry) => (
                            <tr class="hover:bg-white/5 transition-colors">
                              <td class="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" class="rounded" />
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-text-primary">{entry.key}</div>
                              </td>
                              <td class="px-6 py-4">
                                <div class="text-sm text-text-secondary max-w-md truncate">{entry.value}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full bg-brand-blue/20 text-brand-blue">
                                  {entry.valueType}
                                </span>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <span
                                  class={`px-2 py-1 text-xs rounded-full ${
                                    entry.scope === "global"
                                      ? "bg-brand-green/20 text-brand-green"
                                      : "bg-purple-500/20 text-purple-400"
                                  }`}
                                >
                                  {entry.scope}
                                </span>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  class="text-text-secondary hover:text-red-400 transition-colors"
                                  onClick={() => {
                                    if (confirm(`Delete parameter "${entry.key}"?`)) {
                                      deleteConfigMutation.mutate(entry.id);
                                    }
                                  }}
                                  disabled={deleteConfigMutation.isPending}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>
              </Show>
            </div>
          </TabsContent>

          {/* Conditions Tab Content */}
          <TabsContent value="conditions" class="p-6">
            <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
              <p class="text-text-secondary">Conditions feature coming soon...</p>
            </div>
          </TabsContent>

          {/* Personalization Tab Content */}
          <TabsContent value="personalization" class="p-6">
            <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
              <p class="text-text-secondary">Personalization feature coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
