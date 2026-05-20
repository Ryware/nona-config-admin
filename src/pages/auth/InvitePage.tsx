import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { authService } from "../../services/auth.service";
import { ApiRequestError } from "../../services/api-client";
import { renderGoogleSsoButton } from "../../services/google-sso";
import { signInWithMicrosoftPopup } from "../../services/microsoft-sso";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormField } from "../../components/auth/FormField";
import { Button } from "../../components/ui/button";
import type { LoginResponse } from "../../types";

type SsoProvider = "google" | "microsoft";

export default function InvitePage() {
  const navigate = useNavigate();
  const params = useParams<{ token: string }>();
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [activeSsoProvider, setActiveSsoProvider] = createSignal<SsoProvider | null>(null);
  let googleButtonHost: HTMLDivElement | undefined;

  const completeLogin = (result: LoginResponse) => {
    localStorage.setItem("auth_token", result.token);
    navigate("/projects");
  };

  const invitationQuery = useQuery(() => ({
    queryKey: ["invitation", params.token],
    queryFn: () => authService.getInvitation(params.token),
    retry: false,
  }));

  const ssoConfigQuery = useQuery(() => ({
    queryKey: ["sso-config"],
    queryFn: () => authService.getSsoConfig(),
    retry: false,
    enabled: invitationQuery.isSuccess,
  }));

  const passwordMutation = useMutation(() => ({
    mutationFn: (newPassword: string) => authService.completeInvitationWithPassword(params.token, newPassword),
    onSuccess: completeLogin,
    onError: (caught) => {
      setError(getInviteErrorMessage(caught, "Unable to complete invitation right now."));
    },
  }));

  createEffect(() => {
    const googleConfig = ssoConfigQuery.data?.google;
    if (!invitationQuery.isSuccess || !googleConfig?.enabled || !googleConfig.clientId || !googleButtonHost) {
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
          const result = await authService.completeInvitationWithGoogle(params.token, idToken);
          completeLogin(result);
        } catch (caught) {
          setError(getInviteErrorMessage(caught, "Google sign-in failed. Please try again."));
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

    if (password() !== confirmPassword()) {
      setError("Passwords do not match.");
      return;
    }

    passwordMutation.mutate(password());
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
      const result = await authService.completeInvitationWithMicrosoft(params.token, idToken);
      completeLogin(result);
    } catch (caught) {
      setError(getInviteErrorMessage(caught, "Microsoft sign-in failed. Please try again."));
    } finally {
      setActiveSsoProvider(null);
    }
  };

  const isBusy = () => passwordMutation.isPending || activeSsoProvider() !== null;
  const hasSsoOptions = () => !!(ssoConfigQuery.data?.google.enabled || ssoConfigQuery.data?.microsoft.enabled);
  const inviteLoadError = () => getInviteLoadError(invitationQuery.error);

  return (
    <AuthLayout>
      <Show
        when={invitationQuery.isSuccess}
        fallback={
          <AuthCard
            title={invitationQuery.isPending ? "Validating Invitation" : "Invitation Unavailable"}
            description={invitationQuery.isPending ? "Checking your invitation link…" : inviteLoadError()}
            error={!invitationQuery.isPending ? inviteLoadError() : undefined}
          >
            <Show when={invitationQuery.isPending}>
              <p class="text-sm text-center text-on-surface-variant">Please wait while we verify your link.</p>
            </Show>
          </AuthCard>
        }
      >
        <AuthCard
          title="Complete Your Invitation"
          description={`You're joining as ${invitationQuery.data?.email}. Create a password or continue with SSO to activate your account.`}
          error={error()}
        >
          <div class="mb-6 rounded border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface">
            <div class="font-bold">{invitationQuery.data?.name || invitationQuery.data?.email}</div>
            <div class="text-on-surface-variant">{invitationQuery.data?.email}</div>
          </div>

          <form onSubmit={handleSubmit} class="space-y-6">
            <FormField
              id="password"
              label="Create Password"
              type="password"
              placeholder="••••••••••••"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              autofocus
            />
            <FormField
              id="confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
            <div class="pt-2">
              <button
                type="submit"
                disabled={isBusy()}
                class="w-full py-4 rounded font-bold text-on-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style="background: linear-gradient(135deg, #a4c9ff 0%, #60a5fa 100%);"
              >
                <span>{passwordMutation.isPending ? "Activating account…" : "Set Password and Continue"}</span>
                <span class="material-symbols-outlined text-[18px]">lock</span>
              </button>
            </div>
          </form>

          <Show when={hasSsoOptions()}>
            <div class="my-8 flex items-center gap-4 text-outline text-[11px] uppercase tracking-[0.2em]">
              <div class="h-px flex-1 bg-outline/20" />
              <span>Or skip password and use SSO</span>
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
      </Show>
    </AuthLayout>
  );
}

function getInviteLoadError(caught: unknown) {
  if (caught instanceof ApiRequestError && caught.code === "invitation_invalid_or_used") {
    return "This invitation link is invalid or has already been used.";
  }

  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return "We couldn't validate this invitation link.";
}

function getInviteErrorMessage(caught: unknown, fallback: string) {
  if (caught instanceof ApiRequestError) {
    if (caught.code === "invitation_invalid_or_used") {
      return "This invitation link is invalid or has already been used.";
    }

    if (caught.code === "invitation_sso_email_mismatch") {
      return "The SSO email does not match the invited account email.";
    }

    if (caught.code === "sso_user_not_registered") {
      return "This SSO account is not registered for the invited email.";
    }
  }

  if (caught instanceof Error && caught.message) {
    return caught.message;
  }

  return fallback;
}
