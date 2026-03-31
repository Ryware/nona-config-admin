import { createSignal, createEffect, Show, For, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useToast } from "../../components/ui/toast";
import { userService, type UpdateUserRequest } from "../../services/user.service";
import { projectService } from "../../services/project.service";
import type { CreateUserRequest } from "../../types";

export default function UserPage() {
  const navigate = useNavigate();
  const location = useLocation<{ userId?: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { setPageTitle } = usePageTitle();

  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal<"admin" | "viewer">("viewer");
  const [selectedProjects, setSelectedProjects] = createSignal<Set<string>>(new Set());

  const userId = () => location.state?.userId;
  const isEditMode = () => !!userId();

  onMount(() => setPageTitle(isEditMode() ? "Edit Member" : "Invite Member"));

  const userQuery = useQuery(() => ({
    queryKey: ["user", userId()],
    queryFn: () => userService.getById(userId()!),
    enabled: isEditMode(),
  }));

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  createEffect(() => {
    if (userQuery.data) {
      setEmail(userQuery.data.email);
      setRole(userQuery.data.role as "admin" | "viewer");
    }
  });

  const createMutation = useMutation(() => ({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("Magic link generated — team member invited", "success");
      navigate("/users");
    },
    onError: (error: Error) => addToast(error.message || "Failed to invite member", "error"),
  }));

  const updateMutation = useMutation(() => ({
    mutationFn: (data: { id: string; updates: UpdateUserRequest }) =>
      userService.update(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId()] });
      addToast("Member updated successfully", "success");
      navigate("/users");
    },
    onError: (error: Error) => addToast(error.message || "Failed to update member", "error"),
  }));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (isEditMode()) {
      const updates: UpdateUserRequest = { email: email(), role: role() };
      if (username()) updates.username = username();
      updateMutation.mutate({ id: userId()!, updates });
    } else {
      if (!email()) { addToast("Email is required", "error"); return; }
      createMutation.mutate({ email: email(), role: role() });
    }
  };

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isPending = () => createMutation.isPending || updateMutation.isPending;

  const ROLE_CARDS = [
    {
      value: "admin" as const,
      icon: "shield_person",
      label: "Admin",
      desc: "Full access to modify projects, manage team members, and view billing logs.",
    },
    {
      value: "viewer" as const,
      icon: "visibility",
      label: "Viewer",
      desc: "Read-only access to configurations and logs. Cannot modify environment variables.",
    },
  ];

  return (
    <AppLayout>
      <div class="max-w-4xl mx-auto space-y-0">

        {/* Back button */}
        <button
          onClick={() => navigate("/users")}
          class="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors bg-transparent border-0 cursor-pointer group"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span class="text-xs font-bold uppercase tracking-wider">Back to Team Overview</span>
        </button>

        {/* Page header */}
        <div class="flex items-center gap-6 mb-12">
          <div
            class="w-16 h-16 rounded-xl flex items-center justify-center shadow-xl shrink-0"
            style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%); box-shadow: 0 20px 40px rgba(164,201,255,0.1);"
          >
            <span class="material-symbols-outlined text-on-primary text-3xl">
              {isEditMode() ? "manage_accounts" : "person_add"}
            </span>
          </div>
          <div>
            <h1 class="font-headline text-3xl font-bold tracking-tight text-on-surface">
              {isEditMode() ? "Edit Team Member" : "Invite Team Member"}
            </h1>
            <p class="text-on-surface-variant mt-1">
              {isEditMode()
                ? "Update member identity and access level across your infrastructure."
                : "Configure identity and access level for the new user across your infrastructure."}
            </p>
          </div>
        </div>

        <Show
          when={!isEditMode() || !userQuery.isLoading}
          fallback={<div class="p-12 text-center text-outline">Loading member data…</div>}
        >
          <form onSubmit={handleSubmit}>
            <div class="grid grid-cols-1 gap-10">

              {/* Step 01 — Invitee Identity */}
              <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm space-y-8">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded text-primary border border-primary/20">01</span>
                  <h3 class="font-headline font-bold text-lg text-on-surface">Invitee Identity</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="block text-[0.6875rem] font-label text-on-surface-variant uppercase tracking-wider">
                      Full Name or Alias
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={username()}
                      onInput={(e) => setUsername(e.currentTarget.value)}
                      class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:border-b-primary focus:ring-0 text-on-surface px-4 py-3 transition-all placeholder:text-outline/40 outline-none"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[0.6875rem] font-label text-on-surface-variant uppercase tracking-wider">
                      Email Address <span class="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      required
                      autofocus={!isEditMode()}
                      class="w-full bg-surface-container-highest border-none border-b-2 border-b-outline-variant/30 focus:border-b-primary focus:ring-0 text-on-surface px-4 py-3 transition-all placeholder:text-outline/40 outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Step 02 — Role Assignment */}
              <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm space-y-8">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded text-primary border border-primary/20">02</span>
                  <h3 class="font-headline font-bold text-lg text-on-surface">Role Assignment</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <For each={ROLE_CARDS}>
                    {(card) => {
                      const isSelected = () => role() === card.value;
                      return (
                        <div
                          onClick={() => setRole(card.value)}
                          class={`p-6 rounded-lg border-2 transition-all h-full cursor-pointer select-none ${
                            isSelected()
                              ? "border-primary bg-primary/5"
                              : "bg-surface-container-highest border-transparent hover:border-outline-variant/50"
                          }`}
                        >
                          <div class="flex items-start justify-between mb-4">
                            <span
                              class={`material-symbols-outlined text-2xl ${isSelected() ? "text-primary" : "text-on-surface-variant"}`}
                            >
                              {card.icon}
                            </span>
                            {/* Radio indicator */}
                            <div
                              class={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected() ? "border-primary bg-primary" : "border-outline-variant"
                              }`}
                            >
                              <Show when={isSelected()}>
                                <div class="w-2 h-2 bg-on-primary rounded-full"></div>
                              </Show>
                            </div>
                          </div>
                          <div class="font-headline font-bold text-on-surface text-lg">{card.label}</div>
                          <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </section>

              {/* Step 03 — Project Scope */}
              <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm space-y-8">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded text-primary border border-primary/20">03</span>
                  <h3 class="font-headline font-bold text-lg text-on-surface">Project Scope</h3>
                </div>
                <div class="bg-surface-container-lowest rounded-lg border border-outline-variant/10 overflow-hidden">
                  <div class="grid grid-cols-2 px-6 py-4 bg-surface-container-highest/30 border-b border-outline-variant/10 text-[0.6875rem] font-label text-outline uppercase tracking-widest">
                    <span>Active Projects</span>
                    <span class="text-right">Access Level</span>
                  </div>
                  <Show when={(projectsQuery.data?.length ?? 0) === 0}>
                    <div class="px-6 py-8 text-center text-outline text-sm">No projects found</div>
                  </Show>
                  <div class="divide-y divide-outline-variant/10">
                    <For each={projectsQuery.data ?? []}>
                      {(project) => {
                        const isGiven = () => selectedProjects().has(project.id);
                        return (
                          <div
                            class="grid grid-cols-2 px-6 py-4 items-center hover:bg-surface-container-highest/20 transition-colors cursor-pointer"
                            onClick={() => toggleProject(project.id)}
                          >
                            <div class="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isGiven()}
                                onChange={() => toggleProject(project.id)}
                                onClick={(e) => e.stopPropagation()}
                                class="w-4 h-4 bg-surface-container-highest border-outline-variant text-primary rounded-sm cursor-pointer accent-primary"
                              />
                              <span class="text-sm font-mono text-on-surface font-medium">{project.urlSlug}</span>
                            </div>
                            <div class="text-right">
                              <Show
                                when={isGiven()}
                                fallback={
                                  <span class="text-[0.625rem] px-2 py-0.5 bg-surface-variant text-outline rounded-full uppercase font-bold tracking-tighter border border-outline-variant/10">
                                    None
                                  </span>
                                }
                              >
                                <span class="text-[0.625rem] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-tighter border border-primary/20">
                                  Inherited
                                </span>
                              </Show>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </section>

              {/* Footer actions */}
              <div class="flex items-center justify-between pt-4 pb-8">
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  class="px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Cancel Invitation
                </button>
                <button
                  type="submit"
                  disabled={isPending()}
                  class="flex items-center gap-3 px-10 py-3.5 text-on-primary font-bold text-sm rounded-sm active:scale-95 transition-all shadow-lg disabled:opacity-50 border-0 cursor-pointer"
                  style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%); box-shadow: 0 4px 24px rgba(164,201,255,0.2);"
                >
                  <span>{isPending() ? "Processing…" : isEditMode() ? "Save Changes" : "Generate Magic Link"}</span>
                  <span class="material-symbols-outlined text-lg">
                    {isEditMode() ? "save" : "auto_awesome"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </Show>
      </div>
    </AppLayout>
  );
}
