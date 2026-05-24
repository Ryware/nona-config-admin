import { For, Show } from "solid-js";
import type { Project } from "../../../types";
import { MIcon } from "../../../components/ui/icons";

interface ProjectGridProps {
  isLoading: boolean;
  isSuccess: boolean;
  projects: Project[];
  filteredProjects: Project[];
  search: string;
  onNavigate: (slug: string) => void;
  onDeleteTarget: (project: Project) => void;
  onCreateClick: () => void;
}

export function ProjectGrid(props: ProjectGridProps) {
  return (
    <Show
      when={!props.isLoading}
      fallback={
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={[1, 2, 3, 4]}>
            {() => (
              <div class="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/15 space-y-3">
                <div class="skeleton h-3 w-24 rounded" />
                <div class="skeleton h-4 w-2/3 rounded-lg" />
                <div class="skeleton h-3 w-full rounded" />
                <div class="skeleton h-3 w-4/5 rounded" />
                <div class="flex justify-between pt-2 border-t border-outline-variant/10">
                  <div class="skeleton h-3 w-16 rounded" />
                  <div class="skeleton h-5 w-5 rounded-md" />
                </div>
              </div>
            )}
          </For>
        </div>
      }
    >
      <Show
        when={props.isSuccess && props.projects.length > 0}
        fallback={
          <Show when={props.isSuccess}>
            <div class="bg-surface-container-low rounded-2xl p-16 text-center border border-outline-variant/15">
              <MIcon name="folder_open" class="text-5xl text-outline mb-4 block" />
              <p class="text-on-surface text-[14px] font-headline font-bold mb-1">No projects yet</p>
              <p class="text-on-surface-variant text-[13px] mb-6">Create your first project to start managing configuration.</p>
              <button
                onClick={props.onCreateClick}
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary text-[13px] hover:brightness-105 transition-all cursor-pointer border-0"
              >
                <MIcon name="add" class="text-[17px]" />
                New Project
              </button>
            </div>
          </Show>
        }
      >
        <Show
          when={props.filteredProjects.length > 0}
          fallback={
            <div class="bg-surface-container-low rounded-2xl p-10 text-center border border-outline-variant/15">
              <MIcon name="search_off" class="text-4xl text-outline mb-3 block" />
              <p class="text-on-surface-variant text-[13px]">No projects match "<span class="text-on-surface font-medium">{props.search}</span>"</p>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={props.filteredProjects}>
              {(project) => (
                <div
                  role="link"
                  tabindex="0"
                  class="group bg-surface-container-low rounded-2xl transition-colors duration-200 hover:bg-surface-container border border-outline-variant/15 hover:border-outline-variant/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => props.onNavigate(project.urlSlug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      props.onNavigate(project.urlSlug);
                    }
                  }}
                >
                  <div class="p-5 flex flex-col h-full">
                    <span class="text-[11px] font-mono text-outline mb-2 block">{project.urlSlug}</span>

                    <h3 class="text-[14px] font-headline font-semibold text-on-surface leading-tight mb-2">
                      {project.name}
                    </h3>

                    <p class="text-[12.5px] text-on-surface-variant leading-relaxed flex-1 mb-4 line-clamp-2">
                      {project.description || "No description provided."}
                    </p>

                    <div class="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                      <span class="text-[11.5px] text-outline">
                        {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div class="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); props.onDeleteTarget(project); }}
                          class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 bg-transparent border-0 cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                          title={`Delete ${project.name}`}
                        >
                          <MIcon name="delete_outline" class="text-[16px]" />
                        </button>
                        <div class="w-6 h-6 rounded-md flex items-center justify-center text-outline/50 group-hover:text-primary transition-colors">
                          <MIcon name="arrow_forward" class="text-[15px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>

            <button
              onClick={props.onCreateClick}
              class="bg-transparent border border-dashed border-outline-variant/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-outline hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer min-h-37"
            >
              <MIcon name="add" class="text-2xl" />
              <span class="text-[12.5px] font-medium">New Project</span>
            </button>
          </div>
        </Show>
      </Show>
    </Show>
  );
}
