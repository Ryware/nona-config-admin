import { onCleanup, onMount } from "solid-js";

interface ShortcutOptions {
  metaOrCtrl?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: ShortcutOptions
) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const checkMetaOrCtrl = options?.metaOrCtrl ?? true;
    const isMetaOrCtrlMatched = checkMetaOrCtrl ? (e.metaKey || e.ctrlKey) : true;

    if (isMetaOrCtrlMatched && e.key.toLowerCase() === key.toLowerCase()) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      if (isInput) {
        return;
      }

      e.preventDefault();
      callback(e);
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
}
