import { createSignal, For, Show } from "solid-js";
import type { User } from "../../../types";
import { MIcon } from "../../../components/ui/icons";

interface UsersTableProps {
  isLoading: boolean;
  totalUsersCount: number;
  filteredUsers: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function roleMeta(role: string) {
  if (role === "admin")
    return { label: "Admin", class: "bg-primary/10 text-primary border border-primary/20", icon: "admin_panel_settings" };
  if (role === "editor")
    return { label: "Editor", class: "bg-secondary/15 text-secondary border border-secondary/20", icon: "edit" };
  return { label: "Viewer", class: "bg-surface-container-high text-outline border border-outline-variant/15", icon: "visibility" };
}

export function UsersTable(props: UsersTableProps) {
  const [actionUser, setActionUser] = createSignal<User | null>(null);

  const closeModal = () => setActionUser(null);

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
                  <td colspan="4" class="py-16 text-center text-on-surface-variant text-sm">No team members yet</td>
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
                      <tr class="hover:bg-surface-container-high/40 transition-colors group">
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
                        <td class="py-4 px-6 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionUser(user); }}
                            aria-label="More options"
                            class="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center rounded-lg ml-auto opacity-0 group-hover:opacity-100"
                          >
                            <span class="material-symbols-outlined text-lg">more_vert</span>
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

      {/* ── Action Modal ── */}
      <Show when={actionUser()}>
        {(() => {
          const user = actionUser()!;
          const initials = user.name
            ? user.name.slice(0, 2).toUpperCase()
            : user.email.slice(0, 2).toUpperCase();
          const rm = roleMeta(user.role);

          return (
            <>
              {/* Backdrop */}
              <div
                onClick={closeModal}
                class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              />

              {/* Modal */}
              <div class="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                <div
                  class="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header — member card */}
                  <div class="p-5 border-b border-outline-variant/10 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3.5">
                      <div class="w-11 h-11 rounded-full flex items-center justify-center font-headline font-bold text-sm bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {initials}
                      </div>
                      <div class="min-w-0">
                        <div class="font-headline font-bold text-on-surface text-[14px] leading-tight truncate">
                          {user.name || "Pending Invite"}
                        </div>
                        <div class="text-[11px] text-outline font-mono mt-0.5 truncate">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      class="w-7 h-7 flex items-center justify-center text-outline hover:text-on-surface bg-transparent border-0 cursor-pointer rounded-lg hover:bg-surface-container-high transition-all shrink-0"
                      aria-label="Close"
                    >
                      <MIcon name="close" class="text-[16px]" />
                    </button>
                  </div>

                  {/* Role + Scope info */}
                  <div class="px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <MIcon name={rm.icon} class="text-[15px] text-outline" />
                      <span class="text-[12px] text-outline-variant">Role</span>
                    </div>
                    <span class={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${rm.class}`}>
                      {rm.label}
                    </span>
                  </div>
                  <div class="px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <MIcon name={user.role === "admin" ? "public" : "lock_person"} class="text-[15px] text-outline" />
                      <span class="text-[12px] text-outline-variant">Project Scope</span>
                    </div>
                    <span class="text-[12px] text-on-surface font-medium">
                      {user.role === "admin" ? "Global Access" : "Scoped Access"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div class="p-3 space-y-1">
                    <button
                      onClick={() => {
                        closeModal();
                        props.onEdit(user);
                      }}
                      class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] text-on-surface hover:bg-primary/8 hover:text-primary transition-colors bg-transparent border-0 cursor-pointer text-left font-medium"
                    >
                      <MIcon name="edit" class="text-[17px] text-outline shrink-0" />
                      <div>
                        <div class="font-semibold">Edit Member</div>
                        <div class="text-[10.5px] text-outline font-normal mt-0.5">Change role, permissions and details</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        closeModal();
                        props.onDelete(user);
                      }}
                      class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] text-error hover:bg-error/8 transition-colors bg-transparent border-0 cursor-pointer text-left font-medium"
                    >
                      <MIcon name="person_remove" class="text-[17px] shrink-0" />
                      <div>
                        <div class="font-semibold">Remove Member</div>
                        <div class="text-[10.5px] text-error/60 font-normal mt-0.5">Revoke all access immediately</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </Show>
    </>
  );
}
