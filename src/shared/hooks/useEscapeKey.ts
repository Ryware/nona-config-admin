import { onCleanup, onMount } from "solid-js";

/**
 * Calls `callback` whenever the Escape key is pressed.
 * Automatically registers/deregisters the listener with the component lifecycle.
 */
export function useEscapeKey(callback: () => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") callback();
  };
  onMount(() => document.addEventListener("keydown", handleKeyDown));
  onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
}
