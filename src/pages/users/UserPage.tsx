import { createSignal, onMount, Show, createEffect } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { userService, type UpdateUserRequest } from "../../services/user.service";
import { useToast } from "../../components/ui/toast";
import { usePageTitle } from "../../contexts/PageTitleContext";
import type { CreateUserRequest } from "../../types";

export default function UserPage() {
    const navigate = useNavigate();
    const location = useLocation<{ userId?: string }>();
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { setPageTitle } = usePageTitle();

    // Form state
    const [username, setUsername] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [role, setRole] = createSignal("user");

    const userId = () => location.state?.userId;
    const isEditMode = () => !!userId();

    // Set page title
    onMount(() => {
        setPageTitle(isEditMode() ? "Edit User" : "Create User");
    });

    // Fetch user data if editing
    const userQuery = useQuery(() => ({
        queryKey: ["user", userId()],
        queryFn: () => userService.getById(userId()!),
        enabled: isEditMode(),
    }));

    // Populate form when user data loads
    createEffect(() => {
        if (userQuery.data) {
            setEmail(userQuery.data.email);
            setRole(userQuery.data.role);
            // Email and password are not returned by the API, so they remain empty
        }
    });

    // Create user mutation
    const createUserMutation = useMutation(() => ({
        mutationFn: (data: CreateUserRequest) => userService.create(data),
        onSuccess: (opt) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            addToast("User created successfully!", "success");
            navigate("/users", { state: { resetToken: opt.resetPasswordToken } });
        },
        onError: (error: Error) => {
            addToast(error.message || "Failed to create user", "error");
        },
    }));

    // Update user mutation
    const updateUserMutation = useMutation(() => ({
        mutationFn: (data: { id: string; updates: UpdateUserRequest }) =>
            userService.update(data.id, data.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", userId()] });
            addToast("User updated successfully!", "success");
            navigate("/users");
        },
        onError: (error: Error) => {
            addToast(error.message || "Failed to update user", "error");
        },
    }));

    const handleSubmit = (e: Event) => {
        e.preventDefault();

        if (isEditMode()) {
            // Update user
            const updates: UpdateUserRequest = {
                username: username(),
                role: role(),
            };

            // Only include email if it's been filled
            if (email()) {
                updates.email = email();
            }

            updateUserMutation.mutate({
                id: userId()!,
                updates,
            });
        } else {
            // Create user
            if (!email()) {
                addToast("Email is required for new users", "error");
                return;
            }
        }
    };

    const isLoading = () => createUserMutation.isPending || updateUserMutation.isPending;

    return (
        <AppLayout>
            <div class="space-y-6 max-w-lg animate-fade-in">
                {/* Page Header */}
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-semibold text-white">
                            {isEditMode() ? "Edit User" : "Create User"}
                        </h2>
                        <p class="text-[13px] text-[#64748B] mt-1">
                            {isEditMode()
                                ? "Update user information below"
                                : "Fill in the details to create a new user"}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
                        ← Back
                    </Button>
                </div>

                <Show
                    when={!isEditMode() || !userQuery.isLoading}
                    fallback={
                        <div class="rounded-xl py-12 text-center bg-[#111827] border border-white/[0.07]">
                            <p class="text-[#64748B]">Loading user data…</p>
                        </div>
                    }
                >
                    <div class="rounded-xl bg-[#111827] border border-white/[0.07] p-6">
                        <form onSubmit={handleSubmit} class="space-y-5">
                            {/* Email */}
                            <div>
                                <Label for="username">Email address</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="user@example.com"
                                    value={username()}
                                    onInput={(e) => setUsername(e.currentTarget.value)}
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <Label for="role">Role</Label>
                                <Select
                                    id="role"
                                    value={role()}
                                    onChange={(e) => setRole(e.currentTarget.value)}
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div class="flex gap-3 pt-2">
                                <Button type="submit" disabled={isLoading()}>
                                    {isLoading()
                                        ? "Saving…"
                                        : isEditMode()
                                            ? "Update User"
                                            : "Create User"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/users")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Show>
            </div>
        </AppLayout>
    );
}