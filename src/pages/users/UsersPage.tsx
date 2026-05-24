import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createMemo, createSignal } from "solid-js";
import { AppLayout } from "../../components/layout/AppLayout";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { useToast } from "../../components/ui/toast";
import { userService } from "../../services/user.service";
import type { User } from "../../types";

import { UsersFilters } from "./components/UsersFilters";
import { UsersStats } from "./components/UsersStats";
import { UsersTable } from "./components/UsersTable";

export default function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [deleteTarget, setDeleteTarget] = createSignal<User | null>(null);
  const [search, setSearch] = createSignal("");
  const [roleFilter, setRoleFilter] = createSignal("all");

  const usersQuery = useQuery(() => ({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  }));

  const deleteMutation = useMutation(() => ({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
      addToast("Team member removed", "success");
    },
    onError: () => addToast("Failed to remove team member", "error"),
  }));

  const users = () => usersQuery.data ?? [];

  const filteredUsers = createMemo(() => {
    const q = search().toLowerCase().trim();
    const role = roleFilter();
    return users().filter((u: User) => {
      const matchesRole = role === "all" || u.role === role;
      const matchesSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  });

  const adminCount = () =>
    users().filter((u: User) => u.role === "admin").length;
  const editorsCount = () =>
    users().filter((u: User) => u.role === "editor").length;
  const viewersCount = () =>
    users().filter((u: User) => u.role === "viewer").length;

  return (
    <AppLayout>
      <Title>Team Management | Nona Config Admin</Title>

      <div class="space-y-6">
        {/* Page header */}
        <div class="flex items-start sm:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
              Team
            </h2>
            <UsersStats
              totalMembers={users().length}
              editorsAdminsCount={editorsCount() + adminCount()}
              viewersCount={viewersCount()}
            />
          </div>
          <button
            onClick={() => navigate("/user")}
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary text-[13px] transition-all active:scale-[0.98] hover:brightness-105 shrink-0 cursor-pointer border-0"
          >
            <span class="material-symbols-outlined text-[17px]">person_add</span>
            Invite Member
          </button>
        </div>

        {/* Search + filter bar */}
        <UsersFilters
          search={search()}
          roleFilter={roleFilter()}
          onSearchChange={setSearch}
          onRoleFilterChange={setRoleFilter}
        />

        {/* Member Table Section */}
        <UsersTable
          isLoading={usersQuery.isLoading}
          totalUsersCount={users().length}
          filteredUsers={filteredUsers()}
          onEdit={(user) => navigate("/user", { state: { userId: user.id } })}
          onDelete={(user) => setDeleteTarget(user)}
        />
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget() !== null}
        title="Revoke Access"
        variant="danger"
        message={
          <>
            <p class="mb-1">
              Remove{" "}
              <span class="font-semibold text-on-surface">
                {deleteTarget()?.email}
              </span>{" "}
              from this instance?
            </p>
            <p class="text-[11px] text-outline font-sans">
              All active sessions and credentials will be terminated
              immediately.
            </p>
          </>
        }
        confirmLabel="Remove Member"
        cancelLabel="Cancel"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget()!.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
