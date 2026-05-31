import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { useMutation } from "@tanstack/solid-query";
import { authService } from "../../entities/auth/api/auth.service";
import { authStore } from "../../entities/auth/model/store";
import { AuthLayout } from "../../widgets/auth-shell/AuthLayout";
import { AuthCard } from "../../widgets/auth-shell/AuthCard";
import { FormField } from "../../widgets/auth-shell/FormField";
import { PasswordStrengthMeter } from "../../widgets/auth-shell/PasswordStrengthMeter";
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
        authStore.saveSession(
          result.response.token,
          { email: email(), role: result.response.role },
        );
        navigate("/projects");
      } else if (result.error) {
        setError(result.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    },
    onError: () => {
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
    registerMutation.mutate({ email: email(), password: password() });
  };

  return (
    <AuthLayout>
      <AuthCard title="Admin Registration" description="Initialize the root administrator account" error={error()}>
        <form onSubmit={handleSubmit} class="space-y-5">
          <FormField
            id="reg-username"
            label="System Username"
            type="text"
            placeholder="admin@nona.dev"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            autofocus
            leftIcon="alternate_email"
          />

          <div class="space-y-1.5">
            <FormField
              id="reg-password"
              label="Root Password"
              type="password"
              placeholder="••••••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              leftIcon="key"
            />
            <PasswordStrengthMeter password={password()} />
          </div>

          <FormField
            id="reg-confirm-password"
            label="Verify Password"
            type="password"
            placeholder="••••••••••••"
            value={confirmPassword()}
            onInput={(e) => setConfirmPassword(e.currentTarget.value)}
            required
            leftIcon="shield_lock"
          />

          <div class="pt-2">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              class="w-full py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary text-[13px] hover:brightness-105 border-0 cursor-pointer"
            >
              <span>{registerMutation.isPending ? "Creating account…" : "Create Account"}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </button>
          </div>
        </form>

        <div class="mt-5 text-center text-[12px] text-on-surface-variant">
          Already have an account?{" "}
          <A href="/login" class="text-primary hover:text-primary/80 hover:underline font-bold transition-colors">
            Log in
          </A>
        </div>

        {/* Security Info footer */}
        <div class="mt-6 pt-5 border-t border-outline-variant/15">
          <div class="flex items-center justify-center gap-6 text-[10px] text-outline font-medium">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">lock</span>
              TLS 1.3
            </span>
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">history</span>
              Audited
            </span>
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">verified</span>
              Local
            </span>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
