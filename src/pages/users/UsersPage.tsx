import { Show, onMount, createMemo } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { createColumnHelper } from "@tanstack/solid-table";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/data-table";
import { userService } from "../../services/user.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useNavigate } from '@solidjs/router';
import type { User } from "../../types";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setPageTitle } = usePageTitle();

  onMount(() => {
    setPageTitle("Users List");
  });

  const usersQuery = useQuery(() => ({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  }));

  const deleteUserMutation = useMutation(() => ({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("User deleted successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to delete user", "error");
    },
  }));

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => <span class="font-medium text-text-primary text-right">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => <span class="text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span class="text-text-secondary">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span class="text-right block">Actions</span>,
      cell: (info) => (
        <div class="text-right">
          <Show when={info.row.original.role !== "admin"}>
            <Button
              class="text-black transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete user "${info.row.original.username}"?`)) {
                  deleteUserMutation.mutate(info.row.original.id);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              Delete
            </Button>
          </Show>
          <Button
            class="text-black transition-colors"
            onClick={() => {
              navigate('/user', {
                state: {
                  userId: info.row.original.id
                }
              })
            }}
          >
            Edit
          </Button>
        </div>
      ),
    }),
  ];

  const tableData = createMemo(() => usersQuery.data || []);

  return (
    <AppLayout>
      <div class="bg-[#070A13] p-6">
        {/* Page Header */}
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-text-primary">All Users</h2>
            <p class="text-sm text-text-secondary mt-1">
              {usersQuery.data?.length || 0} total users
            </p>
          </div>          <Button variant="default" onClick={() => navigate("/user")}>
            <span class="mr-2">+</span>
            Add user
          </Button>
        </div>

        {/* Users Table */}
        <Show
          when={!usersQuery.isLoading}
          fallback={
            <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
              <p class="text-text-secondary">Loading users...</p>
            </div>
          }
        >
          <Show
            when={usersQuery.data && usersQuery.data.length > 0}
            fallback={
              <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
                <p class="text-text-secondary">No users found. Add your first user to get started!</p>
              </div>
            }
          >
            <DataTable columns={columns} data={tableData()} />
          </Show>
        </Show>
      </div>
    </AppLayout>
  );
}
