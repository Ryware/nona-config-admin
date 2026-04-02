import { createSignal, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { useToast } from "../../components/ui/toast";
import { userService } from "../../services/user.service";
import type { User } from "../../types";
import { Title } from "@solidjs/meta";

// Derive initials and avatar color from role
const avatarStyle = (role: string) =>
  role === "admin"
    ? { bg: "bg-primary/10 border border-primary/20", text: "text-primary" }
    : { bg: "bg-secondary/10 border border-secondary/20", text: "text-secondary" };

const roleLabel = (role: string) =>
  role === "admin"
    ? { name: "Admin", subColor: "text-primary" }
    : { name: "Viewer", subColor: "text-slate-400" };


export default function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Action menu state
  const [openMenu, setOpenMenu] = createSignal<string | null>(null);
  const [deleteTarget, setDeleteTarget] = createSignal<User | null>(null);

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

  const editorsCount = () => users().filter((u: User) => u.role === 'editor').length;
  const viewersCount = () => users().filter((u: User) => u.role === 'viewer').length;

  return (
    <AppLayout>
      <Title>Team Management | Nona Config Admin</Title>

      <div class="space-y-8">

        {/* Hero section */}
        <section class="flex justify-between items-end">
          <div class="space-y-1">
            <h3 class="font-headline text-3xl font-bold text-start tracking-tight text-on-surface">Team Management</h3>
            <p class="text-slate-400 text-sm">Manage administrative privileges and project-level scopes for your organization.</p>
          </div>
          <button
            onClick={() => navigate("/user")}
            class="flex items-center gap-2 px-6 py-3 rounded-sm font-headline font-bold text-on-primary active:scale-95 transition-all shadow-lg shadow-primary/20 border-0 cursor-pointer"
            style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
          >
            <span class="material-symbols-outlined text-[20px]">person_add</span>
            Invite Team Member
          </button>
        </section>

        {/* Stats bar */}
        <div class="grid grid-cols-3 gap-6">
          <div class="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Members</p>
            <p class="font-headline text-3xl font-bold text-on-surface">{users().length}</p>
          </div>
          <div class="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Editors</p>
            <p class="font-headline text-3xl font-bold text-primary">{editorsCount()}</p>
          </div>
          <div class="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/10">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Viewers</p>
            <p class="font-headline text-3xl font-bold text-primary">{viewersCount()}</p>
          </div>
        </div>

        {/* Main 8/4 grid */}
        <div class="grid grid-cols-12 gap-6">

          {/* Member table — 9 cols */}
          <div class="col-span-12 lg:col-span-12 bg-surface-container-low rounded-lg p-1">
            <div>
              <table class="w-full text-left border-separate border-spacing-y-2 px-4">
                <thead>
                  <tr class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <th class="py-4 px-4">Member</th>
                    <th class="py-4 px-4">System Role</th>
                    <th class="py-4 px-4">Project Scope</th>
                    <th class="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <Show when={usersQuery.isLoading}>
                    <tr>
                      <td colspan="4" class="py-12 text-center text-slate-500 text-sm">Loading members…</td>
                    </tr>
                  </Show>
                  <Show when={!usersQuery.isLoading && users().length === 0}>
                    <tr>
                      <td colspan="4" class="py-12 text-center text-slate-500 text-sm">No team members yet</td>
                    </tr>
                  </Show>
                  <For each={users()}>
                    {(user: User) => {
                      const initials = user.email.slice(0, 2).toUpperCase();
                      const av = avatarStyle(user.role);
                      const rl = roleLabel(user.role);
                      return (
                        <tr class="bg-surface-container-high hover:bg-surface-bright transition-colors group">
                          <td class="py-4 px-4 rounded-l">
                            <div class="flex items-center gap-3">
                              <div class={`w-10 h-10 rounded-sm flex items-center justify-center font-headline font-bold text-sm shrink-0 ${av.bg} ${av.text}`}>
                                {initials}
                              </div>
                              <div>
                                <div class="font-headline font-semibold text-on-surface text-sm">{user.name}</div>
                                <div class="text-[11px] text-slate-500 font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td class="py-4 px-4">
                            <div class="flex flex-col">
                              <span class="text-sm font-medium text-on-surface capitalize">{rl.name}</span>
                            </div>
                          </td>
                          <td class="py-4 px-4">
                            <span class="text-sm text-slate-300">
                              {user.role === "admin" ? "Full Access" : "Limited Scope"}
                            </span>
                          </td>
                          <td class="py-4 px-4 text-right rounded-r relative">
                            <div class="relative inline-block">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu(openMenu() === user.id ? null : user.id);
                                }}
                                class="p-2 text-slate-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
                              >
                                <span class="material-symbols-outlined text-xl">more_vert</span>
                              </button>
                              <Show when={openMenu() === user.id}>
                                <div
                                  class="absolute right-0 top-full mt-1 bg-surface-container-high rounded border border-outline-variant/20 shadow-2xl z-10 min-w-[140px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => { setOpenMenu(null); navigate("/user", { state: { userId: user.id } }); }}
                                    class="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-colors bg-transparent border-0 cursor-pointer text-left"
                                  >
                                    <span class="material-symbols-outlined text-[16px]">edit_square</span>
                                    Edit Member
                                  </button>
                                  <button
                                    onClick={() => { setOpenMenu(null); setDeleteTarget(user); }}
                                    class="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] text-error hover:bg-error-container/20 transition-colors bg-transparent border-0 cursor-pointer text-left"
                                  >
                                    <span class="material-symbols-outlined text-[16px]">person_remove</span>
                                    Remove
                                  </button>
                                </div>
                              </Show>
                            </div>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </div>

      {/* Invite modal */}
      {/* Close menu on outside click */}
      <Show when={openMenu() !== null}>
        <div class="fixed inset-0 z-[5]" onClick={() => setOpenMenu(null)}></div>
      </Show>

      {/* Delete confirmation */}
      <Show when={deleteTarget()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div class="bg-[#161b2b] rounded p-8 max-w-sm w-full mx-4 border border-error/20 shadow-2xl">
            <div class="flex items-center gap-3 bg-error-container/20 border border-error/20 rounded p-3 mb-6">
              <span class="material-symbols-outlined text-error text-[20px]">security</span>
              <span class="text-xs font-bold uppercase tracking-widest text-error">Revoke Access</span>
            </div>
            <h3 class="font-headline font-bold text-on-surface mb-2">Remove Team Member</h3>
            <p class="text-on-surface-variant text-sm mb-2">
              Remove <span class="font-semibold text-on-surface">{deleteTarget()?.email}</span> from this instance?
            </p>
            <p class="text-[11px] text-outline mb-6">All active sessions and permissions will be terminated immediately.</p>
            <div class="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteTarget()!.id)}
                disabled={deleteMutation.isPending}
                class="flex-1 py-2.5 rounded font-bold text-sm text-white hover:opacity-90 transition-all disabled:opacity-50 border-0 cursor-pointer"
                style="background-color: #93000a;"
              >
                {deleteMutation.isPending ? "Removing…" : "Remove"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                class="flex-1 py-2.5 rounded font-bold text-sm text-on-surface-variant bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Show>
    </AppLayout>
  );
}
