import { createSignal, Show } from "solid-js";
import { MIcon } from "../../../shared/ui/icons";

interface AuditLogsHeaderProps {
  onExport: (format: "csv" | "json") => void;
}

export function AuditLogsHeader(props: AuditLogsHeaderProps) {
  const [showExportMenu, setShowExportMenu] = createSignal(false);

  return (
    <div class="flex items-start md:items-center justify-between gap-4">
      <div>
        <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">Audit Logs</h2>
        <p class="text-[12.5px] text-on-surface-variant mt-1">
          All administrative actions across your organization.
        </p>
      </div>
      <div class="relative">
        <button
          onClick={() => setShowExportMenu((v) => !v)}
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-primary text-on-primary text-[13px] transition-all active:scale-[0.98] hover:brightness-105 shrink-0 cursor-pointer border-0"
        >
          <MIcon name="download" class="text-[18px]" />
          Export Logs
          <MIcon name="arrow_drop_down" class="text-[16px]" />
        </button>
        <Show when={showExportMenu()}>
          <div class="absolute right-0 top-full mt-1.5 bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in min-w-40">
            <button
              onClick={() => {
                props.onExport("csv");
                setShowExportMenu(false);
              }}
              class="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors bg-transparent border-0 cursor-pointer"
            >
              <MIcon name="table_view" class="text-[16px] text-outline" />
              Export CSV
            </button>
            <button
              onClick={() => {
                props.onExport("json");
                setShowExportMenu(false);
              }}
              class="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors bg-transparent border-0 cursor-pointer"
            >
              <MIcon name="data_object" class="text-[16px] text-outline" />
              Export JSON
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
