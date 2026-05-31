import { QueryClient } from "@tanstack/solid-query";

/**
 * Singleton QueryClient with project-wide defaults.
 *
 * Design notes:
 * - refetchOnWindowFocus disabled — admin panel state is mutation-driven, not time-based.
 * - retry: 1 — retry once on transient network errors; no more to avoid delayed error UX.
 * - keepPreviousData is intentionally NOT set globally; use it only on list queries that
 *   benefit from smooth pagination (see individual query definitions).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
