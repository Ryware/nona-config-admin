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
    const [username, setUsername] = createSignal("");
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
            username: username(),
            password: password(),
        });
    }; const footer = (
        <div class="space-y-4 w-full">
            <Button
                type="submit"
                form="login-form"
                class="w-full pt-5"
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>

            {/* <Button
        variant="google"
        class="w-full gap-3"
        type="button"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </Button> */}
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
                            id="username"
                            label="Username"
                            type="text"
                            placeholder="Enter your username"
                            value={username()}
                            onInput={(e) => setUsername(e.currentTarget.value)}
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
