import { Input } from "../../../components/ui/input";

interface UserIdentityFormProps {
  name: string;
  email: string;
  isEditMode: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
}

export function UserIdentityForm(props: UserIdentityFormProps) {
  return (
    <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/15 space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.15)] shrink-0">01</div>
        <h3 class="font-headline font-bold text-lg text-on-surface">Invitee Identity</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="user-full-name" class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
            Full Name or Alias
          </label>
          <Input
            id="user-full-name"
            type="text"
            placeholder="e.g. John Smith"
            value={props.name}
            onInput={(e) => props.onNameChange(e.currentTarget.value)}
            required={!props.isEditMode}
            leftIcon="person"
          />
        </div>
        <div class="space-y-2">
          <label for="user-email-address" class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em]">
            Email Address <span class="text-primary">*</span>
          </label>
          <Input
            id="user-email-address"
            type="email"
            placeholder="alex@company.com"
            value={props.email}
            onInput={(e) => props.onEmailChange(e.currentTarget.value)}
            required
            autofocus={!props.isEditMode}
            leftIcon="alternate_email"
          />
        </div>
      </div>
    </section>
  );
}
