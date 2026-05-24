import { For, Show, createSignal } from "solid-js";
import type { Environment } from "../../../types";
import { FormField } from "../../../components/auth/FormField";
import { MIcon } from "../../../components/ui/icons";

interface ProjectEnvironmentsProps {
  environments: Environment[];
  activeEnvName: string;
  setActiveEnvName: (v: string) => void;
  onCreateEnv: (envName: string) => void;
  onDeleteEnv: (envName: string) => void;
  showEnvForm: boolean;
  setShowEnvForm: (v: boolean) => void;
  createEnvPending: boolean;
}

export function ProjectEnvironments(props: ProjectEnvironmentsProps) {
  const [envName, setEnvName] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmed = envName().trim();
    if (!trimmed) return;
    props.onCreateEnv(trimmed);
    setEnvName("");
  };

  return (
    <div class="space-y-4">
      {/* Environments Tabs */}
      <div class="space-y-3">
        <p class="text-[12px] font-semibold text-on-surface-variant">Environments</p>
        <Show
          when={props.environments.length > 0}
          fallback={<span class="text-on-surface-variant text-sm block">No environments yet</span>}
        >
          <div class="flex flex-wrap gap-2.5">
            <For each={props.environments}>
              {(env) => (
                <div
                  role="button"
                  tabindex="0"
                  class={`group flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-mono cursor-pointer transition-all duration-300 border outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    props.activeEnvName === env.name
                      ? "border-primary/20 bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                      : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
                  }`}
                  onClick={() => props.setActiveEnvName(props.activeEnvName === env.name ? "" : env.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      props.setActiveEnvName(props.activeEnvName === env.name ? "" : env.name);
                    }
                  }}
                >
                  <span>{env.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onDeleteEnv(env.name);
                    }}
                    aria-label={`Delete environment ${env.name}`}
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error bg-transparent border-0 cursor-pointer p-0 ml-1 flex items-center justify-center"
                  >
                    <MIcon name="close" class="text-[14px]" />
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Create env form */}
      <Show when={props.showEnvForm}>
        <form
          onSubmit={handleSubmit}
          class="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 flex flex-col sm:flex-row gap-4 items-end animate-fade-in shadow-sm"
        >
          <div class="group flex-1 w-full">
            <FormField
              id="env-name"
              label="Environment Name *"
              type="text"
              placeholder="production"
              value={envName()}
              onInput={(e) => setEnvName(e.currentTarget.value)}
              required
              leftIcon="dns"
            />
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={props.createEnvPending}
              class="flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-semibold bg-primary text-on-primary text-[13px] hover:brightness-105 transition-all disabled:opacity-50 border-0 cursor-pointer"
            >
              {props.createEnvPending ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => props.setShowEnvForm(false)}
              class="flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-semibold text-on-surface-variant text-[13px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
}
