import { A, useNavigate } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { createEffect, createSignal, Show } from "solid-js";
import { AuthCard } from "../../widgets/auth-shell/AuthCard";
import { AuthLayout } from "../../widgets/auth-shell/AuthLayout";
import { FormField } from "../../widgets/auth-shell/FormField";
import { SsoSection } from "../../widgets/auth-shell/SsoSection";
import { ApiRequestError } from "../../shared/api/client";
import { MSG } from "../../shared/lib/messages";
import { authService } from "../../entities/auth/api/auth.service";
import { authStore } from "../../entities/auth/model/store";
import type { LoginRequest, LoginResponse } from "../../types";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(true);
  const [showForgot, setShowForgot] = createSignal(false);
  const [forgotEmail, setForgotEmail] = createSignal("");
  const [forgotSent, setForgotSent] = createSignal(false);

  const completeLogin = (result: LoginResponse) => {
    authStore.saveSession(
      result.token,
      { email: result.username ?? "", role: result.role },
      rememberMe(),
    );
    navigate("/projects");
  };

  const loginMutation = useMutation(() => ({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: completeLogin,
    onError: () => {
      setError(MSG.LOGIN_FAILED);
    },
  }));

  const forgotMutation = useMutation(() => ({
    mutationFn: (e: string) => authService.requestPasswordReset({ email: e }),
    onSuccess: () => setForgotSent(true),
    onError: () => setError(MSG.FORGOT_SEND_FAILED),
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

  const handleForgotSubmit = (e: Event) => {
    e.preventDefault();
    setError("");
    forgotMutation.mutate(forgotEmail());
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
          provider === "google" ? MSG.SSO_FAILED_GOOGLE : MSG.SSO_FAILED_MICROSOFT,
        ),
      );
      throw caught;
    }
  };

  const isBusy = () => loginMutation.isPending;

  return (
    <AuthLayout>
      <Show
        when={!showForgot()}
        fallback={
          <AuthCard title="Reset Password" error={error()}>
            <Show
              when={!forgotSent()}
              fallback={
                <div class="text-center space-y-4 py-2">
                  <span class="material-symbols-outlined text-primary text-[40px]">
                    mark_email_read
                  </span>
                  <p class="text-[13px] text-on-surface-variant">
                    If an account exists for{" "}
                    <strong class="text-on-surface">{forgotEmail()}</strong>, a
                    reset link has been sent.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgot(false);
                      setForgotSent(false);
                      setForgotEmail("");
                    }}
                    class="text-primary text-[12px] font-medium hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to login
                  </button>
                </div>
              }
            >
              <form onSubmit={handleForgotSubmit} class="space-y-5">
                <p class="text-[12.5px] text-on-surface-variant">
                  Enter your email and we'll send a password reset link.
                </p>
                <FormField
                  id="forgot-email"
                  label="Email"
                  type="text"
                  placeholder="your@email.com"
                  value={forgotEmail()}
                  onInput={(e) => setForgotEmail(e.currentTarget.value)}
                  required
                  autofocus
                  leftIcon="alternate_email"
                />
                <div class="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setError("");
                    }}
                    class="flex-1 py-3 rounded-lg text-[13px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-all border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotMutation.isPending || !forgotEmail()}
                    class="flex-1 py-3 rounded-lg font-bold bg-primary text-on-primary text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 cursor-pointer border-0"
                  >
                    {forgotMutation.isPending ? "Sending…" : "Send Reset Link"}
                  </button>
                </div>
              </form>
            </Show>
          </AuthCard>
        }
      >
        <AuthCard title="Welcome Back" error={error()}>
          <form onSubmit={handleSubmit} class="space-y-5">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
              autofocus
              autocomplete="email"
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
              autocomplete="current-password"
              leftIcon="key"
            />
            <div class="pt-2">
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

          <div class="mt-5 flex items-center justify-between text-[12px]">
            <span class="text-on-surface-variant">
              Don't have an account?{" "}
              <A
                href="/register"
                class="text-primary hover:text-primary/80 hover:underline font-bold transition-colors"
              >
                Register
              </A>
            </span>
            <button
              type="button"
              onClick={() => {
                setShowForgot(true);
                setForgotEmail(email());
                setError("");
              }}
              class="text-outline hover:text-primary transition-colors bg-transparent border-0 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <SsoSection
            ssoConfig={ssoConfigQuery.data}
            isBusy={isBusy()}
            onSsoSuccess={handleSsoSuccess}
            onSsoError={(msg) => setError(msg)}
          />

          <div class="mt-6 pt-5 border-t border-outline-variant/15">
            <div class="flex items-center justify-center gap-6 text-[10px] text-outline font-medium">
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
                <span class="material-symbols-outlined text-[15px]">
                  terminal
                </span>
                API Docs
              </a>
            </div>
          </div>
        </AuthCard>
      </Show>
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
