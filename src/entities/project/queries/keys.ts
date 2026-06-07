/**
 * Hierarchical query keys for the project entity.
 *
 * Usage:
 *   useQuery({ queryKey: projectKeys.list() })
 *   useQuery({ queryKey: projectKeys.detail(slug) })
 *   useQuery({ queryKey: projectKeys.environments(slug) })
 *   queryClient.invalidateQueries({ queryKey: projectKeys.detail(slug) })
 *     → cascades to environments + config entries for that project
 */
export const projectKeys = {
  /** All project-related cache entries */
  all: () => ["project"] as const,

  /** List of all projects */
  list: () => [...projectKeys.all(), "list"] as const,

  /** Single project by slug */
  detail: (slug: string) => [...projectKeys.all(), "detail", slug] as const,

  /** All environments of a project */
  environments: (slug: string) =>
    [...projectKeys.detail(slug), "environments"] as const,

  /** Config entries for a specific environment */
  configEntries: (slug: string, env: string) =>
    [...projectKeys.detail(slug), "config-entries", env] as const,
} as const;
