import { A, useNavigate } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, Show } from "solid-js";
import { AuthCard } from "../../components/auth/AuthCard";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { FormField } from "../../components/auth/FormField";
import { SsoSection } from "../../components/auth/SsoSection";
import { ApiRequestError } from "../../services/api-client";
import { authService } from "../../services/auth.service";
import type { LoginRequest, LoginResponse } from "../../types";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(true);

  const completeLogin = (result: LoginResponse) => {
    const storage = rememberMe() ? localStorage : sessionStorage;
    storage.setItem("auth_token", result.token);
    navigate("/projects");
  };

  const loginMutation = useMutation(() => ({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: completeLogin,
    onError: () => {
      setError("Invalid credentials. Please try again.");
    },
  }));

  const firstTimeQuery = useQuery(() => ({
    queryKey: ["first-time"],
    queryFn: () => authService.firstTime(),
  }));

  const ssoConfigQuery = useQuery(() => ({
    queryKey: ["sso-config"],
    queryFn: () => authService.getSsoConfig(),
    retry: false,
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

  const handleSsoSuccess = async (
    provider: "google" | "microsoft",
    idToken: string,
  ) => {
    try {
      const result =
        provider === "google"
          ? await authService.loginWithGoogle(idToken)
          : await authService.loginWithMicrosoft(idToken);
      completeLogin(result);
    } catch (caught) {
      setError(
        getErrorMessage(
          caught,
          `${provider === "google" ? "Google" : "Microsoft"} sign-in failed. Please try again.`,
        ),
      );
      throw caught;
    }
  };

  const isBusy = () => loginMutation.isPending;

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back" error={error()}>
        <form onSubmit={handleSubmit} class="space-y-5">
          <FormField
            id="email"
            label="Email"
            type="text"
            placeholder="your@email.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            autofocus
            leftIcon="alternate_email"
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            leftIcon="key"
          />
          <div class="pt-2">
            {/* Remember me */}
            <label class="flex items-center gap-2.5 mb-4 cursor-pointer group w-fit">
              <div
                class={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  rememberMe()
                    ? "bg-primary border-primary"
                    : "border-outline-variant/50 group-hover:border-outline"
                }`}
                onClick={() => setRememberMe((v) => !v)}
              >
                <Show when={rememberMe()}>
                  <span class="material-symbols-outlined text-on-primary text-[11px]">
                    check
                  </span>
                </Show>
              </div>
              <span
                class="text-[12px] text-on-surface-variant select-none"
                onClick={() => setRememberMe((v) => !v)}
              >
                Remember me on this device
              </span>
            </label>
            <button
              type="submit"
              disabled={isBusy()}
              class="w-full py-3.5 rounded-lg font-bold bg-primary text-on-primary text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:brightness-105 cursor-pointer border-0"
            >
              <span>
                {loginMutation.isPending ? "Signing in…" : "Login to Console"}
              </span>
              <span class="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
        </form>

        <div class="mt-5 text-center text-[12px] text-on-surface-variant">
          Don't have an admin account?{" "}
          <A
            href="/register"
            class="text-primary hover:text-primary/80 hover:underline font-bold transition-colors"
          >
            Register
          </A>
        </div>

        <SsoSection
          ssoConfig={ssoConfigQuery.data}
          isBusy={isBusy()}
          onSsoSuccess={handleSsoSuccess}
          onSsoError={(msg) => setError(msg)}
        />
      </AuthCard>

      <div class="mt-8 flex items-center gap-6 text-outline text-[10px] font-bold uppercase tracking-widest">
        <a
          class="hover:text-primary transition-colors flex items-center gap-1.5"
          href="https://www.nonaconfig.com/support"
          target="_blank"
        >
          <span class="material-symbols-outlined text-[15px]">
            contact_support
          </span>
          Support
        </a>
        <a
          class="hover:text-primary transition-colors flex items-center gap-1.5"
          href="https://www.nonaconfig.com/docs"
          target="_blank"
        >
          <span class="material-symbols-outlined text-[15px]">terminal</span>
          API Docs
        </a>
      </div>
    </AuthLayout>
  );
}

function getErrorMessage(caught: unknown, fallback: string) {
  if (
    caught instanceof ApiRequestError &&
    caught.code === "sso_user_not_registered"
  ) {
    return "This account is not registered in the app. Ask an administrator to create your account before using SSO.";
  }

  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return fallback;
}
