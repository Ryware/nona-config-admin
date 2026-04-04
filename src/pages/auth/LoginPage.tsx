import { createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
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
      localStorage.setItem("auth_token", result.token);
      navigate("/projects");
    },
    onError: () => {
      setError("Invalid credentials. Please try again.");
    },
  }));

  const firstTimeQuery = useQuery(() => ({
    queryKey: ["first-time"],
    queryFn: () => authService.firstTime(),
  }));

  createEffect(() => {
    if (firstTimeQuery.isSuccess && firstTimeQuery.data === true) {
      navigate("/register");
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email: email(), password: password() });
  };

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back" error={error()}>
        <form onSubmit={handleSubmit} class="space-y-6">
          <FormField
            id="email"
            label="Email"
            type="text"
            placeholder="your@email.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            autofocus
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <div class="pt-4">
            <button
              type="submit"
              disabled={loginMutation.isPending}
              class="w-full py-4 rounded font-bold text-on-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span>{loginMutation.isPending ? "Signing in…" : "Login to Console"}</span>
              <span class="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
        </form>
      </AuthCard>

      {/* Support links */}
      <div class="mt-8 flex items-center gap-6 text-outline text-xs uppercase tracking-widest">
        <a class="hover:text-on-surface transition-colors flex items-center gap-1" href="https://www.nonaconfig.com/support" target="_blank">
          <span class="material-symbols-outlined text-[14px]">contact_support</span>
          Support
        </a>
        <a class="hover:text-on-surface transition-colors flex items-center gap-1" href="https://www.nonaconfig.com/docs" target="_blank">
          <span class="material-symbols-outlined text-[14px]">terminal</span>
          API Docs
        </a>
      </div>
    </AuthLayout>
  );
}
