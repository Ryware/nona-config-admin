import { Show } from "solid-js";
import { Input } from "../../../components/ui/input";

interface UserInviteLinkProps {
  email: string;
  invitationUrl: string;
  copyFeedback: string;
  onCopy: () => void;
  onBack: () => void;
}

export function UserInviteLink(props: UserInviteLinkProps) {
  return (
    <section class="bg-primary/5 p-8 rounded-xl border border-primary/20 shadow-[0_0_30px_rgba(99,102,241,0.02)] space-y-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-bold font-mono bg-primary/10 px-2.5 py-0.5 rounded-full text-primary border border-primary/20 tracking-wider">
          READY
        </span>
        <h3 class="font-headline font-bold text-lg text-on-surface">
          Invitation Link
        </h3>
      </div>
      <p class="text-sm text-on-surface-variant leading-relaxed">
        Send this link to{" "}
        <span class="text-on-surface font-semibold">{props.email}</span>. It can
        be used once to create a password or finish sign-in with SSO.
      </p>
      <div class="flex flex-col gap-3 md:flex-row">
        <Input
          type="text"
          readOnly
          value={props.invitationUrl}
          class="flex-1 font-mono"
        />
        <button
          type="button"
          onClick={() => props.onCopy()}
          class="px-6 py-3 rounded-lg text-sm font-bold bg-primary text-on-primary hover:brightness-105 transition-all shadow-md cursor-pointer border-0"
        >
          Copy Link
        </button>
      </div>
      <Show when={props.copyFeedback}>
        <p class="text-xs text-primary font-medium">{props.copyFeedback}</p>
      </Show>
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => props.onBack()}
          class="px-5 py-2.5 rounded-lg text-xs font-bold border border-outline-variant/15 bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          Back to Team Overview
        </button>
      </div>
    </section>
  );
}
