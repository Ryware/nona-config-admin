import { createSignal, Show } from "solid-js";
import { MIcon } from "../../../shared/ui/icons";
import { useClipboard } from "../../../shared/hooks/useClipboard";
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
    await copy(value);
    props.onCopied("Copied to clipboard");
  };

  return (
    <Show when={props.project.serverApiKey || props.project.clientApiKey}>
      <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-5 space-y-3">
        <p class="text-[10px] font-bold uppercase tracking-widest text-outline font-headline flex items-center gap-1.5">
          <MIcon name="key" class="text-[15px]" />
          API Keys
        </p>
        <div class="space-y-2">
          <Show when={props.project.serverApiKey}>
            <div class="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5">
              <span class="text-[11px] font-medium tracking-[0.05em] text-on-surface-variant w-20 shrink-0">Server Key</span>
              <code class="flex-1 text-[12px] font-mono text-on-surface truncate">
                {revealServer() ? props.project.serverApiKey : "•".repeat(32)}
              </code>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setRevealServer((v) => !v)}
                  class="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-bright transition-all border-0 cursor-pointer"
                  title={revealServer() ? "Hide" : "Show"}
                >
                  <MIcon name={revealServer() ? "visibility_off" : "visibility"} class="text-[16px]" />
                </button>
                <button
                  onClick={() => handleCopy(props.project.serverApiKey!)}
                  class="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-bright transition-all border-0 cursor-pointer"
                  title="Copy"
                >
                  <MIcon name="content_copy" class="text-[16px]" />
                </button>
                <button
                  onClick={() => props.onReroll("Server")}
                  disabled={props.isRolling}
                  class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all border-0 cursor-pointer disabled:opacity-40"
                  title="Regenerate server key"
                >
                  <MIcon name="refresh" class="text-[16px]" />
                </button>
              </div>
            </div>
          </Show>

          <Show when={props.project.clientApiKey}>
            <div class="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5">
              <span class="text-[11px] font-medium tracking-[0.05em] text-on-surface-variant w-20 shrink-0">Client Key</span>
              <code class="flex-1 text-[12px] font-mono text-on-surface truncate">
                {revealClient() ? props.project.clientApiKey : "•".repeat(32)}
              </code>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setRevealClient((v) => !v)}
                  class="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-bright transition-all border-0 cursor-pointer"
                  title={revealClient() ? "Hide" : "Show"}
                >
                  <MIcon name={revealClient() ? "visibility_off" : "visibility"} class="text-[16px]" />
                </button>
                <button
                  onClick={() => handleCopy(props.project.clientApiKey!)}
                  class="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-bright transition-all border-0 cursor-pointer"
                  title="Copy"
                >
                  <MIcon name="content_copy" class="text-[16px]" />
                </button>
                <button
                  onClick={() => props.onReroll("Client")}
                  disabled={props.isRolling}
                  class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all border-0 cursor-pointer disabled:opacity-40"
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
