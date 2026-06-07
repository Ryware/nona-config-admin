import { For, Show } from "solid-js";

interface UserRoleSelectorProps {
  role: "editor" | "viewer";
  onChange: (role: "editor" | "viewer") => void;
}

export function UserRoleSelector(props: UserRoleSelectorProps) {
  const ROLE_CARDS = [
    {
      value: "editor" as const,
      icon: "shield_person",
      label: "Editor",
      desc: "Full access to modify projects, manage team members, and view billing logs.",
    },
    {
      value: "viewer" as const,
      icon: "visibility",
      label: "Viewer",
      desc: "Read-only access to configurations and logs. Cannot modify environment variables.",
    },
  ];

  return (
    <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/15 shadow-sm space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.15)] shrink-0">02</div>
        <h3 class="font-headline font-bold text-lg text-on-surface">Role Assignment</h3>
      </div>
      <div role="radiogroup" aria-label="System Role Assignment" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <For each={ROLE_CARDS}>
          {(card) => {
            const isSelected = () => props.role === card.value;
            return (
              <div
                role="radio"
                aria-checked={isSelected()}
                tabindex="0"
                onClick={() => props.onChange(card.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    props.onChange(card.value);
                  }
                }}
                class={`p-6 rounded-lg border transition-all duration-300 h-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98] ${
                  isSelected()
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(99,102,241,0.03)] scale-[1.01]"
                    : "bg-surface-container-low border-outline-variant/15 hover:bg-surface-container-high/40 hover:border-outline-variant/30"
                }`}
              >
                <div class="flex items-start justify-between mb-4">
                  <div class={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSelected() ? "bg-primary/10 text-primary border border-primary/25" : "bg-surface-container-high text-outline border border-outline-variant/10"}`}>
                    <span class="material-symbols-outlined text-xl">{card.icon}</span>
                  </div>
                  {/* Radio indicator */}
                  <div
                    class={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected() ? "border-primary bg-primary" : "border-outline-variant"
                    }`}
                  >
                    <Show when={isSelected()}>
                      <div class="w-1.5 h-1.5 bg-on-primary rounded-full" />
                    </Show>
                  </div>
                </div>
                <div class="font-headline font-bold text-on-surface text-base">{card.label}</div>
                <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">{card.desc}</p>
              </div>
            );
          }}
        </For>
      </div>
    </section>
  );
}
