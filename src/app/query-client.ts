import { QueryClient } from "@tanstack/solid-query";

/**
 * Singleton QueryClient with project-wide defaults.
 *
 * Design notes:
 * - refetchOnWindowFocus disabled — admin panel state is mutation-driven, not time-based.
 * - retry: 1 — retry once on transient network errors; no more to avoid delayed error UX.
 * - staleTime: 30s — cached data is fresh for 30 seconds, preventing flash on page transitions.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
