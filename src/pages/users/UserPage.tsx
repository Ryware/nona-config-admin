import { Title } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, Show } from "solid-js";
import { projectService } from "../../entities/project/api/project.service";
import { projectKeys } from "../../entities/project/queries/keys";
import type { UpdateUserRequest } from "../../entities/user/api/user.service";
import { userService } from "../../entities/user/api/user.service";
import { userKeys } from "../../entities/user/queries/keys";
import { MSG } from "../../shared/lib/messages";
import { useToast } from "../../shared/ui/toast";
import type { CreateUserRequest, CreateUserResponse, ProjectAccess } from "../../types";

import { UserFormSkeleton } from "./components/UserFormSkeleton";
import { UserIdentityForm } from "./components/UserIdentityForm";
import { UserInviteLink } from "./components/UserInviteLink";
import { UserProjectScope } from "./components/UserProjectScope";
import { UserRoleSelector } from "./components/UserRoleSelector";
import { UserStepProgress } from "./components/UserStepProgress";

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
    queryKey: userKeys.detail(String(userId())),
    queryFn: () => userService.getById(userId()!),
    enabled: isEditMode()
  }));

  const projectsQuery = useQuery(() => ({
    queryKey: projectKeys.list(),
    queryFn: () => projectService.getAll()
  }));

  createEffect(() => {
    if (userQuery.data) {
      setEmail(userQuery.data.email);
      setRole(userQuery.data.role as "editor" | "viewer");
      setName(userQuery.data.name);
      setSelectedProjects(
        new Set<string>((userQuery.data.projects ?? []).map((p: ProjectAccess) => p.projectName))
      );
    }
  });

  const createMutation = useMutation(() => ({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: async (response: CreateUserResponse) => {
      // Assign selected projects to the newly created user
      const newUserId = String(response.user.id);
      const defaultRole = role();
      const projectsToAdd = [...selectedProjects()];
      if (projectsToAdd.length > 0) {
        await Promise.allSettled(
          projectsToAdd.map(slug => userService.addProject(newUserId, slug, defaultRole))
        );
      }
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      setCreatedInvite(response);
      setCopyFeedback("");
      addToast(MSG.INVITE_GENERATED, "success");
    },
    onError: (error: Error) => addToast(error.message || "Failed to invite member", "error")
  }));

  const updateMutation = useMutation(() => ({
    mutationFn: (data: { id: string; updates: UpdateUserRequest }) =>
      userService.update(data.id, data.updates),
    onSuccess: async () => {
      // Sync project scope changes
      const originalProjects = new Set<string>(
        (userQuery.data?.projects ?? []).map((p: ProjectAccess) => p.projectName)
      );
      const current = selectedProjects();
      const defaultRole = userQuery.data?.scope ?? "viewer";
      const toAdd = [...current].filter(s => !originalProjects.has(s));
      const toRemove = [...originalProjects].filter(s => !current.has(s));
      await Promise.allSettled([
        ...toAdd.map(slug => userService.addProject(userId()!, slug, defaultRole)),
        ...toRemove.map(slug => userService.removeProject(userId()!, slug))
      ]);
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(String(userId())) });
      addToast(MSG.MEMBER_UPDATED, "success");
      navigate("/users");
    },
    onError: (error: Error) => addToast(error.message || "Failed to update member", "error")
  }));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (isEditMode()) {
      const updates: UpdateUserRequest = { name: name(), role: role() };
      updateMutation.mutate({ id: userId()!, updates });
    } else {
      if (!name()) {
        addToast(MSG.NAME_REQUIRED, "error");
        return;
      }
      if (!email()) {
        addToast(MSG.EMAIL_REQUIRED, "error");
        return;
      }
      createMutation.mutate({ name: name(), email: email(), role: role() });
    }
  };

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      addToast(MSG.INVITE_COPIED, "success");
    } catch {
      setCopyFeedback("Copy failed. You can still copy the URL manually.");
      addToast(MSG.INVITE_COPY_FAILED, "error");
    }
  };

  return (
    <>
      <Title>
        {(isEditMode() ? "Edit " + name() : "Invite Team Member") + " | Nona Config Admin"}
      </Title>
      <div class="mx-auto max-w-3xl space-y-0">
        {/* Step progress bar */}
        <Show when={!isEditMode() && !createdInvite()}>
          <UserStepProgress name={name()} email={email()} role={role()} />
        </Show>

        {/* Back button */}
        <button
          onClick={() => navigate("/users")}
          class="text-outline hover:text-primary group mb-8 flex cursor-pointer items-center gap-2 border-0 bg-transparent text-[12px] font-medium transition-colors"
        >
          <span class="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          <span>Back to Team Overview</span>
        </button>

        {/* Page header */}
        <div class="mb-12 flex items-center gap-6">
          <div class="from-primary to-primary-container flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <span class="material-symbols-outlined text-on-primary text-2xl font-bold">
              {isEditMode() ? "manage_accounts" : "person_add"}
            </span>
          </div>
          <div>
            <h1 class="font-headline text-on-surface text-3xl font-bold tracking-tight">
              {isEditMode() ? "Edit Team Member" : "Invite Team Member"}
            </h1>
            <p class="text-on-surface-variant mt-1 text-sm leading-relaxed">
              {isEditMode()
                ? "Update member identity and access level across your infrastructure."
                : "Configure identity and access level for the new user across your infrastructure."}
            </p>
          </div>
        </div>

        <Show when={!isEditMode() || !userQuery.isLoading} fallback={<UserFormSkeleton />}>
          <form onSubmit={handleSubmit}>
            <div class="grid grid-cols-1 gap-8">
              <Show when={createdInvite()}>
                {invite => (
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
              <UserRoleSelector role={role()} onChange={setRole} />

              {/* Step 03 — Project Scope */}
              <UserProjectScope
                projects={projectsQuery.status === "success" ? (projectsQuery.data ?? []) : []}
                selectedProjects={selectedProjects()}
                onToggleProject={toggleProject}
              />

              {/* Footer actions */}
              <div class="flex items-center justify-between pt-4 pb-8">
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  class="text-outline hover:text-on-surface cursor-pointer border-0 bg-transparent px-5 py-2.5 text-[13px] font-medium transition-colors"
                >
                  Cancel Invitation
                </button>
                <button
                  type="submit"
                  disabled={isPending()}
                  class="bg-primary text-on-primary flex cursor-pointer items-center gap-2 rounded-lg border-0 px-6 py-2.5 text-[13px] font-semibold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>
                    {isPending()
                      ? "Processing…"
                      : isEditMode()
                        ? "Save Changes"
                        : "Generate Invitation Link"}
                  </span>
                  <span class="material-symbols-outlined text-base">
                    {isEditMode() ? "save" : "auto_awesome"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </Show>
      </div>
    </>
  );
}
