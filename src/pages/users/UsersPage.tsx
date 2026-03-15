import { Show, onMount, createMemo, createSignal } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { createColumnHelper } from "@tanstack/solid-table";
import { AppLayout } from "../../components/layout/AppLayout";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { userService } from "../../services/user.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import { useNavigate } from "@solidjs/router";
import type { User, CreateUserRequest } from "../../types";

function RoleBadge(props: { role: string }) {
  const styles: Record<string, string> = {
    admin:   "background: rgba(99,102,241,0.18); color: #818CF8;",
    manager: "background: rgba(245,158,11,0.18); color: #FCD34D;",
  };
  const s = styles[props.role] ?? "background: rgba(255,255,255,0.08); color: #94A3B8;";
  return (
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={s}
    >
      {props.role}
    </span>
  );
}

const genPassword = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);

export default function UsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setPageTitle } = usePageTitle();

  onMount(() => setPageTitle("Users"));

  const [showForm, setShowForm] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [role, setRole] = createSignal("user");

  const usersQuery = useQuery(() => ({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  }));

  const createUserMutation = useMutation(() => ({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("User created successfully!", "success");
      setEmail("");
      setRole("user");
      setShowForm(false);
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to create user", "error");
    },
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
      cell: (info) => (
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);"
          >
            {info.getValue().slice(0, 2).toUpperCase()}
          </div>
          <span class="font-medium text-white text-[13px]">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: (info) => (
        <span class="text-[13px] text-[#64748B]">
          {new Date(info.getValue()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span class="text-right block text-[#64748B]">Actions</span>,
      cell: (info) => (
        <div class="flex items-center justify-end gap-2">
          <button
            class="h-8 px-3 rounded-lg text-[12px] font-medium bg-white/5 text-[#94A3B8]
                   hover:bg-white/10 hover:text-white transition-colors border-0 cursor-pointer"
            onClick={() => navigate("/user", { state: { userId: info.row.original.id } })}
          >
            Edit
          </button>
          <Show when={info.row.original.role !== "admin"}>
            <button
              class="h-8 px-3 rounded-lg text-[12px] font-medium bg-red-500/10 text-red-400
                     hover:bg-red-500/20 transition-colors border-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete user "${info.row.original.email}"?`)) {
                  deleteUserMutation.mutate(info.row.original.id);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              Delete
            </button>
          </Show>
        </div>
      ),
    }),
  ];

  const tableData = createMemo(() => usersQuery.data || []);

  const handleCreate = (e: Event) => {
    e.preventDefault();
    if (!email()) {
      addToast("Email is required", "error");
      return;
    }
    createUserMutation.mutate({ email: email(), password: genPassword(), role: role() });
  };

  return (
    <AppLayout>
      <div class="space-y-6 max-w-7xl animate-fade-in">

        {/* Page header */}
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-white">Users</h2>
            <p class="text-[13px] text-[#64748B] mt-1">
              {usersQuery.data?.length ?? 0} registered user{usersQuery.data?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} variant={showForm() ? "outline" : "default"}>
            <Show when={showForm()} fallback={<><span class="text-base leading-none mr-1.5">+</span>Add User</>}>
              Cancel
            </Show>
          </Button>
        </div>

        {/* Inline create form */}
        <Show when={showForm()}>
          <div class="rounded-xl bg-[#111827] border border-white/[0.07] p-5">
            <form onSubmit={handleCreate} class="flex flex-wrap items-end gap-4">
              <div class="flex-1 min-w-55">
                <Label for="new-email">Email address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                />
              </div>
              <div class="w-40">
                <Label for="new-role">Role</Label>
                <Select
                  id="new-role"
                  value={role()}
                  onChange={(e) => setRole(e.currentTarget.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating…" : "Create User"}
              </Button>
            </form>
          </div>
        </Show>

        {/* Table */}
        <Show
          when={!usersQuery.isLoading}
          fallback={
            <div class="rounded-xl p-12 text-center bg-[#111827] border border-white/[0.07]">
              <p class="text-[#64748B]">Loading users…</p>
            </div>
          }
        >
          <Show
            when={usersQuery.data && usersQuery.data.length > 0}
            fallback={
              <div class="rounded-xl p-14 text-center bg-[#111827] border border-dashed border-white/10">
                <div class="text-4xl mb-3">👥</div>
                <p class="font-semibold text-white mb-1">No users found</p>
                <p class="text-[13px] text-[#64748B] mb-5">Add your first user to get started</p>
                <Button onClick={() => setShowForm(true)}>+ Add User</Button>
              </div>
            }
          >
            <div class="rounded-xl overflow-hidden bg-[#111827] border border-white/[0.07]">
              <DataTable columns={columns} data={tableData()} />
            </div>
          </Show>
        </Show>

      </div>
    </AppLayout>
  );
}
