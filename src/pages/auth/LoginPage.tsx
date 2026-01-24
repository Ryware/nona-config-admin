import { createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { Button } from "../../components/ui/button";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormField } from "../../components/auth/FormField";
import type { LoginRequest } from "../../types";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal("");

    const loginMutation = useMutation(() => ({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (result) => {
            if (result.success && result.response?.token) {
                // Store the token
                localStorage.setItem("auth_token", result.response.token);
                // Navigate to dashboard
                navigate("/dashboard");
            } else if (result.error) {
                // Set the error from the API
                setError(result.error);
            } else {
                // Generic error fallback
                setError("Login failed. Please try again.");
            }
        },
        onError: () => {
            // Network or unexpected errors
            setError("An unexpected error occurred. Please try again.");
        },
    }));

    const firstTimeQuery = useQuery(() => ({
        queryKey: ["login"],
        queryFn: () => authService.firstTime(),
    }));

    // Redirect to register page if it's first time setup
    createEffect(() => {
        if (firstTimeQuery.isSuccess && firstTimeQuery.data === true) {
            navigate("/register");
        }
    });    const handleSubmit = (e: Event) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        loginMutation.mutate({
            email: email(),
            password: password(),
        });
    }; 
    const footer = (
        <div class="space-y-4 w-full">
            <Button
                type="submit"
                form="login-form"
                class="w-full pt-5"
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
        </div>
    );    return (
        <AuthLayout>
            <AuthCard
                title="Sign in to your Account"
                error={error()}
                footer={footer}
            >
                <form id="login-form" onSubmit={handleSubmit}>
                    <div class="space-y-4">
                        <FormField
                            id="email"
                            label="Email"
                            type="text"
                            placeholder="Enter your email"
                            value={email()}
                            onInput={(e) => setEmail(e.currentTarget.value)}
                            required
                            autofocus
                        />
                        <FormField
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            required
                        />
                    </div>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
