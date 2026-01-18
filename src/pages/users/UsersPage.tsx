import { createSignal, Show, For } from "solid-js";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { userService } from "../../services/user.service";
import { useToast } from "../../components/ui/toast";
import type { CreateUserRequest } from "../../types";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const usersQuery = createQuery(() => ({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  }));

  const createUserMutation = createMutation(() => ({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowCreateForm(false);
      setUsername("");
      setEmail("");
      setPassword("");
      addToast("User created successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to create user", "error");
    },
  }));

  const deleteUserMutation = createMutation(() => ({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("User deleted successfully!", "success");
    },
    onError: (error: Error) => {
      addToast(error.message || "Failed to delete user", "error");
    },
  }));
  const handleCreate = (e: Event) => {
    e.preventDefault();
    createUserMutation.mutate({
      username: username(),
      email: email(),
      password: password(),
    });
  };

  return (
    <AppLayout>
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Users</h2>
            <p class="text-gray-500">Manage system users</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm())}>
            {showCreateForm() ? "Cancel" : "Create User"}
          </Button>
        </div>

        <Show when={showCreateForm()}>
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} class="space-y-4">
                <div class="space-y-2">
                  <Label for="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username()}
                    onInput={(e) => setUsername(e.currentTarget.value)}
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label for="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password()}                    onInput={(e) => setPassword(e.currentTarget.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Show>

        <Show
          when={!usersQuery.isLoading}
          fallback={<div class="text-center py-8">Loading users...</div>}
        >
          <Show
            when={usersQuery.data && usersQuery.data.length > 0}
            fallback={
              <Card>
                <CardContent class="py-8">
                  <p class="text-center text-gray-500">
                    No users yet. Create the first user to get started!
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardContent class="p-0">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <For each={usersQuery.data}>
                      {(user) => (
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm">                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Delete user "${user.username}"?`)) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                              disabled={deleteUserMutation.isPending}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </Show>
        </Show>
      </div>
    </AppLayout>
  );
}
