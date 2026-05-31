import { For, Show } from "solid-js";
import type { User } from "../../../types";
import { MIcon } from "../../../shared/ui/icons";

interface UsersTableProps {
  isLoading: boolean;
  totalUsersCount: number;
  filteredUsers: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onInvite?: () => void;
}

function roleMeta(role: string) {
  if (role === "admin")
    return { label: "Admin", class: "bg-primary/10 text-primary border border-primary/20", icon: "admin_panel_settings" };
  if (role === "editor")
    return { label: "Editor", class: "bg-secondary/15 text-secondary border border-secondary/20", icon: "edit" };
  return { label: "Viewer", class: "bg-surface-container-high text-outline border border-outline-variant/15", icon: "visibility" };
}

export function UsersTable(props: UsersTableProps) {
  return (
    <>
      <div class="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-outline-variant/15 bg-surface-container-lowest/50">
                <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Member</th>
                <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">System Role</th>
                <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em]">Project Scope</th>
                <th class="py-3 px-6 text-[11px] font-medium text-outline uppercase tracking-[0.05em] text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              <Show when={props.isLoading}>
                <For each={[1, 2, 3, 4, 5]}>
                  {() => (
                    <tr class="border-b border-outline-variant/10">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div class="skeleton w-9 h-9 rounded-full" />
                          <div class="space-y-1.5">
                            <div class="skeleton h-3.5 w-28 rounded" />
                            <div class="skeleton h-3 w-36 rounded" />
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-6"><div class="skeleton h-5 w-16 rounded-full" /></td>
                      <td class="py-4 px-6"><div class="skeleton h-4 w-24 rounded" /></td>
                      <td class="py-4 px-6" />
                    </tr>
                  )}
                </For>
              </Show>

              <Show when={!props.isLoading && props.filteredUsers.length === 0 && props.totalUsersCount === 0}>
                <tr>
                  <td colspan="4" class="py-16 text-center">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/5 mb-4">
                      <MIcon name="group_add" class="text-3xl text-primary/60" />
                    </div>
                    <p class="text-on-surface text-[14px] font-headline font-bold mb-1">No team members yet</p>
                    <p class="text-on-surface-variant text-[13px] mb-4">Invite your first team member to get started.</p>
                    <Show when={props.onInvite}>
                      <button
                        type="button"
                        onClick={() => props.onInvite?.()}
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary text-[13px] transition-all active:scale-[0.98] hover:brightness-105 cursor-pointer border-0"
                      >
                        <MIcon name="person_add" class="text-[17px]" />
                        Invite Member
                      </button>
                    </Show>
                  </td>
                </tr>
              </Show>

              <Show when={!props.isLoading && props.filteredUsers.length === 0 && props.totalUsersCount > 0}>
                <tr>
                  <td colspan="4" class="py-10 text-center text-on-surface-variant text-sm">
                    No members match your search
                  </td>
                </tr>
              </Show>

              <Show when={!props.isLoading}>
                <For each={props.filteredUsers}>
                  {(user: User) => {
                    const initials = user.name
                      ? user.name.slice(0, 2).toUpperCase()
                      : user.email.slice(0, 2).toUpperCase();
                    const rm = roleMeta(user.role);
                    return (
                      <tr
                        onClick={() => props.onEdit(user)}
                        class="group hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                      >
                        <td class="py-4 px-6">
                          <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
                              {initials}
                            </div>
                            <div>
                              <div class="font-headline font-semibold text-on-surface text-sm">{user.name || "Pending Invite"}</div>
                              <div class="text-[11.5px] text-outline font-mono mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td class="py-4 px-6">
                          <span class={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${rm.class}`}>
                            {rm.label}
                          </span>
                        </td>
                        <td class="py-4 px-6">
                          <div class="flex items-center gap-1.5 text-on-surface-variant text-sm">
                            <span class="material-symbols-outlined text-[16px] text-outline">
                              {user.role === "admin" ? "public" : "lock_person"}
                            </span>
                            <span>{user.role === "admin" ? "Global Access" : "Scoped Access"}</span>
                          </div>
                        </td>
                        <td class="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => props.onDelete(user)}
                            class="opacity-40 group-hover:opacity-100 focus:opacity-100 transition-opacity text-outline hover:text-error bg-transparent border-0 cursor-pointer p-1.5 rounded-lg hover:bg-error/10"
                            title={`Remove ${user.name || user.email}`}
                            aria-label={`Remove ${user.name || user.email}`}
                          >
                            <MIcon name="delete_outline" class="text-[18px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
