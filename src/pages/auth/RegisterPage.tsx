import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { useMutation } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { Button } from "../../components/ui/button";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormField } from "../../components/auth/FormField";
import type { RegisterRequest } from "../../types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const registerMutation = useMutation(() => ({
    mutationFn: (data: RegisterRequest) => authService.register(data),
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
        setError("Registration failed. Please try again.");
      }
    },
    onError: () => {
      // Network or unexpected errors
      setError("An unexpected error occurred. Please try again.");
    },
  }));
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError("");

    if (password() !== confirmPassword()) {
      setError("Passwords do not match");
      return;
    }

    registerMutation.mutate({
      email: email(),
      password: password(),
    });
  };

  // Display local validation errors or API errors
  const displayError = error();


  const footer = (
    <>
      <Button
        type="submit"
        form="register-form"
        class="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating account..." : "Create Account"}
      </Button>
    </>
  );

  return (
    <AuthLayout>
      <AuthCard
        title="Create an Account"
        description="Get started with Nona Config"
        error={displayError}
        footer={footer}
      >
        <form id="register-form" onSubmit={handleSubmit}>
          <div class="space-y-4">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              placeholder="Choose a password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
