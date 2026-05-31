import { Show } from "solid-js";
import { MIcon } from "../../shared/ui/icons";
import type { AuditEntry } from "../../pages/audit-logs/types";
import { formatTimestamp, timeAgo } from "../../pages/audit-logs/utils";
import {
  getActionDescription,
  getActionKind,
  isDeleteAction,
  isParamAction,
  KIND_STYLES,
} from "./audit-kind";
import { ParamDiffSection } from "./ParamDiffSection";

interface AuditLogRowProps {
  entry: AuditEntry;
  onSelect: (entry: AuditEntry) => void;
}

export function AuditLogRow(props: AuditLogRowProps) {
  const kind = () => getActionKind(props.entry.action);
  const ks = () => KIND_STYLES[kind()];
  const desc = () => getActionDescription(props.entry.action);

  return (
    <tr
      onClick={() => props.onSelect(props.entry)}
      class="group hover:bg-surface-container-high/20 transition-colors cursor-pointer"
    >
      {/* Activity */}
      <td class="py-4 pl-5 pr-4 align-top">
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 bg-surface-container-high">
            <MIcon name={ks().icon} class={`text-[14px] ${ks().iconColor}`} />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[13px] font-semibold text-on-surface shrink-0">
                {props.entry.actor}
              </span>
              <span class={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${ks().badge}`}>
                {ks().label}
              </span>
              <code
                class={`font-mono text-[11px] px-1.5 py-0.5 rounded border truncate max-w-[180px] bg-surface-container-high border-outline-variant/20 ${
                  isDeleteAction(props.entry.action)
                    ? "text-outline/60 line-through"
                    : "text-on-surface-variant"
                }`}
                title={props.entry.target}
              >
                {props.entry.target}
              </code>
            </div>

            <Show when={props.entry.displayName && props.entry.displayName !== props.entry.target}>
              <div class="mt-0.5 flex items-center gap-1.5">
                <span class="text-[11.5px] text-outline truncate">{props.entry.displayName}</span>
                <Show when={props.entry.description}>
                  <span class="text-outline/30 shrink-0">·</span>
                  <span class="text-[11px] text-outline/50 italic truncate max-w-[220px]">
                    {props.entry.description}
                  </span>
                </Show>
              </div>
            </Show>

            <Show when={isParamAction(props.entry.action)}>
              <ParamDiffSection entry={props.entry} />
            </Show>

            <Show when={desc()}>
              {(d) => (
                <p class={`mt-0.5 text-[11.5px] ${d().colorClass}`}>{d().text}</p>
              )}
            </Show>
          </div>
        </div>
      </td>

      {/* Context */}
      <td class="py-4 px-4 align-top w-32">
        <div class="flex flex-col items-center gap-1.5">
          <span class={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${props.entry.envStyle}`}>
            {props.entry.env === "Global Scope" ? "System" : props.entry.env}
          </span>
          <Show when={props.entry.project}>
            <span
              class="text-[10px] font-mono text-outline/50 truncate max-w-[96px] text-center"
              title={props.entry.project}
            >
              {props.entry.project}
            </span>
          </Show>
        </div>
      </td>

      {/* When */}
      <td class="py-4 pl-4 pr-5 align-top w-44 text-right">
        <div class="text-[12.5px] font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
          {timeAgo(props.entry.time)}
        </div>
        <div
          class="text-[10.5px] text-outline font-mono mt-0.5 truncate"
          title={`Audit Record System ID: ${props.entry.sysId}`}
        >
          {formatTimestamp(props.entry.time)}
        </div>
        <div class="text-[9.5px] font-mono text-outline/40 mt-0.5 tracking-wide">
          {props.entry.sysId}
        </div>
      </td>
    </tr>
  );
}
