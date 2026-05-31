import { createSignal } from "solid-js";

/**
 * Returns a `copy(text)` function and a reactive `copied()` signal
 * that stays `true` for `resetMs` milliseconds after a successful copy.
 *
 * Usage:
 *   const { copy, copied } = useClipboard();
 *   <button onClick={() => copy(value)}>{copied() ? "Copied!" : "Copy"}</button>
 */
export function useClipboard(resetMs = 1500) {
  const [copied, setCopied] = createSignal<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), resetMs);
    } catch {
      // clipboard access denied — silently ignore (caller should handle UI)
    }
  };

  return { copy, copied };
}
