import { Show } from "solid-js";
import { MIcon } from "../../../shared/ui/icons";
import type { Project } from "../../../types";

interface ProjectHeaderProps {
  project: Project | undefined;
  showConfigForm: boolean;
  showBulkImport: boolean;
  showEnvForm: boolean;
  onToggleEnvForm: () => void;
  onToggleBulkImport: () => void;
  onToggleConfigForm: () => void;
}

export function ProjectHeader(props: ProjectHeaderProps) {
  return (
    <Show
      when={props.project}
      fallback={
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
              Projects
            </h2>
          </div>
        </div>
      }
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
            {props.project!.name}
          </h2>
          <p class="text-[12.5px] text-on-surface-variant mt-1">
            {props.project!.description || "No description provided."}
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            onClick={() => props.onToggleEnvForm()}
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all active:scale-[0.98] border-0 cursor-pointer"
          >
            <MIcon name="add" class="text-[17px]" />
            Add Environment
          </button>
          <button
            onClick={() => props.onToggleBulkImport()}
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all active:scale-[0.98] border-0 cursor-pointer"
          >
            <MIcon name="publish" class="text-[17px]" />
            Bulk Import
          </button>
          <button
            onClick={() => props.onToggleConfigForm()}
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-on-primary transition-all active:scale-[0.98] hover:brightness-105 border-0 cursor-pointer"
          >
            <MIcon name="add" class="text-[17px]" />
            Add Parameter
          </button>
        </div>
      </div>
    </Show>
  );
}
