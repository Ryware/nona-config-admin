import { Show } from "solid-js";
import { Input } from "../../shared/ui/input";
import { ProjectParamCreateForm } from "../project-param-edit/ProjectParamCreateForm";
import { ProjectParamsTable } from "./ProjectParamsTable";
import type { ConfigEntry, CreateConfigEntryRequest, Environment } from "../../types";

interface ProjectParamsTabProps {
  activeEnvName: string;
  environments: Environment[];
  filteredConfig: ConfigEntry[];
  isLoading: boolean;
  projectId: string;
  paramSearch: string;
  onParamSearch: (q: string) => void;
  showConfigForm: boolean;
  onCancelCreate: () => void;
  onSubmitCreate: (data: {
    key: string;
    value: string;
    contentType: CreateConfigEntryRequest['contentType'];
    scope: CreateConfigEntryRequest['scope'];
    displayName: string;
    description: string;
  }) => void;
  isCreatePending: boolean;
  onSelectEntry: (entry: ConfigEntry) => void;
  onDeleteEntry: (key: string) => void;
  copiedKey: string | null;
  onCopyValue: (key: string, value: string) => void;
  getParamMeta: (proj: string, env: string, key: string) => { displayName: string; description: string };
}

export function ProjectParamsTab(props: ProjectParamsTabProps) {
  return (
    <div class="space-y-4">
      {/* Section header */}
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <p class="text-[10px] font-bold uppercase tracking-widest text-outline font-headline flex items-center gap-2">
          <span>Parameters</span>
          <Show when={props.activeEnvName}>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {props.environments
                .find((e) => e.name === props.activeEnvName)
                ?.name?.toUpperCase()}
            </span>
          </Show>
        </p>
        <Show when={props.activeEnvName && props.filteredConfig.length > 0}>
          <Input
            type="text"
            placeholder="Search parameters…"
            value={props.paramSearch}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
              props.onParamSearch(e.currentTarget.value)
            }
            class="h-9 w-52"
            leftIcon="search"
            wrapperStyle="w-auto"
          />
        </Show>
      </div>

      {/* No env selected */}
      <Show when={!props.activeEnvName}>
        <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-10 text-center text-on-surface-variant text-sm shadow-sm">
          Select an environment above to view its parameters
        </div>
      </Show>

      {/* New Parameter Form */}
      <Show when={props.activeEnvName && props.showConfigForm}>
        <ProjectParamCreateForm
          onCancel={props.onCancelCreate}
          onSubmit={props.onSubmitCreate}
          isPending={props.isCreatePending}
        />
      </Show>

      {/* Parameters table */}
      <Show when={props.activeEnvName && props.filteredConfig.length > 0}>
        <ProjectParamsTable
          isLoading={props.isLoading}
          projectId={props.projectId}
          activeEnvName={props.activeEnvName}
          filteredConfig={props.filteredConfig}
          onSelectEntry={props.onSelectEntry}
          onDeleteEntry={props.onDeleteEntry}
          copiedKey={props.copiedKey}
          onCopyValue={props.onCopyValue}
          getParamMeta={props.getParamMeta}
          search={props.paramSearch}
        />
      </Show>

      {/* Empty state */}
      <Show
        when={
          props.activeEnvName &&
          !props.isLoading &&
          props.filteredConfig.length === 0
        }
      >
        <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-10 text-center text-on-surface-variant text-sm shadow-sm">
          No parameters yet for this environment
        </div>
      </Show>
    </div>
  );
}
