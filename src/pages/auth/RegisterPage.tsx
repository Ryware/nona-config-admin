import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useMutation } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { AuthLayout } from "../../components/auth/AuthLayout";
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
        localStorage.setItem("auth_token", result.response.token);
        navigate("/dashboard");
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
      <div class="w-full max-w-[440px] overflow-hidden rounded shadow-2xl">
        <div class="p-10 bg-[#0e1323]">

          {/* Brand + Title */}
          <div class="flex flex-col items-center gap-4 mb-8 text-center">
            <div
              class="w-12 h-12 rounded flex items-center justify-center"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span class="material-symbols-outlined text-on-primary font-bold"
                    style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">terminal</span>
            </div>
            <div>
              <h1 class="font-headline text-2xl font-bold text-on-surface tracking-tight">Admin Registration</h1>
              <p class="text-on-surface-variant text-sm mt-1">Initialize the root administrator account</p>
            </div>
          </div>

          {/* Error */}
          {error() && (
            <div class="mb-6 p-3 text-sm text-error bg-error-container/20 border border-error/20 rounded flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">error</span>
              {error()}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} class="space-y-6">
            <div class="group">
              <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                System Username
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[18px]">alternate_email</span>
                <input
                  type="text"
                  placeholder="admin@nona.dev"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                  autofocus
                  class="w-full bg-transparent border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 pl-8 pr-0 transition-all font-mono text-[13px] outline-none"
                />
              </div>
            </div>

            <div class="group">
              <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                Root Password
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[18px]">key</span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  class="w-full bg-transparent border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 pl-8 pr-0 transition-all font-mono text-[13px] outline-none"
                />
              </div>
            </div>

            <div class="group">
              <label class="block text-xs font-bold uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary transition-colors">
                Verify Password
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-outline text-[18px]">shield_lock</span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  required
                  class="w-full bg-transparent border-none border-b-2 border-b-outline-variant/30 focus:ring-0 focus:border-b-primary text-on-surface placeholder:text-outline/40 py-3 pl-8 pr-0 transition-all font-mono text-[13px] outline-none"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                class="w-full py-4 rounded font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-blue-400 text-white hover:bg-blue-300"
              >
                <span>{registerMutation.isPending ? "Creating account…" : "Create Account"}</span>
                <span class="material-symbols-outlined text-[18px]">arrow_right_alt</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security footer */}
        <div class="px-10 py-4 bg-[#080d1d] border-t border-outline-variant/10">
          <div class="flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest text-outline">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">lock</span>
              TLS 1.3
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">history</span>
              Audit Logging
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">verified</span>
              Local Instance
            </span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
