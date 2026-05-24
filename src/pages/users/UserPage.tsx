import { createSignal, createEffect, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useLocation } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { useToast } from "../../components/ui/toast";
import { userService } from "../../services/user.service";
import type { UpdateUserRequest } from "../../services/user.service";
import { projectService } from "../../services/project.service";
import type { CreateUserRequest, CreateUserResponse } from "../../types";

import { UserStepProgress } from "./components/UserStepProgress";
import { UserInviteLink } from "./components/UserInviteLink";
import { UserIdentityForm } from "./components/UserIdentityForm";
import { UserRoleSelector } from "./components/UserRoleSelector";
import { UserProjectScope } from "./components/UserProjectScope";

export default function UserPage() {
  const navigate = useNavigate();
  const location = useLocation<{ userId?: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal<"editor" | "viewer">("editor");
  const [selectedProjects, setSelectedProjects] = createSignal<Set<string>>(new Set());
  const [createdInvite, setCreatedInvite] = createSignal<CreateUserResponse | null>(null);
  const [copyFeedback, setCopyFeedback] = createSignal("");

  const userId = () => location.state?.userId;
  const isEditMode = () => !!userId();

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
      setRole(userQuery.data.role as "editor" | "viewer");
      setName(userQuery.data.name);
    }
  });

  const createMutation = useMutation(() => ({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: (response: CreateUserResponse) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreatedInvite(response);
      setCopyFeedback("");
      addToast("Invitation link generated", "success");
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
      const updates: UpdateUserRequest = { name: name(), role: role() };
      updateMutation.mutate({ id: userId()!, updates });
    } else {
      if (!name()) { addToast("Name is required", "error"); return; }
      if (!email()) { addToast("Email is required", "error"); return; }
      createMutation.mutate({ name: name(), email: email(), role: role() });
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
  const invitationUrl = () => {
    const invite = createdInvite();
    if (!invite) return "";
    return new URL(`/invite/${invite.invitationToken}`, window.location.origin).toString();
  };

  const copyInvitationUrl = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl());
      setCopyFeedback("Invitation link copied");
      addToast("Invitation link copied", "success");
    } catch {
      setCopyFeedback("Copy failed. You can still copy the URL manually.");
      addToast("Failed to copy invitation link", "error");
    }
  };

  return (
    <AppLayout>
      <Title>{(isEditMode() ? "Edit " + name() : "Invite Team Member") + " | Nona Config Admin"}</Title>
      <div class="max-w-3xl mx-auto space-y-0">

        {/* Step progress bar */}
        <Show when={!isEditMode() && !createdInvite()}>
          <UserStepProgress
            name={name()}
            email={email()}
            role={role()}
          />
        </Show>

        {/* Back button */}
        <button
          onClick={() => navigate("/users")}
          class="flex items-center gap-2 text-outline hover:text-primary mb-8 transition-colors bg-transparent border-0 cursor-pointer group text-[12px] font-medium"
        >
          <span class="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Back to Team Overview</span>
        </button>

        {/* Page header */}
        <div class="flex items-center gap-6 mb-12">
          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-primary to-primary-container shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <span class="material-symbols-outlined text-on-primary text-2xl font-bold">
              {isEditMode() ? "manage_accounts" : "person_add"}
            </span>
          </div>
          <div>
            <h1 class="font-headline text-3xl font-bold tracking-tight text-on-surface">
              {isEditMode() ? "Edit Team Member" : "Invite Team Member"}
            </h1>
            <p class="text-on-surface-variant text-sm mt-1 leading-relaxed">
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
            <div class="grid grid-cols-1 gap-8">

              <Show when={createdInvite()}>
                {(invite) => (
                  <UserInviteLink
                    email={invite().user.email}
                    invitationUrl={invitationUrl()}
                    copyFeedback={copyFeedback()}
                    onCopy={copyInvitationUrl}
                    onBack={() => navigate("/users")}
                  />
                )}
              </Show>

              {/* Step 01 — Invitee Identity */}
              <UserIdentityForm
                name={name()}
                email={email()}
                isEditMode={isEditMode()}
                onNameChange={setName}
                onEmailChange={setEmail}
              />

              {/* Step 02 — Role Assignment */}
              <UserRoleSelector
                role={role()}
                onChange={setRole}
              />

              {/* Step 03 — Project Scope */}
              <UserProjectScope
                projects={projectsQuery.data ?? []}
                selectedProjects={selectedProjects()}
                onToggleProject={toggleProject}
              />

              {/* Footer actions */}
              <div class="flex items-center justify-between pt-4 pb-8">
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  class="px-5 py-2.5 text-[13px] font-medium text-outline hover:text-on-surface transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Cancel Invitation
                </button>
                <button
                  type="submit"
                  disabled={isPending()}
                  class="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-semibold text-[13px] rounded-lg active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-50 border-0 cursor-pointer"
                >
                  <span>{isPending() ? "Processing…" : isEditMode() ? "Save Changes" : "Generate Invitation Link"}</span>
                  <span class="material-symbols-outlined text-base">
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
