import { createSignal, Show } from "solid-js";
import { FormField } from "../../widgets/auth-shell/FormField";
import { Input } from "../../shared/ui/input";
import { Select } from "../../shared/ui/select";
import { VisualJsonEditor } from "../../shared/ui/visual-json-editor";

interface ProjectParamCreateFormProps {
  onCancel: () => void;
  onSubmit: (data: {
    key: string;
    value: string;
    contentType: "string" | "number" | "boolean" | "json";
    scope: "client" | "server" | "all";
    displayName: string;
    description: string;
  }) => void;
  isPending: boolean;
}

export function ProjectParamCreateForm(props: ProjectParamCreateFormProps) {
  const [cfgKey, setCfgKey] = createSignal("");
  const [cfgValue, setCfgValue] = createSignal("");
  const [cfgType, setCfgType] = createSignal<"string" | "number" | "boolean" | "json">("string");
  const [cfgDisplayName, setCfgDisplayName] = createSignal("");
  const [cfgDescription, setCfgDescription] = createSignal("");

  const onKeyDownConfigKey = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  const isValidJson = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const isAddInvalid = () => {
    if (cfgType() === "json") {
      return !isValidJson(cfgValue());
    }
    return false;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!cfgKey().trim()) return;

    props.onSubmit({
      key: cfgKey().trim(),
      value: cfgValue().trim(),
      contentType: cfgType(),
      scope: "all",
      displayName: cfgDisplayName().trim(),
      description: cfgDescription().trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 mb-4 space-y-4 animate-fade-in"
    >
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-4">
          <div>
            <FormField
              id="config-entry-key"
              label="Key"
              type="text"
              placeholder="CONFIG_KEY"
              value={cfgKey()}
              onKeyDown={onKeyDownConfigKey}
              onInput={(e: any) => setCfgKey(e.currentTarget.value)}
              required
              autofocus
              leftIcon="code"
            />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em] mb-1.5">
              Datatype
            </label>
            <Select
              value={cfgType()}
              onChange={(val: string) => {
                setCfgType(val as "string" | "number" | "boolean" | "json");
                setCfgValue("");
              }}
              options={["string", "number", "boolean", "json"]}
            />
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <FormField
              id="config-entry-display-name"
              label="Friendly Display Name"
              type="text"
              placeholder="e.g. Mail Server Port"
              value={cfgDisplayName()}
              onInput={(e: any) => setCfgDisplayName(e.currentTarget.value)}
            />
          </div>
          <div>
            <FormField
              id="config-entry-description"
              label="Description"
              type="text"
              placeholder="Explain what this configuration does..."
              value={cfgDescription()}
              onInput={(e: any) => setCfgDescription(e.currentTarget.value)}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      <div>
        <label
          for="config-entry-value"
          class="block text-[11px] font-medium text-on-surface-variant tracking-[0.05em] mb-1.5"
        >
          Value
        </label>
        <Show when={cfgType() === "boolean"}>
          <Select
            id="config-entry-value"
            value={cfgValue()}
            onChange={(val: any) => setCfgValue(val)}
            placeholder="Select status..."
            options={[
              { value: "true", label: "True / Active" },
              { value: "false", label: "False / Inactive" },
            ]}
          />
        </Show>
        <Show when={cfgType() === "number"}>
          <Input
            id="config-entry-value"
            type="number"
            value={cfgValue()}
            onInput={(e: any) => setCfgValue(e.currentTarget.value)}
            required
            placeholder="0"
          />
        </Show>
        <Show when={cfgType() === "json"}>
          <VisualJsonEditor id="config-entry-value" value={cfgValue()} onChange={setCfgValue} />
        </Show>
        <Show when={cfgType() === "string"}>
          <Input
            id="config-entry-value"
            type="text"
            value={cfgValue()}
            onInput={(e: any) => setCfgValue(e.currentTarget.value)}
            required
            placeholder="Enter configuration value"
          />
        </Show>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={props.onCancel}
          class="px-4 py-2.5 rounded-lg font-semibold text-on-surface-variant text-[13px] bg-surface-container-high hover:bg-surface-bright transition-all border-0 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={props.isPending || isAddInvalid()}
          class="px-4 py-2.5 rounded-lg font-semibold bg-primary text-on-primary text-[13px] hover:brightness-105 transition-all disabled:opacity-50 border-0 cursor-pointer"
        >
          {props.isPending ? "Creating…" : "Add Parameter"}
        </button>
      </div>
    </form>
  );
}
