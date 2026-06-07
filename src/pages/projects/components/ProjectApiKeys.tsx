import { createSignal, Show } from "solid-js";
import { useClipboard } from "../../../shared/hooks/useClipboard";
import { MIcon } from "../../../shared/ui/icons";
import type { Project } from "../../../types";

interface ProjectApiKeysProps {
  project: Project;
  isRolling: boolean;
  onReroll: (keyType: "Server" | "Client") => void;
  onCopied: (message: string) => void;
}

export function ProjectApiKeys(props: ProjectApiKeysProps) {
  const [revealServer, setRevealServer] = createSignal(false);
  const [revealClient, setRevealClient] = createSignal(false);
  const { copy } = useClipboard();

  const handleCopy = async (value: string) => {
    if (await copy(value)) {
      props.onCopied("Copied to clipboard");
    }
  };

  return (
    <Show when={props.project.serverApiKey || props.project.clientApiKey}>
      <div
        data-testid="project-api-keys-section"
        class="bg-surface-container-low border-outline-variant/15 space-y-3 rounded-2xl border p-5"
      >
        <p
          data-testid="project-api-keys-heading"
          class="text-outline font-headline flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
        >
          <MIcon name="key" class="text-[15px]" />
          API Keys
        </p>
        <div class="space-y-2">
          <Show when={props.project.serverApiKey}>
            <div class="bg-surface-container flex items-center gap-3 rounded-xl px-4 py-2.5">
              <span
                data-testid="server-key-label"
                class="text-on-surface-variant w-20 shrink-0 text-[11px] font-medium tracking-[0.05em]"
              >
                Server Key
              </span>
              <code
                data-testid="server-key-value"
                class="text-on-surface flex-1 truncate font-mono text-[12px]"
              >
                {revealServer() ? props.project.serverApiKey : "•".repeat(32)}
              </code>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  data-testid="server-key-toggle-button"
                  onClick={() => setRevealServer(v => !v)}
                  class="text-outline hover:text-on-surface hover:bg-surface-bright cursor-pointer rounded-lg border-0 p-1.5 transition-all"
                  title={revealServer() ? "Hide" : "Show"}
                >
                  <MIcon
                    name={revealServer() ? "visibility_off" : "visibility"}
                    class="text-[16px]"
                  />
                </button>
                <button
                  onClick={() => handleCopy(props.project.serverApiKey!)}
                  class="text-outline hover:text-on-surface hover:bg-surface-bright cursor-pointer rounded-lg border-0 p-1.5 transition-all"
                  title="Copy"
                >
                  <MIcon name="content_copy" class="text-[16px]" />
                </button>
                <button
                  data-testid="server-key-reroll-button"
                  onClick={() => props.onReroll("Server")}
                  disabled={props.isRolling}
                  class="text-outline hover:text-error hover:bg-error/10 cursor-pointer rounded-lg border-0 p-1.5 transition-all disabled:opacity-40"
                  title="Regenerate server key"
                >
                  <MIcon name="refresh" class="text-[16px]" />
                </button>
              </div>
            </div>
          </Show>

          <Show when={props.project.clientApiKey}>
            <div class="bg-surface-container flex items-center gap-3 rounded-xl px-4 py-2.5">
              <span
                data-testid="client-key-label"
                class="text-on-surface-variant w-20 shrink-0 text-[11px] font-medium tracking-[0.05em]"
              >
                Client Key
              </span>
              <code
                data-testid="client-key-value"
                class="text-on-surface flex-1 truncate font-mono text-[12px]"
              >
                {revealClient() ? props.project.clientApiKey : "•".repeat(32)}
              </code>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  data-testid="client-key-toggle-button"
                  onClick={() => setRevealClient(v => !v)}
                  class="text-outline hover:text-on-surface hover:bg-surface-bright cursor-pointer rounded-lg border-0 p-1.5 transition-all"
                  title={revealClient() ? "Hide" : "Show"}
                >
                  <MIcon
                    name={revealClient() ? "visibility_off" : "visibility"}
                    class="text-[16px]"
                  />
                </button>
                <button
                  onClick={() => handleCopy(props.project.clientApiKey!)}
                  class="text-outline hover:text-on-surface hover:bg-surface-bright cursor-pointer rounded-lg border-0 p-1.5 transition-all"
                  title="Copy"
                >
                  <MIcon name="content_copy" class="text-[16px]" />
                </button>
                <button
                  data-testid="client-key-reroll-button"
                  onClick={() => props.onReroll("Client")}
                  disabled={props.isRolling}
                  class="text-outline hover:text-error hover:bg-error/10 cursor-pointer rounded-lg border-0 p-1.5 transition-all disabled:opacity-40"
                  title="Regenerate client key"
                >
                  <MIcon name="refresh" class="text-[16px]" />
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
