import { createSignal, onMount, Show, createEffect } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/solid-query";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
    const [password, setPassword] = createSignal("");
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

            // Only include password if it's been changed
            if (password()) {
                updates.password = password();
            }

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
            if (!password()) {
                addToast("Password is required for new users", "error");
                return;
            }

            createUserMutation.mutate({
                email: email(),
                password: password(),
            });
        }
    };

    const isLoading = () => createUserMutation.isPending || updateUserMutation.isPending;

    return (
        <AppLayout>
            <div class="bg-[#070A13] p-6">
                {/* Page Header */}
                <div class="mb-6 flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-semibold text-text-primary text-left">
                            {isEditMode() ? "Edit User" : "Create New User"}
                        </h2>
                        <p class="text-sm text-text-secondary mt-1 mr-3">
                            {isEditMode()
                                ? "Update user information below"
                                : "Fill in the details to create a new user"}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/users")}
                        class="mb-4"
                    >
                        <span class="mr-2">←</span>
                        Back to Users
                    </Button>
                </div>
                <Show
                    when={!isEditMode() || !userQuery.isLoading}
                    fallback={
                        <div class="bg-white/5 border border-white/10 rounded-lg py-12 text-center">
                            <p class="text-text-secondary">Loading user data...</p>
                        </div>
                    }
                >
                    <div class="bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl">
                        <form onSubmit={handleSubmit} class="space-y-6 min-w-full">
                            <div class="gap-6">
                                {/* Username */}
                                <div class="space-y-2 w-full">
                                    <Label for="username" class="text-text-secondary">
                                        Email *
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={username()}
                                        onInput={(e) => setUsername(e.currentTarget.value)}
                                        required
                                    />
                                </div>

                                {/* Role */}
                                <div class="space-y-2 w-full pt-5">
                                    <Label for="role" class="text-text-secondary">
                                        Role *
                                    </Label>
                                    <select
                                        id="role"
                                        class="w-full h-10 rounded-lg border border-white/10 bg-white/5 text-text-primary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        value={role()}
                                        onChange={(e) => setRole(e.currentTarget.value)}
                                        required
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            {/* Actions */}
                            <div class="flex gap-3 pt-4">
                                <Button type="submit" disabled={isLoading()}>
                                    {isLoading()
                                        ? "Saving..."
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