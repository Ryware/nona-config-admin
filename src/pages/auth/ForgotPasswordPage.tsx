import { createSignal } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { Button } from "../../components/ui/button";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormField } from "../../components/auth/FormField";
import { useToast } from "../../components/ui/toast";
import { authService } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authService.requestPasswordReset({ email: email() });
      
      addToast(
        "If an account exists with that email, you will receive password reset instructions.",
        "success"
      );
      
      // Redirect to login after a short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      // For now, show a user-friendly message since backend isn't implemented yet
      setError("Password reset feature is coming soon. Please contact your administrator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button
        type="submit"
        form="forgot-password-form"
        class="w-full"
        disabled={isSubmitting()}
      >
        {isSubmitting() ? "Sending..." : "Send Reset Link"}
      </Button>
      <p class="text-sm text-center text-gray-600">
        Remember your password?{" "}
        <A href="/login" class="text-primary-600 hover:text-primary-700 font-medium hover:underline">
          Sign in
        </A>
      </p>
    </>
  );

  return (
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        description="Enter your email address and we'll send you a link to reset your password"
        error={error()}
        footer={footer}
      >
        <form id="forgot-password-form" onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            autofocus
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
