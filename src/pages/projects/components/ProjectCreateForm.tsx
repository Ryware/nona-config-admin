import { createSignal, Show } from "solid-js";
import { FormField } from "../../../components/auth/FormField";
import { MIcon } from "../../../components/ui/icons";

interface ProjectCreateFormProps {
  onCancel: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  isPending: boolean;
}

const PROJECT_NAME_PATTERN = /^[a-zA-Z0-9-]+$/;

export function ProjectCreateForm(props: ProjectCreateFormProps) {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [createError, setCreateError] = createSignal("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const trimmedName = name().trim();
    if (!trimmedName) {
      setCreateError("Project name is required.");
      return;
    }

    if (!PROJECT_NAME_PATTERN.test(trimmedName)) {
      setCreateError("Use only letters, numbers, and hyphens.");
      return;
    }

    setCreateError("");
    props.onSubmit({ name: trimmedName, description: description().trim() || undefined });
  };

  return (
    <div class="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 shadow-sm animate-fade-in">
      <h3 class="text-xs font-headline font-bold text-on-surface uppercase tracking-wider mb-6">New Project</h3>
      <form onSubmit={handleSubmit} class="grid md:grid-cols-2 gap-6">
        <div>
          <FormField
            id="project-name"
            label="Project Name *"
            type="text"
            placeholder="my-project"
            value={name()}
            onInput={(e) => {
              setName(e.currentTarget.value);
              if (createError()) setCreateError("");
            }}
            required
            leftIcon="folder"
          />
          <p class="mt-2 text-[10px] text-outline font-medium uppercase tracking-wider">Use letters, numbers, and hyphens only.</p>
          <Show when={createError()}>
            <p class="mt-2 text-[11px] font-bold text-error">{createError()}</p>
          </Show>
        </div>
        <FormField
          id="project-description"
          label="Description"
          type="text"
          placeholder="Optional description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          leftIcon="notes"
        />
        <div class="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={props.isPending}
            class="px-6 py-2.5 rounded-lg font-bold bg-primary text-on-primary text-xs uppercase tracking-wider transition-all active:scale-[0.98] hover:brightness-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md border-0"
          >
            <MIcon name="add" class="text-[16px]" />
            {props.isPending ? "Creating…" : "Create Project"}
          </button>
          <button
            type="button"
            onClick={props.onCancel}
            class="px-6 py-2.5 rounded-lg font-bold text-on-surface-variant text-xs uppercase tracking-wider bg-surface-container-high hover:bg-surface-bright transition-all cursor-pointer border-0"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
