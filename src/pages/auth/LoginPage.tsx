import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { ApiRequestError } from "../../services/api-client";
import { renderGoogleSsoButton } from "../../services/google-sso";
import { signInWithMicrosoftPopup } from "../../services/microsoft-sso";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormField } from "../../components/auth/FormField";
import { Button } from "../../components/ui/button";
import type { LoginRequest, LoginResponse } from "../../types";

type SsoProvider = "google" | "microsoft";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [activeSsoProvider, setActiveSsoProvider] = createSignal<SsoProvider | null>(null);
  let googleButtonHost: HTMLDivElement | undefined;

  const completeLogin = (result: LoginResponse) => {
    localStorage.setItem("auth_token", result.token);

    const cliState = asString(searchParams.cli_state);
    const cliRedirect = asString(searchParams.cli_redirect);
    if (cliState && cliRedirect) {
      const params = new URLSearchParams({
        token: result.token,
        username: result.username ?? "",
        role: result.role,
        expires_at: result.expiresAt,
        state: cliState,
      });
      window.location.href = `${cliRedirect}?${params}`;
      return;
    }

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

  createEffect(() => {
    const googleConfig = ssoConfigQuery.data?.google;
    if (!googleConfig?.enabled || !googleConfig.clientId || !googleButtonHost) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void renderGoogleSsoButton(
      googleButtonHost,
      googleConfig.clientId,
      async (idToken) => {
        setActiveSsoProvider("google");
        setError("");

        try {
          const result = await authService.loginWithGoogle(idToken);
          completeLogin(result);
        } catch (caught) {
          setError(getErrorMessage(caught, "Google sign-in failed. Please try again."));
        } finally {
          setActiveSsoProvider(null);
        }
      },
      (message) => {
        setError(message);
        setActiveSsoProvider(null);
      },
    )
      .then((nextCleanup) => {
        if (disposed) {
          nextCleanup();
          return;
        }

        cleanup = nextCleanup;
      })
      .catch(() => {
        setError("Google sign-in is unavailable right now. Please try again.");
      });

    onCleanup(() => {
      disposed = true;
      cleanup?.();
    });
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email: email(), password: password() });
  };

  const handleMicrosoftLogin = async () => {
    const microsoftConfig = ssoConfigQuery.data?.microsoft;
    if (!microsoftConfig?.enabled || !microsoftConfig.clientId || !microsoftConfig.authority) {
      setError("Microsoft sign-in is not configured.");
      return;
    }

    setActiveSsoProvider("microsoft");
    setError("");

    try {
      const idToken = await signInWithMicrosoftPopup(microsoftConfig.clientId, microsoftConfig.authority);
      const result = await authService.loginWithMicrosoft(idToken);
      completeLogin(result);
    } catch (caught) {
      setError(getErrorMessage(caught, "Microsoft sign-in failed. Please try again."));
    } finally {
      setActiveSsoProvider(null);
    }
  };

  const isBusy = () => loginMutation.isPending || activeSsoProvider() !== null;
  const hasSsoOptions = () => !!(ssoConfigQuery.data?.google.enabled || ssoConfigQuery.data?.microsoft.enabled);

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
              disabled={isBusy()}
              class="w-full py-4 rounded font-bold text-on-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
            >
              <span>{loginMutation.isPending ? "Signing in…" : "Login to Console"}</span>
              <span class="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
        </form>

        <Show when={hasSsoOptions()}>
          <div class="my-8 flex items-center gap-4 text-outline text-[11px] uppercase tracking-[0.2em]">
            <div class="h-px flex-1 bg-outline/20" />
            <span>Or continue with SSO</span>
            <div class="h-px flex-1 bg-outline/20" />
          </div>

          <div class="space-y-3">
            <Show when={ssoConfigQuery.data?.google.enabled}>
              <div class="flex flex-col gap-2">
                <div ref={(element) => { googleButtonHost = element; }} class="w-full flex justify-center" />
                <Show when={activeSsoProvider() === "google"}>
                  <p class="text-center text-xs text-outline">Verifying Google sign-in…</p>
                </Show>
              </div>
            </Show>

            <Show when={ssoConfigQuery.data?.microsoft.enabled}>
              <Button
                variant="outline"
                class="w-full h-12 text-on-surface"
                disabled={isBusy()}
                onClick={handleMicrosoftLogin}
              >
                <span class="material-symbols-outlined text-[18px]">domain_verification</span>
                {activeSsoProvider() === "microsoft" ? "Connecting to Microsoft…" : "Continue with Microsoft"}
              </Button>
            </Show>
          </div>
        </Show>
      </AuthCard>

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

function asString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(caught: unknown, fallback: string) {
  if (caught instanceof ApiRequestError && caught.code === "sso_user_not_registered") {
    return "This account is not registered in the app. Ask an administrator to create your account before using SSO.";
  }

  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return fallback;
}
