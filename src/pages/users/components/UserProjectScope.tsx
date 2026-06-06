import { For, Show } from "solid-js";
import type { Project } from "../../../types";

interface UserProjectScopeProps {
  projects: Project[];
  selectedProjects: Set<string>;
  onToggleProject: (id: string) => void;
}

export function UserProjectScope(props: UserProjectScopeProps) {
  return (
    <section class="bg-surface-container-low p-8 rounded-xl border border-outline-variant/15 shadow-sm space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.15)] shrink-0">03</div>
        <h3 class="font-headline font-bold text-lg text-on-surface">Project Scope</h3>
      </div>
      <div class="bg-surface-container-low border border-outline-variant/15 rounded-xl overflow-hidden">
        <div class="grid grid-cols-2 px-6 py-3.5 bg-surface-container-low border-b border-outline-variant/15 text-[10px] uppercase tracking-widest text-outline font-bold">
          <span>Active Projects</span>
          <span class="text-right">Access Level</span>
        </div>
        <Show when={props.projects.length === 0}>
          <div class="px-6 py-8 text-center text-outline text-sm">No projects found</div>
        </Show>
        <div class="divide-y divide-outline-variant/10">
          <For each={props.projects}>
            {(project) => {
              const isGiven = () => props.selectedProjects.has(project.urlSlug);
              return (
                <div
                  class="grid grid-cols-2 px-6 py-4 items-center hover:bg-surface-container-high/40 transition-colors cursor-pointer border-b border-outline-variant/10 last:border-b-0"
                  onClick={() => props.onToggleProject(project.urlSlug)}
                >
                  <div class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isGiven()}
                      onChange={() => props.onToggleProject(project.urlSlug)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Toggle access for project ${project.name || project.urlSlug}`}
                      class="w-4 h-4 bg-surface-container-low border border-outline-variant/20 rounded focus:ring-1 focus:ring-primary/30 text-primary cursor-pointer accent-primary"
                    />
                    <span class="text-sm font-mono text-on-surface font-semibold">{project.urlSlug}</span>
                  </div>
                  <div class="text-right">
                    <Show
                      when={isGiven()}
                      fallback={
                        <span class="text-[9px] px-2.5 py-0.5 bg-surface-container-high text-outline rounded-full uppercase font-bold tracking-wider border border-outline-variant/15">
                          None
                        </span>
                      }
                    >
                      <span class="text-[9px] px-2.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-wider border border-primary/20">
                        Inherited
                      </span>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </section>
  );
}
