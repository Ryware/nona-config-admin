import { createSignal, Show, For, createMemo, onMount } from "solid-js";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
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
      <div class="max-w-7xl animate-fade-in">
        {/* Page Header */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-white">Parameters</h2>
            <p class="text-[13px] text-[#64748B] mt-1">Manage project configuration entries</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm())}
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
                   text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-colors border-0 cursor-pointer"
          >
            <span class="text-lg leading-none">+</span>
            Add Parameter
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="parameters" class="flex-1">
          <div class="border-b border-white/[0.07] mb-6">
            <TabsList>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="personalization">Personalization</TabsTrigger>
            </TabsList>
          </div>

          {/* Parameters Tab Content */}
          <TabsContent value="parameters" class="">
            <div class="space-y-5">
              {/* Project/Environment Filters */}
              <div class="flex gap-3">
                <div class="w-64">
                  <Select
                    value={selectedProjectId()}
                    onChange={(e) => setSelectedProjectId(e.currentTarget.value)}
                  >
                    <option value="">All Projects</option>
                    <For each={projectsQuery.data}>
                      {(project) => <option value={project.id}>{project.name}</option>}
                    </For>
                  </Select>
                </div>
                <div class="w-64">
                  <Select
                    value={selectedEnvironmentId()}
                    onChange={(e) => setSelectedEnvironmentId(e.currentTarget.value)}
                    disabled={!selectedProjectId()}
                  >
                    <option value="">All Environments</option>
                    <For each={environmentsQuery.data}>
                      {(env) => <option value={env.id}>{env.name}</option>}
                    </For>
                  </Select>
                </div>
              </div>

              {/* Create Form */}
              <Show when={showCreateForm()}>
                <div class="rounded-xl bg-[#111827] border border-white/[0.07] p-6">
                  <h3 class="font-semibold text-white mb-5">Create New Parameter</h3>
                  <form onSubmit={handleCreate} class="space-y-4">
                    <div class="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label for="project">Project *</Label>
                        <Select
                          id="project"
                          value={selectedProjectId()}
                          onChange={(e) => setSelectedProjectId(e.currentTarget.value)}
                          required
                        >
                          <option value="">Select a project</option>
                          <For each={projectsQuery.data}>
                            {(project) => <option value={project.id}>{project.name}</option>}
                          </For>
                        </Select>
                      </div>

                      <div>
                        <Label for="scope">Scope *</Label>
                        <Select
                          id="scope"
                          value={scope()}
                          onChange={(e) => setScope(e.currentTarget.value as "global" | "environment")}
                          required
                        >
                          <option value="global">Global</option>
                          <option value="environment">Environment-specific</option>
                        </Select>
                      </div>
                    </div>

                    <Show when={scope() === "environment"}>
                      <div>
                        <Label for="environment">Environment *</Label>
                        <Select
                          id="environment"
                          value={selectedEnvironmentId()}
                          onChange={(e) => setSelectedEnvironmentId(e.currentTarget.value)}
                          required={scope() === "environment"}
                          disabled={!selectedProjectId()}
                        >
                          <option value="">Select an environment</option>
                          <For each={environmentsQuery.data}>
                            {(env) => <option value={env.id}>{env.name}</option>}
                          </For>
                        </Select>
                      </div>
                    </Show>

                    <div class="grid gap-4 md:grid-cols-2">
                      <div>
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

                      <div>
                        <Label for="valueType">Value Type *</Label>
                        <Select
                          id="valueType"
                          value={valueType()}
                          onChange={(e) => setValueType(e.currentTarget.value as any)}
                          required
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="json">JSON</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label for="value">Value *</Label>
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
                fallback={<div class="text-center py-12 text-[#64748B] text-[13px]">Loading parameters…</div>}
              >
                <Show
                  when={filteredEntries().length > 0}
                  fallback={
                    <div class="rounded-xl py-14 text-center bg-[#111827] border border-dashed border-white/10">
                      <div class="text-4xl mb-3">⚙️</div>
                      <p class="font-semibold text-white mb-1">No parameters yet</p>
                      <p class="text-[13px] text-[#64748B]">Create your first parameter to get started</p>
                    </div>
                  }
                >
                  <div class="rounded-xl overflow-hidden bg-[#111827] border border-white/[0.07]">
                    <table class="w-full">
                      <thead class="border-b border-white/[0.07]">
                        <tr>
                          <th class="px-5 py-3 text-left text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
                            <input type="checkbox" class="rounded" />
                          </th>
                          <th class="px-5 py-3 text-left text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Name</th>
                          <th class="px-5 py-3 text-left text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Value</th>
                          <th class="px-5 py-3 text-left text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Type</th>
                          <th class="px-5 py-3 text-left text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Scope</th>
                          <th class="px-5 py-3 text-right text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/6">
                        <For each={filteredEntries()}>
                          {(entry) => (
                            <tr class="hover:bg-white/3 transition-colors">
                              <td class="px-5 py-3.5 whitespace-nowrap">
                                <input type="checkbox" class="rounded" />
                              </td>
                              <td class="px-5 py-3.5 whitespace-nowrap">
                                <div class="text-[13px] font-medium text-white font-mono">{entry.key}</div>
                              </td>
                              <td class="px-5 py-3.5">
                                <div class="text-[13px] text-[#64748B] max-w-xs truncate">{entry.value}</div>
                              </td>
                              <td class="px-5 py-3.5 whitespace-nowrap">
                                <span class="px-2.5 py-0.5 text-[11px] rounded-full font-semibold"
                                      style="background: rgba(99,102,241,0.18); color: #818CF8;">
                                  {entry.valueType}
                                </span>
                              </td>
                              <td class="px-5 py-3.5 whitespace-nowrap">
                                <span
                                  class="px-2.5 py-0.5 text-[11px] rounded-full font-semibold"
                                  style={entry.scope === "global"
                                    ? "background: rgba(16,185,129,0.18); color: #34D399;"
                                    : "background: rgba(139,92,246,0.18); color: #A78BFA;"}
                                >
                                  {entry.scope}
                                </span>
                              </td>
                              <td class="px-5 py-3.5 whitespace-nowrap text-right">
                                <button
                                  class="h-8 px-3 rounded-lg text-[12px] font-medium bg-red-500/10 text-red-400
                                         hover:bg-red-500/20 transition-colors border-0 cursor-pointer"
                                  onClick={() => {
                                    if (confirm(`Delete parameter "${entry.key}"?`)) {
                                      deleteConfigMutation.mutate(entry.id);
                                    }
                                  }}
                                  disabled={deleteConfigMutation.isPending}
                                >
                                  Delete
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

          {/* Conditions Tab */}
          <TabsContent value="conditions">
            <div class="rounded-xl py-14 text-center bg-[#111827] border border-dashed border-white/10">
              <p class="text-[#64748B] text-[13px]">Conditions feature coming soon…</p>
            </div>
          </TabsContent>

          {/* Personalization Tab */}
          <TabsContent value="personalization">
            <div class="rounded-xl py-14 text-center bg-[#111827] border border-dashed border-white/10">
              <p class="text-[#64748B] text-[13px]">Personalization feature coming soon…</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
